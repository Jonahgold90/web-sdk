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
		props.oncomplete?.();
	});

	$effect(() => {
		props.symbolInfo;
		props.oncomplete?.();
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
		const duration = 500;
		const intensity = 0.2;
		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			const easeInOut = 0.5 * (1 - Math.cos(progress * Math.PI));
			const squish = Math.sin(progress * Math.PI * 2) * intensity * (1 - progress);
			
			scaleX = 1 + squish;
			scaleY = 1 - squish * 0.5;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				scaleX = 1;
				scaleY = 1;
				props.oncomplete?.();
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
/>
