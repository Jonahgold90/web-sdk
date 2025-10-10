<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' }
		| { type: 'skibidiAppear' }
		| { type: 'skibidiDisappear' }
		| { type: 'skibidiLaserEyes' }
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
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';

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

	type AnimationName = 'reelhouse_glow_start' | 'reelhouse_glow_idle' | 'reelhouse_glow_exit';

	let animationName = $state<AnimationName | undefined>(undefined);
	let loop = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			animationName = 'reelhouse_glow_start';
			loop = false;
		},
		boardFrameGlowHide: () => {
			if (animationName) animationName = 'reelhouse_glow_exit';
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

{#if animationName}
	<SpineProvider
		zIndex={-1}
		key="reelhouse"
		x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
		y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
		width={context.stateGameDerived.boardLayout().width * SPINE_SCALE.width}
		height={context.stateGameDerived.boardLayout().height * SPINE_SCALE.height}
	>
		<SpineTrack
			trackIndex={0}
			{animationName}
			{loop}
			listener={{
				complete: (entry) => {
					if (entry.animation) {
						if (entry.animation.name === 'reelhouse_glow_start') {
							animationName = 'reelhouse_glow_idle';
							loop = true;
						}

						if (entry.animation.name === 'reelhouse_glow_exit') {
							animationName = undefined;
							loop = false;
						}
					}
				},
			}}
		/>
	</SpineProvider>
{/if}

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

<!-- Buy frame sprite - vertically level with board frame, to the left -->
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

<!-- Bet frame - right under buy frame with vertical margin -->
<Sprite
	key="betFrame"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 197 / 2 - 60}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) + 135.5 + 10 + (243.5 / 2) - 10}
	width={197}
	height={243.5}
	zIndex={1}
/>
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
						// After laser eyes, return to idle
						else if (entry.animation.name === 'laser_eyes_zapping_the_board') {
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
