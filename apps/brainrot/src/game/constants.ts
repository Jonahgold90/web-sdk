import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 110;

export const REEL_PADDING = 0.53;

// initial board (padded top and bottom)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{
			name: 'L1',
		},
		{
			name: 'H1',
		},
		{
			name: 'L1',
		},
		{
			name: 'L2',
		},
		{
			name: 'L2',
		},
		{
			name: 'L3',
		},
		{
			name: 'L2',
		},
	],
	[
		{
			name: 'L2',
		},
		{
			name: 'L2',
		},
		{
			name: 'L3',
		},
		{
			name: 'L2',
		},
		{
			name: 'L2',
		},
		{
			name: 'L3',
		},
		{
			name: 'L2',
		},
	],
	[
		{
			name: 'L3',
		},
		{
			name: 'H3',
		},
		{
			name: 'L1',
		},
		{
			name: 'L1',
		},
		{
			name: 'H4',
		},
		{
			name: 'L2',
		},
		{
			name: 'H4',
		},
	],
	[
		{
			name: 'H4',
		},
		{
			name: 'L1',
		},
		{
			name: 'H2',
		},
		{
			name: 'H2',
		},
		{
			name: 'H4',
		},
		{
			name: 'H2',
		},
		{
			name: 'H2',
		},
	],
	[
		{
			name: 'L1',
		},
		{
			name: 'L1',
		},
		{
			name: 'H3',
		},
		{
			name: 'H1',
		},
		{
			name: 'H1',
		},
		{
			name: 'L2',
		},
		{
			name: 'L2',
		},
	],
	[
		{
			name: 'L1',
		},
		{
			name: 'L2',
		},
		{
			name: 'L2',
		},
		{
			name: 'H1',
		},
		{
			name: 'H4',
		},
		{
			name: 'H4',
		},
		{
			name: 'H2',
		},
	],
];

export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 2039 / 1000;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4', 'H5'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const M_SIZE = 0.3;
const HIGH_SYMBOL_SIZE = 0.9;
const LOW_SYMBOL_SIZE = 0.9;
const SPECIAL_SYMBOL_SIZE = 1;

const SPIN_OPTIONS_SHARED = {
	reelFallInDelay: 80,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 3.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.15,
	symbolFallInBounceSizeMulti: 0.5,
	symbolFallOutSpeed: 3.5,
	symbolFallOutInterval: 20,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 7,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 0.3,
	symbolFallInBounceSizeMulti: 0.25,
	symbolFallOutSpeed: 7,
	symbolFallOutInterval: 0,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
};

const h1Static = { type: 'sprite', assetKey: 'h1.png', sizeRatios: { width: 1, height: 1 } };
const h2Static = { type: 'sprite', assetKey: 'h2.png', sizeRatios: { width: 1, height: 1 } };
const h3Static = { type: 'sprite', assetKey: 'h3.png', sizeRatios: { width: 1, height: 1 } };
const h4Static = { type: 'sprite', assetKey: 'h4.png', sizeRatios: { width: 1, height: 1 } };
const h5Static = { type: 'sprite', assetKey: 'h5.png', sizeRatios: { width: 1, height: 1 } };

const l1Static = { type: 'sprite', assetKey: 'l1.png', sizeRatios: { width: 1, height: 1 } };
const l2Static = { type: 'sprite', assetKey: 'l2.png', sizeRatios: { width: 1, height: 1 } };
const l3Static = { type: 'sprite', assetKey: 'l3.png', sizeRatios: { width: 1, height: 1 } };
const l4Static = { type: 'sprite', assetKey: 'l4.png', sizeRatios: { width: 1, height: 1 } };

const sStatic = { type: 'sprite', assetKey: 's.png', sizeRatios: { width: 1.243, height: 1.243 } };
const m2Static = { type: 'sprite', assetKey: 'm1_2x.png', sizeRatios: { width: 0.88, height: 0.88 } };

const mSizeRatios = { width: 1, height: 1 };
const sSizeRatios = { width: 1.243, height: 1.243 };

export const SYMBOL_INFO_MAP = {
	H1: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H1Animated',
			animationName: 'brbo_67_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: h1Static,
		static: h1Static,
		spin: h1Static,
		land: {
			type: 'spine',
			assetKey: 'H1Animated',
			animationName: 'brbo_67_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	H2: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H2Animated',
			animationName: 'baby_oil_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: h2Static,
		static: h2Static,
		spin: h2Static,
		land: {
			type: 'spine',
			assetKey: 'H2Animated',
			animationName: 'baby_oil_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	H3: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H3Animated',
			animationName: 'giga_chad_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: h3Static,
		static: h3Static,
		spin: h3Static,
		land: {
			type: 'spine',
			assetKey: 'H3Animated',
			animationName: 'giga_chad_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	H4: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H4Animated',
			animationName: 'troll_face_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: h4Static,
		static: h4Static,
		spin: h4Static,
		land: {
			type: 'spine',
			assetKey: 'H4Animated',
			animationName: 'troll_face_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	L1: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L1Animated',
			animationName: 'brbo_watermelon_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: l1Static,
		static: l1Static,
		spin: l1Static,
		land: {
			type: 'spine',
			assetKey: 'L1Animated',
			animationName: 'brbo_watermelon_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	L2: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L2Animated',
			animationName: 'brbo_plum_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: l2Static,
		static: l2Static,
		spin: l2Static,
		land: {
			type: 'spine',
			assetKey: 'L2Animated',
			animationName: 'brbo_plum_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	L3: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L3Animated',
			animationName: 'brbo_mango_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: l3Static,
		static: l3Static,
		spin: l3Static,
		land: {
			type: 'spine',
			assetKey: 'L3Animated',
			animationName: 'brbo_mango_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	L4: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L4Animated',
			animationName: 'brbo_grapes_win',
			sizeRatios: { width: 1, height: 1 },
		},
		postWinStatic: l4Static,
		static: l4Static,
		spin: l4Static,
		land: {
			type: 'spine',
			assetKey: 'L4Animated',
			animationName: 'brbo_grapes_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	M: {
		explosion,
		postWinStatic: m2Static,
		static: m2Static,
		spin: m2Static,
		win: {
			type: 'spine',
			assetKey: 'MAnimated',
			animationName: 'brain_win_1',
			sizeRatios: { width: 1, height: 1 },
		},
		land: {
			type: 'spine',
			assetKey: 'MAnimated',
			animationName: 'brain_landing_1',
			sizeRatios: { width: 1, height: 1 },
		},
	},
	S: {
		explosion,
		postWinStatic: sStatic,
		static: sStatic,
		spin: sStatic,
		win: {
			type: 'spine',
			assetKey: 'SAnimated',
			animationName: 'mustard_bottle_win',
			sizeRatios: { width: 1, height: 1 },
		},
		land: {
			type: 'spine',
			assetKey: 'SAnimated',
			animationName: 'mustard_bottle_landing',
			sizeRatios: { width: 1, height: 1 },
		},
	},
} as const;

export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
} as const;
