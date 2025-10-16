<script lang="ts">
	import { OnPressFullScreen } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { SpineProvider, SpineTrack } from 'pixi-svelte';

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

	// Position text - different for mobile vs desktop
	const textY = $derived(
		isMobile
			? canvasSize.height - controlBarHeight - 20
			: canvasSize.height - controlBarHeight - 60
	);
	const textX = $derived(canvasSize.width / 2);
	const textScale = $derived(isMobile ? 0.5 : 1);
</script>

<SpineProvider key="pressToContinueText" x={textX} y={textY} scale={{ x: textScale, y: textScale }}>
	<SpineTrack trackIndex={0} animationName="loop" loop={true} />
</SpineProvider>
<OnHotkey hotkey="Space" onpress={() => props.onpress()} />
<OnPressFullScreen onpress={() => props.onpress()} />
