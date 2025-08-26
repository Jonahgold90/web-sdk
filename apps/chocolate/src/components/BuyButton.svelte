<script lang="ts" module>
	export type EmitterEventBuyButton =
		| { type: 'buyButtonShow' }
		| { type: 'buyButtonHide' }
		| { type: 'buyButtonClick' };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Sprite, Container } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { stateModal, stateBet } from 'state-shared';
	import { stateGame } from '../game/stateGame.svelte';
	import { stateSlots } from 'utils-slots/src/stateSlots.svelte';
	import { SYMBOL_SIZE } from '../game/constants';
	
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

	// Comprehensive responsive positioning and sizing
	const layout = $derived(() => {
		const layoutData = context.stateLayoutDerived.mainLayout();
		const width = layoutData.width;
		const height = layoutData.height;
		const isMobile = width < 1024;
		
		// Button dimensions - bigger on mobile
		const buttonWidth = isMobile ? 240 : 200;
		const buttonHeight = isMobile ? 126 : 105;
		
		// Position calculation
		if (isMobile) {
			// Mobile/Tablet: side by side above control bar, below board
			const totalWidth = buttonWidth * 2 + 20; // Two buttons plus 20px gap
			const centerX = (width - totalWidth) / 2;
			return { 
				x: centerX, 
				y: height - 320, // Moved up by 40px
				width: buttonWidth,
				height: buttonHeight
			};
		} else {
			// Desktop: stacked vertically on left side
			return { 
				x: 100, 
				y: 300,
				width: buttonWidth,
				height: buttonHeight
			};
		}
	});
	
	// Debug the positioning and game state
	// $effect(() => {
	// 	console.log('BuyButton show:', show, 'interactive:', interactive, 'isSpinning:', isSpinning);
	// 	console.log('Spinning details:', {
	// 		isPreSpinning: stateSlots.isPreSpinning,
	// 		reelMotions: context.stateGame.board.map(reel => reel.reelState.motion),
	// 		gameType: context.stateGame.gameType
	// 	});
	// });

	context.eventEmitter.subscribeOnMount({
		buyButtonShow: () => (manualShow = true),
		buyButtonHide: () => (manualShow = false),
		freeSpinOutroShow: () => (freeSpinOutroVisible = true),
		freeSpinOutroHide: () => (freeSpinOutroVisible = false),
		freeSpinCounterShow: () => (freeSpinCounterVisible = true),
		freeSpinCounterHide: () => {
			freeSpinCounterVisible = false;
			// Delay showing the buy button to let fade out animation complete
			setTimeout(() => (delayedShow = true), 500);
		},
		buyButtonClick: () => {
			// Open the same modal as the shopping cart button in control bar
			stateModal.modal = { name: 'buyBonus' };
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
		context.eventEmitter.broadcast({ type: 'buyButtonClick' });
	}
</script>

{#if show}
	<MainContainer>
		<Container x={layout().x} y={layout().y}>
			<Sprite 
				key="buyButton" 
				width={layout().width} 
				height={layout().height}
				interactive={interactive}
				cursor={interactive ? "pointer" : "default"}
				alpha={interactive ? 1 : 0.5}
				onpointertap={interactive ? handleClick : undefined}
				onpointerover={interactive ? (e) => e.currentTarget.alpha = 0.8 : undefined}
				onpointerout={interactive ? (e) => e.currentTarget.alpha = (interactive ? 1 : 0.5) : undefined}
			/>
		</Container>
	</MainContainer>
{/if}