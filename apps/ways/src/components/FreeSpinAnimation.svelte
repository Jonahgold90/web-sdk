<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		anchorToPivot,
		Container,
		Sprite,
		type Sizes,
	} from 'pixi-svelte';
	import { MainContainer } from 'components-layout';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, BOARD_DIMENSIONS } from '../game/constants';

	type Props = {
		children: Snippet<[{ sizes: Sizes }]>;
	};

	const props: Props = $props();

	const context = getContext();
	const BACKGROUND_RATIO = 920 / 720;
	const BACKGROUND_WIDTH = SYMBOL_SIZE * BOARD_DIMENSIONS.x;
	const BACKGROUND_SIZES = {
		width: BACKGROUND_WIDTH,
		height: BACKGROUND_WIDTH / BACKGROUND_RATIO,
	};
</script>

<MainContainer>
	<Container
		x={context.stateGameDerived.boardLayout().x}
		y={context.stateGameDerived.boardLayout().y}
		pivot={anchorToPivot({ anchor: 0.5, sizes: BACKGROUND_SIZES })}
	>
		<Sprite
			key="freeSpinIntroFrame"
			width={BACKGROUND_SIZES.width}
			height={BACKGROUND_SIZES.height}
		/>

		<!-- If you still want to render children (e.g. overlayed text): -->
		{@render props.children({ sizes: BACKGROUND_SIZES })}
	</Container>
</MainContainer>
