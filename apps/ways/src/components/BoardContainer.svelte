<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Container } from 'pixi-svelte';

	import { getContext } from '../game/context';

	// Add a y-offset to move the board up
	const BOARD_Y_OFFSET = 40; // Adjust this value as needed

	type Props = {
		children: Snippet;
	};

	const props: Props = $props();

	const context = getContext();
</script>

<Container
	x={context.stateGameDerived.boardLayout().x - 2}
	y={context.stateGameDerived.boardLayout().y - BOARD_Y_OFFSET}
	pivot={context.stateGameDerived.boardLayout().pivot}
>
	{@render props.children()}
</Container>
