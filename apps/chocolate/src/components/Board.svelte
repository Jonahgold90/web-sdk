<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';
	import type { BookEventOfType } from '../game/typesBookEvent';

	export type EmitterEventBoard =
		| { type: 'boardSettle'; board: RawSymbol[][] }
		| { type: 'boardShow' }
		| { type: 'boardHide' }
		| {
				type: 'boardWithAnimateSymbols';
				symbolPositions: Position[];
		  }
		| { type: 'collectionAnimationShow' }
		| { type: 'collectionAnimationHide' }
		| { type: 'collectionAnimationPlay'; event: BookEventOfType<'cc_collect_sequence'> }
		| { type: 'collectionAnimationToggleDebug' };
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { BoardContext } from 'components-shared';
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import BoardBase from './BoardBase.svelte';
	import CollectionAnimation from './CollectionAnimation.svelte';

	const context = getContext();

	let show = $state(true);
	let collectionAnimationShow = $state(false);
	let collectionAnimationDebug = $state(false);
	let collectionAnimationRef: CollectionAnimation;
	
	// State for line animation skipping
	let isLineAnimationActive = $state(false);
	let skipLineAnimation = $state<(() => void) | null>(null);

	// Add keyboard listener for spacebar to skip line animations
	onMount(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if ((event.code === 'Space' || event.key === ' ') && isLineAnimationActive && skipLineAnimation) {
				event.preventDefault();
				skipLineAnimation();
			}
		};

		document.addEventListener('keydown', handleKeyPress);
		
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	});

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => context.stateGameDerived.enhancedBoard.stop(),
		boardSettle: ({ board }) => context.stateGameDerived.enhancedBoard.settle(board),
		boardShow: () => (show = true),
		boardHide: () => (show = false),
		boardWithAnimateSymbols: async ({ symbolPositions }, resolve) => {
			// console.log('🎬 Board: Starting animation for', symbolPositions.length, 'symbols');
			
			// Set line animation as active
			isLineAnimationActive = true;
			let animationSkipped = false;
			
			// Set up skip function
			skipLineAnimation = () => {
				if (animationSkipped) return;
				animationSkipped = true;
				
				// Immediately complete all symbol animations
				symbolPositions.forEach((position) => {
					const reelSymbol = context.stateGame.board[position.reel].reelState.symbols[position.row];
					if (reelSymbol.oncomplete) {
						reelSymbol.oncomplete();
					}
				});
			};
			
			// Set all symbols in this line to 'win' state simultaneously
			symbolPositions.forEach((position) => {
				const reelSymbol = context.stateGame.board[position.reel].reelState.symbols[position.row];
				reelSymbol.symbolState = 'win';
			});

			// Wait for all symbols in this line to complete their animations (or be skipped)
			await Promise.all(
				symbolPositions.map((position) => {
					const reelSymbol = context.stateGame.board[position.reel].reelState.symbols[position.row];
					return waitForResolve((resolveSymbol) => (reelSymbol.oncomplete = resolveSymbol));
				})
			);

			// Set all symbols to post-win state
			symbolPositions.forEach((position) => {
				const reelSymbol = context.stateGame.board[position.reel].reelState.symbols[position.row];
				reelSymbol.symbolState = 'postWinStatic';
			});

			// Clean up skip state
			isLineAnimationActive = false;
			skipLineAnimation = null;

			// console.log('✅ Board: Animation complete for this line');
			resolve?.();
		},
		collectionAnimationShow: () => {
			// console.log('🎬 Board: Collection animation show');
			collectionAnimationShow = true;
		},
		collectionAnimationHide: () => {
			// console.log('🎬 Board: Collection animation hide');
			collectionAnimationShow = false;
		},
		collectionAnimationPlay: async ({ event }, resolve) => {
			// console.log('🎬 Board: Playing collection animation', event);
			if (collectionAnimationRef) {
				await collectionAnimationRef.playCollectSequence(event);
			}
			resolve?.();
		},
		collectionAnimationToggleDebug: () => {
			collectionAnimationDebug = !collectionAnimationDebug;
			// console.log('🎬 Board: Collection animation debug mode:', collectionAnimationDebug);
		},
	});

	context.stateGameDerived.enhancedBoard.readyToSpinEffect();
</script>

<!-- Click overlay for line animation skipping -->
{#if isLineAnimationActive}
	<div 
		class="line-animation-skip-overlay"
		style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; cursor: pointer;"
		onclick={() => {
			if (skipLineAnimation) {
				skipLineAnimation();
			}
		}}
	></div>
{/if}

{#if show}
	<BoardContext animate={false}>
		<BoardContainer>
			<BoardMask />
			<BoardBase />
		</BoardContainer>
	</BoardContext>

	<BoardContext animate={true}>
		<BoardContainer>
			<BoardBase />
			<!-- Collection animation overlay -->
			<CollectionAnimation 
				bind:this={collectionAnimationRef}
				show={collectionAnimationShow}
				debugMode={collectionAnimationDebug}
				onComplete={() => {
					// console.log('🎬 Board: Collection animation completed');
				}}
			/>
		</BoardContainer>
	</BoardContext>
{/if}
