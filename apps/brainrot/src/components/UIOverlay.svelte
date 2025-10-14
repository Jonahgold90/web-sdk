<script lang="ts">
	import { Sprite, Text, BitmapText, SpineProvider, SpineTrack, Graphics } from 'pixi-svelte';
	import { stateBet, stateBetDerived, stateModal, stateConfig, stateSound, stateUrlDerived } from 'state-shared';
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
	const isLandscape = $derived(layoutType === 'landscape');

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
	const mobileButtonSize = $derived(canvasSize.height < 580 ? 28 : 35); // Even smaller buttons for small mobile
	const mobileHorizontalSpacing = 15; // Spacing between elements
	const mobileSidePadding = 20; // Padding from screen edges

	// Desktop button sizes and positions - scale based on screen height
	const bottomOverlayHeight = $derived(
		isLandscape && canvasSize.width < 500 ? 45 :
		canvasSize.height < 600 ? 90 :
		canvasSize.height < 750 ? 110 :
		150
	); // Much smaller for small landscape (150 * 0.4 = 60)
	const buttonSize = $derived(
		isLandscape && canvasSize.width < 500 ? 18 :
		canvasSize.height < 600 ? 38 :
		canvasSize.height < 750 ? 45 :
		60
	); // From 60 to 18 (30% of original size)
	const leftMargin = $derived(isLandscape ? 25 : 60); // Distance from left edge
	const buttonSpacing = $derived(
		isLandscape && canvasSize.width < 500 ? 5 :
		canvasSize.height < 600 ? 3 :
		canvasSize.height < 750 ? 5 :
		10
	); // Tighter spacing for small landscape

	// Calculate button positions
	const settingsX = $derived(leftMargin);
	const settingsY = $derived(bottomOverlayY - bottomOverlayHeight / 2 + buttonSize / 2 + (canvasSize.height < 600 ? 5 : 10)); // Higher position on very small screens
	const spekX = $derived(leftMargin);
	const spekY = $derived(settingsY - buttonSize - buttonSpacing); // Above settings

	// Info button - larger and centered between the two buttons
	const infoButtonSize = $derived(
		isLandscape && canvasSize.width < 500 ? 30 :
		isLandscape ? 80 :
		canvasSize.height < 600 ? 65 :
		canvasSize.height < 750 ? 80 :
		100
	); // From 100 to 30 (30% of original size)
	const infoX = $derived(leftMargin + buttonSize + (isLandscape && canvasSize.width < 500 ? 10 : isLandscape ? 20 : canvasSize.height < 600 ? 40 : 60)); // Even closer for small landscape
	const infoY = $derived(bottomOverlayY - bottomOverlayHeight / 2); // Centered vertically in overlay

	// Credit and Bet text displays - to the right of info button
	const creditWidth = $derived(
		isLandscape && canvasSize.width < 500 ? 59 :
		isLandscape ? 94 :
		canvasSize.height < 600 ? 95 :
		118
	);  // 50% smaller for small landscape (118 * 0.5 ≈ 59)
	const creditHeight = $derived(
		isLandscape && canvasSize.width < 500 ? 18 :
		isLandscape ? 28 :
		canvasSize.height < 600 ? 28 :
		35
	);
	const betWidth = $derived(
		isLandscape && canvasSize.width < 500 ? 33 :
		isLandscape ? 53 :
		canvasSize.height < 600 ? 53 :
		66
	);
	const betHeight = $derived(
		isLandscape && canvasSize.width < 500 ? 17 :
		isLandscape ? 27 :
		canvasSize.height < 600 ? 27 :
		34
	);

	// Position them left-aligned - adjusted for smaller screens
	const textStartX = $derived(infoX + infoButtonSize / 2 + (isLandscape && canvasSize.width < 500 ? 5 : isLandscape ? 10 : canvasSize.height < 600 ? 15 : 30)); // Even tighter for small landscape
	const creditX = $derived(textStartX + creditWidth / 2); // Center point for credit
	const creditY = $derived(bottomOverlayY - bottomOverlayHeight / 2 - (canvasSize.height < 600 ? 15 : 20)); // Closer to center on small screens
	const betX = $derived(textStartX + betWidth / 2); // Center point for bet (left-aligned with credit)
	const betY = $derived(bottomOverlayY - bottomOverlayHeight / 2 + (canvasSize.height < 600 ? 15 : 20)); // Closer to center on small screens

	// Amount text positions - adjusted based on screen size
	const creditAmountX = $derived(
		isLandscape && canvasSize.width < 500 ? creditX + 10 :
		creditX + creditWidth / 2 + (isLandscape ? 60 : canvasSize.width < 1400 ? 70 : 70)
	); // Under label for small landscape, next to label otherwise
	const creditAmountY = $derived(
		isLandscape && canvasSize.width < 500 ? creditY + creditHeight / 2 + 7 : creditY
	); // Below label for small landscape
	const betAmountX = $derived(betX + betWidth / 2 + (isLandscape && canvasSize.width < 500 ? 28 : isLandscape ? 55 : canvasSize.width < 1400 ? 75 : 65)); // Even tighter for small landscape

	// WIN display - centered horizontally, positioned near bottom of reel frame
	const winWidth = $derived(
		isLandscape && canvasSize.width < 500 ? 59 :
		isLandscape ? 117 :
		canvasSize.height < 600 ? 137.05 :
		195.5
	);  // 50% of landscape size for small landscape (117 * 0.5 ≈ 59)
	const winHeight = $derived(
		isLandscape && canvasSize.width < 500 ? 30 :
		isLandscape ? 59 :
		canvasSize.height < 600 ? 68.95 :
		98.5
	);   // 50% of landscape size for small landscape (59 * 0.5 ≈ 30)
	const winX = $derived(canvasSize.width / 2); // Centered horizontally
	const winY = $derived(bottomOverlayY - bottomOverlayHeight + winHeight/2 - (canvasSize.height < 600 ? 12 : 18)); // Adjusted position for smaller size

	// PAYS display - between WIN and spin button
	const paysWidth = $derived(
		isLandscape && canvasSize.width < 500 ? 50 :
		canvasSize.height < 600 ? 65 :
		canvasSize.width < 1400 ? 80 :
		100
	); // Even smaller on very small screens
	const paysHeight = $derived(
		isLandscape && canvasSize.width < 500 ? 25 :
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
	const paysY = $derived(
		isLandscape && canvasSize.width < 500 ? bottomOverlayY - bottomOverlayHeight / 2 + 5 :
		canvasSize.width < 1400 ? bottomOverlayY - bottomOverlayHeight / 2 + 25 :
		bottomOverlayY - bottomOverlayHeight / 2
	); // Lower on smaller screens

	// Spin button - positioned on the right side, scaled based on screen width and layout
	// Spine dimensions from JSON: width:619, height:359, aspect ratio ~1.72
	// Scale down on smaller screens (< 1400px width) and landscape mode
	const spinButtonScale = $derived(
		isLandscape && canvasSize.width < 500 ? 0.25 :
		isLandscape ? 0.5 :
		canvasSize.width < 1400 ? 0.65 :
		1.0
	); // 50% of normal for small landscape (1.0 * 0.5 * 0.5 = 0.25)
	const spinButtonWidth = $derived(186 * spinButtonScale); // 155 * 1.2 (20% bigger) * scale
	const spinButtonHeight = $derived(108 * spinButtonScale); // 90 * 1.2 to maintain aspect ratio * scale
	const spinX = $derived(
		isLandscape ? canvasSize.width - 100 :
		canvasSize.width < 1400 ? canvasSize.width - 180 - (spinButtonWidth / 2) :
		canvasSize.width - 250
	); // Position based on size
	const spinY = $derived(
		isLandscape ? bottomOverlayY - bottomOverlayHeight / 2 - 30 :
		canvasSize.width < 1400 ? bottomOverlayY - bottomOverlayHeight / 2 - 40 :
		bottomOverlayY - bottomOverlayHeight / 2 - 60
	); // Height based on size

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
	const mobileCenterY = $derived(
		canvasSize.height < 580 ? (boardBottomY + overlayTopY) / 2 - 240 :
		canvasSize.height < 700 ? (boardBottomY + overlayTopY) / 2 - 225 :
		(boardBottomY + overlayTopY) / 2 - 175
	); // Much higher on smaller screens

	// Mobile spin button - maintain aspect ratio (619x359 from spine), scale based on screen height
	const mobileSpinButtonWidth = $derived(
		canvasSize.height < 580 ? 60 :
		canvasSize.height < 700 ? 70 :
		94
	); // Smaller on small mobile
	const mobileSpinButtonHeight = $derived(
		canvasSize.height < 580 ? 35 :
		canvasSize.height < 700 ? 40 :
		54
	); // Maintain aspect ratio
	const mobileSpinX = $derived(canvasSize.width / 2);
	const mobileSpinY = $derived(
		canvasSize.height < 580 ? mobileCenterY - 32 :
		canvasSize.height < 700 ? mobileCenterY - 8 :
		mobileCenterY
	);

	// Win label and amount - higher above spin button
	const mobileWinWidth = $derived(
		canvasSize.height < 580 ? 68 :
		canvasSize.height < 700 ? 80 :
		100
	);
	const mobileWinHeight = $derived(
		canvasSize.height < 580 ? 34 :
		canvasSize.height < 700 ? 40 :
		50
	);
	const mobileWinX = $derived(canvasSize.width / 2);
	const mobileWinY = $derived(
		canvasSize.height < 580 ? mobileCenterY - 18 - mobileSpinButtonHeight / 2 - 60 :
		mobileCenterY - mobileSpinButtonHeight / 2 - (canvasSize.height < 700 ? 70 : 80)
	);

	// PAYS display - under spin button on mobile
	const mobilePaysWidth = 60;
	const mobilePaysHeight = 30;
	const mobilePaysLabelX = $derived(canvasSize.width / 2 - (canvasSize.height < 580 ? 32 : 40)); // Label to the left
	const mobilePaysAmountX = $derived(canvasSize.width / 2 + (canvasSize.height < 580 ? 32 : 40)); // Amount to the right
	const mobilePaysY = $derived(
		canvasSize.height < 580 ? mobileSpinY + mobileSpinButtonHeight / 2 + 22 :
		canvasSize.height < 700 ? mobileSpinY + mobileSpinButtonHeight / 2 + 35 :
		mobileCenterY + mobileSpinButtonHeight / 2 + 45
	);

	// Buy frame - scaled down on small mobile
	const mobileBuyFrameWidth = $derived(canvasSize.height < 580 ? 65 : 80);
	const mobileBuyFrameHeight = $derived(canvasSize.height < 580 ? 36 : 45);
	const mobileBuyFrameX = $derived(mobileSpinX - mobileSpinButtonWidth / 2 - (canvasSize.height < 580 ? 50 : 60) - mobileBuyFrameWidth / 2);
	const mobileBuyFrameY = $derived(
		canvasSize.height < 580 ? mobileSpinY - 15 :
		canvasSize.height < 700 ? mobileSpinY - 15 :
		mobileCenterY - 15
	);

	// Bet frame - scaled down on small mobile
	const mobileBetFrameWidth = $derived(canvasSize.height < 580 ? 65 : 80);
	const mobileBetFrameHeight = $derived(canvasSize.height < 580 ? 80 : 99);
	const mobileBetFrameX = $derived(mobileSpinX + mobileSpinButtonWidth / 2 + (canvasSize.height < 580 ? 50 : 60) + mobileBetFrameWidth / 2);
	const mobileBetFrameY = $derived(
		canvasSize.height < 580 ? mobileSpinY - 15 :
		canvasSize.height < 700 ? mobileSpinY - 15 :
		mobileCenterY - 15
	);

	// Calculate horizontal positions for mobile (left to right) - tightly packed
	let currentMobileX = 5; // Minimal padding on left

	// Info button (small)
	const mobileInfoX = $derived(currentMobileX + mobileButtonSize / 2);
	const mobileInfoY = $derived(mobileY);
	const mobileInfoNextX = $derived(mobileInfoX + mobileButtonSize / 2 + 5);

	// Credit label dimensions (smaller for mobile)
	const mobileCreditWidth = $derived(canvasSize.height < 580 ? 48 : 60);
	const mobileCreditHeight = $derived(canvasSize.height < 580 ? 20 : 25);
	const mobileCreditX = $derived(mobileInfoNextX + mobileCreditWidth / 2);
	const mobileCreditY = $derived(mobileY);

	// Credit amount position - more space to prevent overlap
	const mobileCreditAmountX = $derived(mobileCreditX + mobileCreditWidth / 2 + (canvasSize.height < 580 ? 36 : 45));
	const mobileCreditNextX = $derived(mobileCreditAmountX + (canvasSize.height < 580 ? 28 : 35));

	// Bet label
	const mobileBetWidth = $derived(canvasSize.height < 580 ? 32 : 40);
	const mobileBetHeight = $derived(canvasSize.height < 580 ? 20 : 25);
	const mobileBetX = $derived(mobileCreditNextX + (canvasSize.height < 580 ? 10 : 12) + mobileBetWidth / 2);
	const mobileBetY = $derived(mobileY);

	// Bet amount position (space for 4-digit amounts like 1000) - more space to prevent overlap
	const mobileBetAmountX = $derived(mobileBetX + mobileBetWidth / 2 + (canvasSize.height < 580 ? 27 : 33));
	const mobileBetNextX = $derived(mobileBetAmountX + (canvasSize.height < 580 ? 40 : 50));

	// Volume button (using spek sprite)
	const mobileVolumeX = $derived(canvasSize.width - mobileButtonSize / 2 - 43); // From right edge
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
		fontSize: isLandscape && canvasSize.width < 500 ? 15 : isLandscape ? 29 : canvasSize.height < 600 ? 34 : 48,
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
		fontSize: isLandscape && canvasSize.width < 500 ? 12 : 24,
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
		fontSize: isLandscape && canvasSize.width < 500 ? 12 : 24,
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
	y={creditAmountY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: isLandscape && canvasSize.width < 500 ? 14 : isLandscape ? 22 : 28,
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
		fontSize: isLandscape && canvasSize.width < 500 ? 14 : isLandscape ? 22 : 28,
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
		fontSize: canvasSize.height < 580 ? 17 : canvasSize.height < 700 ? 20 : 24,
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
		fontSize: canvasSize.height < 580 ? 13 : 16,
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
		fontSize: canvasSize.height < 580 ? 13 : 16,
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
	y={mobileBuyFrameY - (canvasSize.height < 580 ? 6.5 : 8)}
	width={canvasSize.height < 580 ? 64 : 79.2}
	height={canvasSize.height < 580 ? 14.3 : 17.6}
	zIndex={102}
/>

<!-- Bonus buy cost text -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text={`$${(stateBet.betAmount * 100).toString()}`}
	x={mobileBuyFrameX - 6}
	y={mobileBuyFrameY + (canvasSize.height < 580 ? 10 : 12)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: canvasSize.height < 580 ? 3.5 : 4,
	}}
	zIndex={110}
/>
{/key}

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

<!-- BET label text on bet frame -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text={stateUrlDerived.social() ? "PLAY" : "BET"}
	x={mobileBetFrameX}
	y={mobileBetFrameY - (canvasSize.height < 580 ? 48 : 60)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: canvasSize.height < 580 ? 1.7 : 2.2,
	}}
	zIndex={110}
/>
{/key}

<!-- Bet amount text on bet frame -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text={`$${(stateBet.betAmount * 1.25).toFixed(2)}`}
	x={mobileBetFrameX - 5 - 2.5}
	y={mobileBetFrameY - (canvasSize.height < 580 ? 30 : 37)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: canvasSize.height < 580 ? 2.5 : 3.5,
	}}
	zIndex={110}
/>
{/key}

<!-- DOUBLE label text on bet frame -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text="DOUBLE"
	x={mobileBetFrameX}
	y={mobileBetFrameY - (canvasSize.height < 580 ? 15 : 18)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: canvasSize.height < 580 ? 1 : 1.3,
	}}
	zIndex={110}
/>
{/key}

<!-- CHANCE TO label text on bet frame -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text="CHANCE TO"
	x={mobileBetFrameX}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 0 : 0)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: canvasSize.height < 580 ? 0.8 : 1.1,
	}}
	zIndex={110}
/>
{/key}

<!-- WIN FEATURE label text on bet frame -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text={stateUrlDerived.social() ? "PLAY FEATURE" : "WIN FEATURE"}
	x={mobileBetFrameX}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 13 : 16)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: canvasSize.height < 580 ? 0.8 : 1.1,
	}}
	zIndex={110}
/>
{/key}

<!-- Button 01 (toggle button) -->
<Sprite
	key="button_01.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 26 : 32)}
	width={canvasSize.height < 580 ? 58 : 72}
	height={canvasSize.height < 580 ? 17 : 21}
	zIndex={102}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleAnteBet}
/>

<!-- "On" text on left side of button -->
<Sprite
	key="on.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX - (canvasSize.height < 580 ? 14.5 : 18)}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 26 : 32)}
	width={canvasSize.height < 580 ? 15.4 : 19}
	height={canvasSize.height < 580 ? 10.4 : 12.8}
	zIndex={103}
/>

<!-- "Off" text on right side of button -->
<Sprite
	key="off.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX + (canvasSize.height < 580 ? 14.5 : 18)}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 26 : 32)}
	width={canvasSize.height < 580 ? 18.5 : 22.8}
	height={canvasSize.height < 580 ? 10.5 : 13}
	zIndex={103}
/>

<!-- Arrow toggle (moves left/right) -->
<Sprite
	key="arrow.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBetFrameX + (isToggleOn ? (canvasSize.height < 580 ? 11.3 : ARROW_ON_POSITION_MOBILE) : (canvasSize.height < 580 ? -9.8 : ARROW_OFF_POSITION_MOBILE))}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 26 : 32)}
	width={canvasSize.height < 580 ? 27.9 : 34.4}
	height={canvasSize.height < 580 ? 11 : 13.6}
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
	y={mobileBuyFrameY - (canvasSize.height < 580 ? 11.3 : 14)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: canvasSize.height < 580 ? 14 : 17,
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
	y={mobileBuyFrameY + (canvasSize.height < 580 ? 1.6 : 2)}
	scale={{ x: canvasSize.height < 580 ? 0.162 : 0.2, y: canvasSize.height < 580 ? 0.162 : 0.2 }}
	zIndex={102}
/>

<Sprite
	key="left.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY + (canvasSize.height < 580 ? 13 : 16)}
	scale={{ x: canvasSize.height < 580 ? 0.162 : 0.2, y: canvasSize.height < 580 ? 0.162 : 0.2 }}
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
		fontSize: canvasSize.height < 580 ? 13 : 16,
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
		fontSize: canvasSize.height < 580 ? 13 : 16,
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