<script lang="ts">
	import { getContext as getSvelteContext } from 'svelte';
	import SpinButtonBoundingBoxes from './SpinButtonBoundingBoxes.svelte';

	const spineInstance = getSvelteContext('@@pixi_spine');
</script>

<SpinButtonBoundingBoxes {spineInstance} />
