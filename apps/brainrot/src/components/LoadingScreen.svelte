<script lang="ts">
	import { SpineProvider, SpineTrack, SpineBone, Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { MainContainer } from 'components-layout';
	import { OnHotkey } from 'components-shared';
	import { OnPressFullScreen } from 'components-layout';

	import { getContext } from '../game/context';
	import TransitionAnimation from './TransitionAnimation.svelte';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	let loadingType = $state<'start' | 'intro' | 'transition'>('start');

	// DEBUG MODE: Set to true to loop the loading screen indefinitely for testing
	const DEBUG_LOOP_LOADING = false;
	let debugProgress = $state(0);

	// Determine if we're on mobile/portrait layout
	const isMobile = $derived(context.stateLayoutDerived.isStacked());

	// Visual adjustments - responsive to mobile/desktop
	const logoScale = $derived(isMobile ? 0.5 : 2.0); // Smaller on mobile
	const progressBarScale = 0.7; // Make progress bar smaller (1 = original size)
	const verticalOffset = 100; // Move everything down (positive = down)

	// Scale the progress bone based on loading progress (0-100%)
	const progressScale = $derived(
		DEBUG_LOOP_LOADING ? debugProgress / 100 : context.stateApp.loadingProgress / 100
	);

	// Track intro animation state
	let introAnimationState = $state<'in' | 'loop' | 'out'>('in');

	// Debug effect: Loop progress from 0 to 100
	$effect(() => {
		if (DEBUG_LOOP_LOADING) {
			const interval = setInterval(() => {
				debugProgress = (debugProgress + 1) % 101;
			}, 30); // Update every 30ms
			return () => clearInterval(interval);
		}
	});

	// Debug: Log mobile state and logo scale
	$effect(() => {
		console.log('isMobile:', isMobile, '| logoScale:', logoScale);
	});

	// Get animation name based on state and layout
	const getAnimationName = (state: 'in' | 'loop' | 'out') => {
		return isMobile ? `${state}_mobile` : state;
	};

	// Scale up mobile intro to fill portrait screens better
	const introScale = $derived(isMobile ? 1.6 : 1);

	// When assets are loaded, switch to intro (disabled in debug mode)
	$effect(() => {
		if (!DEBUG_LOOP_LOADING && context.stateApp.loaded && loadingType === 'start') {
			loadingType = 'intro';
		}
	});

	// Handle user input to exit intro
	function handleIntroExit() {
		if (introAnimationState === 'loop') {
			introAnimationState = 'out';
		}
	}
</script>

<!-- logo and loading progress -->
<FadeContainer show={loadingType === 'start'}>
	<MainContainer>
		<Container
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			y={context.stateLayoutDerived.mainLayout().height * 0.5 + verticalOffset}
		>
			{#if DEBUG_LOOP_LOADING || !context.stateApp.loaded}
				{#if isMobile}
					<SpineProvider key="loadingScreen" scale={0.8}>
						<!-- Scale the frame (progress bar container) smaller -->
						<SpineBone boneName="frame" scaleX={progressBarScale} scaleY={progressBarScale} />
						<!-- Don't use any animation, just manually scale the progress bone -->
						<SpineBone boneName="progess" scaleX={progressScale} scaleY={1} />
					</SpineProvider>
				{:else}
					<SpineProvider key="loadingScreen" scale={1.3}>
						<!-- Scale the frame (progress bar container) smaller -->
						<SpineBone boneName="frame" scaleX={progressBarScale} scaleY={progressBarScale} />
						<!-- Don't use any animation, just manually scale the progress bone -->
						<SpineBone boneName="progess" scaleX={progressScale} scaleY={1} />
					</SpineProvider>
				{/if}
			{/if}

			<!-- Debug progress display -->
			{#if DEBUG_LOOP_LOADING}
				<text
					style="fill: white; fontSize: 32px; fontFamily: Arial;"
					x={-100}
					y={200}
				>
					Progress: {debugProgress}%
				</text>
				<text
					style="fill: white; fontSize: 24px; fontFamily: Arial;"
					x={-100}
					y={250}
				>
					Mobile: {isMobile} | Scale: {logoScale}
				</text>
			{/if}
		</Container>
	</MainContainer>
</FadeContainer>

<!-- intro screen -->
<FadeContainer show={loadingType === 'intro'}>
	<MainContainer>
		<SpineProvider
			key="introScreen"
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			y={context.stateLayoutDerived.mainLayout().height * 0.5}
			scale={introScale}
		>
			{#if introAnimationState === 'in'}
				<SpineTrack
					trackIndex={0}
					animationName={getAnimationName('in')}
					loop={false}
					listener={{
						complete: () => (introAnimationState = 'loop'),
					}}
				/>
			{:else if introAnimationState === 'loop'}
				<SpineTrack trackIndex={0} animationName={getAnimationName('loop')} loop={true} />
			{:else if introAnimationState === 'out'}
				<SpineTrack
					trackIndex={0}
					animationName={getAnimationName('out')}
					loop={false}
					listener={{
						complete: () => props.onloaded(),
					}}
				/>
			{/if}
		</SpineProvider>
	</MainContainer>
	<OnHotkey hotkey="Space" onpress={handleIntroExit} />
	<OnPressFullScreen onpress={handleIntroExit} />
</FadeContainer>

<!-- transition between the loading screen and the game -->
<FadeContainer show={loadingType === 'transition'}>
	<TransitionAnimation oncomplete={props.onloaded} />
</FadeContainer>
