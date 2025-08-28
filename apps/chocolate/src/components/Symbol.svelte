<script lang="ts">
	import SymbolSprite from './SymbolSprite.svelte';
	import { getSymbolInfo } from '../game/utils';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { BitmapText, Container, Sprite } from 'pixi-svelte';
	import { stateBet } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import { SYMBOL_SIZE } from '../game/constants';

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
	
	// Track animation scale for the entire symbol container
	let containerScaleX = $state(1);
	let containerScaleY = $state(1);

	// Start animation when symbol enters win state
	$effect(() => {
		if (props.state === 'win') {
			// console.log('🎯 Starting symbol animation for', props.rawSymbol.name);
			playSymbolAnimation();
		} else {
			containerScaleX = 1;
			containerScaleY = 1;
		}
	});

	function playSymbolAnimation() {
		// console.log('🎬 playSymbolAnimation called');
		const duration = 800;
		const intensity = 0.3;
		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const squish = Math.sin(progress * Math.PI * 3) * intensity * (1 - progress * 0.7);
			
			containerScaleX = 1 + squish;
			containerScaleY = 1 - squish * 0.6;
			
			// console.log('🎬 Container animation frame:', { progress, squish, scaleX: containerScaleX, scaleY: containerScaleY });

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				// console.log('🎬 Container animation complete');
				containerScaleX = 1;
				containerScaleY = 1;
				// Call oncomplete after animation finishes
				setTimeout(() => {
					props.oncomplete?.();
				}, 300);
			}
		}

		requestAnimationFrame(animate);
	}
</script>

<Container 
	x={props.x} 
	y={props.y} 
	scale={{x: containerScaleX, y: containerScaleY}}
>
	{#if props.state === 'win' && !['JAR', 'CC', 'S', 'CW'].includes(props.rawSymbol.name)}
		<Sprite
			key={`${props.rawSymbol.name}_BG.png`}
			anchor={0.5}
			x={0}
			y={0}
			width={SYMBOL_SIZE * symbolInfo.sizeRatios.width}
			height={SYMBOL_SIZE * symbolInfo.sizeRatios.height}
			zIndex={0}
		/>
	{/if}
	
	<SymbolSprite 
		{symbolInfo} 
		x={0}
		y={0}
		oncomplete={() => {}} 
		isWinning={false}
	/>

	{#if props.rawSymbol.name === 'CC' && props.rawSymbol.cash_value}
		<BitmapText
			anchor={0.5}
			x={0}
			y={10}
			text={numberToCurrencyString(stateBet.betAmount * props.rawSymbol.cash_value)}
			zIndex={2}
			style={{
				fontFamily: 'gold',
				fontSize: 30,
			}}
		/>
	{/if}

	{#if props.rawSymbol.multiplier}
		<BitmapText
			anchor={0}
			x={-55}
			y={-60}
			text={`${props.rawSymbol.multiplier}X`}
			zIndex={2}
			style={{
				fontFamily: 'gold',
				fontSize: 28,
			}}
		/>
	{/if}
</Container>

