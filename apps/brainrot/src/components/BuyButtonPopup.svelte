<script lang="ts">
	import { SpineProvider, SpineTrack, BitmapText, Container, SpineSlot, Graphics, Sprite } from 'pixi-svelte';
	import { stateBuyButton, getAnimationName, type BuyButtonAnimation } from './BoardFrame.svelte';
	import { getContext } from '../game/context';
	import BuyButtonBoundingBoxesWrapper from './BuyButtonBoundingBoxesWrapper.svelte';
	import { stateBet, stateBetDerived, stateUrlDerived } from 'state-shared';
	import { bookEventAmountToCurrencyString, numberToCurrencyCodeString } from 'utils-shared/amount';
	import { Graphics as PixiGraphics } from 'pixi.js';

	const context = getContext();
	const VERTICAL_OFFSET = -20;

	// X offset to center super feature confirmation screen (which is offset in spine)
	const xOffset = $derived(0);

	// Check if mobile/portrait layout
	const isMobile = $derived(context.stateLayoutDerived.isStacked());

	// Helper to get the prefix (buy or play) from current animation
	const getPrefix = (anim: BuyButtonAnimation): 'buy' | 'play' => {
		return anim.startsWith('play_') ? 'play' : 'buy';
	};

	// Helper to check if animation name matches pattern (supports both buy_ and play_ prefixes)
	const isAnimationType = (anim: BuyButtonAnimation, suffix: string) => {
		return anim === `buy_${suffix}` || anim === `play_${suffix}`;
	};

	// Calculate costs
	const featureCost = $derived(stateBet.betAmount * 100);
	const superFeatureCost = $derived(stateBet.betAmount * 300);
	const featureText = $derived(numberToCurrencyCodeString(featureCost));
	const superFeatureText = $derived(numberToCurrencyCodeString(superFeatureCost));

	// Debug logging
	$effect(() => {
		if (isAnimationType(stateBuyButton.animationName, 'panel_super_feature_loop')) {
			console.log('Feature text:', featureText, 'Super feature text:', superFeatureText);
			console.log('Feature position:', PLAY_FEATURE_AMOUNT_X, PLAY_FEATURE_AMOUNT_Y);
			console.log('Super feature position:', PLAY_SUPER_FEATURE_AMOUNT_X, PLAY_SUPER_FEATURE_AMOUNT_Y);
		}
	});

	// Bone positions from spine JSON
	// main bone has scaleX=2, scaleY=2
	// bone is at x=0, y=54.17 (child of "main")
	// play_feature is at x=-270, y=-8.5 (child of "bone")
	// play_feature_amount is at x=-1.87, y=-44.22 (child of play_feature)
	// Need to multiply by main's scale: (0 + (-270) + (-1.87)) * 2, (54.17 + (-8.5) + (-44.22)) * 2
	const PLAY_FEATURE_AMOUNT_X = (-271.87) * 2;
	const PLAY_FEATURE_AMOUNT_Y = (1.45) * 2;

	// play_super_feature_ is at x=234.5, y=-8.5 (child of "bone")
	// play_super_feature_amountt is at x=7.41, y=-64.86 (child of play_super_feature_)
	// Need to multiply by main's scale: (0 + 234.5 + 7.41) * 2, (54.17 + (-8.5) + (-64.86)) * 2
	const PLAY_SUPER_FEATURE_AMOUNT_X = (241.91) * 2;
	const PLAY_SUPER_FEATURE_AMOUNT_Y = (-19.19) * 2;

	// play_super_feature_amountt2 is at x=3.81, y=-42.9 (child of big_buy, which is child of main with scale 2)
	const PLAY_SUPER_FEATURE_AMOUNT2_X = 3.81 * 2;
	const PLAY_SUPER_FEATURE_AMOUNT2_Y = -42.9 * 2;

	// Check if we're showing a modal (choice screen or confirmation screen)
	// Note: yes_out animations are excluded so the overlay disappears when buying the bonus
	const isShowingModal = $derived.by(() => {
		const anim = stateBuyButton.animationName;
		return isAnimationType(anim, 'panel_super_feature_loop') ||
			isAnimationType(anim, 'panel_super_feature_in') ||
			isAnimationType(anim, 'panel_upper_cross_out') ||
			isAnimationType(anim, 'panel_feature_click') ||
			isAnimationType(anim, 'super_feature_click') ||
			isAnimationType(anim, 'feature_in') ||
			isAnimationType(anim, 'feature_loop') ||
			isAnimationType(anim, 'feature_no_out') ||
			isAnimationType(anim, 'feature_upper_cross_out') ||
			isAnimationType(anim, 'super_feature_in') ||
			isAnimationType(anim, 'super_feature_loop') ||
			isAnimationType(anim, 'super_feature_no_out') ||
			isAnimationType(anim, 'super_feature_upper_cross_out');
	});

	// Scale: choice screen and confirmation screens scaled differently
	const scale = $derived.by(() => {
		const anim = stateBuyButton.animationName;
		const isChoiceScreen =
			isAnimationType(anim, 'panel_super_feature_loop') ||
			isAnimationType(anim, 'panel_super_feature_in') ||
			isAnimationType(anim, 'panel_upper_cross_out') ||
			isAnimationType(anim, 'panel_feature_click') ||
			isAnimationType(anim, 'super_feature_click');

		const isBigBuyScreen =
			isAnimationType(anim, 'feature_in') ||
			isAnimationType(anim, 'feature_loop') ||
			isAnimationType(anim, 'feature_yes_out') ||
			isAnimationType(anim, 'feature_no_out') ||
			isAnimationType(anim, 'feature_upper_cross_out') ||
			isAnimationType(anim, 'super_feature_in') ||
			isAnimationType(anim, 'super_feature_loop') ||
			isAnimationType(anim, 'super_feature_yes_out') ||
			isAnimationType(anim, 'super_feature_no_out') ||
			isAnimationType(anim, 'super_feature_upper_cross_out');

		const canvasWidth = context.stateLayoutDerived.canvasSizes().width;

		if (isMobile) {
			// Mobile small (width < 400) vs mobile large
			if (isChoiceScreen) {
				return canvasWidth < 400 ? 0.5 : 0.65;
			} else if (isBigBuyScreen) {
				return canvasWidth < 400 ? 0.5 : 0.65;
			}
			return 1;
		} else {
			// Popout small (400), Popout large (800), Laptop (1024), Desktop (1200)
			if (isChoiceScreen) {
				if (canvasWidth <= 400) return 0.4; // Popout small
				if (canvasWidth <= 800) return 0.8; // Popout large
				return canvasWidth < 1100 ? 1.2 : 1.5; // Laptop/Desktop
			} else if (isBigBuyScreen) {
				if (canvasWidth <= 400) return 0.4; // Popout small
				if (canvasWidth <= 800) return 0.8; // Popout large
				return canvasWidth < 1100 ? 0.9 : 1.2; // Laptop/Desktop
			}
			return 1;
		}
	});

	// Create a mask to hide elements outside the centered area
	let maskGraphics = $state<PixiGraphics | null>(null);

	$effect(() => {
		if (maskGraphics) {
			const canvasWidth = context.stateLayoutDerived.canvasSizes().width;
			const canvasHeight = context.stateLayoutDerived.canvasSizes().height;
			const centerX = canvasWidth / 2;
			const centerY = canvasHeight / 2;

			maskGraphics.clear();
			// Create a circular mask around the center to hide stray elements
			maskGraphics.circle(centerX, centerY, Math.max(canvasWidth, canvasHeight) / 2);
			maskGraphics.fill({ color: 0xffffff });
		}
	});
</script>

{#if isShowingModal}
<!-- Semi-transparent black background overlay -->
<Graphics
	x={-1000}
	y={-1000}
	zIndex={100000}
	draw={(g) => {
		g.clear();
		g.rect(0, 0, 5000, 5000);
		g.fill({ color: 0x000000, alpha: 0.7 });
	}}
/>

<!-- Mask graphics for SpineProvider -->
<Graphics
	zIndex={100001}
	bind:instance={maskGraphics}
/>

<Container zIndex={100001} mask={maskGraphics}>
<SpineProvider
	key="buyButtonSpine"
	x={context.stateLayoutDerived.canvasSizes().width / 2 + xOffset}
	y={context.stateLayoutDerived.canvasSizes().height / 2 + VERTICAL_OFFSET}
	width={800}
	height={520}
	scale={{ x: scale, y: scale }}
>
	<SpineTrack
		trackIndex={0}
		animationName={stateBuyButton.animationName}
		loop={stateBuyButton.loop}
		listener={{
			complete: (entry) => {
				if (entry.animation) {
					const animName = entry.animation.name as BuyButtonAnimation;
					const prefix = getPrefix(animName);

					// Transition from intro animations to loop animations
					if (isAnimationType(animName, 'panel_super_feature_in')) {
						stateBuyButton.animationName = getAnimationName(prefix === 'play', 'panel_super_feature_loop');
						stateBuyButton.loop = true;
					} else if (isAnimationType(animName, 'panel_feature_click')) {
						// After clicking normal feature, show confirmation screen
						stateBuyButton.animationName = getAnimationName(prefix === 'play', 'feature_in');
						stateBuyButton.loop = false;
					} else if (isAnimationType(animName, 'feature_in')) {
						stateBuyButton.animationName = getAnimationName(prefix === 'play', 'feature_loop');
						stateBuyButton.loop = true;
					} else if (isAnimationType(animName, 'super_feature_click')) {
						stateBuyButton.animationName = getAnimationName(prefix === 'play', 'super_feature_in');
						stateBuyButton.loop = false;
					} else if (isAnimationType(animName, 'super_feature_in')) {
						stateBuyButton.animationName = getAnimationName(prefix === 'play', 'super_feature_loop');
						stateBuyButton.loop = true;
					}

					// Reset to small buy/play click after any exit animation
					if (isAnimationType(animName, 'panel_upper_cross_out') ||
					    isAnimationType(animName, 'feature_no_out') ||
					    isAnimationType(animName, 'feature_upper_cross_out') ||
					    isAnimationType(animName, 'super_feature_no_out') ||
					    isAnimationType(animName, 'super_feature_upper_cross_out')) {
						stateBuyButton.animationName = prefix === 'play' ? 'small_play_click' : 'small_buy_click';
						stateBuyButton.loop = true;
					}
					// Yes buttons don't reset - they trigger the bet and the game handles the state
					// (Removed feature_yes_out and super_feature_yes_out from reset logic)
				}
			},
		}}
	/>

	{#if isAnimationType(stateBuyButton.animationName, 'panel_super_feature_loop') || isAnimationType(stateBuyButton.animationName, 'panel_super_feature_in') || isAnimationType(stateBuyButton.animationName, 'panel_feature_click') || isAnimationType(stateBuyButton.animationName, 'super_feature_click') || isAnimationType(stateBuyButton.animationName, 'panel_upper_cross_out')}
	<!-- Dynamic cost text for normal feature (shown in choice screen) -->
	<SpineSlot slotName="play_feature_frame">
		<BitmapText
			text={featureText}
			x={-20}
			y={50}
			anchor={{ x: 0.5, y: 0.5 }}
			style={{
				fontFamily: 'pinkFont',
				fontSize: 14,
			}}
		/>
	</SpineSlot>

	<!-- Dynamic cost text for super feature (shown in choice screen) -->
	<SpineSlot slotName="play_super_feature_super_frame">
		<BitmapText
			text={superFeatureText}
			x={0}
			y={85}
			anchor={{ x: 0.5, y: 0.5 }}
			style={{
				fontFamily: 'yellowFont',
				fontSize: 14,
			}}
		/>
	</SpineSlot>
	{/if}

	{#if isAnimationType(stateBuyButton.animationName, 'feature_loop') || isAnimationType(stateBuyButton.animationName, 'feature_in') || isAnimationType(stateBuyButton.animationName, 'feature_yes_out') || isAnimationType(stateBuyButton.animationName, 'feature_no_out') || isAnimationType(stateBuyButton.animationName, 'feature_upper_cross_out')}
	<!-- Dynamic cost text for normal feature confirmation screen -->
	<SpineSlot slotName="buy_text">
		<BitmapText
			text={featureText}
			x={-25}
			y={130}
			anchor={{ x: 0.5, y: 0.5 }}
			style={{
				fontFamily: 'pinkFont',
				fontSize: 20,
			}}
		/>
	</SpineSlot>
	{/if}

	{#if isAnimationType(stateBuyButton.animationName, 'super_feature_loop') || isAnimationType(stateBuyButton.animationName, 'super_feature_in') || isAnimationType(stateBuyButton.animationName, 'super_feature_yes_out') || isAnimationType(stateBuyButton.animationName, 'super_feature_no_out') || isAnimationType(stateBuyButton.animationName, 'super_feature_upper_cross_out')}
	<!-- Dynamic cost text for super feature confirmation screen -->
	<SpineSlot slotName="buy_text">
		<BitmapText
			text={superFeatureText}
			x={0}
			y={185}
			anchor={{ x: 0.5, y: 0.5 }}
			style={{
				fontFamily: 'yellowFont',
				fontSize: 15,
			}}
		/>
	</SpineSlot>
	{/if}

	<!-- Add interactive bounding boxes wrapper -->
	<BuyButtonBoundingBoxesWrapper />
</SpineProvider>
</Container>
{/if}
