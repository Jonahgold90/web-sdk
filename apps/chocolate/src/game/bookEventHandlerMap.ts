import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet, stateUi } from 'state-shared';
import { sequence } from 'utils-shared/sequence';
import { BOOK_AMOUNT_MULTIPLIER } from 'constants-shared/bet';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';
import config from './config';

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
	}
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		// check if SUPERSPIN, when finishing a bet.
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
	});
};

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		// Check for spinWinTotal events in this book
		const spinWinTotalEvents = bookEvents.filter(event => event.type === 'spinWinTotal');
		//console.log('🔍 REVEAL: Found', spinWinTotalEvents.length, 'spinWinTotal events in this book');
		// if (spinWinTotalEvents.length > 0) {
		// 	console.log('🔍 spinWinTotal events:', spinWinTotalEvents);
		// }
		
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		stateGame.gameType = bookEvent.gameType;
		await stateGameDerived.enhancedBoard.spin({
			revealEvent: bookEvent,
			paddingBoard: config.paddingReels[bookEvent.gameType],
		});
		
		// Broadcast board reveal for sound system
		eventEmitter.broadcast({ 
			type: 'boardReveal', 
			board: bookEvent.board 
		});
		
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		// console.log('winInfo called at index:', bookEvent.index, 'totalWin:', bookEvent.totalWin, 'wins count:', bookEvent.wins.length);
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
		
		// Process each line win sequentially
		for (let i = 0; i < bookEvent.wins.length; i++) {
			// console.log(`Animating line ${i + 1} of ${bookEvent.wins.length}:`, bookEvent.wins[i].meta.lineIndex);
			await animateSymbols({ positions: bookEvent.wins[i].positions });
		}
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>, { bookEvents }: BookEventContext) => {
		// console.log('📊 setTotalWin called with amount:', bookEvent.amount, 'at index:', bookEvent.index);
		
		// Check if there's a spinWinTotal event that will handle this win
		const hasSpinWinTotal = bookEvents.some(event => event.type === 'spinWinTotal');
		
		if (hasSpinWinTotal) {
			// console.log('📊 spinWinTotal event exists, skipping setTotalWin - will be handled by spinWinTotal');
			return;
		}
		
		// Only run if no spinWinTotal exists (fallback behavior)
		stateBet.winBookEventAmount = bookEvent.amount;
		// console.log('📊 setTotalWin updated control bar to:', bookEvent.amount);
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// animate scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		// show free spin intro
		//eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		//eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freegame';
		stateGame.retrigCount = 0; // Reset retrig counter for new free spin session
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		//eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateUi.freeSpinCounterShow = true;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		stateUi.freeSpinCounterTotal = bookEvent.totalFs;
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateUi.freeSpinCounterShow = true;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount + 1,
			total: bookEvent.total,
		});
		stateUi.freeSpinCounterCurrent = bookEvent.amount + 1;
		stateUi.freeSpinCounterTotal = bookEvent.total;
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		stateBet.activeBetModeKey = 'BASE';
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		//eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		stateUi.freeSpinCounterShow = false;
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>, { bookEvents }: BookEventContext) => {
		//console.log('🎯 setWin called with amount:', bookEvent.amount, 'winLevel:', bookEvent.winLevel);
		
		// Update control bar with win amount
		if (stateGame.gameType === 'freegame') {
			// During bonus rounds, add to cumulative total
			stateBet.winBookEventAmount += bookEvent.amount;
		} else {
			// In base game, replace with current win
			stateBet.winBookEventAmount = bookEvent.amount;
		}
		
		// Skip animation if there's no win
		if (bookEvent.amount == 0) {
			console.log('🎯 No win (amount = 0), skipping animation');
			return;
		}
		
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];
		
		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	spinWinTotal: async (bookEvent: BookEventOfType<'spinWinTotal'>, { bookEvents }: BookEventContext) => {
		//console.log('✨ spinWinTotal called with total:', bookEvent.amount, 'breakdown:', { lineWins: bookEvent.lineWins, collections: bookEvent.collections });
		
		// spinWinTotal now only updates control bar - win animations handled by setWin
		// No win animation logic needed here since setWin handles it with correct win levels
		
		// Hide collection animations after spin completes
		eventEmitter.broadcast({ type: 'collectionAnimationHide' });
	},
	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		// Do nothing
	},
	collection: async (bookEvent: BookEventOfType<'collection'>) => {
		// Handle Big-Bass collection mechanic
		console.log('💰 Collection event triggered at index:', bookEvent.index, 'amount:', bookEvent.collected_amount);
		
		// Play collection sound
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
		
		// Note: Collection amounts now handled by spinWinTotal events and setTotalWin
		// No manual addition to control bar needed
	},
	cwLanded: async (bookEvent: BookEventOfType<'cwLanded'>) => {
		// Handle CW landing event for progression animation
		//console.log('🎊 CW Landed event triggered at index:', bookEvent.index, 'count:', bookEvent.count, 'totalCws:', bookEvent.totalCws);
		
		// Broadcast to components listening for CW events
		eventEmitter.broadcast({ 
			type: 'cwLanded',
			count: bookEvent.count,
			totalCws: bookEvent.totalCws
		});
	},
	cc_collect_sequence: async (bookEvent: BookEventOfType<'cc_collect_sequence'>) => {
		// Handle deterministic CC collection animation
		//console.log('🎬 CC Collect Sequence event triggered at index:', bookEvent.index, 'collections:', bookEvent.collections.length);
		
		// Show collection animation and wait for completion
		eventEmitter.broadcast({ type: 'collectionAnimationShow' });
		await eventEmitter.broadcastAsync({ 
			type: 'collectionAnimationPlay',
			event: bookEvent
		});
		//console.log('✅ CC collection sequence animation completed at index:', bookEvent.index);
		// Keep animation visible for remainder of spin
	},
	level_advance: async (bookEvent: BookEventOfType<'level_advance'>) => {
		// Handle Big-Bass level advancement with retrigger
		console.log('Level advance event:', bookEvent);
		
		// Show retrigger intro when extra spins are granted
		if (bookEvent.extra_spins_granted > 0) {
			stateGame.retrigCount += 1;
			const currentTotal = stateUi.freeSpinCounterTotal;
			const newTotal = currentTotal + bookEvent.extra_spins_granted;
			
			// Hide UI and show retrig popup
			await eventEmitter.broadcastAsync({ type: 'uiHide' });
			eventEmitter.broadcast({ type: 'retrigPopupShow' });
			//eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
			await eventEmitter.broadcastAsync({
				type: 'retrigPopupUpdate',
				retrigCount: stateGame.retrigCount,
				extraSpins: bookEvent.extra_spins_granted,
			});
			
			// Update counter and hide popup
			eventEmitter.broadcast({
				type: 'freeSpinCounterUpdate',
				current: undefined, // Keep current spin display unchanged
				total: newTotal,
			});
			stateUi.freeSpinCounterTotal = newTotal;
			
			eventEmitter.broadcast({ type: 'retrigPopupHide' });
			await eventEmitter.broadcastAsync({ type: 'uiShow' });
		}
		
		// TODO: Implement level advance animation
		// - Show level-up animation
		// - Display new multiplier level
		
		// Play level advance sound
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_levelup' });
	},
	// customised
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		function findAllBookEvents<T>(type: T) {
			return bookEvents.filter((bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>[]
				| [];
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);
		const allCwLandedEvents = findAllBookEvents('cwLanded' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });
		
		// Replay all cwLanded events to rebuild CW progress
		for (const cwLandedEvent of allCwLandedEvents) {
			await playBookEvent(cwLandedEvent, { bookEvents });
		}
	},
};
