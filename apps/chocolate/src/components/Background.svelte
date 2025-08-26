<script lang="ts">
	import { Rectangle, Sprite } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';

	import { getContext } from '../game/context';

	const context = getContext();
	const canvasSizes = $derived(context.stateLayoutDerived.canvasSizes());
	const showBaseBackground = $derived(context.stateGame.gameType === 'basegame');
	const showFeatureBackground = $derived(context.stateGame.gameType === 'freegame');
	const hasAnticipation = $derived(
		context.stateGame.board.some((reel) => reel.reelState.anticipating),
	);
	const showAnticipationBackground = $derived(showBaseBackground && hasAnticipation);
</script>

<Rectangle {...canvasSizes} backgroundColor={0x000000} zIndex={-3} />

<FadeContainer show={showBaseBackground} duration={SECOND} zIndex={-2}>
	<Sprite
		key="backgroundImageBaseLandscape"
		anchor={{ x: 0.5, y: 0.5 }}
		x={canvasSizes.width / 2}
		y={canvasSizes.height / 2}
		width={Math.max(canvasSizes.width, canvasSizes.height * (16/9))}
		height={Math.max(canvasSizes.height, canvasSizes.width * (9/16))}
	/>
</FadeContainer>

<FadeContainer show={showFeatureBackground} duration={SECOND} zIndex={-1}>
	<Sprite
		key="backgroundImageBonusLandscape"
		anchor={{ x: 0.5, y: 0.5 }}
		x={canvasSizes.width / 2}
		y={canvasSizes.height / 2}
		width={Math.max(canvasSizes.width, canvasSizes.height * (16/9))}
		height={Math.max(canvasSizes.height, canvasSizes.width * (9/16))}
	/>
</FadeContainer>

<FadeContainer show={showAnticipationBackground} duration={SECOND * 0.3} zIndex={-1.5}>
	<Sprite
		key="anticipationBackground"
		anchor={{ x: 0.5, y: 0.5 }}
		x={canvasSizes.width / 2}
		y={canvasSizes.height / 2}
		width={Math.max(canvasSizes.width, canvasSizes.height * (16/9))}
		height={Math.max(canvasSizes.height, canvasSizes.width * (9/16))}
	/>
</FadeContainer>
