<script lang="ts">
	import { BitmapText } from 'pixi-svelte';
	import BoardContainer from './BoardContainer.svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	let multipliers = $state<Array<{ reel: number; row: number; value: number }>>([]);

	// Filter to only show multipliers on actual M symbols on the board
	const visibleMultipliers = $derived(() => {
		return multipliers.filter((mult) => {
			const symbol = context.stateGame.board[mult.reel]?.reelState.symbols[mult.row];
			return symbol?.rawSymbol.name === 'M';
		});
	});

	context.eventEmitter.subscribeOnMount({
		showMultiplierValues: (event) => {
			multipliers = event.multipliers;
		},
		// Clear multipliers when tumble ends or new spin starts
		reveal: () => {
			multipliers = [];
		},
	});
</script>

<BoardContainer>
	{#each visibleMultipliers() as mult (mult.reel + '_' + mult.row)}
		<BitmapText
			text={`${mult.value}x`}
			x={SYMBOL_SIZE * (mult.reel + 0.5)}
			y={SYMBOL_SIZE * (mult.row - 0.5)}
			anchor={0.5}
			style={{
				fontFamily: 'goldFont',
				fontSize: 48,
			}}
		/>
	{/each}
</BoardContainer>
