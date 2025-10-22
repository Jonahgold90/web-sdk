<script lang="ts" module>
	export type EmitterEventMultiHit = { type: 'multiHitAnimationComplete' };
</script>

<script lang="ts">
	import { SpineProvider, SpineTrack, Container } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';

	const context = getContext();

	type AnimatingHit = {
		id: number;
		reel: number;
		row: number;
		x: number;
		yTop: number;
		yBottom: number;
		scaleY: number;
	};

	let animatingHits = $state<AnimatingHit[]>([]);
	let nextId = 0;

	// Board top position (where lightning starts)
	const BOARD_TOP_Y = -SYMBOL_SIZE * 0.5; // Top of the visible board area

	const startMultiHitAnimation = async () => {
		// Scan the board for M symbols directly (skip padding rows 0 and 6, only scan visible rows 1-5)
		const mSymbols: Array<{ reel: number; row: number; value: number }> = [];

		for (let reelIndex = 0; reelIndex < context.stateGame.board.length; reelIndex++) {
			const reel = context.stateGame.board[reelIndex];
			// Only scan visible rows (1-5), skip padding rows (0 and 6)
			for (let rowIndex = 1; rowIndex <= 5; rowIndex++) {
				const symbol = reel.reelState.symbols[rowIndex];
				if (symbol?.rawSymbol.name === 'M') {
					mSymbols.push({
						reel: reelIndex,
						row: rowIndex,
						value: symbol.rawSymbol.multiplier || 1,
					});
				}
			}
		}

		console.log('🌩️ MultiHit: Starting animation, M symbols found:', mSymbols);
		if (mSymbols.length === 0) {
			console.log('🌩️ MultiHit: No M symbols on board, skipping');
			return;
		}

		// Clear any previous animations
		animatingHits = [];

		// Sequential start with small delays
		const STAGGER_DELAY = 60; // ms between each lightning strike start

		for (let i = 0; i < mSymbols.length; i++) {
			const mult = mSymbols[i];

			// Wait for stagger delay (except for first one)
			if (i > 0) {
				await new Promise(resolve => setTimeout(resolve, STAGGER_DELAY));
			}

			// Get symbol position - aim for the exact center of the M symbol
			const reelSymbol = context.stateGame.board[mult.reel]?.reelState.symbols[mult.row];
			const symbolX = getSymbolX(mult.reel);
			// Symbol Y is at the center of the symbol, so we subtract SYMBOL_SIZE to get to the center
			const symbolY = (reelSymbol?.symbolY.current ?? 0) - SYMBOL_SIZE;

			console.log(`🌩️ MultiHit: Strike ${i} - reel:${mult.reel}, row:${mult.row}, x:${symbolX}, y:${symbolY}, symbolY.current:${reelSymbol?.symbolY.current}`);

			// Calculate scale to stretch from top to symbol
			const distance = symbolY - BOARD_TOP_Y;
			const originalHeight = SYMBOL_SIZE * 2; // Approximate original spine height in our coordinate system
			const scaleY = distance / originalHeight;

			console.log(`🌩️ MultiHit: Distance:${distance}, scaleY:${scaleY}`);

			// Add to animating list
			animatingHits = [
				...animatingHits,
				{
					id: nextId++,
					reel: mult.reel,
					row: mult.row,
					x: symbolX,
					yTop: BOARD_TOP_Y,
					yBottom: symbolY,
					scaleY: Math.max(scaleY, 0.5), // Minimum scale to avoid too small
				},
			];
		}

		console.log('🌩️ MultiHit: Animating hits:', animatingHits);

		// Wait for animation duration, then reveal multipliers and clear
		await new Promise(resolve => setTimeout(resolve, 600)); // Animation is ~567ms

		// Trigger multiplier reveal now that lightning has struck
		console.log('✨ MultiHit: Revealing multipliers');
		context.eventEmitter.broadcast({ type: 'skibidiLaserReveal' });

		animatingHits = [];

		context.eventEmitter.broadcast({ type: 'multiHitAnimationComplete' });
	};

	context.eventEmitter.subscribeOnMount({
		skibidiLaserEyes: async () => {
			console.log('🌩️ MultiHit: Received skibidiLaserEyes event');
			// Wait for laser to start before triggering lightning (500ms delay)
			await new Promise(resolve => setTimeout(resolve, 500));
			// Trigger multi-hit animation after the laser has started
			startMultiHitAnimation();
		},
	});
</script>

{#if animatingHits.length > 0}
	<BoardContainer>
		{#each animatingHits as hit (hit.id)}
			<Container
				x={hit.x}
				y={hit.yTop}
				scale={{ x: 1, y: hit.scaleY }}
				rotation={0}
				zIndex={90}
			>
				<SpineProvider
					key="multiHit"
					width={SYMBOL_SIZE}
					height={SYMBOL_SIZE * 2}
				>
					<SpineTrack
						trackIndex={0}
						animationName="brbo_multipler_hit"
						loop={false}
					/>
				</SpineProvider>
			</Container>
		{/each}
	</BoardContainer>
{/if}
