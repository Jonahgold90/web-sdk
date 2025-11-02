<script lang="ts">
	import * as spine from '@esotericsoftware/spine-pixi-v8';
	import type { Spine } from '@esotericsoftware/spine-pixi-v8';
	import type { FederatedPointerEvent } from 'pixi.js';
	import { stateBuyButton, getAnimationName, type BuyButtonAnimation } from './BoardFrame.svelte';
	import { onMount } from 'svelte';
	import { stateBet } from 'state-shared';
	import { gameActor } from '../game/actor';
	import { getContext } from '../game/context';

	// Spine instance passed as prop from parent
	let { spineInstance }: { spineInstance: Spine } = $props();

	const context = getContext();

	const bounds = new spine.SkeletonBounds();

	// Helper to get the prefix (buy or play) from current animation
	const getPrefix = (anim: BuyButtonAnimation): 'buy' | 'play' => {
		return anim.startsWith('play_') ? 'play' : 'buy';
	};

	// Helper to check if animation name matches pattern (supports both buy_ and play_ prefixes)
	const isAnimationType = (anim: BuyButtonAnimation, suffix: string) => {
		return anim === `buy_${suffix}` || anim === `play_${suffix}`;
	};

	// Check if player has enough balance for feature (100x bet)
	const hasEnoughBalanceForFeature = $derived(() => {
		const featureCost = stateBet.betAmount * 100;
		return stateBet.balanceAmount >= featureCost;
	});

	// Check if player has enough balance for super feature (300x bet)
	const hasEnoughBalanceForSuperFeature = $derived(() => {
		const superFeatureCost = stateBet.betAmount * 300;
		return stateBet.balanceAmount >= superFeatureCost;
	});

	// Refresh bounds with current pose
	function refreshBounds() {
		// In spine-pixi-v8, updateWorldTransform requires a Physics parameter
		spineInstance.skeleton.updateWorldTransform(spine.Physics.update);
		bounds.update(spineInstance.skeleton, true);
	}

	// Point-in-polygon test using ray casting algorithm
	function containsPoint(polygon: ArrayLike<number>, x: number, y: number): boolean {
		const nn = polygon.length;
		let prevIndex = nn - 2;
		let inside = false;
		for (let ii = 0; ii < nn; ii += 2) {
			const vertexY = polygon[ii + 1];
			const prevY = polygon[prevIndex + 1];
			if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
				const vertexX = polygon[ii];
				if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x) inside = !inside;
			}
			prevIndex = ii;
		}
		return inside;
	}

	// Check if a point hits a specific bounding box
	function hitBox(attachmentName: string, e: FederatedPointerEvent): boolean {
		refreshBounds();
		const p = spineInstance.toLocal(e.global);

		if (!bounds.aabbContainsPoint(p.x, p.y)) return false;

		for (let i = 0; i < bounds.boundingBoxes.length; i++) {
			const bb = bounds.boundingBoxes[i];
			if (bb.name === attachmentName) {
				const poly = bounds.polygons[i];
				return containsPoint(poly, p.x, p.y);
			}
		}
		return false;
	}

	// Check which bounding box should take priority when multiple boxes overlap
	function getHitPriority(e: FederatedPointerEvent): string | null {
		refreshBounds();
		const p = spineInstance.toLocal(e.global);

		if (!bounds.aabbContainsPoint(p.x, p.y)) return null;

		const hitBoxes: string[] = [];
		for (let i = 0; i < bounds.boundingBoxes.length; i++) {
			const bb = bounds.boundingBoxes[i];
			const poly = bounds.polygons[i];
			if (containsPoint(poly, p.x, p.y)) {
				hitBoxes.push(bb.name);
			}
		}

		// Priority order: upper_cross > play_super_feature_box > play_feature
		if (hitBoxes.includes('upper_cross')) return 'upper_cross';
		if (hitBoxes.includes('play_super_feature_box')) return 'play_super_feature_box';
		if (hitBoxes.includes('play_feature')) return 'play_feature';

		return hitBoxes[0] || null;
	}

	// Handle pointer down on the spine
	function onPointerDown(e: FederatedPointerEvent) {
		const currentAnimation = stateBuyButton.animationName;
		const prefix = getPrefix(currentAnimation);

		// In the initial choice screen (panel_super_feature_loop)
		if (isAnimationType(currentAnimation, 'panel_super_feature_loop')) {
			// Get the highest priority bounding box that was hit
			const hitBox = getHitPriority(e);

			if (hitBox === 'upper_cross') {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				// Close the choice screen
				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'panel_upper_cross_out');
				stateBuyButton.loop = false;
				return;
			} else if (hitBox === 'play_feature') {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				// Play click animation then navigate to normal feature confirmation screen
				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'panel_feature_click');
				stateBuyButton.loop = false;
				return;
			} else if (hitBox === 'play_super_feature_box') {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				// Play click animation and navigate to super feature confirmation screen
				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'super_feature_click');
				stateBuyButton.loop = false;
				return;
			}
		}
		// In the normal feature confirmation screen (feature_loop)
		else if (isAnimationType(currentAnimation, 'feature_loop')) {
			if (hitBox('yes', e)) {
				// Check if player has enough balance
				if (!hasEnoughBalanceForFeature()) {
					return;
				}

				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				// Set bet mode to bonus and trigger the bet
				stateBet.activeBetModeKey = 'BONUS';
				gameActor.send({ type: 'BET' });

				// Close the modal after triggering the bet
				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'feature_yes_out');
				stateBuyButton.loop = false;
			} else if (hitBox('no', e)) {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'feature_no_out');
				stateBuyButton.loop = false;
			} else if (hitBox('upper_cross', e)) {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'feature_upper_cross_out');
				stateBuyButton.loop = false;
			}
		}
		// In the super feature confirmation screen (super_feature_loop)
		else if (isAnimationType(currentAnimation, 'super_feature_loop')) {
			if (hitBox('yes', e)) {
				// Check if player has enough balance
				if (!hasEnoughBalanceForSuperFeature()) {
					return;
				}

				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				// Set bet mode to super_bonus and trigger the bet
				stateBet.activeBetModeKey = 'SUPER_BONUS';
				gameActor.send({ type: 'BET' });

				// Close the modal after triggering the bet
				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'super_feature_yes_out');
				stateBuyButton.loop = false;
			} else if (hitBox('no', e)) {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'super_feature_no_out');
				stateBuyButton.loop = false;
			} else if (hitBox('upper_cross', e)) {
				// Play button sound
				context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

				stateBuyButton.animationName = getAnimationName(prefix === 'play', 'super_feature_upper_cross_out');
				stateBuyButton.loop = false;
			}
		}
	}

	// Update the yes button appearance based on balance and current screen
	$effect(() => {
		const currentAnimation = stateBuyButton.animationName;
		const greenButton = spineInstance.skeleton.findSlot('green_button');
		const greenButton2 = spineInstance.skeleton.findSlot('green_button2');

		let hasBalance = true;

		// Check balance based on current screen
		if (isAnimationType(currentAnimation, 'feature_loop')) {
			hasBalance = hasEnoughBalanceForFeature();
		} else if (isAnimationType(currentAnimation, 'super_feature_loop')) {
			hasBalance = hasEnoughBalanceForSuperFeature();
		}

		if (hasBalance) {
			// Normal appearance - white tint, full opacity
			if (greenButton) greenButton.color.set(1, 1, 1, 1);
			if (greenButton2) greenButton2.color.set(1, 1, 1, 1);
		} else {
			// Greyed out appearance - darker tint, reduced opacity
			if (greenButton) greenButton.color.set(0.4, 0.4, 0.4, 0.5);
			if (greenButton2) greenButton2.color.set(0.4, 0.4, 0.4, 0.5);
		}
	});

	// Make the spine interactive when component mounts
	onMount(() => {
		spineInstance.eventMode = 'static';
		spineInstance.cursor = 'pointer';
		spineInstance.on('pointerdown', onPointerDown);

		return () => {
			spineInstance.off('pointerdown', onPointerDown);
		};
	});
</script>
