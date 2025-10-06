<script lang="ts">
	import type { Snippet } from 'svelte';

	import { SpineProvider, SpineTrack, SpineSlot } from 'pixi-svelte';

	import { getContext } from '../game/context';

	type AnimationState = 'intro' | 'idle' | 'outro';

	type Props = {
		animationMap: {
			intro: 'brbo_big_in' | 'brbo_mega_in' | 'brbo_super_in';
			idle: 'brbo_big_loop' | 'brbo_mega_loop' | 'brbo_super_loop';
			outro: 'brbo_big_out' | 'brbo_mega_out' | 'brbo_super_out';
		};
		children: Snippet;
	};

	const props: Props = $props();
	const context = getContext();

	let oncomplete = $state(() => {});
	let animationState = $state<AnimationState>('intro');
</script>

<SpineProvider width={context.stateGameDerived.boardLayout().width} key="bigwin">
	<SpineTrack
		trackIndex={0}
		animationName={props.animationMap[animationState]}
		loop={animationState === 'idle'}
		listener={{
			complete: () => {
				if (animationState === 'intro') animationState = 'idle';
				if (animationState === 'outro') oncomplete();
			},
		}}
	/>
	<SpineSlot slotName="slot_win_count">
		{@render props.children()}
	</SpineSlot>
</SpineProvider>
