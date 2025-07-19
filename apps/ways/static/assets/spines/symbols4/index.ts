import { createAsset } from 'pixi-svelte';

import img from './symbols4.png';
import rawAtlas from './symbols4.atlas?raw';
import S from './S.json';

export default createAsset({
	img,
	rawAtlas,
	spines: {
		S,
	},
}); 