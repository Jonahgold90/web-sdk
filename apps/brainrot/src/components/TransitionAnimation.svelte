<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { onMount } from 'svelte';
	import { getContext } from '../game/context';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	// Determine if we're on mobile/portrait layout
	const isMobile = $derived(context.stateLayoutDerived.isStacked());

	// Use appropriate asset and animation for layout
	const transitionKey = $derived(isMobile ? 'transitionMobile' : 'transition');
	const animationName = $derived(isMobile ? 'brbo_transition_portrait' : 'brbo_transition');

	// Play transition sound when component mounts (animation starts)
	onMount(() => {
		console.log('TransitionAnimation mounted - broadcasting soundTransition');
		context.eventEmitter.broadcast({ type: 'soundTransition' });
	});

	function handleComplete() {
		// Stop transition sound when animation completes
		console.log('TransitionAnimation complete - stopping sound');
		context.eventEmitter.broadcast({ type: 'soundStop', name: 'transition' });
		props.oncomplete();
	}
</script>

<SpineProvider
	key={transitionKey}
	x={context.stateLayoutDerived.canvasSizes().width * 0.5}
	y={context.stateLayoutDerived.canvasSizes().height * 0.5}
	width={context.stateLayoutDerived.canvasSizes().width}
	height={context.stateLayoutDerived.canvasSizes().height}
>
	<SpineTrack
		trackIndex={0}
		{animationName}
		listener={{
			complete: handleComplete,
		}}
	/>
</SpineProvider>
