<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';

	const context = getContext();
	const POSITION_ADJUSTMENT = 1.01;
	const VERTICAL_OFFSET = -20;

	let skibidiAnimationName = $state<string>('idle');
	let skibidiLoop = $state(true);
	let idleBreakTimeout: ReturnType<typeof setTimeout> | null = null;

	const scheduleIdleBreak = () => {
		// Clear any existing timeout
		if (idleBreakTimeout) clearTimeout(idleBreakTimeout);

		// Schedule next idle break in 5-10 seconds
		const delay = 5000 + Math.random() * 5000;
		idleBreakTimeout = setTimeout(() => {
			if (skibidiAnimationName === 'idle') {
				skibidiAnimationName = 'idle_break';
				skibidiLoop = false;
			}
		}, delay);
	};

	onMount(() => {
		scheduleIdleBreak();
		return () => {
			if (idleBreakTimeout) clearTimeout(idleBreakTimeout);
		};
	});

	context.eventEmitter.subscribeOnMount({
		skibidiAppear: () => {
			skibidiAnimationName = 'head swirling_in_new';
			skibidiLoop = false;
		},
		skibidiHeadSwing: () => {
			skibidiAnimationName = 'head_swing_new';
			skibidiLoop = false;
		},
		skibidiLaserEyes: () => {
			skibidiAnimationName = 'laser_eyes_zapping_the_board';
			skibidiLoop = false;
			// Trigger laser sound effect
			context.eventEmitter.broadcast({ type: 'soundSkibidiLaser' });
		},
		skibidiIdle: () => {
			skibidiAnimationName = 'idle';
			skibidiLoop = true;
			scheduleIdleBreak();
		},
	});
</script>

<!-- Skibidi Toilet character - 20px to the right of board, bottom aligned -->
<SpineProvider
	key="skibidiToilet"
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT + (context.stateGameDerived.boardLayout().width / 2) + 20 + 110}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET + (context.stateGameDerived.boardLayout().height / 2) - 50}
	width={130}
	height={130}
	zIndex={1000}
>
	<SpineTrack
		trackIndex={0}
		animationName={skibidiAnimationName}
		loop={skibidiLoop}
		listener={{
			complete: (entry) => {
				if (entry.animation) {
					// After idle_break, return to idle
					if (entry.animation.name === 'idle_break') {
						skibidiAnimationName = 'idle';
						skibidiLoop = true;
						scheduleIdleBreak();
					}
					// After appearing, go to idle
					else if (entry.animation.name === 'head swirling_in_new') {
						skibidiAnimationName = 'idle';
						skibidiLoop = true;
						scheduleIdleBreak();
					}
					// After head swing, return to idle
					else if (entry.animation.name === 'head_swing_new') {
						skibidiAnimationName = 'idle';
						skibidiLoop = true;
						scheduleIdleBreak();
					}
					// After laser eyes, return to idle (multiplier reveal now triggered by lightning)
					else if (entry.animation.name === 'laser_eyes_zapping_the_board') {
						skibidiAnimationName = 'idle';
						skibidiLoop = true;
						scheduleIdleBreak();
					}
				}
			},
		}}
	/>
</SpineProvider>
