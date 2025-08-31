<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import type { Reel } from '../game/stateGame.svelte';
	import { REEL_PADDING, SYMBOL_SIZE } from '../game/constants';

	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	let show = $state(true);

	// Use exact same positioning as the original implementation
	const x = $derived(
		context.stateGameDerived.boardLayout().x -
		context.stateGameDerived.boardLayout().width * 0.5 +
		(props.reel.reelIndex + REEL_PADDING) * SYMBOL_SIZE
	);
	const y = $derived(context.stateGameDerived.boardLayout().y - SYMBOL_SIZE * 0.2 - 3);

	$effect(() => {
		// When reel stops bouncing or is fully stopped, complete immediately
		if ((props.reel.reelState.motion === 'bouncing' || props.reel.reelState.motion === 'stopped') && show) {
			show = false;
			props.oncomplete();
		}
	});
</script>

{#if show}
	<SpineProvider
		key="anticipation"
		{x}
		{y}
		alpha={1.0}
		width={SYMBOL_SIZE * 0.5}
		height={SYMBOL_SIZE * 1.5}
	>
		<SpineTrack
			trackIndex={0}
			animationName="animation"
			loop={true}
		/>
	</SpineProvider>
{/if}
