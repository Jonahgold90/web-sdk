<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';

	export type EmitterEventBoard =
		| { type: 'boardSettle'; board: RawSymbol[][] }
		| { type: 'boardShow' }
		| { type: 'boardHide' }
		| {
				type: 'boardWithAnimateSymbols';
				symbolPositions: Position[];
		  };
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { BoardContext } from 'components-shared';

	import { getContext } from '../game/context';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import BoardBase from './BoardBase.svelte';

	const context = getContext();

	let show = $state(true);

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => context.stateGameDerived.enhancedBoard.stop(),
		boardSettle: ({ board }) => context.stateGameDerived.enhancedBoard.settle(board),
		boardShow: () => (show = true),
		boardHide: () => (show = false),
		boardWithAnimateSymbols: async ({ symbolPositions }, resolve) => {
			console.log('🎬 Board: Starting animation for', symbolPositions.length, 'symbols');
			
			// Set all symbols in this line to 'win' state simultaneously
			symbolPositions.forEach((position) => {
				const reelSymbol = context.stateGame.board[position.reel].reelState.symbols[position.row];
				reelSymbol.symbolState = 'win';
			});

			// Wait for all symbols in this line to complete their animations
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

			console.log('✅ Board: Animation complete for this line');
			resolve?.();
		},
	});

	context.stateGameDerived.enhancedBoard.readyToSpinEffect();
</script>

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
		</BoardContainer>
	</BoardContext>
{/if}
