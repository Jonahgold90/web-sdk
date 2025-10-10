<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { stateBetDerived } from 'state-shared';

	import { getContext } from '../game/context';
	import type { Reel } from '../game/stateGame.svelte';
	import { REEL_PADDING, SYMBOL_SIZE } from '../game/constants';

	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	type AnimationName = 'brbo_anticipation_in' | 'brbo_anticipation_loop' | 'brbo_anticipation_out';

	let animationName = $state<AnimationName>('brbo_anticipation_in');

	$effect(() => {
		if (props.reel.reelState.motion === 'stopped') {
			animationName = 'brbo_anticipation_out';
		}
	});
</script>

<SpineProvider
	key="anticipation"
	width={SYMBOL_SIZE * 1}
	height={SYMBOL_SIZE * 3}
	x={context.stateGameDerived.boardLayout().x -
		context.stateGameDerived.boardLayout().width * 0.5 +
		(props.reel.reelIndex + REEL_PADDING) * SYMBOL_SIZE}
	y={context.stateGameDerived.boardLayout().y + SYMBOL_SIZE*2.3}
>
	<SpineTrack
		trackIndex={0}
		{animationName}
		loop={animationName === 'brbo_anticipation_loop'}
		timeScale={stateBetDerived.timeScale()}
		listener={{
			complete: () => {
				if (animationName === 'brbo_anticipation_in') {
					animationName = 'brbo_anticipation_loop';
				}

				if (animationName === 'brbo_anticipation_out') {
					props.oncomplete();
				}
			},
		}}
	/>
</SpineProvider>
