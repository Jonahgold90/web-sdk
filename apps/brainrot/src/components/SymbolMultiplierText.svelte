<script lang="ts">
	import { Sprite } from 'pixi-svelte';

	import { SYMBOL_SIZE } from '../game/constants';

	type Props = {
		value: number;
	};

	const props: Props = $props();

	// Map multiplier value to sprite name from sprite sheet
	const getSpriteName = (value: number): string => {
		return `${value}X.png`;
	};
</script>

<Sprite
	key={getSpriteName(props.value)}
	x={SYMBOL_SIZE * 0 - 5}
	y={SYMBOL_SIZE * 0.5}
	anchor={{ x: 0.5, y: 1 }}
	scale={{ x: 0.35, y: 0.35 }}
/>
