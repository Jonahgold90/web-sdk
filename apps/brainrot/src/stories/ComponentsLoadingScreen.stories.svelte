<script lang="ts">
	import { SpineProvider, SpineBone, Container } from 'pixi-svelte';
	import { FadeContainer } from 'components-pixi';
	import { MainContainer } from 'components-layout';
	import { getContext } from '../game/context';

	const context = getContext();

	// Simulate loading progress that loops from 0 to 100%
	let progress = $state(0);
	const progressScale = $derived(progress / 100);

	// Auto-increment progress for debugging
	$effect(() => {
		const interval = setInterval(() => {
			progress = (progress + 1) % 101; // Loop from 0 to 100
		}, 50); // Update every 50ms for smooth animation

		return () => clearInterval(interval);
	});
</script>

<MainContainer>
	<Container
		x={context.stateLayoutDerived.mainLayout().width * 0.5}
		y={context.stateLayoutDerived.mainLayout().height * 0.5}
	>
		<SpineProvider key="loadingScreen">
			<!-- Manually scale the progress bone based on simulated loading progress -->
			<SpineBone boneName="progess" scaleX={progressScale} scaleY={1} />
		</SpineProvider>
	</Container>

	<!-- Debug info -->
	<Container x={50} y={50}>
		<text style="fill: white; fontSize: 24px;">
			Loading Progress: {progress}%
		</text>
	</Container>
</MainContainer>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
