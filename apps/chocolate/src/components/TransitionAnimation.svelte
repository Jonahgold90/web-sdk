<script lang="ts">
	import { Container, Graphics } from 'pixi-svelte';
	import { waitForTimeout } from 'utils-shared/wait';
	import { onMount } from 'svelte';
	import { getContext } from '../game/context';

	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();
	
	let overlayAlpha = $state(0);
	let animationId = $state(0);

	onMount(async () => {
		// Animate fade to black
		const fadeInDuration = 300;
		const fadeOutDuration = 300;
		const holdDuration = 100;
		
		const startTime = performance.now();
		
		// Fade in
		const fadeIn = () => {
			const elapsed = performance.now() - startTime;
			const progress = Math.min(elapsed / fadeInDuration, 1);
			overlayAlpha = progress;
			
			if (progress < 1) {
				animationId = requestAnimationFrame(fadeIn);
			} else {
				// Hold at full opacity briefly
				setTimeout(() => {
					const fadeOutStartTime = performance.now();
					
					// Fade out
					const fadeOut = () => {
						const elapsed = performance.now() - fadeOutStartTime;
						const progress = Math.min(elapsed / fadeOutDuration, 1);
						overlayAlpha = 1 - progress;
						
						if (progress < 1) {
							animationId = requestAnimationFrame(fadeOut);
						} else {
							// Animation complete
							props.oncomplete();
						}
					};
					
					fadeOut();
				}, holdDuration);
			}
		};
		
		fadeIn();
		
		// Cleanup function
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<Container>
	<Graphics
		draw={(graphics) => {
			graphics.clear();
			graphics.rect(0, 0, context.stateLayoutDerived.canvasSizes().width, context.stateLayoutDerived.canvasSizes().height);
			graphics.fill({ color: 0x000000, alpha: overlayAlpha });
		}}
	/>
</Container>
