<script lang="ts" module>
	export type EmitterEventBuyButton =
		| { type: 'buyButtonShow' }
		| { type: 'buyButtonHide' }
		| { type: 'buyButtonClick' };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Sprite, Container } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { stateModal } from 'state-shared';
	import { SYMBOL_SIZE } from '../game/constants';
	
	const context = getContext();

	let show = $state(true); // Show by default in base game

	// Button sizing and positioning - let PIXI maintain aspect ratio
	const buttonSize = $derived(SYMBOL_SIZE * 2); // Base size
	const position = $derived({
		x: 100, // Simple left position for testing
		y: 300, // Simple center position for testing
	});
	
	// Debug the positioning and assets
	$effect(() => {
		console.log('BuyButton position:', position, 'buttonSize:', buttonSize);
		console.log('Board layout:', context.stateGameDerived.boardLayout());
		console.log('BuyButton show state:', show);
		console.log('Loaded assets keys:', Object.keys(context.stateApp.loadedAssets || {}));
		console.log('Has buyButton asset:', 'buyButton' in (context.stateApp.loadedAssets || {}));
	});

	context.eventEmitter.subscribeOnMount({
		buyButtonShow: () => (show = true),
		buyButtonHide: () => (show = false),
		buyButtonClick: () => {
			// Open the same modal as the shopping cart button in control bar
			stateModal.modal = { name: 'buyBonus' };
		},
	});

	function handleClick() {
		context.eventEmitter.broadcast({ type: 'buyButtonClick' });
	}
</script>

{#if show}
	<MainContainer>
		<Container x={100} y={300}>
			<Sprite 
				key="buyButton" 
				width={200} 
				height={105}
				interactive={true}
				cursor="pointer"
				onpointertap={handleClick}
				onpointerover={(e) => e.currentTarget.alpha = 0.8}
				onpointerout={(e) => e.currentTarget.alpha = 1}
			/>
		</Container>
	</MainContainer>
{/if}