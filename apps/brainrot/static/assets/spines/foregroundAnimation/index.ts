import { createAsset } from 'pixi-svelte';

import img1 from './basegame.png';
import img2 from './basegame2.png';
import img3 from './basegame3.png';
import img4 from './basegame4.png';
import rawAtlas from './basegame.atlas?raw';
import spine from './basegame.json';

export default createAsset({
  img: [img1, img2, img3, img4],
  rawAtlas,
  spine,
  preload: true
});