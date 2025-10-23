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
	let previousVolume = $state(50); // Store the volume level before muting (for slider display)

	function handleVolumePointerMove(e: PointerEvent | TouchEvent) {
		if (!isDraggingVolume || !volumeSliderElement) return;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const localY = clientY - (volumeSliderElement.y - volumeSliderElement.height / 2);
		const newVolume = 1 - Math.max(0, Math.min(1, localY / volumeSliderElement.height));
		const roundedVolume = Math.round(newVolume * 100);
		// When user drags slider, update both actual and displayed volume
		previousVolume = roundedVolume;
		stateSound.volumeValueMaster = roundedVolume;
	}

	function handleVolumePointerUp() {
		isDraggingVolume = false;
	}

	function handleVolumeTrackClick(e: PointerEvent | TouchEvent, sliderY: number, trackHeight: number) {
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const localY = clientY - (sliderY - trackHeight / 2);
		const newVolume = 1 - Math.max(0, Math.min(1, localY / trackHeight));
		const roundedVolume = Math.round(newVolume * 100);
		// When user clicks slider, update both actual and displayed volume
		previousVolume = roundedVolume;
		stateSound.volumeValueMaster = roundedVolume;
	}

	function toggleVolumeButton(e: PointerEvent) {
		e.stopPropagation(); // Prevent window click handler from interfering
		e.preventDefault(); // Prevent default click behavior
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });

		// Capture the current slider state BEFORE doing anything else
		const wasOpen = showVolumeSlider;

		// If slider is already open, just close it without changing mute state
		if (wasOpen) {
			showVolumeSlider = false;
			return;
		}

		// Slider is closed, so toggle mute state and open slider
		if (stateSound.volumeValueMaster === 0) {
			// If currently muted, restore to previous volume (default to 50 if previous was also 0)
			const volumeToRestore = previousVolume === 0 ? 50 : previousVolume;
			stateSound.volumeValueMaster = volumeToRestore;
			previousVolume = volumeToRestore; // Update previousVolume so slider shows the restored value
		} else {
			// If currently unmuted, save current volume and mute
			previousVolume = stateSound.volumeValueMaster;
			stateSound.volumeValueMaster = 0;
		}

		// Open slider
		showVolumeSlider = true;
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
		autoplayButtonPress: () => {
			onAutoplayPress();
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

	// Auto-spin menu state
	let isAutoSpinMenuOpen = $state(false);
	let pendingAutoSpinCount = $state<number | null>(null);

	// Autoplay button functionality
	const hasAutoSpins = $derived(stateBetDerived.hasAutoBetCounter());

	const onAutoplayPress = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (hasAutoSpins) {
			// Stop auto spins if already running
			stateBet.autoSpinsCounter = 0;
			isAutoSpinMenuOpen = false;
			pendingAutoSpinCount = null;
		} else {
			// Toggle auto-spin menu
			isAutoSpinMenuOpen = !isAutoSpinMenuOpen;
			pendingAutoSpinCount = null;
		}
	};

	const handleAutoSpinSelect = (count: number) => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		pendingAutoSpinCount = count;
		isAutoSpinMenuOpen = false;
	};

	const confirmAutoSpin = () => {
		if (pendingAutoSpinCount !== null) {
			context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
			stateBet.autoSpinsCounter = pendingAutoSpinCount;
			pendingAutoSpinCount = null;
			// Trigger autoBet to start the auto-betting loop
			context.eventEmitter.broadcast({ type: 'autoBet' });
		}
	};

	const cancelAutoSpin = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		pendingAutoSpinCount = null;
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
	const mobileBetAmountX = $derived(mobileBetX + mobileBetWidth / 2 + (canvasSize.height < 580 ? 32 : 38));
	const mobileBetNextX = $derived(mobileBetAmountX + (canvasSize.height < 580 ? 40 : 50));

	// Volume button (using spek sprite)
	const mobileVolumeX = $derived(canvasSize.width - mobileButtonSize / 2 - 43); // From right edge
	const mobileVolumeY = $derived(mobileY);

	// Settings button
	const mobileSettingsX = $derived(canvasSize.width - mobileButtonSize / 2 - 5); // From right edge
	const mobileSettingsY = $derived(mobileY);

	// Volume button sprite key - changes based on master volume
	const volumeSpriteKey = $derived(stateSound.volumeValueMaster === 0 ? 'mutedState' : 'uiSpek');
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
	key={volumeSpriteKey}
	anchor={{ x: 0.5, y: 0.5 }}
	x={spekX}
	y={spekY}
	width={buttonSize}
	height={buttonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
	data-volume-button
	onpointerdown={(e) => e.stopPropagation()}
	onpointerup={toggleVolumeButton}
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
		context.eventEmitter.broadcast({ type: 'volumeControlShow' });
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
	onpointerup={() => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'payTable' };
	}}
/>

<!-- Text displays - vertically stacked, left aligned -->
<!-- Credit display (top) -->
<Sprite
	key={stateUrlDerived.social() ? "uiCoins" : "uiCredit"}
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
	key={stateUrlDerived.social() ? "uiPlay" : "uiBet"}
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

<!-- Autospin counter display on desktop - centered on spin button (hidden in free spins) -->
{#if hasAutoSpins && stateBet.autoSpinsCounter > 0 && fontLoaded && !showFreeSpinCounter}
<Text
	text={stateBet.autoSpinsCounter.toString()}
	x={spinX}
	y={spinY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: isLandscape && canvasSize.width < 500 ? 11 : isLandscape ? 17 : canvasSize.height < 600 ? 20 : 26,
		fill: 0x00ff00,
		align: 'center',
		fontWeight: 'bold',
		stroke: 0x000000,
		strokeThickness: 2
	}}
	zIndex={105}
/>
{/if}
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

<!-- Autospin counter display on mobile - centered on spin button (hidden in free spins) -->
{#if hasAutoSpins && stateBet.autoSpinsCounter > 0 && fontLoaded && !showFreeSpinCounter}
<Text
	text={stateBet.autoSpinsCounter.toString()}
	x={mobileSpinX}
	y={mobileSpinY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'Darling Coffee',
		fontSize: canvasSize.height < 580 ? 12 : canvasSize.height < 700 ? 14 : 17,
		fill: 0x00ff00,
		align: 'center',
		fontWeight: 'bold',
		stroke: 0x000000,
		strokeThickness: 2
	}}
	zIndex={105}
/>
{/if}

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
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
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
<BitmapText
	text={`$${(stateBet.betAmount * 100).toString()}`}
	x={mobileBuyFrameX - 6}
	y={mobileBuyFrameY + (canvasSize.height < 580 ? 10 : 12)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: 4,
	}}
	zIndex={110}
/>

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

<!-- Bet amount text on bet frame -->
<BitmapText
	text={`$${(stateBet.betAmount * 1.25).toFixed(2)}`}
	x={mobileBetFrameX - 5 - 2.5}
	y={mobileBetFrameY - (canvasSize.height < 580 ? 30 : 37)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: 3.5,
	}}
	zIndex={110}
/>

<!-- DOUBLE label text on bet frame -->
<BitmapText
	text="DOUBLE"
	x={mobileBetFrameX}
	y={mobileBetFrameY - (canvasSize.height < 580 ? 15 : 18)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: 1.3,
	}}
	zIndex={110}
/>

<!-- CHANCE TO label text on bet frame -->
<BitmapText
	text="CHANCE TO"
	x={mobileBetFrameX}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 0 : 0)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: 1.1,
	}}
	zIndex={110}
/>

<!-- WIN FEATURE label text on bet frame -->
<BitmapText
	text={stateUrlDerived.social() ? "PLAY FEATURE" : "WIN FEATURE"}
	x={mobileBetFrameX}
	y={mobileBetFrameY + (canvasSize.height < 580 ? 13 : 16)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: 1.1,
	}}
	zIndex={110}
/>

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

<!-- Free spin counter text - moved down and bigger -->
<!-- Use separate components for different sizes to avoid texture corruption on mobile -->
{#if canvasSize.height < 580}
<BitmapText
	text={`${freeSpinTotal - freeSpinCurrent}`}
	x={mobileBuyFrameX - 5}
	y={mobileBuyFrameY - 6}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: 3.5,
	}}
	zIndex={102}
/>
{:else}
<BitmapText
	text={`${freeSpinTotal - freeSpinCurrent}`}
	x={mobileBuyFrameX - 5}
	y={mobileBuyFrameY - 6}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: 4.5,
	}}
	zIndex={102}
/>
{/if}

<!-- Free spins label - moved up -->
<Sprite
	key="free_spins.png"
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileBuyFrameX}
	y={mobileBuyFrameY + (canvasSize.height < 580 ? 9 : 11)}
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
	onpointerup={() => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateModal.modal = { name: 'payTable' };
	}}
/>

<!-- Credit label -->
<Sprite
	key={stateUrlDerived.social() ? "uiCoins" : "uiCredit"}
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
	key={stateUrlDerived.social() ? "uiPlay" : "uiBet"}
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
	key={volumeSpriteKey}
	anchor={{ x: 0.5, y: 0.5 }}
	x={mobileVolumeX}
	y={mobileVolumeY}
	width={mobileButtonSize}
	height={mobileButtonSize}
	zIndex={101}
	interactive={true}
	cursor="pointer"
	data-volume-button
	onpointerdown={(e) => e.stopPropagation()}
	onpointerup={toggleVolumeButton}
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
		context.eventEmitter.broadcast({ type: 'volumeControlShow' });
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
	{@const isMuted = stateSound.volumeValueMaster === 0}
	{@const displayVolume = isMuted ? previousVolume : stateSound.volumeValueMaster}
	<div
		class="volume-slider"
		class:mobile={isMobile}
		class:muted={isMuted}
		style="left: {sliderX}px; top: {sliderY}px; height: {sliderHeight}px;"
	>
		<div class="volume-percentage">{displayVolume}%</div>
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
				<div class="volume-slider-fill" style="height: {displayVolume}%"></div>
			</div>
			<div
				class="volume-slider-thumb"
				style="top: {(1 - displayVolume / 100) * 100}%"
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

<!-- Auto-spin menu / confirmation - positioned above spin button -->
{#if pendingAutoSpinCount !== null || isAutoSpinMenuOpen}
	{@const menuX = isMobile ? mobileSpinX : spinX}
	{@const menuY = isMobile ? mobileSpinY - mobileSpinButtonHeight / 2 - 80 : spinY - spinButtonHeight / 2 - 100}
	<div class="auto-spin-container" style="left: {menuX}px; top: {menuY}px;" class:mobile={isMobile}>
		{#if pendingAutoSpinCount !== null}
			<div class="auto-spin-confirm">
				<div class="confirm-text">Start {pendingAutoSpinCount} Autospins?</div>
				<div class="confirm-buttons">
					<button onclick={confirmAutoSpin} class="confirm-btn confirm">✓</button>
					<button onclick={cancelAutoSpin} class="confirm-btn cancel">✕</button>
				</div>
			</div>
		{:else if isAutoSpinMenuOpen}
			<div class="auto-spin-menu">
				{#each [10, 25, 50, 100] as count}
					<button onclick={() => handleAutoSpinSelect(count)} class="auto-option">
						{count}
					</button>
				{/each}
			</div>
		{/if}
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
		transition: background 0.2s ease;
	}

	.volume-slider.muted .volume-slider-fill {
		background: #ff0000;
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
		transition: border-color 0.2s ease;
	}

	.volume-slider.muted .volume-slider-thumb {
		border-color: #ff0000;
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

	/* Auto-spin menu styles - modern & compact */
	.auto-spin-container {
		position: absolute;
		transform: translate(-50%, -50%);
		z-index: 1001;
		pointer-events: auto;
	}

	.auto-spin-menu {
		background: rgba(10, 10, 15, 0.95);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(0, 255, 0, 0.3);
		border-radius: 12px;
		padding: 8px;
		display: flex;
		gap: 6px;
		flex-direction: column;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
	}

	.auto-spin-container.mobile .auto-spin-menu {
		padding: 6px;
		gap: 5px;
	}

	.auto-option {
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.15) 0%, rgba(0, 200, 0, 0.25) 100%);
		border: 1.5px solid rgba(0, 255, 0, 0.4);
		border-radius: 8px;
		color: #00ff00;
		font-size: 18px;
		font-weight: 600;
		padding: 10px 24px;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: 'Darling Coffee', sans-serif;
		text-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
	}

	.auto-spin-container.mobile .auto-option {
		font-size: 16px;
		padding: 8px 20px;
	}

	.auto-option:hover {
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.25) 0%, rgba(0, 255, 0, 0.35) 100%);
		border-color: rgba(0, 255, 0, 0.7);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 255, 0, 0.4);
	}

	.auto-spin-confirm {
		background: rgba(10, 10, 15, 0.95);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 170, 0, 0.4);
		border-radius: 12px;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
	}

	.auto-spin-container.mobile .auto-spin-confirm {
		padding: 10px 14px;
		gap: 8px;
	}

	.confirm-text {
		color: #ffffff;
		font-size: 16px;
		font-weight: 600;
		text-align: center;
		font-family: 'Darling Coffee', sans-serif;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.auto-spin-container.mobile .confirm-text {
		font-size: 14px;
	}

	.confirm-buttons {
		display: flex;
		gap: 10px;
	}

	.auto-spin-container.mobile .confirm-buttons {
		gap: 8px;
	}

	.confirm-btn {
		width: 42px;
		height: 42px;
		border-radius: 10px;
		border: 1.5px solid rgba(255, 255, 255, 0.3);
		font-size: 22px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.auto-spin-container.mobile .confirm-btn {
		width: 36px;
		height: 36px;
		font-size: 18px;
	}

	.confirm-btn.confirm {
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 200, 0, 0.3) 100%);
		color: #00ff00;
		text-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
	}

	.confirm-btn.cancel {
		background: linear-gradient(135deg, rgba(255, 50, 50, 0.2) 0%, rgba(200, 0, 0, 0.3) 100%);
		color: #ff5555;
		text-shadow: 0 0 8px rgba(255, 50, 50, 0.6);
	}

	.confirm-btn:hover {
		transform: translateY(-2px);
		border-color: rgba(255, 255, 255, 0.6);
	}

	.confirm-btn.confirm:hover {
		box-shadow: 0 4px 16px rgba(0, 255, 0, 0.4);
	}

	.confirm-btn.cancel:hover {
		box-shadow: 0 4px 16px rgba(255, 50, 50, 0.4);
	}
</style>