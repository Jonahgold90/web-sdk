<script lang="ts">
	import { Container, Sprite } from 'pixi-svelte';
	import { FadeContainer, LoadingProgress } from 'components-pixi';
	import { MainContainer } from 'components-layout';
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';
	import TransitionAnimation from './TransitionAnimation.svelte';
	import ContinueButton from './ContinueButton.svelte';

	type Props = {
		onloaded: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	let loadingType = $state<'start' | 'transition'>('start');
	let loadersFinished = $state(false);
	
	// Check if the loader.gif is still showing by checking DOM
	onMount(() => {
		const checkLoaders = () => {
			// Look for loader elements in DOM
			const stakeLoader = document.querySelector('[src*="stake-engine-loader.gif"]');
			const exampleLoader = document.querySelector('[src*="loader.gif"]');
			
			// If no loaders are found, they're finished
			if (!stakeLoader && !exampleLoader) {
				loadersFinished = true;
			} else {
				// Check again in 100ms
				setTimeout(checkLoaders, 100);
			}
		};
		
		// Start checking after a short delay
		setTimeout(checkLoaders, 100);
	});
	
	// Animation state
	let animationTime = $state(0);
	let animationFrame: number;
	
	// Animated properties - just a subtle pulse
	const scale = $derived(1 + Math.sin(animationTime * 0.002) * 0.02); // Very subtle pulse
	
	// Particle system
	let particles = $state<Array<{
		id: number;
		x: number;
		y: number;
		size: number;
		color: string;
		speedX: number;
		speedY: number;
		opacity: number;
		rotation: number;
		rotationSpeed: number;
	}>>([]);
	
	// Create particles for creepy chocolate theme
	const createParticles = () => {
		particles = Array.from({ length: 30 }, (_, i) => ({
			id: i,
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			size: Math.random() * 8 + 3, // 3-11px (bigger)
			color: ['#555555', '#777777', '#444444', '#666666', '#393939', '#4A4A4A'][Math.floor(Math.random() * 6)], // Cool grays, no orange tones
			speedX: (Math.random() - 0.5) * 0.4,
			speedY: (Math.random() - 0.5) * 0.4,
			opacity: Math.random() * 0.6 + 0.3, // More visible opacity (0.3-0.9)
			rotation: Math.random() * 360,
			rotationSpeed: (Math.random() - 0.5) * 1.5
		}));
	};
	
	// Update particles
	const updateParticles = () => {
		particles = particles.map(particle => ({
			...particle,
			x: particle.x + particle.speedX,
			y: particle.y + particle.speedY,
			rotation: particle.rotation + particle.rotationSpeed,
			// Wrap around screen
			...(particle.x > window.innerWidth && { x: -particle.size }),
			...(particle.x < -particle.size && { x: window.innerWidth }),
			...(particle.y > window.innerHeight && { y: -particle.size }),
			...(particle.y < -particle.size && { y: window.innerHeight })
		}));
	};
	
	onMount(() => {
		// Initialize particles
		createParticles();
		
		const animate = (timestamp: number) => {
			animationTime = timestamp;
			updateParticles();
			animationFrame = requestAnimationFrame(animate);
		};
		
		animationFrame = requestAnimationFrame(animate);
		
		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

<style>
	@keyframes creepyFloat {
		0% { opacity: 0.4; transform: scale(0.9) rotate(0deg); }
		50% { opacity: 0.8; transform: scale(1.1) rotate(180deg); }
		100% { opacity: 0.4; transform: scale(0.9) rotate(360deg); }
	}
</style>

<!-- logo and loading progress -->
<FadeContainer show={loadingType === 'start'}>
	<!-- Particle effects background -->
	<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 1;">
		{#each particles as particle (particle.id)}
			<div
				style="
					position: absolute;
					left: {particle.x}px;
					top: {particle.y}px;
					width: {particle.size}px;
					height: {particle.size}px;
					background: {particle.color};
					opacity: {particle.opacity};
					border-radius: 50%;
					transform: rotate({particle.rotation}deg);
					box-shadow: 0 0 {particle.size * 2}px {particle.color}50;
					animation: creepyFloat 4s ease-in-out infinite alternate;
				"
			></div>
		{/each}
	</div>

	<MainContainer>
		<Container
			x={context.stateLayoutDerived.mainLayout().width * 0.5}
			y={context.stateLayoutDerived.mainLayout().height * 0.5}
		>
			<Sprite 
				key="loader" 
				anchor={0.5} 
				width={600 * scale} 
				height={564 * scale}
			/>
			{#if !context.stateApp.loaded}
				<LoadingProgress y={250} width={1967 * 0.2} height={346 * 0.2}>
					{#snippet background(sizes)}
						<Sprite key="progressBarBackground.png" {...sizes} />
					{/snippet}
					{#snippet progress(sizes)}
						<Sprite key="progressBar.png" {...sizes} />
					{/snippet}
					{#snippet frame(sizes)}
						<Sprite key="progressBarFrame.png" {...sizes} />
					{/snippet}
				</LoadingProgress>
			{/if}
		</Container>
	</MainContainer>
</FadeContainer>

<!-- press to continue -->
<FadeContainer show={loadingType === 'start' && context.stateApp.loaded && loadersFinished}>
	<!-- Full screen clickable overlay -->
	<div 
		style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999; cursor: pointer;"
		onclick={() => (loadingType = 'transition')}
	></div>
	
	<!-- Continue button -->
	<div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000;">
		<ContinueButton onclick={() => (loadingType = 'transition')} />
	</div>
</FadeContainer>

<!-- transition between the loading screen and the game -->
<FadeContainer show={loadingType === 'transition'}>
	<TransitionAnimation oncomplete={props.onloaded} />
</FadeContainer>
