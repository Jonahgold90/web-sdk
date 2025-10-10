<script lang="ts">
	import { BitmapText } from 'pixi-svelte';

	import { SYMBOL_SIZE } from '../game/constants';

	type Props = {
		value: number;
	};

	const props: Props = $props();
</script>

<BitmapText
	text={`X${props.value}`}
	x={SYMBOL_SIZE * 0 - 5}
	y={SYMBOL_SIZE * 0.5}
	style={{
		fontFamily: 'gold',
		fontSize: SYMBOL_SIZE * 0.5,
	}}
	anchor={{ x: 0.5, y: 1 }}
	tint={0x90EE90}
/>
