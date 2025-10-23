<script lang="ts">
	import * as spine from '@esotericsoftware/spine-pixi-v8';
	import type { Spine } from '@esotericsoftware/spine-pixi-v8';
	import type { FederatedPointerEvent } from 'pixi.js';
	import { stateBuyButton } from './BoardFrame.svelte';
	import { onMount } from 'svelte';
	import { stateBet } from 'state-shared';
	import { gameActor } from '../game/actor';
	import { getContext } from '../game/context';

	// Spine instance passed as prop from parent
	let { spineInstance }: { spineInstance: Spine } = $props();

	const context = getContext();

	const bounds = new spine.SkeletonBounds();

	// Check if player has enough balance for bonus buy (100x bet)
	const hasEnoughBalance = $derived(() => {
		const bonusBuyCost = stateBet.betAmount * 100;
		return stateBet.balanceAmount >= bonusBuyCost;
	});

	// Refresh bounds with current pose
	function refreshBounds() {
		// In spine-pixi-v8, updateWorldTransform requires a Physics parameter
		// Pass the skeleton's physics constraint or use the default
		const physics = spineInstance.skeleton.data.defaultPhysics || spine.Physics.none;
		spineInstance.skeleton.updateWorldTransform(physics);
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

	// Handle pointer down on the spine
	function onPointerDown(e: FederatedPointerEvent) {
		if (hitBox('yes_place_holder2', e)) {
			// Check if player has enough balance
			if (!hasEnoughBalance()) {
				// Don't do anything if insufficient balance
				return;
			}

			// Play button sound
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

			// Set bet mode to bonus and trigger the bet (matching chocolate implementation)
			stateBet.activeBetModeKey = 'BONUS';
			gameActor.send({ type: 'BET' });

			// Close the modal after triggering the bet
			stateBuyButton.animationName = 'big_buy_yes_out';
			stateBuyButton.loop = false;
		} else if (hitBox('x_place_holder2', e)) {
			// Play button sound
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

			stateBuyButton.animationName = 'big_buy_no_out';
			stateBuyButton.loop = false;
		} else if (hitBox('upper_cross', e)) {
			// Play button sound
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

			stateBuyButton.animationName = 'big_buy_upper_cross_out';
			stateBuyButton.loop = false;
		}
	}

	// Update the yes button appearance based on balance
	$effect(() => {
		const greenButton = spineInstance.skeleton.findSlot('green_button');
		const greenButton2 = spineInstance.skeleton.findSlot('green_button2');

		if (hasEnoughBalance()) {
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
