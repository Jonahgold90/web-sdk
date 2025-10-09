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
	y={0}
	style={{
		fontFamily: 'gold',
		fontSize: SYMBOL_SIZE * 0.5,
	}}
	anchor={0.5}
	tint={0x90EE90}
/>
