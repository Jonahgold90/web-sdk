import type { BetType } from 'rgs-requests';

import type { SymbolName, RawSymbol, GameType, Position } from './types';

// book events shared with scatter game
type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	anticipation: number[];
	gameType: GameType;
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

type BookEventFreeSpinTrigger = {
	index: number;
	type: 'freeSpinTrigger';
	totalFs: number;
	positions: Position[];
};

type BookEventUpdateFreeSpin = {
	index: number;
	type: 'updateFreeSpin';
	amount: number;
	total: number;
};

type BookEventSetWin = {
	index: number;
	type: 'setWin';
	amount: number;
	winLevel: number;
};

type BookEventSpinWinTotal = {
	index: number;
	type: 'spinWinTotal';
	amount: number;
	lineWins: number;
	collections: number;
};

type BookEventFreeSpinEnd = {
	index: number;
	type: 'freeSpinEnd';
	amount: number;
	winLevel: number;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: {
		symbol: SymbolName;
		kind: number;
		win: number;
		positions: Position[];
		meta: {
			lineIndex: number;
			multiplier: number;
			winWithoutMult: number;
			globalMult: number;
			lineMultiplier: number;
		};
	}[];
};

// Big-Bass collection event
type BookEventCollection = {
	index: number;
	type: 'collection';
	spin: number;
	level: number;
	cw_count: number;
	cc_count: number;
	cc_values: number[];
	cc_sum: number;
	collected_amount: number;
	payout_per_cw_raw: number;
	subcollections: {
		cw_index: number;
		amount: number;
	}[];
};

// Big-Bass level advance event
type BookEventLevelAdvance = {
	index: number;
	type: 'level_advance';
	spin: number;
	new_level: number;
	extra_spins_granted: number;
};

// CC Collect Sequence event for deterministic animation
type BookEventCCCollectSequence = {
	index: number;
	type: 'cc_collect_sequence';
	collections: {
		cw: { col: number; row: number };
		cw_level: number;
		cw_multiplier: number;
		steps: {
			cc: { col: number; row: number };
			base_value: number;
			multiplier_used: number;
			credited_value: number;
		}[];
		total: number;
	}[];
};

// customised
type BookEventCwLanded = {
	index: number;
	type: 'cwLanded';
	count: number;
	totalCws: number;
};

type BookEventCreateBonusSnapshot = {
	index: number;
	type: 'createBonusSnapshot';
	bookEvents: BookEvent[];
};

export type BookEvent =
	| BookEventReveal
	| BookEventWinInfo
	| BookEventSetTotalWin
	| BookEventFreeSpinTrigger
	| BookEventUpdateFreeSpin
	| BookEventCreateBonusSnapshot
	| BookEventFinalWin
	| BookEventSetWin
	| BookEventSpinWinTotal
	| BookEventFreeSpinEnd
	| BookEventCollection
	| BookEventLevelAdvance
	| BookEventCCCollectSequence
	// customised
	| BookEventCwLanded
	| BookEventCreateBonusSnapshot;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
