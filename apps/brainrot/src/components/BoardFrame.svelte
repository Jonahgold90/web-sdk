<script lang="ts" module>
	export type EmitterEventBoardFrame =
		| { type: 'boardFrameGlowShow' }
		| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { Sprite, SpineProvider, SpineTrack } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();

	// Character animation states
	let skibidiAnimationName = $state<string>('idle');
	let tungtungAnimationName = $state<string>('sahur_idle');
	const SPINE_SCALE = { width: 0.6, height: 0.6 };
	const SPRITE_SCALE = { width: 0.95, height: 0.9 };
	const BG_RATIO = 937 / 806;
	const POSITION_ADJUSTMENT = 1.01;
	const VERTICAL_OFFSET = -20; // Move board up by 20 pixels
	const NUM_REELS = 6;
	const NUM_ROWS = 5;
	// The divider image should be sized to match the exact reel grid dimensions

	type AnimationName = 'reelhouse_glow_start' | 'reelhouse_glow_idle' | 'reelhouse_glow_exit';

	let animationName = $state<AnimationName | undefined>(undefined);
	let loop = $state(false);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			animationName = 'reelhouse_glow_start';
			loop = false;
		},
		boardFrameGlowHide: () => {
			if (animationName) animationName = 'reelhouse_glow_exit';
		},
	});
</script>

{#if animationName}
	<SpineProvider
		zIndex={-1}
		key="reelhouse"
		x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
		y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
		width={context.stateGameDerived.boardLayout().width * SPINE_SCALE.width}
		height={context.stateGameDerived.boardLayout().height * SPINE_SCALE.height}
	>
		<SpineTrack
			trackIndex={0}
			{animationName}
			{loop}
			listener={{
				complete: (entry) => {
					if (entry.animation) {
						if (entry.animation.name === 'reelhouse_glow_start') {
							animationName = 'reelhouse_glow_idle';
							loop = true;
						}

						if (entry.animation.name === 'reelhouse_glow_exit') {
							animationName = undefined;
							loop = false;
						}
					}
				},
			}}
		/>
	</SpineProvider>
{/if}

<!-- Reel background behind everything -->
<Sprite
	key="reelBackground"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={context.stateGameDerived.boardLayout().width * BG_RATIO * SPRITE_SCALE.width * 1.0}
	height={context.stateGameDerived.boardLayout().width * SPRITE_SCALE.height * 0.95}
	zIndex={-2}
/>

<!-- Reel glow effect -->
<Sprite
	key="reelGlow"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={context.stateGameDerived.boardLayout().width * 1.2}
	height={context.stateGameDerived.boardLayout().height * 1.2}
	zIndex={-1}
	blendMode="add"
/>

<!-- Top banner above the frame -->
<Sprite
	key="topBanner"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) - 50}
	width={context.stateGameDerived.boardLayout().width * 1.2}
	height={100}
	zIndex={2}
/>

<!-- Reel frame on top -->
<Sprite
	key="reelFrame"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET}
	width={context.stateGameDerived.boardLayout().width * BG_RATIO * SPRITE_SCALE.width}
	height={context.stateGameDerived.boardLayout().width * SPRITE_SCALE.height}
/>

<!-- Buy frame - vertically level with board frame, to the left -->
<Sprite
	key="buyFrame"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 197 / 2 - 60}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) + (135.5 / 2) - 10}
	width={197}
	height={135.5}
	zIndex={1}
/>

<!-- Bet frame - right under buy frame with vertical margin -->
<Sprite
	key="betFrame"
	anchor={0.5}
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 197 / 2 - 60}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET - (context.stateGameDerived.boardLayout().height / 2) + 135.5 + 10 + (243.5 / 2) - 10}
	width={197}
	height={243.5}
	zIndex={1}
/>

<!-- Skibidi Toilet character - 20px to the right of board, bottom aligned -->
<SpineProvider
	key="skibidiToilet"
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT + (context.stateGameDerived.boardLayout().width / 2) + 20 + 110}
	y={context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT + VERTICAL_OFFSET + (context.stateGameDerived.boardLayout().height / 2) - 50}
	width={150}
	height={150}
	zIndex={3}
>
	<SpineTrack
		trackIndex={0}
		animationName={skibidiAnimationName}
		loop={true}
	/>
</SpineProvider>


<!-- TungTung character - 20px left of bottom board edge, above control bar -->
<SpineProvider
	key="tungtung"
	x={context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT - (context.stateGameDerived.boardLayout().width / 2) - 20 - 136}
	y={context.stateLayoutDerived.canvasSizes().height - 355}
	width={100}
	height={177}
	zIndex={3}
>
	<SpineTrack
		trackIndex={0}
		animationName={tungtungAnimationName}
		loop={true}
	/>
</SpineProvider>
