<script lang="ts">
	import { Sprite, Text } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal } from 'state-shared';
	import { numberToCurrencyString, bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';

	const context = getContext();

	// Get balance, bet, and win amounts
	const balanceAmount = $derived(numberToCurrencyString(stateBet.balanceAmount));
	const betAmount = $derived(numberToCurrencyString(stateBetDerived.betCost()));
	const winAmount = $derived(bookEventAmountToCurrencyString(stateBet.winBookEventAmount));

	// Font loading state
	let fontLoaded = $state(false);

	onMount(async () => {
		// Force load the Darling Coffee font
		try {
			// Create a FontFace object and load it explicitly
			const fontFace = new FontFace('Darling Coffee', "url('/assets/fonts/brainrotBonanza/Darling%20Coffee.ttf')");
			await fontFace.load();
			document.fonts.add(fontFace);
			fontLoaded = true;
		} catch (error) {
			console.warn('Failed to load Darling Coffee font, trying alternate method:', error);
			// Try checking if font is already loaded
			await document.fonts.ready;
			// Small delay to ensure Pixi recognizes the font
			await new Promise(resolve => setTimeout(resolve, 100));
			fontLoaded = true;
		}

		// Add spacebar listener for spin
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.code === 'Space') {
				event.preventDefault(); // Prevent page scroll
				onSpinPress();
			}
		};

		window.addEventListener('keydown', handleKeydown);

		// Cleanup on unmount
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	// Get canvas dimensions
	const canvasSize = $derived(context.stateLayoutDerived.canvasSizes());

	// Calculate bottom overlay position
	const bottomOverlayY = $derived(canvasSize.height); // Position at bottom edge

	// Button sizes and positions
	const buttonSize = 60; // Size for the buttons
	const leftMargin = 60; // Distance from left edge
	const buttonSpacing = 10; // Spacing between buttons
	const bottomOverlayHeight = 150; // Height of the bottom overlay

	// Calculate button positions
	const settingsX = leftMargin;
	const settingsY = $derived(bottomOverlayY - bottomOverlayHeight / 2 + buttonSize / 2 + 10); // Lower position
	const spekX = leftMargin;
	const spekY = $derived(settingsY - buttonSize - buttonSpacing); // Above settings

	// Info button - larger and centered between the two buttons
	const infoButtonSize = 100; // Larger size for info button
	const infoX = leftMargin + buttonSize + 60; // To the right of the other buttons
	const infoY = $derived(bottomOverlayY - bottomOverlayHeight / 2); // Centered vertically in overlay

	// Credit and Bet text displays - to the right of info button
	const creditWidth = 118;  // Slightly bigger than half
	const creditHeight = 35;  // Slightly bigger than half
	const betWidth = 66;      // Slightly bigger than half
	const betHeight = 34;     // Slightly bigger than half

	// Position them left-aligned
	const textStartX = infoX + infoButtonSize / 2 + 60; // 30px gap from info button
	const creditX = textStartX + creditWidth / 2; // Center point for credit
	const creditY = $derived(bottomOverlayY - bottomOverlayHeight / 2 - 20); // Top position
	const betX = textStartX + betWidth / 2; // Center point for bet (left-aligned with credit)
	const betY = $derived(bottomOverlayY - bottomOverlayHeight / 2 + 20); // Bottom position

	// WIN display - centered horizontally, positioned near bottom of reel frame
	const winWidth = 195.5;  // Half of 391
	const winHeight = 98.5;   // Half of 197
	const winX = $derived(canvasSize.width / 2); // Centered horizontally
	const winY = $derived(bottomOverlayY - bottomOverlayHeight + winHeight/2 - 18); // Higher position, more of it hangs above overlay

	// Spin outline button - positioned on the right side
	const spinButtonSize = 180; // Large but not too big
	const spinX = $derived(canvasSize.width - 250); // Further to the left from right edge
	const spinY = $derived(bottomOverlayY - bottomOverlayHeight / 2 - 60); // Higher to make room for autoplay

	// Autoplay button - slightly overlapping bottom of spin button
	const autoplayWidth = 229;
	const autoplayHeight = 34;
	const autoplayX = $derived(spinX); // Same X position as spin button
	const autoplayY = $derived(spinY + spinButtonSize/2 - 10); // Slightly overlapping spin button

	// Spin button functionality
	const isSpinning = $derived(!context.stateXstateDerived.isIdle());

	const onSpinPress = () => {
		if (isSpinning) {
			// Stop spinning if already spinning
			if (stateBetDerived.hasAutoBetCounter()) stateBet.autoSpinsCounter = 0;
			context.eventEmitter.broadcast({ type: 'stopButtonClick' });
		} else {
			// Start spinning
			context.eventEmitter.broadcast({ type: 'soundPressBet' });
			context.eventEmitter.broadcast({ type: 'bet' });
		}
	};

	// Autoplay button functionality
	const hasAutoSpins = $derived(stateBetDerived.hasAutoBetCounter());

	const onAutoplayPress = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (hasAutoSpins) {
			// Stop auto spins if already running
			stateBet.autoSpinsCounter = 0;
		} else {
			// Open autoplay modal
			stateModal.modal = { name: 'autoSpin' };
		}
	};
</script>

<!-- Bottom Overlay - base layer for UI -->
<Sprite
	key="uiBottomOverlay"
	anchor={{ x: 0.5, y: 1 }}
	x={canvasSize.width / 2}
	y={bottomOverlayY}
	width={canvasSize.width}
	height={150}
	zIndex={100}
/>

<!-- All UI elements on top of the overlay -->
<!-- WIN display -->
<Sprite
	key="uiWin"
	anchor={{ x: 0.5, y: 0.5 }}
	x={winX}
	y={winY}
	width={winWidth}
	height={winHeight}
	zIndex={101}
/>

<!-- Win amount text below WIN label -->
{#if fontLoaded}
<Text
	text={winAmount}
	x={winX}
	y={winY + winHeight / 2 + 5}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 48,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- Left side buttons -->
<!-- Spek button (top) -->
<Sprite
	key="uiSpek"
	anchor={{ x: 0.5, y: 0.5 }}
	x={spekX}
	y={spekY}
	width={buttonSize}
	height={buttonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
/>

<!-- Settings button (bottom) -->
<Sprite
	key="uiSettings"
	anchor={{ x: 0.5, y: 0.5 }}
	x={settingsX}
	y={settingsY}
	width={buttonSize}
	height={buttonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
/>

<!-- Info button (larger, to the right) -->
<Sprite
	key="uiInfo"
	anchor={{ x: 0.5, y: 0.5 }}
	x={infoX}
	y={infoY}
	width={infoButtonSize}
	height={infoButtonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
/>

<!-- Text displays - vertically stacked, left aligned -->
<!-- Credit display (top) -->
<Sprite
	key="uiCredit"
	anchor={{ x: 0.5, y: 0.5 }}
	x={creditX}
	y={creditY}
	width={creditWidth}
	height={creditHeight}
	zIndex={101}
/>

<!-- Balance amount text next to credit label -->
{#if fontLoaded}
<Text
	text={balanceAmount}
	x={creditX + creditWidth / 2 + 65}
	y={creditY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 28,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- Bet display (bottom) -->
<Sprite
	key="uiBet"
	anchor={{ x: 0.5, y: 0.5 }}
	x={betX}
	y={betY}
	width={betWidth}
	height={betHeight}
	zIndex={101}
/>

<!-- Bet amount text next to bet label -->
{#if fontLoaded}
<Text
	text={betAmount}
	x={betX + betWidth / 2 + 50}
	y={betY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 28,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- Spin outline button on the right side -->
<Sprite
	key="uiSpinOutline"
	anchor={{ x: 0.5, y: 0.5 }}
	x={spinX}
	y={spinY}
	width={spinButtonSize}
	height={spinButtonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
	onpointerup={onSpinPress}
/>

<!-- Spin button inside the outline -->
<Sprite
	key="uiSpin"
	anchor={{ x: 0.5, y: 0.5 }}
	x={spinX}
	y={spinY}
	width={64.35}
	height={64.9}
	zIndex={102}
	interactive={true}
	cursor="pointer"
	onpointerup={onSpinPress}
/>

<!-- Autoplay outline overlapping bottom of spin button -->
<Sprite
	key="uiAutoplayOutline"
	anchor={{ x: 0.5, y: 0.5 }}
	x={autoplayX}
	y={autoplayY}
	width={160}
	height={55}
	zIndex={101}
	interactive={true}
	cursor="pointer"
	onpointerup={onAutoplayPress}
/>

<!-- Autoplay button text inside the outline -->
<Sprite
	key="uiAutoplay"
	anchor={{ x: 0.5, y: 0.5 }}
	x={autoplayX}
	y={autoplayY}
	width={137}
	height={20}
	zIndex={102}
	interactive={true}
	cursor="pointer"
	onpointerup={onAutoplayPress}
/>