<script lang="ts">
import { Sprite } from 'pixi-svelte';
import { getContext } from '../game/context';
import { BOARD_SIZES } from '../game/constants';

const context = getContext();
const FRAME_ASPECT = 1080 / 1080; // Your frame's aspect ratio
const FRAME_PADDING = 1.3; // Adjust as needed for best fit
</script>

<Sprite
  key="skyVaultReelFrame"
  anchor={0.5}
  x={context.stateGameDerived.boardLayout().x}
  y={context.stateGameDerived.boardLayout().y - 50}
  width={BOARD_SIZES.width * FRAME_PADDING + 10}
  height={(BOARD_SIZES.width * FRAME_PADDING) / FRAME_ASPECT}
/>
