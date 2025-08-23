<script lang="ts" module>
	export type EmitterEventXBetButton =
		| { type: 'xBetButtonShow' }
		| { type: 'xBetButtonHide' }
		| { type: 'xBetButtonClick' };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Sprite, Container, BitmapText } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { stateBet, stateBetDerived } from 'state-shared';
	import { stateGame } from '../game/stateGame.svelte';
	import { stateSlots } from 'utils-slots/src/stateSlots.svelte';
	import { SYMBOL_SIZE } from '../game/constants';
	import { numberToCurrencyString } from 'utils-shared/amount';
	
	const context = getContext();

	// Only show in base game, hide during bonus features and outro modals
	let manualShow = $state(true);
	let freeSpinOutroVisible = $state(false);
	let freeSpinCounterVisible = $state(false);
	let delayedShow = $state(false);
	
	// Show logic with delay after free spin counter disappears
	let show = $derived(manualShow && context.stateGame.gameType === 'basegame' && !freeSpinOutroVisible && !freeSpinCounterVisible && delayedShow);
	
	// Check if any reel is spinning
	let isSpinning = $derived(
		stateSlots.isPreSpinning || 
		context.stateGame.board.some(reel => reel.reelState.motion === 'spinning' || reel.reelState.motion === 'bouncing')
	);
	
	// Interactive only when showing and game is not spinning
	let interactive = $derived(show && !isSpinning);

	// Check if antibet mode is active
	let isAntibetActive = $derived(stateBet.activeBetModeKey === 'ANTIBET');
	
	// Debug logging
	$effect(() => {
		console.log('XBet Button - Bet mode key changed to:', stateBet.activeBetModeKey, 'Active:', isAntibetActive);
		console.log('XBet Button - Sprite key:', spriteKey);
	});
	
	// Choose the correct sprite key based on antibet state
	let spriteKey = $derived(
		isAntibetActive 
			? 'xBetButtonOn'
			: 'xBetButtonOff'
	);

	// Button sizing and positioning - using original image dimensions
	const position = $derived({
		x: 100, // Centered under bonus buy button (same x as bonus button now)
		y: 420, // Position under the bonus buy button
	});
	
	// Use original image dimensions scaled down appropriately
	const buttonWidth = 200; // Scale up from 174 for better visibility
	const buttonHeight = 145; // Scale up from 126 to maintain aspect ratio
	
	// Calculate bet amount to display - show the antibet cost regardless of current state
	let betAmountText = $derived(
		numberToCurrencyString(stateBet.betAmount * 1.5)
	);

	context.eventEmitter.subscribeOnMount({
		xBetButtonShow: () => (manualShow = true),
		xBetButtonHide: () => (manualShow = false),
		freeSpinOutroShow: () => (freeSpinOutroVisible = true),
		freeSpinOutroHide: () => (freeSpinOutroVisible = false),
		freeSpinCounterShow: () => (freeSpinCounterVisible = true),
		freeSpinCounterHide: () => {
			freeSpinCounterVisible = false;
			// Delay showing the button to let fade out animation complete
			setTimeout(() => (delayedShow = true), 500);
		},
		xBetButtonClick: () => {
			// Toggle antibet mode
			console.log('xBet button clicked! Current mode:', stateBet.activeBetModeKey);
			if (stateBet.activeBetModeKey === 'ANTIBET') {
				stateBet.activeBetModeKey = 'BASE';
				console.log('Switched to base mode');
			} else {
				stateBet.activeBetModeKey = 'ANTIBET';
				console.log('Switched to antibet mode');
			}
			console.log('New bet mode:', stateBet.activeBetModeKey);
		},
	});
	
	// Initialize delayedShow when in base game
	$effect(() => {
		if (context.stateGame.gameType === 'basegame' && !freeSpinCounterVisible) {
			delayedShow = true;
		} else {
			delayedShow = false;
		}
	});

	function handleClick() {
		context.eventEmitter.broadcast({ type: 'xBetButtonClick' });
	}
</script>

{#if show}
	<MainContainer>
		<Container x={position.x} y={position.y}>
			<Sprite 
				key={spriteKey} 
				width={buttonWidth} 
				height={buttonHeight}
				interactive={interactive}
				cursor={interactive ? "pointer" : "default"}
				alpha={interactive ? 1 : 0.5}
				onpointertap={interactive ? handleClick : undefined}
				onpointerover={interactive ? (e) => e.currentTarget.alpha = 0.8 : undefined}
				onpointerout={interactive ? (e) => e.currentTarget.alpha = (interactive ? 1 : 0.5) : undefined}
			/>
			
			<!-- Bet amount text overlay - always show the antibet cost -->
			{#if betAmountText}
				<BitmapText
					text={betAmountText}
					x={buttonWidth / 2}
					y={buttonHeight - 30}
					anchor={{ x: 0.5, y: 0.5 }}
					style={{
						fontFamily: 'gold',
						fontSize: 28,
					}}
				/>
			{/if}
		</Container>
	</MainContainer>
{/if}