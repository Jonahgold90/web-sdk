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

	// Scale the progress bone based on loading progress (0-100%)
	const progressScale = $derived(context.stateApp.loadingProgress / 100);

	// Track intro animation state
	let introAnimationState = $state<'in' | 'loop' | 'out'>('in');

	// When assets are loaded, switch to intro
	$effect(() => {
		if (context.stateApp.loaded && loadingType === 'start') {
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
			y={context.stateLayoutDerived.mainLayout().height * 0.5}
		>
			{#if !context.stateApp.loaded}
				<SpineProvider key="loadingScreen">
					<SpineTrack trackIndex={0} animationName="idle" loop={true} />
					<SpineBone boneName="progess" scaleX={progressScale} scaleY={1} />
				</SpineProvider>
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
		>
			{#if introAnimationState === 'in'}
				<SpineTrack
					trackIndex={0}
					animationName="in"
					loop={false}
					listener={{
						complete: () => (introAnimationState = 'loop'),
					}}
				/>
			{:else if introAnimationState === 'loop'}
				<SpineTrack trackIndex={0} animationName="loop" loop={true} />
			{:else if introAnimationState === 'out'}
				<SpineTrack
					trackIndex={0}
					animationName="out"
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
