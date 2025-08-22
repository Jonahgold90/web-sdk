<script lang="ts">
	import SymbolSprite from './SymbolSprite.svelte';
	import { getSymbolInfo } from '../game/utils';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { BitmapText } from 'pixi-svelte';
	import { stateBet } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
</script>

<SymbolSprite {symbolInfo} x={props.x} y={props.y} oncomplete={props.oncomplete} isWinning={props.state === 'win'} />

{#if props.rawSymbol.name === 'CC' && props.rawSymbol.cash_value}
	<BitmapText
		anchor={0.5}
		x={props.x}
		y={(props.y || 0) + 10}
		text={numberToCurrencyString(stateBet.betAmount * props.rawSymbol.cash_value)}
		style={{
			fontFamily: 'gold',
			fontSize: 30,
		}}
	/>
{/if}

{#if props.rawSymbol.multiplier}
	<BitmapText
		anchor={0}
		x={(props.x || 0) - 55}
		y={(props.y || 0) - 60}
		text={`${props.rawSymbol.multiplier}X`}
		style={{
			fontFamily: 'gold',
			fontSize: 28,
		}}
	/>
{/if}

