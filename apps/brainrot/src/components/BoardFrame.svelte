<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' }
		| { type: 'skibidiAppear' }
		| { type: 'skibidiDisappear' }
		| { type: 'skibidiLaserEyes' }
		| { type: 'skibidiLaserReveal' }
		| { type: 'skibidiIdle' }
		| { type: 'tungtungWinSpin' }
		| { type: 'tungtungWinMultiplier' }
		| { type: 'tungtungWinBig' }
		| { type: 'tungtungIdle' };

	export type BuyButtonAnimation = 'small_buy_click' | 'big_buy_in' | 'big_buy_loop';

	export const stateBuyButton = $state<{
		animationName: BuyButtonAnimation;
		loop: boolean;
	}>({
		animationName: 'small_buy_click',
		loop: true,
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Sprite, SpineProvider, SpineTrack, Text } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal, stateConfig } from 'state-shared';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	// Font loading state
	let fontLoaded = $state(false);

	onMount(async () => {
		// Force load the Darling Coffee font
		try {
			// Create a FontFace object and load it explicitly
			const fontFace = new FontFace('Darling Coffee', "url('/assets/fonts/brainrotBonanza/Darling%20Coffee.ttf')");
			await fontFace.load();
			document.fonts.add(fontFace);
			fontLoaded = true;
		} catch (error) {
			console.warn('Failed to load Darling Coffee font, trying alternate method:', error);
			// Try checking if font is already loaded
			await document.fonts.ready;
			// Small delay to ensure Pixi recognizes the font
			await new Promise(resolve => setTimeout(resolve, 100));
			fontLoaded = true;
		}
	});

	// Character animation states
	type SkibidiAnimation = 'idle' | 'idle_break' | 'head swirling_in_new' | 'head swirling_out_new' | 'head_swing_new' | 'laser_eyes_zapping_the_board';
	type TungtungAnimation = 'sahur_idle' | 'sahur_win1' | 'sahur_win2' | 'sahur_win3';

	let skibidiAnimationName = $state<SkibidiAnimation>('idle');
	let skibidiLoop = $state(true);
	let tungtungAnimationName = $state<TungtungAnimation>('sahur_idle');
	let tungtungLoop = $state(true);

	// Toggle button state - tied to ANTE mode
	const isToggleOn = $derived(stateBet.activeBetModeKey === 'ANTE');
	const ARROW_OFF_POSITION = -30; // Off position (BASE mode)
	const ARROW_ON_POSITION = 35; // On position (ANTE mode)

	const toggleAnteBet = () => {
		if (isToggleOn) {
			// Turn off - go back to BASE mode
			stateBet.activeBetModeKey = 'BASE';
		} else {
			// Turn on - activate ANTE mode
			stateBet.activeBetModeKey = 'ANTE';
		}
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
	};

	// Idle variation timer for Skibidi
	let idleBreakTimer: ReturnType<typeof setTimeout> | null = null;
	const scheduleIdleBreak = () => {
		if (idleBreakTimer) clearTimeout(idleBreakTimer);
		// Random interval between 5-15 seconds for idle_break
		const delay = 5000 + Math.random() * 10000;
		idleBreakTimer = setTimeout(() => {
			if (skibidiAnimationName === 'idle') {
				skibidiAnimationName = 'idle_break';
				skibidiLoop = false;
			}
		}, delay);
	};

	const SPINE_SCALE = { width: 0.6, height: 0.6 };
	const SPRITE_SCALE = { width: 0.95, height: 0.9 };
	const BG_RATIO = 937 / 806;
	const POSITION_ADJUSTMENT = 1.01;
	const VERTICAL_OFFSET = -20; // Move board up by 20 pixels
	const NUM_REELS = 6;
	const NUM_ROWS = 5;
	// The divider image should be sized to match the exact reel grid dimensions

	let showFreeSpinCounter = $state(false);
	let freeSpinCurrent = $state(0);
	let freeSpinTotal = $state(0);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			// Reelhouse glow removed
		},
		boardFrameGlowHide: () => {
			// Reelhouse glow removed
		},
		freeSpinCounterShow: () => {
			showFreeSpinCounter = true;
		},
		freeSpinCounterHide: () => {
			showFreeSpinCounter = false;
		},
		freeSpinCounterUpdate: (emitterEvent) => {
			if (emitterEvent.current !== undefined) freeSpinCurrent = emitterEvent.current;
			if (emitterEvent.total !== undefined) freeSpinTotal = emitterEvent.total;
		},
		// Skibidi animations
		skibidiAppear: () => {
			skibidiAnimationName = 'head swirling_in_new';
			skibidiLoop = false;
		},
		skibidiDisappear: () => {
			skibidiAnimationName = 'head swirling_out_new';
			skibidiLoop = false;
		},
		skibidiLaserEyes: () => {
			console.log('🎬 BoardFrame received skibidiLaserEyes, setting animation');
			console.log('Current animation:', skibidiAnimationName, 'Setting to: laser_eyes_zapping_the_board');
			skibidiAnimationName = 'laser_eyes_zapping_the_board';
			skibidiLoop = false;
		},
		skibidiIdle: () => {
			skibidiAnimationName = 'idle';
			skibidiLoop = true;
			scheduleIdleBreak();
		},
		// TungTung animations
		tungtungWinSpin: () => {
			tungtungAnimationName = 'sahur_win1';
			tungtungLoop = false;
		},
		tungtungWinMultiplier: () => {
			tungtungAnimationName = 'sahur_win2';
			tungtungLoop = false;
		},
		tungtungWinBig: () => {
			tungtungAnimationName = 'sahur_win3';
			tungtungLoop = false;
		},
		tungtungIdle: () => {
			tungtungAnimationName = 'sahur_idle';
			tungtungLoop = true;
		},
	});

	// Start idle break scheduling
	scheduleIdleBreak();
</script>

<!-- Reel background behind everything -->
<Sprite
	key="reelBackground"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={context.stateGameDerived.boardLayout().width * BG_RATIO * SPRITE_SCALE.width * 1.0}
	height={context.stateGameDerived.boardLayout().width * SPRITE_SCALE.height * 0.95}
	zIndex={-2}
/>

<!-- Reel glow effect -->
<Sprite
	key="reelGlow"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={context.stateGameDerived.boardLayout().width * 1.2}
	height={context.stateGameDerived.boardLayout().height * 1.2}
	zIndex={-1}
	blendMode="add"
/>

<!-- Top banner above the frame -->
<Sprite
	key="topBanner"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) - 50}
	width={context.stateGameDerived.boardLayout().width * 1.2}
	height={100}
	zIndex={2}
/>

<!-- Reel frame on top -->
<Sprite
	key="reelFrame"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={context.stateGameDerived.boardLayout().width * BG_RATIO * SPRITE_SCALE.width}
	height={context.stateGameDerived.boardLayout().width * SPRITE_SCALE.height}
/>

{#if ['desktop', 'landscape'].includes(context.stateLayoutDerived.layoutType())}
	{@const buyButtonX = context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 197 / 2 - 60}
	{@const buyButtonY = context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) + (135.5 / 2) - 10}
	{@const bonusBuyCost = stateBet.betAmount * 100}

<!-- Buy frame sprite - only shown in base mode (not during free spins) -->
{#if !showFreeSpinCounter}
<Sprite
	key="buyFrame"
	anchor={0.5}
	x={buyButtonX}
	y={buyButtonY}
	width={197}
	height={135.5}
	zIndex={1}
	interactive={true}
	cursor="pointer"
	onpointerup={() => {
		stateBuyButton.animationName = 'big_buy_in';
		stateBuyButton.loop = false;
	}}
/>

<!-- "BUY FEATURE" text on the button -->
<Sprite
	key="buyText"
	anchor={0.5}
	x={buyButtonX}
	y={buyButtonY - 20}
	width={198}
	height={44}
	zIndex={2}
/>

<!-- Bonus buy cost text -->
{#if fontLoaded}
<Text
	text={`$${bonusBuyCost.toString()}`}
	x={buyButtonX}
	y={buyButtonY + 30}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 32,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={2}
/>
{/if}
{/if}

<!-- Free Spin Counter Frame - shown during free spins in same position as buy frame -->
{#if showFreeSpinCounter}
<Sprite
	key="freeSpinCounterFrame"
	anchor={0.5}
	x={buyButtonX}
	y={buyButtonY}
	width={197}
	height={135.5}
	zIndex={1}
/>

<!-- Free spin counter text -->
{#if fontLoaded}
<Text
	text={`${freeSpinTotal - freeSpinCurrent}`}
	x={buyButtonX}
	y={buyButtonY - 35}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 42,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={2}
/>
{/if}

<Sprite
	key="free_spins.png"
	anchor={0.5}
	x={buyButtonX}
	y={buyButtonY + 5}
	scale={{ x: 0.5, y: 0.5 }}
	zIndex={2}
/>

<Sprite
	key="left.png"
	anchor={0.5}
	x={buyButtonX}
	y={buyButtonY + 40}
	scale={{ x: 0.5, y: 0.5 }}
	zIndex={2}
/>
{/if}

<!-- Bet frame - only shown in base mode (not during free spins) -->
{#if !showFreeSpinCounter}
{@const betFrameX = context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 197 / 2 - 60}
{@const betFrameY = context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) + 135.5 + 10 + (243.5 / 2) - 10}

<Sprite
	key="bet_frame.png"
	anchor={0.5}
	x={betFrameX}
	y={betFrameY}
	width={197}
	height={243.5}
	zIndex={1}
/>

<!-- Button 01 (toggle button) -->
<Sprite
	key="button_01.png"
	anchor={0.5}
	x={betFrameX}
	y={betFrameY + 80}
	width={179.5}
	height={53}
	zIndex={2}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleAnteBet}
/>

<!-- "On" text on left side of button -->
<Sprite
	key="on.png"
	anchor={0.5}
	x={betFrameX - 45}
	y={betFrameY + 80}
	width={47.5}
	height={32}
	zIndex={3}
/>

<!-- "Off" text on right side of button -->
<Sprite
	key="off.png"
	anchor={0.5}
	x={betFrameX + 45}
	y={betFrameY + 80}
	width={57}
	height={32.5}
	zIndex={3}
/>

<!-- Arrow toggle (moves left/right) -->
<Sprite
	key="arrow.png"
	anchor={0.5}
	x={betFrameX + (isToggleOn ? ARROW_ON_POSITION : ARROW_OFF_POSITION)}
	y={betFrameY + 80}
	width={86}
	height={34}
	zIndex={4}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleAnteBet}
/>
{/if}
	{@const betFrameCenterY = context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) + 135.5 + 10 + (243.5 / 2) - 10}
	{@const betFrameBottomY = betFrameCenterY + (243.5 / 2)}
	<!-- Skibidi Toilet character - 20px to the right of board, bottom aligned -->
	<SpineProvider
		key="skibidiToilet"
		x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT + (context.stateGameDerived.boardLayout().width / 2) + 20 + 110}
		y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET + (context.stateGameDerived.boardLayout().height / 2) - 50}
		width={150}
		height={150}
		zIndex={3}
	>
		<SpineTrack
			trackIndex={0}
			animationName={skibidiAnimationName}
			loop={skibidiLoop}
			listener={{
				complete: (entry) => {
					if (entry.animation) {
						// After idle_break, return to idle
						if (entry.animation.name === 'idle_break') {
							skibidiAnimationName = 'idle';
							skibidiLoop = true;
							scheduleIdleBreak();
						}
						// After appearing, go to idle
						else if (entry.animation.name === 'head swirling_in_new') {
							skibidiAnimationName = 'idle';
							skibidiLoop = true;
							scheduleIdleBreak();
						}
						// After head swing, return to idle
						else if (entry.animation.name === 'head_swing_new') {
							skibidiAnimationName = 'idle';
							skibidiLoop = true;
							scheduleIdleBreak();
						}
						// After laser eyes, return to idle and reveal multiplier
						else if (entry.animation.name === 'laser_eyes_zapping_the_board') {
							context.eventEmitter.broadcast({ type: 'skibidiLaserReveal' });
							skibidiAnimationName = 'idle';
							skibidiLoop = true;
							scheduleIdleBreak();
						}
					}
				},
			}}
		/>
	</SpineProvider>

	<!-- TungTung character - 20px left of bottom board edge, below bet frame -->
	<SpineProvider
		key="tungtung"
		x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 20 - 136}
		y={betFrameBottomY + 190}
		width={95}
		height={168}
		zIndex={3}
	>
		<SpineTrack
			trackIndex={0}
			animationName={tungtungAnimationName}
			loop={tungtungLoop}
			listener={{
				complete: (entry) => {
					if (entry.animation) {
						// After any win animation, return to idle
						if (entry.animation.name === 'sahur_win1' ||
						    entry.animation.name === 'sahur_win2' ||
						    entry.animation.name === 'sahur_win3') {
							tungtungAnimationName = 'sahur_idle';
							tungtungLoop = true;
						}
					}
				},
			}}
		/>
	</SpineProvider>
{/if}
