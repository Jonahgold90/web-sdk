<script lang="ts" module>
	export type EmitterEventMultiHit = { type: 'multiHitAnimationComplete' };
</script>

<script lang="ts">
	import { SpineProvider, SpineTrack, Container, BitmapText } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import { stateLayoutDerived } from '../game/stateLayout';
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
	// Row 0 (padding row) centers at 0.5 * SYMBOL_SIZE, start from top of that row
	const BOARD_TOP_Y = 0;

	const startMultiHitAnimation = async (positions: Array<{ reel: number; row: number }>) => {
		if (positions.length === 0) {
			return;
		}

		// Clear any previous animations
		animatingHits = [];

		// Sequential start with small delays
		const STAGGER_DELAY = 60; // ms between each lightning strike start

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];

			// Wait for stagger delay (except for first one)
			if (i > 0) {
				await new Promise(resolve => setTimeout(resolve, STAGGER_DELAY));
			}

			// Get the actual M symbol spine's position from the board
			const actualSymbol = context.stateGame.board[pos.reel]?.reelState.symbols[pos.row];
			const symbolX = getSymbolX(pos.reel);
			const targetY = actualSymbol?.symbolY.current ?? 0;

			// Calculate distance for spine height
			const distance = targetY - BOARD_TOP_Y;
			const originalHeight = SYMBOL_SIZE * 2;
			const scaleY = distance / originalHeight;

			// Add to animating list
			animatingHits = [
				...animatingHits,
				{
					id: nextId++,
					reel: pos.reel,
					row: pos.row,
					x: symbolX,
					yTop: BOARD_TOP_Y,
					yBottom: targetY,
					scaleY: Math.max(scaleY, 0.5), // Minimum scale to avoid too small
				},
			];
		}

		// Wait for animation duration, then reveal multipliers and clear
		await new Promise(resolve => setTimeout(resolve, 600)); // Animation is ~567ms

		// Trigger multiplier reveal now that lightning has struck
		context.eventEmitter.broadcast({ type: 'skibidiLaserReveal' });

		animatingHits = [];

		context.eventEmitter.broadcast({ type: 'multiHitAnimationComplete' });
	};

	context.eventEmitter.subscribeOnMount({
		skibidiLaserEyes: async ({ positions }: { positions: Array<{ reel: number; row: number }> }) => {
			const isMobile = stateLayoutDerived.isStacked();

			// Desktop: Wait for laser to start before triggering lightning
			// Mobile: Play lightning immediately (no laser to wait for)
			if (!isMobile) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			// Trigger multi-hit animation with backend-provided positions
			startMultiHitAnimation(positions);
		},
	});
</script>

{#if animatingHits.length > 0}
	<BoardContainer>
		{#each animatingHits as hit (hit.id)}
			<Container
				x={hit.x}
				y={hit.yTop}
				rotation={0}
				zIndex={90}
			>
				<SpineProvider
					key="multiHit"
					width={SYMBOL_SIZE}
					height={(hit.yBottom - hit.yTop)}
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
