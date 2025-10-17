<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { onMount } from 'svelte';
	import { getContext } from '../game/context';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

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
	key="transition"
	x={context.stateLayoutDerived.canvasSizes().width * 0.5}
	y={context.stateLayoutDerived.canvasSizes().height * 0.5}
	width={context.stateLayoutDerived.canvasSizes().width}
	height={context.stateLayoutDerived.canvasSizes().height}
>
	<SpineTrack
		trackIndex={0}
		animationName={'brbo_transition'}
		listener={{
			complete: handleComplete,
		}}
	/>
</SpineProvider>
