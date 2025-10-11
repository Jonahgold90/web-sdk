<script lang="ts">
	import { Sprite, Text, SpineProvider, SpineTrack } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal, stateConfig } from 'state-shared';
	import { numberToCurrencyString, bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';
	import SpinButtonBoundingBoxesWrapper from './SpinButtonBoundingBoxesWrapper.svelte';

	const context = getContext();

	// Get balance, bet, and win amounts
	const balanceAmount = $derived(numberToCurrencyString(stateBet.balanceAmount));
	const betAmount = $derived(numberToCurrencyString(stateBetDerived.betCost()));
	const winAmount = $derived(bookEventAmountToCurrencyString(stateBet.winBookEventAmount));

	// Tumble win amount state
	let tumbleWinAmount = $state(0);
	let showTumbleWin = $state(false);

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountShow: () => (showTumbleWin = true),
		tumbleWinAmountHide: () => (showTumbleWin = false),
		tumbleWinAmountReset: () => {
			tumbleWinAmount = 0;
		},
		tumbleWinAmountUpdate: async (emitterEvent) => {
			if (tumbleWinAmount !== emitterEvent.amount) {
				tumbleWinAmount = emitterEvent.amount;
			}
		},
	});

	const tumbleWinAmountFormatted = $derived(bookEventAmountToCurrencyString(tumbleWinAmount));

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
	const layoutType = $derived(context.stateLayoutDerived.layoutType());
	const isMobile = $derived(layoutType === 'portrait');

	// Calculate bottom overlay position
	const bottomOverlayY = $derived(canvasSize.height); // Position at bottom edge

	// Mobile-specific settings
	const mobileOverlayHeight = 70; // Thinner control bar for mobile
	const mobileButtonSize = 35; // Smaller buttons for mobile
	const mobileHorizontalSpacing = 15; // Spacing between elements
	const mobileSidePadding = 20; // Padding from screen edges

	// Desktop button sizes and positions
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

	// Amount text positions - moved to the right
	const creditAmountX = creditX + creditWidth / 2 + 80; // Further to the right
	const betAmountX = betX + betWidth / 2 + 85; // Further to the right

	// WIN display - centered horizontally, positioned near bottom of reel frame
	const winWidth = 195.5;  // Half of 391
	const winHeight = 98.5;   // Half of 197
	const winX = $derived(canvasSize.width / 2); // Centered horizontally
	const winY = $derived(bottomOverlayY - bottomOverlayHeight + winHeight/2 - 18); // Higher position, more of it hangs above overlay

	// PAYS display - between WIN and spin button
	const paysWidth = 100;
	const paysHeight = 50;
	const paysLabelX = $derived(winX + winWidth / 2 + 150); // Label position - further to the right
	const paysAmountX = $derived(paysLabelX + paysWidth / 2 + 50); // Amount to the right of label
	const paysY = $derived(bottomOverlayY - bottomOverlayHeight / 2);

	// Spin button - positioned on the right side
	// Spine dimensions from JSON: width:619, height:359, aspect ratio ~1.72
	const spinButtonWidth = 186; // 155 * 1.2 (20% bigger)
	const spinButtonHeight = 108; // 90 * 1.2 to maintain aspect ratio
	const spinX = $derived(canvasSize.width - 250); // Further to the left from right edge
	const spinY = $derived(bottomOverlayY - bottomOverlayHeight / 2 - 60); // Higher to make room for autoplay

	// Autoplay button - slightly overlapping bottom of spin button
	const autoplayWidth = 229;
	const autoplayHeight = 34;
	const autoplayX = $derived(spinX); // Same X position as spin button
	const autoplayY = $derived(spinY + spinButtonHeight/2 - 10); // Slightly overlapping spin button

	// Spacebar listener for spin
	const onSpinPress = () => {
		const isSpinning = !context.stateXstateDerived.isIdle();
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

	// Mobile UI layout - horizontal arrangement from left to right
	// Elements: info button, credit label+amount, bet label+amount, volume button, settings button
	const mobileY = $derived(bottomOverlayY - mobileOverlayHeight / 2);

	// Mobile elements - centered between board bottom and overlay top
	const boardLayout = $derived(context.stateGameDerived.boardLayout());
	const boardBottomY = $derived(boardLayout.y + boardLayout.height / 2);
	const overlayTopY = $derived(bottomOverlayY - mobileOverlayHeight);
	const mobileCenterY = $derived((boardBottomY + overlayTopY) / 2 - 175);

	// Mobile spin button - maintain aspect ratio (619x359 from spine)
	const mobileSpinButtonWidth = 94; // 78 * 1.2 (20% bigger)
	const mobileSpinButtonHeight = 54; // 45 * 1.2 to maintain aspect ratio
	const mobileSpinX = $derived(canvasSize.width / 2);
	const mobileSpinY = $derived(mobileCenterY);

	// Win label and amount - higher above spin button
	const mobileWinWidth = 100;
	const mobileWinHeight = 50;
	const mobileWinX = $derived(canvasSize.width / 2);
	const mobileWinY = $derived(mobileCenterY - mobileSpinButtonHeight / 2 -  80);

	// PAYS display - under spin button on mobile
	const mobilePaysWidth = 60;
	const mobilePaysHeight = 30;
	const mobilePaysLabelX = $derived(canvasSize.width / 2 - 40); // Label to the left
	const mobilePaysAmountX = $derived(canvasSize.width / 2 + 40); // Amount to the right
	const mobilePaysY = $derived(mobileCenterY + mobileSpinButtonHeight / 2 + 45);

	// Buy frame - doubled spacing
	const mobileBuyFrameWidth = 80;
	const mobileBuyFrameHeight = 45;
	const mobileBuyFrameX = $derived(mobileSpinX - mobileSpinButtonWidth / 2 - 60 - mobileBuyFrameWidth / 2);
	const mobileBuyFrameY = $derived(mobileCenterY - 15);

	// Bet frame - doubled spacing
	const mobileBetFrameWidth = 80;
	const mobileBetFrameHeight = 99;
	const mobileBetFrameX = $derived(mobileSpinX + mobileSpinButtonWidth / 2 + 60 + mobileBetFrameWidth / 2);
	const mobileBetFrameY = $derived(mobileCenterY - 15);

	// Calculate horizontal positions for mobile (left to right) - tightly packed
	let currentMobileX = 5; // Minimal padding on left

	// Info button (small)
	const mobileInfoX = $derived(currentMobileX + mobileButtonSize / 2);
	const mobileInfoY = $derived(mobileY);
	const mobileInfoNextX = $derived(mobileInfoX + mobileButtonSize / 2 + 5);

	// Credit label dimensions (smaller for mobile)
	const mobileCreditWidth = 60;
	const mobileCreditHeight = 25;
	const mobileCreditX = $derived(mobileInfoNextX + mobileCreditWidth / 2);
	const mobileCreditY = $derived(mobileY);

	// Credit amount position - more space to prevent overlap
	const mobileCreditAmountX = $derived(mobileCreditX + mobileCreditWidth / 2 + 55);
	const mobileCreditNextX = $derived(mobileCreditAmountX + 40);

	// Bet label
	const mobileBetWidth = 40;
	const mobileBetHeight = 25;
	const mobileBetX = $derived(mobileCreditNextX + 18 + mobileBetWidth / 2);
	const mobileBetY = $derived(mobileY);

	// Bet amount position (space for 4-digit amounts like 1000) - more space to prevent overlap
	const mobileBetAmountX = $derived(mobileBetX + mobileBetWidth / 2 + 45);
	const mobileBetNextX = $derived(mobileBetAmountX + 60);

	// Volume button (using spek sprite)
	const mobileVolumeX = $derived(canvasSize.width - mobileButtonSize / 2 - 50); // From right edge
	const mobileVolumeY = $derived(mobileY);

	// Settings button
	const mobileSettingsX = $derived(canvasSize.width - mobileButtonSize / 2 - 5); // From right edge
	const mobileSettingsY = $derived(mobileY);
</script>

<!-- Bottom Overlay - base layer for UI -->
<Sprite
	key="uiBottomOverlay"
	anchor={{ x: 0.5, y: 1 }}
	x={canvasSize.width / 2}
	y={bottomOverlayY}
	width={canvasSize.width}
	height={isMobile ? mobileOverlayHeight : bottomOverlayHeight}
	zIndex={100}
/>

<!-- Desktop UI -->
{#if !isMobile}
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

<!-- PAYS display - between WIN and spin button -->
{#if showTumbleWin && fontLoaded}
<!-- PAYS label text -->
<Text
	text="PAYS:"
	x={paysLabelX}
	y={paysY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 24,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>

<!-- PAYS amount text - to the right of label -->
<Text
	text={tumbleWinAmountFormatted}
	x={paysAmountX}
	y={paysY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 24,
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
	x={creditAmountX}
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
	x={betAmountX}
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

<!-- Spin button spine -->
<SpineProvider
	key="spinButton"
	x={spinX}
	y={spinY}
	width={spinButtonWidth}
	height={spinButtonHeight}
	zIndex={101}
>
	<SpineTrack trackIndex={0} animationName="spin_button_idle" loop={true} />
	<SpinButtonBoundingBoxesWrapper />
</SpineProvider>
{/if}

<!-- Mobile UI - horizontal layout at bottom -->
{#if isMobile}
<!-- Win label - above spin button -->
<Sprite
	key="uiWin"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileWinX}
	y={mobileWinY}
	width={mobileWinWidth}
	height={mobileWinHeight}
	zIndex={101}
/>

<!-- Win amount text -->
{#if fontLoaded}
<Text
	text={winAmount}
	x={mobileWinX}
	y={mobileWinY + mobileWinHeight / 2 + 5}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 24,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- PAYS display on mobile - between WIN and spin button -->
{#if showTumbleWin && fontLoaded}
<!-- PAYS label text -->
<Text
	text="PAYS:"
	x={mobilePaysLabelX}
	y={mobilePaysY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 16,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>

<!-- PAYS amount text - to the right of label -->
<Text
	text={tumbleWinAmountFormatted}
	x={mobilePaysAmountX}
	y={mobilePaysY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 16,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- Spin button spine - centered between board and control bar -->
<SpineProvider
	key="spinButton"
	x={mobileSpinX}
	y={mobileSpinY}
	width={mobileSpinButtonWidth}
	height={mobileSpinButtonHeight}
	zIndex={101}
>
	<SpineTrack trackIndex={0} animationName="spin_button_idle" loop={true} />
	<SpinButtonBoundingBoxesWrapper />
</SpineProvider>

<!-- Buy frame - left of spin button -->
<Sprite
	key="buyFrame"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY}
	width={mobileBuyFrameWidth}
	height={mobileBuyFrameHeight}
	zIndex={101}
/>

<!-- Bet frame - right of spin button -->
<Sprite
	key="betFrame"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX}
	y={mobileBetFrameY}
	width={mobileBetFrameWidth}
	height={mobileBetFrameHeight}
	zIndex={101}
/>

<!-- Info button (small) -->
<Sprite
	key="uiInfo"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileInfoX}
	y={mobileInfoY}
	width={mobileButtonSize}
	height={mobileButtonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
/>

<!-- Credit label -->
<Sprite
	key="uiCredit"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileCreditX}
	y={mobileCreditY}
	width={mobileCreditWidth}
	height={mobileCreditHeight}
	zIndex={101}
/>

<!-- Credit amount text -->
{#if fontLoaded}
<Text
	text={balanceAmount}
	x={mobileCreditAmountX}
	y={mobileCreditY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 16,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- Bet label -->
<Sprite
	key="uiBet"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetX}
	y={mobileBetY}
	width={mobileBetWidth}
	height={mobileBetHeight}
	zIndex={101}
/>

<!-- Bet amount text -->
{#if fontLoaded}
<Text
	text={betAmount}
	x={mobileBetAmountX}
	y={mobileBetY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 16,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={103}
/>
{/if}

<!-- Volume button (using spek sprite) -->
<Sprite
	key="uiSpek"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileVolumeX}
	y={mobileVolumeY}
	width={mobileButtonSize}
	height={mobileButtonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
/>

<!-- Settings button -->
<Sprite
	key="uiSettings"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileSettingsX}
	y={mobileSettingsY}
	width={mobileButtonSize}
	height={mobileButtonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
/>
{/if}