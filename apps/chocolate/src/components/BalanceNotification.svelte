<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { BitmapText, Container } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { stateBet, stateModal } from 'state-shared';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const context = getContext();

	// State for showing the notification
	let show = $state(false);
	let message = $state('');

	// Animation values
	let opacity = tweened(0, { duration: 300, easing: cubicOut });
	let yOffset = tweened(-50, { duration: 300, easing: cubicOut });

	// Center position on screen
	const position = $derived(() => {
		const layout = context.stateLayoutDerived.mainLayout();
		return { 
			x: layout.width / 2, 
			y: layout.height / 3  // Position in upper third of screen
		};
	});

	// Listen for insufficient funds modal and show notification instead
	$effect(() => {
		if (stateModal.modal?.name === 'autoSpinMessage' && stateModal.modal.message === 'insufficientFunds') {
			// Hide the modal immediately
			stateModal.modal = null;
			
			// Show our on-screen notification
			showNotification('INSUFFICIENT BALANCE');
		}
	});

	// Listen for bet events and requests to show balance notifications
	context.eventEmitter.subscribeOnMount({
		bet: () => {
			// Check balance before bet is processed
			const betCost = stateBet.betAmount * (stateBet.activeBetModeKey === 'BONUS' ? 100 : 1);
			if (betCost > stateBet.balanceAmount) {
				showNotification('INSUFFICIENT BALANCE');
			}
		},
		showInsufficientBalance: () => {
			// Direct request to show insufficient balance notification
			console.log('🚨 BalanceNotification: Received showInsufficientBalance event');
			showNotification('INSUFFICIENT BALANCE');
		}
	});

	async function showNotification(text: string) {
		console.log('🚨 BalanceNotification: showNotification called with:', text);
		message = text;
		show = true;
		
		// Animate in
		await Promise.all([
			opacity.set(1),
			yOffset.set(0)
		]);
		
		// Wait 3 seconds
		await new Promise(resolve => setTimeout(resolve, 3000));
		
		// Animate out
		await Promise.all([
			opacity.set(0),
			yOffset.set(-50)
		]);
		
		// Hide
		show = false;
	}

	// Public function to show notifications from other components
	export function showInsufficientBalance() {
		showNotification('INSUFFICIENT BALANCE');
	}
</script>

{#if show}
	<MainContainer>
		<Container 
			x={position().x} 
			y={position().y + $yOffset}
			alpha={$opacity}
		>
			<!-- Background -->
			<Container>
				<!-- Semi-transparent dark background -->
				<BitmapText
					text="█████████████████████████"
					anchor={{ x: 0.5, y: 0.5 }}
					alpha={0.8}
					tint={0x000000}
					style={{
						fontFamily: 'gold',
						fontSize: 36,
					}}
				/>
			</Container>
			
			<!-- Message text -->
			<BitmapText
				text={message}
				anchor={{ x: 0.5, y: 0.5 }}
				tint={0xFF0000}
				style={{
					fontFamily: 'gold',
					fontSize: 36,
				}}
			/>
		</Container>
	</MainContainer>
{/if}