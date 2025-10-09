<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';
	import { stateBuyButton } from './BoardFrame.svelte';
	import { getContext } from '../game/context';
	import BuyButtonBoundingBoxesWrapper from './BuyButtonBoundingBoxesWrapper.svelte';

	const context = getContext();
	const POSITION_ADJUSTMENT = 1.01;
	const VERTICAL_OFFSET = -20;
</script>

{#if stateBuyButton.animationName !== 'small_buy_click'}
<SpineProvider
	key="buyButtonSpine"
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={800}
	height={520}
	zIndex={1000}
>
	<SpineTrack
		trackIndex={0}
		animationName={stateBuyButton.animationName}
		loop={stateBuyButton.loop}
		listener={{
			complete: (entry) => {
				if (entry.animation) {
					if (entry.animation.name === 'big_buy_in') {
						stateBuyButton.animationName = 'big_buy_loop';
						stateBuyButton.loop = true;
					}
					// Reset to small_buy_click after any exit animation
					if (entry.animation.name === 'big_buy_no_out' ||
					    entry.animation.name === 'big_buy_yes_out' ||
					    entry.animation.name === 'big_buy_upper_cross_out') {
						stateBuyButton.animationName = 'small_buy_click';
						stateBuyButton.loop = true;
					}
				}
			},
		}}
	/>

	<!-- Add interactive bounding boxes wrapper -->
	<BuyButtonBoundingBoxesWrapper />
</SpineProvider>
{/if}
