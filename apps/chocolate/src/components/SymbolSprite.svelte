<script lang="ts">
	import { Sprite, type SpriteProps } from 'pixi-svelte';

	import { getSymbolInfo } from '../game/utils';
	import { SYMBOL_SIZE } from '../game/constants';
	import { onMount } from 'svelte';

	type Props = {
		x?: number;
		y?: number;
		symbolInfo: ReturnType<typeof getSymbolInfo>;
		oncomplete?: () => void;
		isWinning?: boolean;
	};

	const props: Props = $props();

	let scaleX = $state(1);
	let scaleY = $state(1);

	onMount(() => {
		if (!props.isWinning) {
			props.oncomplete?.();
		}
	});

	$effect(() => {
		props.symbolInfo;
		if (!props.isWinning) {
			props.oncomplete?.();
		}
	});

	$effect(() => {
		if (props.isWinning) {
			playSquishAnimation();
		} else {
			scaleX = 1;
			scaleY = 1;
		}
	});

	function playSquishAnimation() {
		const duration = 800;
		const intensity = 0.3;
		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const squish = Math.sin(progress * Math.PI * 3) * intensity * (1 - progress * 0.7);
			
			scaleX = 1 + squish;
			scaleY = 1 - squish * 0.6;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				scaleX = 1;
				scaleY = 1;
				setTimeout(() => {
					props.oncomplete?.();
				}, 300);
			}
		}

		requestAnimationFrame(animate);
	}
</script>

<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	key={props.symbolInfo.assetKey}
	width={SYMBOL_SIZE * props.symbolInfo.sizeRatios.width * scaleX}
	height={SYMBOL_SIZE * props.symbolInfo.sizeRatios.height * scaleY}
	zIndex={1}
/>
