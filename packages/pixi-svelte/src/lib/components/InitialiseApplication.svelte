<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { devicePixelRatio } from 'svelte/reactivity/window';
	import { getContextApp } from '../context.svelte';

	type Props = { children: Snippet };

	const props: Props = $props();
	const context = getContextApp();

	let wrap: HTMLDivElement;
	let initialised = $state(false);

	// Create a canvas element that we'll manage
	let canvas: HTMLCanvasElement;

	const initPixi = async () => {
		if (initialised || !wrap) return;

		try {
			// Create canvas if it doesn't exist
			if (!canvas) {
				canvas = document.createElement('canvas');
			}

			// Create basic PIXI Application
			const app = new PIXI.Application();
			
			// Initialize with options
			await app.init({
				view: canvas,
				width: wrap.clientWidth || window.innerWidth,
				height: wrap.clientHeight || window.innerHeight,
				autoDensity: true,
				backgroundAlpha: 0,
				antialias: true,
				resolution: devicePixelRatio.current,
				resizeTo: wrap,
				preference: 'webgpu',
				powerPreference: 'high-performance',
			});

			// Store the application in the context
			context.stateApp.pixiApplication = app;

			// Configure touch events
			if (app.renderer) {
				app.renderer.events.autoPreventDefault = false;
				app.renderer.canvas.style.touchAction = 'auto';
			}

			// Append canvas to the wrapper
			wrap.appendChild(canvas);

			// Handle window resize
			const onResize = () => {
				if (app.renderer && wrap) {
					app.renderer.resize(
						wrap.clientWidth || window.innerWidth,
						wrap.clientHeight || window.innerHeight
					);
				}
			};

			// Initial resize
		onResize();

			window.addEventListener('resize', onResize);

			initialised = true;

			// Return cleanup function
			return () => {
				window.removeEventListener('resize', onResize);
				app.destroy(true);
			};
		} catch (error) {
			console.error('Failed to initialize PIXI:', error);
			throw error;
		}
	};

	// Use a mutation observer to detect when the wrapper is available
	let observer: MutationObserver;

	onMount(() => {
		if (!wrap) return;

		// Try to initialize immediately
		initPixi().catch(console.error);

		// Set up a mutation observer as a fallback
		observer = new MutationObserver(() => {
			if (wrap && !initialised) {
				initPixi().catch(console.error);
			}
		});

		// Start observing the parent node for changes
		if (wrap.parentNode) {
			observer.observe(wrap.parentNode, { childList: true, subtree: true });
		}

		// Clean up
		return () => {
			if (observer) observer.disconnect();
		};
	});

	onDestroy(() => {
		if (context.stateApp.pixiApplication) {
			context.stateApp.pixiApplication.destroy();
		}
	});
</script>

<div bind:this={wrap}>
	{#if initialised}
		{@render props.children()}
	{/if}
</div>
