<script lang="ts">
	import { Sprite, Text, SpineProvider, SpineTrack, Graphics } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal, stateConfig, stateSound } from 'state-shared';
	import { numberToCurrencyString, bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { onMount } from 'svelte';

	import { getContext } from '../game/context';
	import SpinButtonBoundingBoxesWrapper from './SpinButtonBoundingBoxesWrapper.svelte';
	import { stateBuyButton } from './BoardFrame.svelte';

	const context = getContext();

	// Get balance, bet, and win amounts
	const balanceAmount = $derived(numberToCurrencyString(stateBet.balanceAmount));
	const betAmount = $derived(numberToCurrencyString(stateBetDerived.betCost()));
	const winAmount = $derived(bookEventAmountToCurrencyString(stateBet.winBookEventAmount));

	// Tumble win amount state
	let tumbleWinAmount = $state(0);
	let showTumbleWin = $state(false);

	// Volume slider state
	let showVolumeSlider = $state(false);
	let isDraggingVolume = $state(false);
	let volumeSliderElement: { y: number; height: number } | null = null;

	function handleVolumePointerMove(e: PointerEvent | TouchEvent) {
		if (!isDraggingVolume || !volumeSliderElement) return;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const localY = clientY - (volumeSliderElement.y - volumeSliderElement.height / 2);
		const newVolume = 1 - Math.max(0, Math.min(1, localY / volumeSliderElement.height));
		stateSound.volumeValueMaster = Math.round(newVolume * 100);
	}

	function handleVolumePointerUp() {
		isDraggingVolume = false;
	}

	function handleVolumeTrackClick(e: PointerEvent | TouchEvent, sliderY: number, trackHeight: number) {
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const localY = clientY - (sliderY - trackHeight / 2);
		const newVolume = 1 - Math.max(0, Math.min(1, localY / trackHeight));
		stateSound.volumeValueMaster = Math.round(newVolume * 100);
	}

	// Free spin counter state
	let showFreeSpinCounter = $state(false);
	let freeSpinCurrent = $state(0);
	let freeSpinTotal = $state(0);

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
		freeSpinCounterShow: () => {
			showFreeSpinCounter = true;
		},
		freeSpinCounterHide: () => {
			showFreeSpinCounter = false;
		},
		freeSpinCounterUpdate: (emitterEvent) => {
			if (emitterEvent.current !== undefined) freeSpinCurrent = emitterEvent.current;
			if (emitterEvent.total !== undefined) freeSpinTotal = emitterEvent.total;
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

	// Ante bet toggle
	const isToggleOn = $derived(stateBet.activeBetModeKey === 'ANTE');
	// Mobile arrow positions (scaled for 80px wide frame, desktop uses -30/35 for 197px frame)
	const ARROW_OFF_POSITION_MOBILE = -12; // Off position (BASE mode)
	const ARROW_ON_POSITION_MOBILE = 14; // On position (ANTE mode)

	const toggleAnteBet = () => {
		if (isToggleOn) {
			stateBet.activeBetModeKey = 'BASE';
		} else {
			stateBet.activeBetModeKey = 'ANTE';
		}
	};

	// Calculate bottom overlay position
	const bottomOverlayY = $derived(canvasSize.height); // Position at bottom edge

	// Mobile-specific settings
	const mobileOverlayHeight = 70; // Thinner control bar for mobile
	const mobileButtonSize = 35; // Smaller buttons for mobile
	const mobileHorizontalSpacing = 15; // Spacing between elements
	const mobileSidePadding = 20; // Padding from screen edges

	// Desktop button sizes and positions - scale based on screen height
	const bottomOverlayHeight = $derived(
		canvasSize.height < 600 ? 90 :
		canvasSize.height < 750 ? 110 :
		150
	); // Even more reduced for very small screens
	const buttonSize = $derived(
		canvasSize.height < 600 ? 38 :
		canvasSize.height < 750 ? 45 :
		60
	); // Smaller on very small screens (5% smaller: 40 -> 38)
	const leftMargin = 60; // Distance from left edge
	const buttonSpacing = $derived(
		canvasSize.height < 600 ? 3 :
		canvasSize.height < 750 ? 5 :
		10
	); // Even tighter spacing on very small screens

	// Calculate button positions
	const settingsX = leftMargin;
	const settingsY = $derived(bottomOverlayY - bottomOverlayHeight / 2 + buttonSize / 2 + (canvasSize.height < 600 ? 5 : 10)); // Higher position on very small screens
	const spekX = leftMargin;
	const spekY = $derived(settingsY - buttonSize - buttonSpacing); // Above settings

	// Info button - larger and centered between the two buttons
	const infoButtonSize = $derived(
		canvasSize.height < 600 ? 65 :
		canvasSize.height < 750 ? 80 :
		100
	); // Even smaller on very small screens
	const infoX = $derived(leftMargin + buttonSize + (canvasSize.height < 600 ? 40 : 60)); // Closer on very small screens
	const infoY = $derived(bottomOverlayY - bottomOverlayHeight / 2); // Centered vertically in overlay

	// Credit and Bet text displays - to the right of info button
	const creditWidth = $derived(canvasSize.height < 600 ? 95 : 118);  // Smaller on very small screens
	const creditHeight = $derived(canvasSize.height < 600 ? 28 : 35);
	const betWidth = $derived(canvasSize.height < 600 ? 53 : 66);
	const betHeight = $derived(canvasSize.height < 600 ? 27 : 34);

	// Position them left-aligned - adjusted for smaller screens
	const textStartX = $derived(infoX + infoButtonSize / 2 + (canvasSize.height < 600 ? 15 : 30)); // Even tighter on very small screens
	const creditX = $derived(textStartX + creditWidth / 2); // Center point for credit
	const creditY = $derived(bottomOverlayY - bottomOverlayHeight / 2 - (canvasSize.height < 600 ? 15 : 20)); // Closer to center on small screens
	const betX = $derived(textStartX + betWidth / 2); // Center point for bet (left-aligned with credit)
	const betY = $derived(bottomOverlayY - bottomOverlayHeight / 2 + (canvasSize.height < 600 ? 15 : 20)); // Closer to center on small screens

	// Amount text positions - adjusted based on screen size
	const creditAmountX = $derived(creditX + creditWidth / 2 + (canvasSize.width < 1400 ? 70 : 60)); // More space on smaller screens
	const betAmountX = $derived(betX + betWidth / 2 + (canvasSize.width < 1400 ? 75 : 65)); // More space on smaller screens

	// WIN display - centered horizontally, positioned near bottom of reel frame
	const winWidth = $derived(canvasSize.height < 600 ? 137.05 : 195.5);  // 70% size on very small screens (Half of 391 * 0.7)
	const winHeight = $derived(canvasSize.height < 600 ? 68.95 : 98.5);   // 70% size on very small screens (Half of 197 * 0.7)
	const winX = $derived(canvasSize.width / 2); // Centered horizontally
	const winY = $derived(bottomOverlayY - bottomOverlayHeight + winHeight/2 - (canvasSize.height < 600 ? 12 : 18)); // Adjusted position for smaller size

	// PAYS display - between WIN and spin button
	const paysWidth = $derived(
		canvasSize.height < 600 ? 65 :
		canvasSize.width < 1400 ? 80 :
		100
	); // Even smaller on very small screens
	const paysHeight = $derived(
		canvasSize.height < 600 ? 32 :
		canvasSize.width < 1400 ? 40 :
		50
	); // Even smaller on very small screens
	const paysLabelX = $derived(
		canvasSize.height < 600 ? winX + winWidth / 2 + 50 :
		canvasSize.width < 1400 ? winX + winWidth / 2 + 70 :
		winX + winWidth / 2 + 150
	); // Further left on very small screens
	const paysAmountX = $derived(paysLabelX + paysWidth / 2 + (canvasSize.width < 1400 ? 40 : 50)); // Tighter spacing on smaller screens
	const paysY = $derived(canvasSize.width < 1400 ? bottomOverlayY - bottomOverlayHeight / 2 + 25 : bottomOverlayY - bottomOverlayHeight / 2); // Lower on smaller screens

	// Spin button - positioned on the right side, scaled based on screen width
	// Spine dimensions from JSON: width:619, height:359, aspect ratio ~1.72
	// Scale down on smaller screens (< 1400px width)
	const spinButtonScale = $derived(canvasSize.width < 1400 ? 0.65 : 1.0);
	const spinButtonWidth = $derived(186 * spinButtonScale); // 155 * 1.2 (20% bigger) * scale
	const spinButtonHeight = $derived(108 * spinButtonScale); // 90 * 1.2 to maintain aspect ratio * scale
	const spinX = $derived(canvasSize.width < 1400 ? canvasSize.width - 180 - (spinButtonWidth / 2) : canvasSize.width - 250); // Position based on size
	const spinY = $derived(canvasSize.width < 1400 ? bottomOverlayY - bottomOverlayHeight / 2 - 40 : bottomOverlayY - bottomOverlayHeight / 2 - 60); // Height based on size

	// Autoplay button - slightly overlapping bottom of spin button
	const autoplayWidth = $derived(229 * spinButtonScale);
	const autoplayHeight = $derived(34 * spinButtonScale);
	const autoplayX = $derived(spinX); // Same X position as spin button
	const autoplayY = $derived(spinY + spinButtonHeight/2 - (10 * spinButtonScale)); // Slightly overlapping spin button

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

<svelte:window
	on:pointermove={handleVolumePointerMove}
	on:pointerup={handleVolumePointerUp}
	on:touchmove={handleVolumePointerMove}
	on:touchend={handleVolumePointerUp}
	on:pointerdown={(e) => {
		if (showVolumeSlider) {
			const target = e.target as HTMLElement;
			if (!target.closest('.volume-slider') && !target.closest('[data-volume-button]')) {
				showVolumeSlider = false;
			}
		}
	}}
/>

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
		fontSize: canvasSize.height < 600 ? 34 : 48,
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
<!-- Spek button (top) - Volume button -->
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
	data-volume-button
	onpointerup={() => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		showVolumeSlider = !showVolumeSlider;
	}}
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
	onpointerup={() => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'settings' };
	}}
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

<!-- Buy frame - left of spin button (only in base game) -->
{#if !showFreeSpinCounter}
<Sprite
	key="buyFrame"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY}
	width={mobileBuyFrameWidth}
	height={mobileBuyFrameHeight}
	zIndex={101}
	interactive={true}
	cursor="pointer"
	onpointerup={() => {
		stateBuyButton.animationName = 'big_buy_in';
		stateBuyButton.loop = false;
	}}
/>

<!-- "BUY FEATURE" text on the button -->
<Sprite
	key="buyText"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY - 8}
	width={79.2}
	height={17.6}
	zIndex={102}
/>

<!-- Bonus buy cost text -->
{#if fontLoaded}
<Text
	text={`$${(stateBet.betAmount * 100).toString()}`}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY + 12}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 13,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={102}
/>
{/if}

<!-- Bet frame - right of spin button -->
<Sprite
	key="bet_frame.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX}
	y={mobileBetFrameY}
	width={mobileBetFrameWidth}
	height={mobileBetFrameHeight}
	zIndex={101}
/>

<!-- Button 01 (toggle button) -->
<Sprite
	key="button_01.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX}
	y={mobileBetFrameY + 32}
	width={72}
	height={21}
	zIndex={102}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleAnteBet}
/>

<!-- "On" text on left side of button -->
<Sprite
	key="on.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX - 18}
	y={mobileBetFrameY + 32}
	width={19}
	height={12.8}
	zIndex={103}
/>

<!-- "Off" text on right side of button -->
<Sprite
	key="off.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX + 18}
	y={mobileBetFrameY + 32}
	width={22.8}
	height={13}
	zIndex={103}
/>

<!-- Arrow toggle (moves left/right) -->
<Sprite
	key="arrow.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX + (isToggleOn ? ARROW_ON_POSITION_MOBILE : ARROW_OFF_POSITION_MOBILE)}
	y={mobileBetFrameY + 32}
	width={34.4}
	height={13.6}
	zIndex={104}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleAnteBet}
/>
{/if}

<!-- Free Spin Counter Frame - shown during free spins in same position as buy frame -->
{#if showFreeSpinCounter}
<Sprite
	key="freeSpinCounterFrame"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY}
	width={mobileBuyFrameWidth}
	height={mobileBuyFrameHeight}
	zIndex={101}
/>

<!-- Free spin counter text -->
{#if fontLoaded}
<Text
	text={`${freeSpinTotal - freeSpinCurrent}`}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY - 14}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: 17,
		fill: 0xFFFFFF,
		align: 'center'
	}}
	zIndex={102}
/>
{/if}

<Sprite
	key="free_spins.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY + 2}
	scale={{ x: 0.2, y: 0.2 }}
	zIndex={102}
/>

<Sprite
	key="left.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY + 16}
	scale={{ x: 0.2, y: 0.2 }}
	zIndex={102}
/>
{/if}

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
	data-volume-button
	onpointerup={() => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		showVolumeSlider = !showVolumeSlider;
	}}
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
	onpointerup={() => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'settings' };
	}}
/>
{/if}

{#if showVolumeSlider}
	{@const sliderHeight = isMobile ? 150 : 250}
	{@const trackHeight = isMobile ? 120 : 200}
	{@const sliderX = isMobile ? mobileVolumeX : spekX}
	{@const sliderY = isMobile ? mobileVolumeY - mobileButtonSize / 2 - sliderHeight / 2 - 20 : spekY - buttonSize / 2 - sliderHeight / 2 - 20}
	{@const padding = isMobile ? 8 : 10}
	{@const gap = isMobile ? 5 : 10}
	{@const textHeight = isMobile ? 20 : 25}
	{@const trackY = sliderY - sliderHeight / 2 + padding + textHeight + gap + trackHeight / 2}
	<div
		class="volume-slider"
		class:mobile={isMobile}
		style="left: {sliderX}px; top: {sliderY}px; height: {sliderHeight}px;"
	>
		<div class="volume-percentage">{stateSound.volumeValueMaster}%</div>
		<div class="volume-slider-container" style="height: {trackHeight}px;">
			<div
				class="volume-slider-track"
				style="height: {trackHeight}px;"
				onpointerdown={(e) => {
					handleVolumeTrackClick(e, trackY, trackHeight);
				}}
				ontouchstart={(e) => {
					handleVolumeTrackClick(e, trackY, trackHeight);
				}}
			>
				<div class="volume-slider-fill" style="height: {stateSound.volumeValueMaster}%"></div>
			</div>
			<div
				class="volume-slider-thumb"
				style="top: {(1 - stateSound.volumeValueMaster / 100) * 100}%"
				role="button"
				tabindex="0"
				onpointerdown={(e) => {
					e.stopPropagation();
					volumeSliderElement = { y: trackY, height: trackHeight };
					isDraggingVolume = true;
				}}
				ontouchstart={(e) => {
					e.stopPropagation();
					volumeSliderElement = { y: trackY, height: trackHeight };
					isDraggingVolume = true;
				}}
			></div>
		</div>
	</div>
{/if}

<style>
	.volume-slider {
		position: absolute;
		width: 60px;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.5);
		border: 2px solid white;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 10px 0;
		gap: 10px;
		z-index: 1000;
		pointer-events: auto;
	}

	.volume-slider.mobile {
		width: 45px;
		padding: 8px 0;
		gap: 5px;
	}

	.volume-slider.mobile .volume-percentage {
		font-size: 14px;
	}

	.volume-slider.mobile .volume-slider-track {
		width: 6px;
	}

	.volume-slider.mobile .volume-slider-thumb {
		width: 15px;
		height: 15px;
		border: 2px solid #00ff00;
	}

	.volume-slider-container {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.volume-slider-track {
		position: relative;
		width: 8px;
		background: white;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		cursor: pointer;
	}

	.volume-slider-fill {
		width: 100%;
		background: #00ff00;
	}

	.volume-slider-thumb {
		position: absolute;
		width: 20px;
		height: 20px;
		background: white;
		border: 3px solid #00ff00;
		border-radius: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		cursor: pointer;
		pointer-events: auto;
		z-index: 10;
	}

	.volume-slider-thumb:hover {
		transform: translate(-50%, -50%) scale(1.1);
	}

	.volume-percentage {
		color: white;
		font-weight: 900;
		font-size: 18px;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
		pointer-events: none;
	}
</style>