<script lang="ts">
	import { onMount } from 'svelte';
	import { getContextParent, getContextApp } from 'pixi-svelte';
	import { Sprite, Texture } from 'pixi.js';
	
	import { getContext } from '../game/context';
	import type { Reel } from '../game/stateGame.svelte';
	import { REEL_PADDING, SYMBOL_SIZE } from '../game/constants';
	import assets from '../game/assets';


	type Props = {
		reel: Reel;
		oncomplete: () => void;
	};

	const props: Props = $props();
	const context = getContext();
	const parentContext = getContextParent();
	const appContext = getContextApp();

	let show = $state(true);
	let timeoutId: number;
	let anticipationSprite: Sprite | null = null;
	let gifCanvas: HTMLCanvasElement | null = null;
	let gifImage: HTMLImageElement | null = null;
	let animationFrame: number;
	let isLoaded = $state(false);
	let isDestroyed = $state(false);

	// Use exact same positioning as the original Spine
	const x = $derived(
		context.stateGameDerived.boardLayout().x -
		context.stateGameDerived.boardLayout().width * 0.5 +
		(props.reel.reelIndex + REEL_PADDING) * SYMBOL_SIZE
	);
	const y = $derived(context.stateGameDerived.boardLayout().y - SYMBOL_SIZE * 0.2);

	// Simple cleanup for canvas-based GIF rendering
	const cleanupSprite = () => {
		if (!isDestroyed) {
			console.log('🗑️ Anticipation: Starting cleanup');
			
			try {
				// Cancel animation frame
				if (animationFrame) {
					cancelAnimationFrame(animationFrame);
				}
				
				// Remove sprite from parent
				if (anticipationSprite && anticipationSprite.parent) {
					anticipationSprite.parent.removeChild(anticipationSprite);
				}
				
				// Destroy sprite normally (texture will be cleaned up automatically)
				if (anticipationSprite) {
					anticipationSprite.destroy();
				}
				
				// Clean up canvas and image
				if (gifCanvas) {
					gifCanvas.width = 1;
					gifCanvas.height = 1;
				}
				
				console.log('🗑️ Anticipation: Cleanup completed successfully');
				isDestroyed = true;
				anticipationSprite = null;
				gifCanvas = null;
				gifImage = null;
			} catch (error) {
				console.error('❌ Anticipation: Error during cleanup:', error);
				isDestroyed = true;
			}
		}
	};

	onMount(() => {
		console.log('🎬 Anticipation: Component mounted, loading GIF with canvas');

		const loadGif = async () => {
			try {
				// Create canvas for rendering GIF
				gifCanvas = document.createElement('canvas');
				gifCanvas.width = SYMBOL_SIZE;
				gifCanvas.height = SYMBOL_SIZE * 3;
				const ctx = gifCanvas.getContext('2d');
				if (!ctx) throw new Error('Could not get 2D context');
				
				// Load GIF as image element
				gifImage = new Image();
				gifImage.crossOrigin = 'anonymous';
				
				// When image loads, create the PIXI texture
				gifImage.onload = () => {
					if (!gifCanvas || !gifImage || isDestroyed) return;
					
					console.log('🎬 Anticipation: GIF loaded, creating texture');
					
					// Draw GIF to canvas (this captures the first frame or current frame)
					ctx.clearRect(0, 0, gifCanvas.width, gifCanvas.height);
					ctx.globalAlpha = 0.6; // Less transparent
					ctx.drawImage(gifImage, 0, 0, gifCanvas.width, gifCanvas.height);
					
					// Create PIXI texture from canvas
					const texture = Texture.from(gifCanvas);
					anticipationSprite = new Sprite(texture);
					
					// Position and configure sprite
					anticipationSprite.anchor.set(0.5);
					anticipationSprite.x = x;
					anticipationSprite.y = y;
					
					// Set loaded flag
					isLoaded = true;
					
					console.log('🎬 Anticipation: Canvas-based sprite created');
				};
				
				gifImage.onerror = () => {
					console.error('🎬 Anticipation: Failed to load GIF image');
					props.oncomplete();
				};
				
				// Start loading the GIF
				gifImage.src = assets.anticipation.src;
				
			} catch (error) {
				console.error('🎬 Anticipation: Error setting up canvas GIF:', error);
				props.oncomplete();
			}
		};

		// Call the async function
		loadGif();

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			cleanupSprite();
		};
	});

	// Add sprite to parent when loaded (outside of async context)
	$effect(() => {
		if (isLoaded && anticipationSprite && parentContext && parentContext.parent && !isDestroyed) {
			// Add directly to parent to avoid automatic cleanup
			parentContext.parent.addChild(anticipationSprite);
			parentContext.parent.sortChildren();
		}
	});

	// Update position when x/y changes
	$effect(() => {
		if (anticipationSprite && !isDestroyed) {
			anticipationSprite.x = x;
			anticipationSprite.y = y;
		}
	});

	$effect(() => {
		// When reel stops, wait a moment then complete to ensure timing aligns
		if (props.reel.reelState.motion === 'stopped' && show) {
			console.log('🎬 Anticipation: Reel stopped, completing anticipation');
			setTimeout(() => {
				show = false;
				cleanupSprite();
				props.oncomplete();
			}, 200); // Small delay to ensure anticipation shows until reel is fully stopped
		}
	});

	// Control visibility
	$effect(() => {
		if (anticipationSprite && !isDestroyed) {
			anticipationSprite.visible = show;
		}
	});
</script>
