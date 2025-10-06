import { SECOND } from 'constants-shared/time';

export const winLevelMap = {
	1: {
		level: 1,
		alias: 'zero',
		type: 'small',
		text: null,
		presentDuration: 0,
		sound: { sfx: undefined, bgm: undefined },
		animation: undefined,
	},
	2: {
		level: 2,
		alias: 'standard',
		type: 'small',
		text: null,
		presentDuration: 0.6 * SECOND,
		sound: { sfx: undefined, bgm: undefined },
		animation: undefined,
	},
	3: {
		level: 3,
		alias: 'small',
		type: 'small',
		text: null,
		presentDuration: 1 * SECOND,
		sound: { sfx: undefined, bgm: undefined },
		animation: undefined,
	},
	4: {
		level: 4,
		alias: 'nice',
		type: 'medium',
		text: null,
		presentDuration: 1.5 * SECOND,
		sound: { sfx: undefined, bgm: undefined },
		animation: undefined,
	},
	5: {
		level: 5,
		alias: 'substantial',
		type: 'medium',
		text: null,
		presentDuration: 2.0 * SECOND,
		sound: { sfx: undefined, bgm: undefined },
		animation: undefined,
	},
	6: {
		level: 6,
		alias: 'big',
		type: 'big',
		text: 'BIG WIN',
		presentDuration: 6 * SECOND,
		sound: { sfx: undefined, bgm: 'bgm_winlevel_big' },
		animation: { intro: 'brbo_big_in', idle: 'brbo_big_loop', outro: 'brbo_big_out' },
	},
	7: {
		level: 7,
		alias: 'superwin',
		type: 'big',
		text: 'SUPER WIN',
		presentDuration: 18 * SECOND,
		sound: { sfx: undefined, bgm: 'bgm_winlevel_superwin' },
		animation: { intro: 'brbo_super_in', idle: 'brbo_super_loop', outro: 'brbo_super_out' },
	},
	8: {
		level: 8,
		alias: 'mega',
		type: 'big',
		text: 'MEGA WIN',
		presentDuration: 20 * SECOND,
		sound: { sfx: undefined, bgm: 'bgm_winlevel_mega' },
		animation: { intro: 'brbo_mega_in', idle: 'brbo_mega_loop', outro: 'brbo_mega_out' },
	},
	9: {
		level: 9,
		alias: 'epic',
		type: 'big',
		text: 'EPIC WIN!',
		presentDuration: 26 * SECOND,
		sound: { sfx: undefined, bgm: 'bgm_winlevel_epic' },
		animation: { intro: 'brbo_mega_in', idle: 'brbo_mega_loop', outro: 'brbo_mega_out' },
	},
	10: {
		level: 10,
		alias: 'max',
		type: 'big',
		text: 'MAX WIN',
		presentDuration: 32 * SECOND,
		sound: { sfx: undefined, bgm: 'bgm_winlevel_max' },
		animation: { intro: 'brbo_mega_in', idle: 'brbo_mega_loop', outro: 'brbo_mega_out' },
	},
} as const;

export type WinLevelMap = typeof winLevelMap;
export type WinLevel = keyof typeof winLevelMap;
export type WinLevelData = WinLevelMap[WinLevel];
export type WinLevelAlias = WinLevelData['alias'];
