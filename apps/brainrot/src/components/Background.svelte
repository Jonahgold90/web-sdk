<script lang="ts">
	import { Rectangle, SpineProvider, SpineTrack } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { SECOND } from 'constants-shared/time';

	import { getContext } from '../game/context';

	const context = getContext();
	const backgroundProps = $derived(
		context.stateLayoutDerived.normalBackgroundLayout({ scale: 0.5 }),
	);
	const featureBackgroundProps = $derived(
		context.stateLayoutDerived.normalBackgroundLayout({ scale: 0.65 }),
	);
	const showBaseBackground = $derived(context.stateGame.gameType === 'basegame');
	const showFeatureBackground = $derived(context.stateGame.gameType === 'freegame');
</script>

<Rectangle {...context.stateLayoutDerived.canvasSizes()} backgroundColor={0x000000} zIndex={-3} />

<FadeContainer show={showBaseBackground} duration={SECOND} zIndex={-2}>
	<SpineProvider key="foregroundAnimation" {...backgroundProps}>
		<SpineTrack trackIndex={0} animationName={'basegame'} loop />
		<SpineTrack trackIndex={1} animationName={'basegame'} loop />
		<SpineTrack trackIndex={2} animationName={'basegame'} loop />
	</SpineProvider>
</FadeContainer>

<FadeContainer show={showFeatureBackground} duration={SECOND} zIndex={-1}>
	<SpineProvider key="foregroundFeatureAnimation" {...featureBackgroundProps}>
		<SpineTrack trackIndex={0} animationName={'animation'} loop />
	</SpineProvider>
</FadeContainer>
