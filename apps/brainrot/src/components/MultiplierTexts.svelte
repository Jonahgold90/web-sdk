<script lang="ts">
	import { BitmapText } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { getSymbolX } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';

	const context = getContext();

	// Create a list of multipliers with their screen positions
	const multiplierDisplays = $derived.by(() => {
		return context.stateGame.multiplierValues.map((mult) => {
			const reelSymbol = context.stateGame.board[mult.reel]?.reelState.symbols[mult.row];
			if (!reelSymbol || reelSymbol.rawSymbol.name !== 'M') return null;

			return {
				value: mult.value,
				x: getSymbolX(mult.reel),
				y: reelSymbol.symbolY.current - SYMBOL_SIZE * 0.35,
			};
		}).filter(Boolean);
	});
</script>

<BoardContainer>
	{#each multiplierDisplays as display}
		<BitmapText
			text={`${display.value}x`}
			x={display.x}
			y={display.y}
			anchor={0.5}
			tint={0xFFFFFF}
			style={{
				fontFamily: 'gold',
				fontSize: 72,
			}}
		/>
	{/each}
</BoardContainer>
