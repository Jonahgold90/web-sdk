import { createAsset } from 'pixi-svelte';

import img from './freegame.png';
import rawAtlas from './freegame.atlas?raw';
import spine from './freegame.json';

export default createAsset({ img, rawAtlas, spine, preload: true });