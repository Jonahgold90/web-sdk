<script lang="ts">
	import { onMount } from 'svelte';
	import { getContextParent, getContextApp } from 'pixi-svelte';
	import { Assets } from 'pixi.js';
	import { AnimatedGIF } from '@pixi/gif';
	
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
	let gifSprite: any = null;
	let isLoaded = $state(false);

	// Use exact same positioning as the original Spine
	const x = $derived(
		context.stateGameDerived.boardLayout().x -
		context.stateGameDerived.boardLayout().width * 0.5 +
		(props.reel.reelIndex + REEL_PADDING) * SYMBOL_SIZE
	);
	const y = $derived(context.stateGameDerived.boardLayout().y - SYMBOL_SIZE * 0.2);

	onMount(() => {
		console.log('Anticipation onMount - loading GIF directly...');
		
		const loadGif = async () => {
			try {
				// Load the GIF directly using fetch and AnimatedGIF
				console.log('Loading GIF from:', assets.anticipation.src);
				
				const response = await fetch(assets.anticipation.src);
				const buffer = await response.arrayBuffer();
				console.log('GIF buffer loaded:', buffer.byteLength, 'bytes');
				
				// Create AnimatedGIF from buffer
				gifSprite = AnimatedGIF.fromBuffer(buffer);
				console.log('AnimatedGIF created:', gifSprite);
				
				// Size to cover the whole reel (full width and height)
				gifSprite.width = SYMBOL_SIZE;
				gifSprite.height = SYMBOL_SIZE * 3; // Cover all 3 visible symbols on the reel
				gifSprite.anchor.set(0.5);
				gifSprite.x = x;
				gifSprite.y = y;
				gifSprite.alpha = 0.3; // Make semi-transparent so symbols show through
				gifSprite.loop = true;
				gifSprite.play();
				
				// Set loaded flag to trigger the effect
				isLoaded = true;
				
			} catch (error) {
				console.error('Failed to load GIF:', error);
			}
		};

		// Call the async function
		loadGif();

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (gifSprite && parentContext && parentContext.parent) {
				try {
					parentContext.parent.removeChild(gifSprite);
					if (gifSprite.destroy) {
						gifSprite.destroy();
					}
				} catch (error) {
					console.warn('Error cleaning up GIF sprite:', error);
				}
			}
		};
	});

	// Add sprite to parent when loaded (outside of async context)
	$effect(() => {
		if (isLoaded && gifSprite && parentContext && parentContext.parent) {
			console.log('Adding GIF sprite to parent at position:', x, y);
			// Add directly to parent to avoid automatic cleanup
			parentContext.parent.addChild(gifSprite);
			parentContext.parent.sortChildren();
		}
	});

	// Update position when x/y changes
	$effect(() => {
		if (gifSprite) {
			gifSprite.x = x;
			gifSprite.y = y;
		}
	});

	$effect(() => {
		// When reel stops, complete immediately to prevent overlaps
		if (props.reel.reelState.motion === 'stopped') {
			console.log('Reel stopped, completing anticipation immediately');
			show = false;
			if (gifSprite) {
				try {
					if (gifSprite.stop) {
						gifSprite.stop();
					}
					if (parentContext && parentContext.parent) {
						parentContext.parent.removeChild(gifSprite);
					}
				} catch (error) {
					console.warn('Error stopping GIF sprite:', error);
				}
			}
			props.oncomplete();
		}
	});

	// Control visibility
	$effect(() => {
		if (gifSprite) {
			gifSprite.visible = show;
		}
	});
</script>
