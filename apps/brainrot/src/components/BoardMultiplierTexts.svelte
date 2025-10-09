<script lang="ts">
	import { Container, BitmapText } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { getSymbolX } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import BoardContainer from './BoardContainer.svelte';

	const context = getContext();
</script>

<BoardContainer>
	{#each context.stateGame.board as reel, reelIndex}
		{#each reel.reelState.symbols as reelSymbol, rowIndex}
			{@const multiplierValue = reelSymbol.rawSymbol.name === 'M' ? reelSymbol.rawSymbol.multiplier : undefined}
			{#if multiplierValue}
				<Container x={getSymbolX(reelIndex)} y={reelSymbol.symbolY.current}>
					<BitmapText
						text={`${multiplierValue}x`}
						x={0}
						y={0}
						pivot={{ x: 0.5, y: 0.5 }}
						tint={0xFFFFFF}
						fontName="gold"
						fontSize={SYMBOL_SIZE * 0.5}
					/>
				</Container>
			{/if}
		{/each}
	{/each}
</BoardContainer>
