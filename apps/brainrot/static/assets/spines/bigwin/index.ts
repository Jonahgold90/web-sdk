import { createAsset } from 'pixi-svelte';

import img from './brbo_bigwin.png';
import img2 from './brbo_bigwin_2.png';
import rawAtlas from './brbo_bigwin.atlas?raw';
import spine from './brbo_bigwin.json';

export default createAsset({ img: [img, img2], rawAtlas, spine });