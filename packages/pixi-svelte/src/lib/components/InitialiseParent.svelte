<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import * as PIXI from 'pixi.js';

	import { createContextParent, getContextApp } from '../context.svelte';

	type Props = { children: Snippet };

	const props: Props = $props();
	const context = getContextApp();

	let parentContext = $state<{ parent: PIXI.Container | null }>({ parent: null });

	onMount(() => {
		// Create a default container if needed
		const container = context.stateApp.pixiApplication?.stage ?? new PIXI.Container();
		parentContext = createContextParent(container);

		return () => {
			// Cleanup if needed
		};
	});
</script>

{#if parentContext.parent}
	{@render props.children()}
{/if}
