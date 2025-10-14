<script lang="ts">
	import { Sprite, Graphics, BitmapText } from 'pixi-svelte';
	import { stateSound } from 'state-shared';
	import { getContext } from '../game/context';

	const context = getContext();

	// Component visibility
	let visible = $state(false);

	// Subscribe to events to show/hide the volume control
	context.eventEmitter.subscribeOnMount({
		volumeControlShow: () => (visible = true),
		volumeControlHide: () => (visible = false),
	});

	// Get canvas dimensions
	const canvasSize = $derived(context.stateLayoutDerived.canvasSizes());
	const layoutType = $derived(context.stateLayoutDerived.layoutType());
	const isMobile = $derived(layoutType === 'portrait');
	const isMobileSmall = $derived(isMobile && canvasSize.height < 580);

	// Component dimensions - responsive size (desktop 15% bigger)
	const panelWidth = $derived(isMobileSmall ? 280 : isMobile ? 350 : 575);
	const panelHeight = $derived(isMobileSmall ? 180 : isMobile ? 220 : 345);
	const panelX = $derived(canvasSize.width / 2);
	const panelY = $derived(canvasSize.height / 2);

	// Toggle positions
	const toggleWidth = $derived(isMobileSmall ? 75 : isMobile ? 90 : 138);
	const toggleHeight = $derived(isMobileSmall ? 38 : isMobile ? 45 : 69);
	const toggleSpacing = $derived(isMobileSmall ? 15 : isMobile ? 20 : 35);

	// SFX toggle
	const sfxToggleY = $derived(panelY - (isMobileSmall ? 15 : isMobile ? 20 : 30));
	const sfxLabelX = $derived(panelX - (isMobileSmall ? 70 : isMobile ? 85 : 138));

	// Music toggle
	const musicToggleY = $derived(panelY + (isMobileSmall ? 25 : isMobile ? 30 : 50));
	const musicLabelX = $derived(panelX - (isMobileSmall ? 70 : isMobile ? 85 : 138));

	// Toggle button X position
	const toggleX = $derived(panelX + (isMobileSmall ? 50 : isMobile ? 60 : 92));

	// Toggle states
	const isSfxOn = $derived(stateSound.volumeValueSoundEffect > 0);
	const isMusicOn = $derived(stateSound.volumeValueMusic > 0);

	// Toggle functions
	const toggleSfx = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateSound.volumeValueSoundEffect = isSfxOn ? 0 : 75;
	};

	const toggleMusic = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateSound.volumeValueMusic = isMusicOn ? 0 : 75;
	};

	// Close button
	const closeButtonSize = $derived(isMobileSmall ? 35 : isMobile ? 40 : 58);
	const closeButtonX = $derived(panelX + panelWidth / 2 - 15);
	const closeButtonY = $derived(panelY - panelHeight / 2 + 15);

	const closePanel = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		visible = false;
	};
</script>

{#if visible}
<!-- Dimmed background overlay -->
<Graphics
	x={0}
	y={0}
	zIndex={200}
	interactive={true}
	cursor="default"
	onpointerup={closePanel}
	draw={(graphics) => {
		graphics.clear();
		graphics.rect(0, 0, canvasSize.width, canvasSize.height);
		graphics.fill({ color: 0x000000, alpha: 0.7 });
	}}
/>

<!-- Panel background -->
<Graphics
	x={panelX}
	y={panelY}
	anchor={{ x: 0.5, y: 0.5 }}
	zIndex={201}
	interactive={true}
	cursor="default"
	onpointerup={(e) => e.stopPropagation()}
	draw={(graphics) => {
		graphics.clear();
		graphics.roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 15);
		graphics.fill({ color: 0x1a1a2e });
		graphics.roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 15);
		graphics.stroke({ color: 0x00ff00, width: 3 });
	}}
/>

<!-- Title text -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text="VOLUME SETTINGS"
	x={isMobile ? panelX - 10 : panelX}
	y={panelY - (isMobileSmall ? 62 : isMobile ? 75 : 115)}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: isMobileSmall ? 3 : isMobile ? 3.5 : 5.75,
	}}
	zIndex={202}
/>
{/key}

<!-- SFX Label -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text="SFX"
	x={sfxLabelX}
	y={sfxToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: isMobileSmall ? 2.5 : isMobile ? 3 : 4.6,
	}}
	zIndex={202}
/>
{/key}

<!-- SFX Toggle Background -->
<Graphics
	x={toggleX}
	y={sfxToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	zIndex={202}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleSfx}
	draw={(graphics) => {
		graphics.clear();
		graphics.roundRect(-toggleWidth / 2, -toggleHeight / 2, toggleWidth, toggleHeight, 20);
		graphics.fill({ color: isSfxOn ? 0x00ff00 : 0x555555 });
	}}
/>

<!-- SFX Toggle Switch -->
<Graphics
	x={toggleX + (isSfxOn ? (isMobileSmall ? 18 : isMobile ? 22 : 35) : (isMobileSmall ? -18 : isMobile ? -22 : -35))}
	y={sfxToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	zIndex={203}
	draw={(graphics) => {
		graphics.clear();
		graphics.circle(0, 0, isMobileSmall ? 14 : isMobile ? 16 : 25);
		graphics.fill({ color: 0xffffff });
	}}
/>

<!-- SFX Status Text -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text={isSfxOn ? "ON" : "OFF"}
	x={toggleX + (isSfxOn ? (isMobileSmall ? -18 : isMobile ? -22 : -35) : (isMobileSmall ? 15 : isMobile ? 18 : 23))}
	y={sfxToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: isMobileSmall ? 3 : isMobile ? 3.5 : 5.75,
	}}
	zIndex={203}
/>
{/key}

<!-- Music Label -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text="MUSIC"
	x={musicLabelX}
	y={musicToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'greenFont',
		fontSize: isMobileSmall ? 2.5 : isMobile ? 3 : 4.6,
	}}
	zIndex={202}
/>
{/key}

<!-- Music Toggle Background -->
<Graphics
	x={toggleX}
	y={musicToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	zIndex={202}
	interactive={true}
	cursor="pointer"
	onpointerup={toggleMusic}
	draw={(graphics) => {
		graphics.clear();
		graphics.roundRect(-toggleWidth / 2, -toggleHeight / 2, toggleWidth, toggleHeight, 20);
		graphics.fill({ color: isMusicOn ? 0x00ff00 : 0x555555 });
	}}
/>

<!-- Music Toggle Switch -->
<Graphics
	x={toggleX + (isMusicOn ? (isMobileSmall ? 18 : isMobile ? 22 : 35) : (isMobileSmall ? -18 : isMobile ? -22 : -35))}
	y={musicToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	zIndex={203}
	draw={(graphics) => {
		graphics.clear();
		graphics.circle(0, 0, isMobileSmall ? 14 : isMobile ? 16 : 25);
		graphics.fill({ color: 0xffffff });
	}}
/>

<!-- Music Status Text -->
{#key `${canvasSize.width}-${canvasSize.height}`}
<BitmapText
	text={isMusicOn ? "ON" : "OFF"}
	x={toggleX + (isMusicOn ? (isMobileSmall ? -18 : isMobile ? -22 : -35) : (isMobileSmall ? 15 : isMobile ? 18 : 23))}
	y={musicToggleY}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'pinkFont',
		fontSize: isMobileSmall ? 3 : isMobile ? 3.5 : 5.75,
	}}
	zIndex={203}
/>
{/key}

<!-- Close button -->
<Graphics
	x={closeButtonX}
	y={closeButtonY}
	anchor={{ x: 0.5, y: 0.5 }}
	zIndex={202}
	interactive={true}
	cursor="pointer"
	onpointerup={closePanel}
	draw={(graphics) => {
		graphics.clear();
		graphics.circle(0, 0, closeButtonSize / 2);
		graphics.fill({ color: 0xff0000 });
		// Draw X
		graphics.moveTo(-8, -8);
		graphics.lineTo(8, 8);
		graphics.moveTo(8, -8);
		graphics.lineTo(-8, 8);
		graphics.stroke({ color: 0xffffff, width: 3 });
	}}
/>
{/if}
