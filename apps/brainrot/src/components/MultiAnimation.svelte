<script lang="ts" module>
	export type EmitterEventMultiAnimation =
		| { type: 'multiAnimationStart'; multipliers: Array<{ reel: number; row: number; value: number }>; totalWin: number }
		| { type: 'multiAnimationComplete' };
</script>

<script lang="ts">
	import { Sprite, BitmapText, SpineProvider, SpineTrack, Container } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { waitForResolve } from 'utils-shared/wait';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';

	import { getContext } from '../game/context';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import { SYMBOL_SIZE, REEL_PADDING, BOARD_DIMENSIONS } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';
	import SymbolMultiplierText from './SymbolMultiplierText.svelte';

	const context = getContext();

	type AnimatingMultiplier = {
		value: number;
		x: Tween<number>;
		y: Tween<number>;
		scale: Tween<number>;
		reel: number;
		row: number;
	};

	let animating = $state(false);
	let animatingMultipliers = $state<AnimatingMultiplier[]>([]);
	let showOverlay = $state(false);
	let overlayX = $state(0);
	let overlayY = $state(0);
	let finalWinAmount = $state(0);
	let overlayComplete = $state(() => {});

	// For showing merged multiplier value as BitmapText
	let showMergedMulti = $state(false);
	let mergedMultiValue = $state(0);
	let mergedMultiY = $state<Tween<number> | null>(null);

	// Center position for merging multipliers in the middle
	// X: Between reels 2 and 3 (at 2.5)
	// Y: Middle row (row 2 of 0-4) - using same formula as getSymbolY
	const centerX = SYMBOL_SIZE * (2.5 + REEL_PADDING);
	const centerY = (2 + 0.5) * SYMBOL_SIZE;  // getSymbolY(2) = 2.5 * SYMBOL_SIZE

	// Calculate tumble frame Y position in board coordinates
	const tumbleFrameY = $derived(() => {
		const boardLayoutY = context.stateGameDerived.boardLayout().y;
		const boardHeight = context.stateGameDerived.boardLayout().height;
		const POSITION_ADJUSTMENT = 1.01;
		const VERTICAL_OFFSET = -20;

		// This is the absolute screen position of tumble frame
		const absoluteY = boardLayoutY * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (boardHeight / 2) - 45;

		// Convert to board-relative coordinates (board top-left is at -height/2)
		return absoluteY - (boardLayoutY - boardHeight / 2);
	});

	context.eventEmitter.subscribeOnMount({
		multiAnimationStart: async ({ multipliers, totalWin }) => {
			if (multipliers.length === 0) return;

			animating = true;
			finalWinAmount = totalWin;

			// Create animating multipliers from current positions
			animatingMultipliers = multipliers.map((mult) => {
				const reelSymbol = context.stateGame.board[mult.reel]?.reelState.symbols[mult.row];
				const startX = getSymbolX(mult.reel);
				const startY = reelSymbol?.symbolY.current ?? getSymbolY(mult.row - 1);

				return {
					value: mult.value,
					x: new Tween(startX),
					y: new Tween(startY),
					scale: new Tween(1),
					reel: mult.reel,
					row: mult.row,
				};
			});

			if (multipliers.length > 1) {
				// Multiple multipliers: merge in middle, explode, then go to tumble frame

				// Step 1: Move both horizontally AND vertically to center while keeping original size
				await Promise.all(
					animatingMultipliers.map(async (mult) => {
						const promises = [
							mult.x.set(centerX, { duration: 500, easing: cubicOut }),
							mult.y.set(centerY, { duration: 500, easing: cubicOut }),
							mult.scale.set(1.0, { duration: 500, easing: cubicOut }),
						];
						await Promise.all(promises);
					})
				);

				// Step 2: Hide individual multipliers
				animatingMultipliers = [];

				// Show merged multiplier value immediately after spines hide
				mergedMultiValue = multipliers.reduce((sum: number, m: { reel: number; row: number; value: number }) => sum + m.value, 0);
				mergedMultiY = new Tween(centerY + 10);
				showMergedMulti = true;

				// Step 3: Start explosion at the same center position
				overlayX = centerX;
				overlayY = centerY;
				showOverlay = true;
				await waitForResolve((resolve) => (overlayComplete = resolve));
				showOverlay = false;

				// Brief delay to let the merged value be visible before moving
				await new Promise(resolve => setTimeout(resolve, 100));

				// Step 4: Animate merged value up to tumble frame
				await mergedMultiY.set(tumbleFrameY(), { duration: 300, easing: cubicOut });

				// Step 5: Hide merged multi and explode at tumble frame
				showMergedMulti = false;
				overlayX = centerX;
				overlayY = tumbleFrameY();
				showOverlay = true;

				// Update tumbleWinAmount to final win right when overlay plays
				context.eventEmitter.broadcast({
					type: 'tumbleWinAmountUpdate',
					amount: finalWinAmount,
					animate: false
				});

				await waitForResolve((resolve) => (overlayComplete = resolve));
				showOverlay = false;

				// Step 5: Brief display of final amount
				await new Promise(resolve => setTimeout(resolve, 150));
			} else {
				// Single multiplier: go straight to tumble frame, explode there

				// Step 1: Move directly to tumble frame position
				await Promise.all(
					animatingMultipliers.map(async (mult) => {
						const promises = [
							mult.x.set(centerX, { duration: 400, easing: cubicOut }),
							mult.y.set(tumbleFrameY(), { duration: 400, easing: cubicOut }),
							mult.scale.set(1.0, { duration: 400, easing: cubicOut }),
						];
						await Promise.all(promises);
					})
				);

				// Step 2: Hide multiplier and show overlay at tumble frame
				animatingMultipliers = [];
				overlayX = centerX;
				overlayY = tumbleFrameY();
				showOverlay = true;

				// Update tumbleWinAmount to final win right when overlay plays
				context.eventEmitter.broadcast({
					type: 'tumbleWinAmountUpdate',
					amount: finalWinAmount,
					animate: false
				});

				await waitForResolve((resolve) => (overlayComplete = resolve));
				showOverlay = false;

				// Step 3: Brief display of final amount
				await new Promise(resolve => setTimeout(resolve, 150));
			}

			// Cleanup
			animating = false;

			context.eventEmitter.broadcast({ type: 'multiAnimationComplete' });
		},
	});
</script>

{#if animating}
	<BoardContainer>
		{#each animatingMultipliers as mult}
			<Container
				x={mult.x.current}
				y={mult.y.current}
				scale={mult.scale.current}
				zIndex={100}
			>
				<SymbolMultiplierText value={mult.value} />
			</Container>
		{/each}
	</BoardContainer>
{/if}

{#if showMergedMulti && mergedMultiY}
	<BoardContainer>
		<BitmapText
			text={`${mergedMultiValue}x`}
			x={centerX}
			y={mergedMultiY.current}
			anchor={0.5}
			style={{
				fontFamily: 'greenFont',
				fontSize: 6,
			}}
			zIndex={100}
		/>
	</BoardContainer>
{/if}

{#if showOverlay}
	<BoardContainer>
		<SpineProvider
			key="multiOverlay"
			x={overlayX}
			y={overlayY}
			width={SYMBOL_SIZE * 2}
			height={SYMBOL_SIZE * 2}
		>
			<SpineTrack
				trackIndex={0}
				animationName="brbo_multiplier_overlay"
				loop={false}
				listener={{
					complete: () => {
						overlayComplete();
					},
				}}
			/>
		</SpineProvider>
	</BoardContainer>
{/if}
