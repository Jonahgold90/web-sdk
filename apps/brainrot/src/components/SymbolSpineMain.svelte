<script lang="ts">
	import { SpineProvider, SpineTrack, type SpineTrackProps, Container } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import SymbolMultiplierText from './SymbolMultiplierText.svelte';

	type Props = {
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		x?: number;
		y?: number;
		listener: SpineTrackProps['listener'];
		loop?: boolean;
		multiplierValue?: number;
	};

	const props: Props = $props();

	// Speed up explosion animation by 1.5x
	const isExplosion = $derived(props.symbolInfo.animationName === 'brbo_overlay');
	const effectiveTimeScale = $derived(stateBetDerived.timeScale() * (isExplosion ? 1.5 : 1));
</script>

<SpineProvider
	x={props.x}
	y={props.y}
	key={props.symbolInfo.assetKey}
	height={SYMBOL_SIZE * props.symbolInfo.sizeRatios.height}
>
	<SpineTrack
		loop={props.loop}
		trackIndex={0}
		animationName={props.symbolInfo.animationName}
		timeScale={effectiveTimeScale}
		listener={props.listener}
	/>
	{#if props.multiplierValue}
		<Container zIndex={1000}>
			<SymbolMultiplierText value={props.multiplierValue} />
		</Container>
	{/if}
</SpineProvider>
