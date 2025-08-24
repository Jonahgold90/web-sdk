<script lang="ts">
	import { type Snippet } from 'svelte';
	import { GlobalStyle } from 'components-ui-html';
	import { Authenticate, LoaderStakeEngine, LoaderExample, LoadI18n } from 'components-shared';
	import Game from '../components/Game.svelte';
	import { setContext } from '../game/context';
	// Import collection animation utilities to make them globally available
	import '../game/collectionAnimationUtils';
	
	// Debug PIXI texture garbage collection errors
	if (typeof window !== 'undefined') {
		const originalConsoleError = console.error;
		console.error = function(...args) {
			if (args[0] && args[0].toString().includes('_resourceId')) {
				console.log('🚨 PIXI Texture GC Error detected!');
				console.log('🚨 Error args:', args);
				console.trace('🚨 Error stack trace:');
			}
			originalConsoleError.apply(console, args);
		};
		
		// Catch uncaught errors
		window.addEventListener('error', (event) => {
			if (event.message && event.message.includes('_resourceId')) {
				console.log('🚨 Uncaught PIXI Error:', event.message);
				console.log('🚨 Error object:', event.error);
				console.log('🚨 Stack:', event.error?.stack);
			}
		});
	}

	import messagesMap from '../i18n/messagesMap';

	type Props = { children: Snippet };

	const props: Props = $props();

	let showYourLoader = $state(false);

	const loaderUrlStakeEngine = new URL('../../stake-engine-loader.gif', import.meta.url).href;
	const loaderUrl = new URL('../../loader.gif', import.meta.url).href;

	setContext();
</script>

<GlobalStyle>
	<Authenticate>
		<LoadI18n {messagesMap}>
			<Game />
		</LoadI18n>
	</Authenticate>
</GlobalStyle>

<LoaderStakeEngine src={loaderUrlStakeEngine} oncomplete={() => (showYourLoader = true)} />

{#if showYourLoader}
	<LoaderExample src={loaderUrl} />
	<!-- '/loader.gif' is served from static folder of sveltekit -->
	<!-- File location: apps/scatter/static/loader.gif -->
{/if}

{@render props.children()}