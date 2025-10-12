<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';

	import { getContext } from '../game/context';

	const context = getContext();
	const POSITION_ADJUSTMENT = 1.01;
	const VERTICAL_OFFSET = -20;

	type TungtungAnimation = 'sahur_idle' | 'sahur_win1' | 'sahur_win2' | 'sahur_win3';

	let tungtungAnimationName = $state<TungtungAnimation>('sahur_idle');
	let tungtungLoop = $state(true);

	// Calculate position relative to bet frame
	const betFrameCenterY = $derived(
		context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT +
		VERTICAL_OFFSET -
		(context.stateGameDerived.boardLayout().height / 2) +
		135.5 + 10 + (243.5 / 2) - 10
	);
	const betFrameBottomY = $derived(betFrameCenterY + (243.5 / 2));

	context.eventEmitter.subscribeOnMount({
		tungtungWinSpin: () => {
			tungtungAnimationName = 'sahur_win1';
			tungtungLoop = false;
		},
		tungtungWinMultiplier: () => {
			tungtungAnimationName = 'sahur_win2';
			tungtungLoop = false;
		},
		tungtungWinBig: () => {
			tungtungAnimationName = 'sahur_win3';
			tungtungLoop = false;
		},
		tungtungIdle: () => {
			tungtungAnimationName = 'sahur_idle';
			tungtungLoop = true;
		},
	});
</script>

<!-- TungTung character - 20px left of bottom board edge, below bet frame -->
<SpineProvider
	key="tungtung"
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 20 - 136}
	y={betFrameBottomY + 190}
	width={95}
	height={168}
	zIndex={1000}
>
	<SpineTrack
		trackIndex={0}
		animationName={tungtungAnimationName}
		loop={tungtungLoop}
		listener={{
			complete: (entry) => {
				if (entry.animation) {
					// After any win animation, return to idle
					if (entry.animation.name === 'sahur_win1' ||
					    entry.animation.name === 'sahur_win2' ||
					    entry.animation.name === 'sahur_win3') {
						tungtungAnimationName = 'sahur_idle';
						tungtungLoop = true;
					}
				}
			},
		}}
	/>
</SpineProvider>
