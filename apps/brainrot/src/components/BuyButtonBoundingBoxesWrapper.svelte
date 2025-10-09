<script lang="ts">
	import { getContext as getSvelteContext } from 'svelte';
	import BuyButtonBoundingBoxes from './BuyButtonBoundingBoxes.svelte';

	// Get spine from context - this component is rendered INSIDE SpineProvider
	const spineInstance = getSvelteContext('@@pixi_spine');
</script>

{#if spineInstance}
	<BuyButtonBoundingBoxes {spineInstance} />
{:else}
	<span><!-- Spine not ready yet --></span>
{/if}
