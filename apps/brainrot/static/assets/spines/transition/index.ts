import { createAsset } from 'pixi-svelte';

import img from './brbo_transition.png';
import rawAtlas from './brbo_transition.atlas?raw';
import spine from './brbo_transition.json';

export default createAsset({ img, rawAtlas, spine });