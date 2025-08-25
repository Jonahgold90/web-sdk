<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';
	import { Container, Sprite } from 'pixi-svelte';

	const context = getContext();
	
	// Frame dimensions (84x222) with scaling based on SYMBOL_SIZE and screen size
	const frameScale = $derived.by(() => {
		const layoutType = context.stateLayoutDerived.layoutType();
		const screenWidth = context.stateLayoutDerived.mainLayout().width;
		const baseScale = SYMBOL_SIZE / 150;
		
		// Make smaller on tablet screens (landscape but smaller width)
		if (layoutType !== 'portrait' && screenWidth <= 1024) {
			return baseScale * 0.8; // 20% smaller on tablet
		}
		
		return baseScale;
	});
	const frameWidth = $derived(84 * frameScale);
	const frameHeight = $derived(222 * frameScale);
	const frameSpacing = $derived(frameWidth * 0.1); // Much smaller spacing
	
	// Background dimensions - slightly smaller than frames
	const backgroundScale = $derived(frameScale * 0.85); // 5% smaller than frames
	const backgroundWidth = $derived(84 * backgroundScale);
	const backgroundHeight = $derived(222 * backgroundScale);
	
	// Header dimensions (108x150) with smaller scaling than frames
	const headerScale = $derived(frameScale * 0.8); // 20% smaller than frames
	const headerWidth = $derived(108 * headerScale);
	const headerHeight = $derived(150 * headerScale);
	const headerSpacing = 0; // No gap between header and frame
	
	// Character dimensions (127x126) - sized to fill frame width well
	const characterScale = $derived(frameScale * 0.45); // Larger to fill the frame better
	const characterWidth = $derived(127 * characterScale);
	const characterHeight = $derived(126 * characterScale);
	
	// Position to the left of the board
	const position = $derived.by(() => {
		const layoutType = context.stateLayoutDerived.layoutType();
		const boardLayout = context.stateGameDerived.boardLayout();
		
		if (layoutType === 'portrait') {
			// Mobile: center higher up, closer to the board
			return {
				x: boardLayout.x - (frameWidth * 3 + frameSpacing * 2) * 0.5,
				y: boardLayout.y + boardLayout.height * 0.5 + SYMBOL_SIZE * 0.2,
			};
		} else {
			// Desktop/Landscape: positioned to the left of the board
			const screenWidth = context.stateLayoutDerived.mainLayout().width;
			const isTablet = screenWidth <= 1024;
			const totalWidth = frameWidth * 3 + frameSpacing * 2;
			const totalHeight = headerHeight + headerSpacing + frameHeight;
			
			if (isTablet) {
				// Tablet: position from left edge since board shifted right
				const minMargin = SYMBOL_SIZE * 0.05;
				return {
					x: minMargin,
					y: boardLayout.y - totalHeight * 0.5,
				};
			} else {
				// Desktop: original positioning relative to board
				const boardLeftEdge = boardLayout.x - boardLayout.width * 0.5;
				return {
					x: boardLeftEdge - totalWidth - SYMBOL_SIZE * 0.2,
					y: boardLayout.y - totalHeight * 0.5,
				};
			}
		}
	});

	const show = $derived(context.stateGame.gameType === 'freegame');
	
	// CW progress state (0-12: positions 1-3=x2 chars, 4=x2 header, 5-7=x3 chars, 8=x3 header, 9-11=x10 chars, 12=x10 header)
	let cwProgress = $state(0);
	let previousCwCount = $state(0);
	
	// Listen for cwLanded events from math
	context.eventEmitter.subscribeOnMount({
		cwLanded: (event) => {
			console.log(`🎊 cwLanded event received: ${event.count} CWs landed, total: ${event.totalCws}`);
			
			// Update progress based on the count from math
			cwProgress = Math.min(cwProgress + event.count, 12);
			console.log(`Updated progress to: ${cwProgress}`);
		},
	});
	
	// Reset progress when bonus game ends
	$effect(() => {
		if (!show) {
			cwProgress = 0;
			previousCwCount = 0;
		}
	});

	// Helper functions to determine sprite keys based on progress
	const getCharacterSpriteKey = (position: number) => {
		const key = cwProgress >= position ? 'bonusLevelCharacterColor' : 'bonusLevelCharacterGrey';
		console.log(`Character position ${position}: progress=${cwProgress}, key=${key}`);
		return key;
	};
	
	const getHeaderSpriteKey = (frameType: 'x2' | 'x3' | 'x10') => {
		const headerPosition = frameType === 'x2' ? 4 : frameType === 'x3' ? 8 : 12;
		const greyKey = `levelBarHeader${frameType.replace('x', 'X')}`;
		const colorKey = `levelBarHeader${frameType.replace('x', 'X')}Color`;
		const key = cwProgress >= headerPosition ? colorKey : greyKey;
		console.log(`Header ${frameType}: progress=${cwProgress}, headerPos=${headerPosition}, key=${key}`);
		return key;
	};

	// Header positions relative to the container (at the top)
	const header1Position = { x: 0, y: 0 };
	const header2Position = { x: frameWidth + frameSpacing, y: 0 };
	const header3Position = { x: (frameWidth + frameSpacing) * 2, y: 0 };
	
	// Frame positions relative to the container (below headers)
	const frameYOffset = headerHeight + headerSpacing;
	const frame1Position = { x: 0, y: frameYOffset };
	const frame2Position = { x: frameWidth + frameSpacing, y: frameYOffset };
	const frame3Position = { x: (frameWidth + frameSpacing) * 2, y: frameYOffset };
	
	// Background positions - centered behind the frames
	const backgroundXOffset = $derived((frameWidth - backgroundWidth) * 0.5);
	const backgroundYOffset = $derived((frameHeight - backgroundHeight) * 0.5);
	const background1Position = { x: backgroundXOffset, y: frameYOffset + backgroundYOffset };
	const background2Position = { x: frameWidth + frameSpacing + backgroundXOffset, y: frameYOffset + backgroundYOffset };
	const background3Position = { x: (frameWidth + frameSpacing) * 2 + backgroundXOffset, y: frameYOffset + backgroundYOffset };
	
	// Character positions within each frame (3 characters stacked vertically)
	const characterXOffset = $derived((frameWidth - characterWidth) * 0.5); // Center horizontally
	const characterPadding = $derived(characterHeight * 0.15); // More padding between characters
	const totalCharacterHeight = $derived(characterHeight * 3 + characterPadding * 2);
	const characterStartY = $derived(frameYOffset + (frameHeight - totalCharacterHeight) * 0.35); // Move down slightly
	const characterSpacingY = $derived(characterHeight + characterPadding); // Character height plus padding
	
	// Frame 1 characters (x2)
	const char1_1Position = { x: characterXOffset, y: characterStartY };
	const char1_2Position = { x: characterXOffset, y: characterStartY + characterSpacingY };
	const char1_3Position = { x: characterXOffset, y: characterStartY + characterSpacingY * 2 };
	
	// Frame 2 characters (x3)
	const char2_1Position = { x: frameWidth + frameSpacing + characterXOffset, y: characterStartY };
	const char2_2Position = { x: frameWidth + frameSpacing + characterXOffset, y: characterStartY + characterSpacingY };
	const char2_3Position = { x: frameWidth + frameSpacing + characterXOffset, y: characterStartY + characterSpacingY * 2 };
	
	// Frame 3 characters (x10)
	const char3_1Position = { x: (frameWidth + frameSpacing) * 2 + characterXOffset, y: characterStartY };
	const char3_2Position = { x: (frameWidth + frameSpacing) * 2 + characterXOffset, y: characterStartY + characterSpacingY };
	const char3_3Position = { x: (frameWidth + frameSpacing) * 2 + characterXOffset, y: characterStartY + characterSpacingY * 2 };
</script>

<MainContainer>
	<FadeContainer {show} {...position}>
		<!-- x2 Header -->
		<Sprite 
			key={getHeaderSpriteKey('x2')} 
			width={headerWidth}
			height={headerHeight}
			{...header1Position}
		/>
		
		<!-- x3 Header -->
		<Sprite 
			key={getHeaderSpriteKey('x3')} 
			width={headerWidth}
			height={headerHeight}
			{...header2Position}
		/>
		
		<!-- x10 Header -->
		<Sprite 
			key={getHeaderSpriteKey('x10')} 
			width={headerWidth}
			height={headerHeight}
			{...header3Position}
		/>
		
		<!-- Frame Backgrounds - rendered first so they appear behind everything -->
		<Sprite 
			key="bonusLevelFrameBackgroundX2" 
			width={backgroundWidth}
			height={backgroundHeight}
			{...background1Position}
		/>
		<Sprite 
			key="bonusLevelFrameBackgroundX3" 
			width={backgroundWidth}
			height={backgroundHeight}
			{...background2Position}
		/>
		<Sprite 
			key="bonusLevelFrameBackgroundX10" 
			width={backgroundWidth}
			height={backgroundHeight}
			{...background3Position}
		/>
		
		<!-- Frame 1 (x2) Characters - rendered after backgrounds but before frames -->
		<!-- Bottom character (position 1) -->
		<Sprite 
			key={getCharacterSpriteKey(1)} 
			width={characterWidth}
			height={characterHeight}
			{...char1_3Position}
		/>
		<!-- Middle character (position 2) -->
		<Sprite 
			key={getCharacterSpriteKey(2)} 
			width={characterWidth}
			height={characterHeight}
			{...char1_2Position}
		/>
		<!-- Top character (position 3) -->
		<Sprite 
			key={getCharacterSpriteKey(3)} 
			width={characterWidth}
			height={characterHeight}
			{...char1_1Position}
		/>
		
		<!-- Frame 2 (x3) Characters -->
		<!-- Bottom character (position 5) -->
		<Sprite 
			key={getCharacterSpriteKey(5)} 
			width={characterWidth}
			height={characterHeight}
			{...char2_3Position}
		/>
		<!-- Middle character (position 6) -->
		<Sprite 
			key={getCharacterSpriteKey(6)} 
			width={characterWidth}
			height={characterHeight}
			{...char2_2Position}
		/>
		<!-- Top character (position 7) -->
		<Sprite 
			key={getCharacterSpriteKey(7)} 
			width={characterWidth}
			height={characterHeight}
			{...char2_1Position}
		/>
		
		<!-- Frame 3 (x10) Characters -->
		<!-- Bottom character (position 9) -->
		<Sprite 
			key={getCharacterSpriteKey(9)} 
			width={characterWidth}
			height={characterHeight}
			{...char3_3Position}
		/>
		<!-- Middle character (position 10) -->
		<Sprite 
			key={getCharacterSpriteKey(10)} 
			width={characterWidth}
			height={characterHeight}
			{...char3_2Position}
		/>
		<!-- Top character (position 11) -->
		<Sprite 
			key={getCharacterSpriteKey(11)} 
			width={characterWidth}
			height={characterHeight}
			{...char3_1Position}
		/>
		
		<!-- x2 Frame - rendered after characters so it appears on top -->
		<Sprite 
			key="bonusLevelFrameX2" 
			width={frameWidth}
			height={frameHeight}
			{...frame1Position}
		/>
		
		<!-- x3 Frame -->
		<Sprite 
			key="bonusLevelFrameX3" 
			width={frameWidth}
			height={frameHeight}
			{...frame2Position}
		/>
		
		<!-- x10 Frame -->
		<Sprite 
			key="bonusLevelFrameX10" 
			width={frameWidth}
			height={frameHeight}
			{...frame3Position}
		/>
		
	</FadeContainer>
</MainContainer>