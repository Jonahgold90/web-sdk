<script lang="ts" module>
	export type EmitterEventXBetButton =
		| { type: 'xBetButtonShow' }
		| { type: 'xBetButtonHide' }
		| { type: 'xBetButtonClick' };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Sprite, Container, BitmapText } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { stateBet, stateBetDerived } from 'state-shared';
	import { stateGame } from '../game/stateGame.svelte';
	import { stateSlots } from 'utils-slots/src/stateSlots.svelte';
	import { SYMBOL_SIZE } from '../game/constants';
	import { numberToCurrencyString } from 'utils-shared/amount';
	
	const context = getContext();

	// Only show in base game, hide during bonus features and outro modals
	let manualShow = $state(true);
	let freeSpinOutroVisible = $state(false);
	let freeSpinCounterVisible = $state(false);
	let delayedShow = $state(false);
	
	// Show logic with delay after free spin counter disappears
	let show = $derived(manualShow && context.stateGame.gameType === 'basegame' && !freeSpinOutroVisible && !freeSpinCounterVisible && delayedShow);
	
	// Check if any reel is spinning
	let isSpinning = $derived(
		stateSlots.isPreSpinning || 
		context.stateGame.board.some(reel => reel.reelState.motion === 'spinning' || reel.reelState.motion === 'bouncing')
	);
	
	// Interactive only when showing, game is not spinning, and bet amount is greater than 0
	let interactive = $derived(show && !isSpinning && stateBet.betAmount > 0);

	// Check if antibet mode is active
	let isAntibetActive = $derived(stateBet.activeBetModeKey === 'ANTIBET');
	
	// // Debug logging
	// $effect(() => {
	// 	console.log('XBet Button - Bet mode key changed to:', stateBet.activeBetModeKey, 'Active:', isAntibetActive);
	// 	console.log('XBet Button - Sprite key:', spriteKey);
	// });
	
	// Choose the correct sprite key based on antibet state
	let spriteKey = $derived(
		isAntibetActive 
			? 'xBetButtonOn'
			: 'xBetButtonOff'
	);

	// Comprehensive responsive positioning and sizing to match BuyButton
	const layout = $derived(() => {
		const layoutData = context.stateLayoutDerived.mainLayout();
		const width = layoutData.width;
		const height = layoutData.height;
		const isMobile = width < 1024;
		
		// Button dimensions - slightly bigger than BuyButton but maintain 871:630 aspect ratio
		const buttonWidth = isMobile ? 280 : 240;
		const buttonHeight = Math.round(buttonWidth * (630 / 871));
		
		// Position calculation
		if (isMobile) {
			// Mobile/Tablet: to the right of bonus buy, above control bar
			const buyButtonWidth = 240; // BuyButton width on mobile
			const totalWidth = buyButtonWidth + buttonWidth + 20; // Two buttons plus 20px gap
			const centerX = (width - totalWidth) / 2;
			return { 
				x: centerX + buyButtonWidth + 20, 
				y: height - 340, // Moved up to align with BuyButton
				width: buttonWidth,
				height: buttonHeight
			};
		} else {
			// Desktop: centered below bonus buy button
			const buyButtonWidth = 200; // BuyButton width on desktop
			const centerX = 100 + (buyButtonWidth - buttonWidth) / 2; // Center under BuyButton
			return { 
				x: centerX, 
				y: 420,
				width: buttonWidth,
				height: buttonHeight
			};
		}
	});
	
	// Format currency helper - just the number for non-USD
	const formatCurrencyNumber = (amount: number) => {
		if (stateBet.currency === 'USD') {
			return numberToCurrencyString(amount);
		} else {
			return amount.toFixed(2);
		}
	};
	
	// Get currency abbreviation for display
	const getCurrencyAbbreviation = () => {
		const currencyAbbreviations: Record<string, string> = {
			'EUR': 'EUR',
			'GBP': 'GBP',
			'CAD': 'CAD',
			'AUD': 'AUD',
			'JPY': 'JPY',
			'CHF': 'CHF',
			'SEK': 'SEK',
			'NOK': 'NOK',
			'DKK': 'DKK',
			'MXN': 'MXN',
			'XGC': 'GC',
			'XSC': 'SC',
		};
		return currencyAbbreviations[stateBet.currency] || stateBet.currency;
	};
	
	// Calculate bet amount to display - show the antibet cost regardless of current state
	const xBetCostAmount = $derived(stateBet.betAmount * 1.5);
	let betAmountText = $derived(
		formatCurrencyNumber(xBetCostAmount)
	);
	
	// Check if player has enough balance for XBet
	const canAffordXBet = $derived(xBetCostAmount <= stateBet.balanceAmount);
	
	// Whether to show separate currency abbreviation
	let showCurrencyAbbreviation = $derived(stateBet.currency !== 'USD');
	let currencyAbbreviation = $derived(getCurrencyAbbreviation());

	context.eventEmitter.subscribeOnMount({
		xBetButtonShow: () => (manualShow = true),
		xBetButtonHide: () => (manualShow = false),
		freeSpinOutroShow: () => (freeSpinOutroVisible = true),
		freeSpinOutroHide: () => (freeSpinOutroVisible = false),
		freeSpinCounterShow: () => (freeSpinCounterVisible = true),
		freeSpinCounterHide: () => {
			freeSpinCounterVisible = false;
			// Delay showing the button to let fade out animation complete
			setTimeout(() => (delayedShow = true), 500);
		},
		xBetButtonClick: () => {
			// Toggle antibet mode (balance check is done in handleClick)
			// console.log('xBet button clicked! Current mode:', stateBet.activeBetModeKey);
			if (stateBet.activeBetModeKey === 'ANTIBET') {
				stateBet.activeBetModeKey = 'BASE';
				// console.log('Switched to base mode');
			} else {
				stateBet.activeBetModeKey = 'ANTIBET';
				// console.log('Switched to antibet mode');
			}
			// console.log('New bet mode:', stateBet.activeBetModeKey);
		},
	});
	
	// Initialize delayedShow when in base game
	$effect(() => {
		if (context.stateGame.gameType === 'basegame' && !freeSpinCounterVisible) {
			delayedShow = true;
		} else {
			delayedShow = false;
		}
	});

	function handleClick() {
		// Check if player can afford XBet, show notification if not
		if (!canAffordXBet) {
			// Trigger the balance notification
			// console.log('🚨 XBetButton: Player cannot afford XBet, broadcasting showInsufficientBalance');
			context.eventEmitter.broadcast({ type: 'showInsufficientBalance' });
			return;
		}
		
		context.eventEmitter.broadcast({ type: 'xBetButtonClick' });
	}
</script>

{#if show}
	<MainContainer>
		<Container x={layout().x} y={layout().y}>
			<Sprite 
				key={spriteKey} 
				width={layout().width} 
				height={layout().height}
				interactive={interactive}
				cursor={interactive ? "pointer" : "default"}
				alpha={interactive ? 1 : 0.5}
				onpointertap={interactive ? handleClick : undefined}
				onpointerover={interactive ? (e) => e.currentTarget.alpha = 0.8 : undefined}
				onpointerout={interactive ? (e) => e.currentTarget.alpha = (interactive ? 1 : 0.5) : undefined}
			/>
			
			<!-- Currency abbreviation for non-USD currencies -->
			{#if showCurrencyAbbreviation}
				<BitmapText
					text={currencyAbbreviation}
					x={layout().width / 2 - 25}
					y={layout().height - 35}
					anchor={{ x: 0.5, y: 0.5 }}
					style={{
						fontFamily: 'gold',
						fontSize: 20,
					}}
				/>
			{/if}
			
			<!-- Bet amount text overlay - always show the antibet cost -->
			{#if betAmountText}
				<BitmapText
					text={betAmountText}
					x={showCurrencyAbbreviation ? layout().width / 2 + 25 : layout().width / 2}
					y={layout().height - 35}
					anchor={{ x: 0.5, y: 0.5 }}
					style={{
						fontFamily: 'gold',
						fontSize: 22,
					}}
				/>
			{/if}
		</Container>
	</MainContainer>
{/if}