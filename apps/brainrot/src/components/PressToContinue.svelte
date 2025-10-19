<script lang="ts">
	import { OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { SpineProvider, SpineTrack, Container } from 'pixi-svelte';

	import { getContext } from '../game/context';

	type Props = {
		onpress: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	// Calculate position above control bar
	const canvasSize = $derived(context.stateLayoutDerived.canvasSizes());
	const layoutType = $derived(context.stateLayoutDerived.layoutType());
	const isMobile = $derived(layoutType === 'portrait');

	// Control bar heights from UIOverlay
	const mobileOverlayHeight = 70;
	const bottomOverlayHeight = $derived(
		layoutType === 'landscape' && canvasSize.width < 500 ? 45 :
		canvasSize.height < 600 ? 90 :
		canvasSize.height < 750 ? 110 :
		150
	);
	const controlBarHeight = $derived(isMobile ? mobileOverlayHeight : bottomOverlayHeight);

	// Position text - move it up and center it better, especially on mobile
	const textY = $derived(
		isMobile
			? canvasSize.height * 0.65  // More centered on mobile screens
			: canvasSize.height - controlBarHeight - 60
	);
	const textX = $derived(canvasSize.width / 2);
	const textScale = $derived(isMobile ? 0.4 : 1);
</script>

<Container zIndex={10000}>
	<SpineProvider key="pressToContinueText" x={textX} y={textY} scale={{ x: textScale, y: textScale }}>
		<SpineTrack trackIndex={0} animationName="loop" loop={true} />
	</SpineProvider>
</Container>
<OnHotkey hotkey="Space" onpress={() => props.onpress()} />
<OnPressFullScreen onpress={() => props.onpress()} />
