<script lang="ts">
	import * as spine from '@esotericsoftware/spine-pixi-v8';
	import type { Spine } from '@esotericsoftware/spine-pixi-v8';
	import type { FederatedPointerEvent } from 'pixi.js';
	import { onMount } from 'svelte';
	import { stateBet, stateBetDerived, stateModal, stateConfig } from 'state-shared';

	import { getContext } from '../game/context';

	let { spineInstance }: { spineInstance: Spine } = $props();

	const context = getContext();
	const bounds = new spine.SkeletonBounds();

	// Spin button animation state (passed from parent)
	let spinButtonAnimation = $state('spin_button_idle');
	let isHoveringButton = $state<'plus' | 'minus' | 'spin' | null>(null);

	const isSpinning = $derived(!context.stateXstateDerived.isIdle());

	// Update animation based on spinning state and hover
	$effect(() => {
		if (isSpinning) {
			spinButtonAnimation = 'spin_pause_idle';
		} else if (isHoveringButton === 'plus') {
			spinButtonAnimation = 'plus_hover';
		} else if (isHoveringButton === 'minus') {
			spinButtonAnimation = 'minus_hover';
		} else if (isHoveringButton === 'spin') {
			spinButtonAnimation = 'spin_hover';
		} else {
			spinButtonAnimation = 'spin_button_idle';
		}
	});

	function refreshBounds() {
		const physics = spineInstance.skeleton.data.defaultPhysics || spine.Physics.none;
		spineInstance.skeleton.updateWorldTransform(physics);
		bounds.update(spineInstance.skeleton, true);
	}

	function containsPoint(polygon: ArrayLike<number>, x: number, y: number): boolean {
		const nn = polygon.length;
		let prevIndex = nn - 2;
		let inside = false;

		for (let ii = 0; ii < nn; ii += 2) {
			const vertexY = polygon[ii + 1];
			const prevY = polygon[prevIndex + 1];

			if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
				const vertexX = polygon[ii];
				if (vertexX + ((y - vertexY) / (prevY - vertexY)) * (polygon[prevIndex] - vertexX) < x) {
					inside = !inside;
				}
			}
			prevIndex = ii;
		}

		return inside;
	}

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

	const onSpinPress = () => {
		if (isSpinning) {
			// Stop spinning if already spinning
			if (stateBetDerived.hasAutoBetCounter()) stateBet.autoSpinsCounter = 0;
			context.eventEmitter.broadcast({ type: 'stopButtonClick' });
		} else {
			// Start spinning
			spinButtonAnimation = 'spin_click';
			context.eventEmitter.broadcast({ type: 'soundPressBet' });
			context.eventEmitter.broadcast({ type: 'bet' });
		}
	};

	function onPointerDown(e: FederatedPointerEvent) {
		if (hitBox('plus2', e)) {
			// Plus clicked - increase bet to next interval
			spinButtonAnimation = 'plus_click';
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

			const currentBetAmount = stateBet.betAmount;
			const betOptions = stateConfig.betAmountOptions;
			const currentIndex = betOptions.findIndex((amount) => amount >= currentBetAmount);
			const nextIndex = Math.min(currentIndex + 1, betOptions.length - 1);
			stateBetDerived.setBetAmount(betOptions[nextIndex]);

			setTimeout(() => (isHoveringButton = null), 300);
		} else if (hitBox('minus2', e)) {
			// Minus clicked - decrease bet to previous interval
			spinButtonAnimation = 'minus_click';
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

			const currentBetAmount = stateBet.betAmount;
			const betOptions = stateConfig.betAmountOptions;
			const currentIndex = betOptions.findIndex((amount) => amount >= currentBetAmount);
			const prevIndex = Math.max(currentIndex - 1, 0);
			stateBetDerived.setBetAmount(betOptions[prevIndex]);

			setTimeout(() => (isHoveringButton = null), 300);
		} else if (hitBox('spin_bounding', e)) {
			// Spin clicked
			onSpinPress();
			setTimeout(() => (isHoveringButton = null), 300);
		}
	}

	function onPointerMove(e: FederatedPointerEvent) {
		let newHoverState: 'plus' | 'minus' | 'spin' | null = null;

		if (hitBox('plus2', e)) {
			newHoverState = 'plus';
		} else if (hitBox('minus2', e)) {
			newHoverState = 'minus';
		} else if (hitBox('spin_bounding', e)) {
			newHoverState = 'spin';
		}

		if (newHoverState !== isHoveringButton) {
			isHoveringButton = newHoverState;
		}
	}

	function onPointerLeave() {
		isHoveringButton = null;
	}

	onMount(() => {
		spineInstance.eventMode = 'static';
		spineInstance.cursor = 'pointer';
		spineInstance.on('pointerdown', onPointerDown);
		spineInstance.on('pointermove', onPointerMove);
		spineInstance.on('pointerleave', onPointerLeave);

		return () => {
			spineInstance.off('pointerdown', onPointerDown);
			spineInstance.off('pointermove', onPointerMove);
			spineInstance.off('pointerleave', onPointerLeave);
		};
	});

	// Export animation state so parent can use it
	$effect(() => {
		// Update the parent's spine track animation
		const track = spineInstance.state.tracks[0];
		if (track && track.animation?.name !== spinButtonAnimation) {
			const loop =
				spinButtonAnimation === 'spin_button_idle' ||
				spinButtonAnimation === 'spin_pause_idle' ||
				spinButtonAnimation.includes('hover');
			spineInstance.state.setAnimation(0, spinButtonAnimation, loop);
		}
	});
</script>
