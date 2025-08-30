export default {
	loader: {
		type: 'sprite',
		src: new URL('../../assets/sprites/loaderImg/intro_screen_v03.png', import.meta.url).href,
		preload: true,
	},
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
		preload: true,
	},
	payFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/payFrame/payFrame.png', import.meta.url).href,
	},
	freeSpinOutroBackground: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeSpinOutro/Bonus_Screen_Outro.png', import.meta.url).href,
	},
	buyButton: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyButton/Bonus_buy_v03.png', import.meta.url).href,
		preload: true,
	},
	buyButtonSocial: {
		type: 'sprite',
		src: new URL('../../static/assets/sprites/buyButton/Bonus_buy_v05_social.png', import.meta.url).href,
		preload: true,
	},
	xBetButtonOff: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyButton/xBet_off_v04.png', import.meta.url).href,
		preload: true,
	},
	xBetButtonOn: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyButton/xBet_on_v04.png', import.meta.url).href,
		preload: true,
	},
	buyFreeSpins: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyConfirmation/BUY_FREE_SPINS.png', import.meta.url).href,
		preload: true,
	},
	anticipation: {
		type: 'gif',
		src: new URL('../../assets/sprites/anticipation/Candy_Crypt_anticipation_02_1.gif', import.meta.url).href,
		preload: true,
	},
	anticipationBackground: {
		type: 'sprite',
		src: new URL('../../assets/sprites/anticipation/Base_Game_BG_Landscape_v02_light.png', import.meta.url).href,
		preload: true,
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/yellowFont/yellowFont.xml', import.meta.url).href,
	},
	yellowFont: {
	type: 'font',
	src: new URL('../../assets/fonts/yellowFont/yellowFont.xml', import.meta.url).href,
},
	goldBlur: {
		type: 'font',
		src: new URL('../../assets/fonts/goldBlur/miningfont_gold_blur.xml', import.meta.url).href,
	},
	silverFont: {
		type: 'font',
		src: new URL('../../assets/fonts/silverFont/mm_silver.xml', import.meta.url).href,
	},
	purpleFont: {
		type: 'font',
		src: new URL('../../assets/fonts/purpleFont/mm_purple.xml', import.meta.url).href,
	},
	bigwin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/bigwin/big_wins.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/bigwin/mm_bigwin.json', import.meta.url).href,
			scale: 2,
		},
	},
	// foregroundAnimation: {
	// 	type: 'spine',
	// 	src: {
	// 		atlas: new URL('../../assets/spines/foregroundAnimation/mm_bg.atlas', import.meta.url).href,
	// 		skeleton: new URL('../../assets/spines/foregroundAnimation/mm_bg.json', import.meta.url).href,
	// 		scale: 2,
	// 	},
	// 	preload: true,
	// },
	// foregroundFeatureAnimation: {
	// 	type: 'spine',
	// 	src: {
	// 		atlas: new URL('../../assets/spines/foregroundFeatureAnimation/mm_bg_feature.atlas', import.meta.url).href,
	// 		skeleton: new URL('../../assets/spines/foregroundFeatureAnimation/mm_bg_feature.json', import.meta.url).href,
	// 		scale: 2,
	// 	},
	// 	preload: true,
	// },
	tumble_multiplier: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_multiplier.json', import.meta.url).href,
			scale: 2,
		},
	},
	tumble_win: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/tumbleWin/tumble_win.json', import.meta.url).href,
			scale: 2,
		},
	},
	progressBar: {
		type: 'sprites',
		src: new URL('../../assets/sprites/progressBar/progressBar.json', import.meta.url).href,
		preload: true,
	},
	freeSpins: {
		type: 'sprites',
		src: new URL('../../assets/sprites/freeSpins/freeSpins.json', import.meta.url).href,
	},
	winSmall: {
		type: 'sprites',
		src: new URL('../../assets/sprites/winSmall/MM_Localisation_winsmall.json', import.meta.url).href,
	},
	clusterWin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/clusterWin/clusterpay.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/clusterWin/clusterpay.json', import.meta.url).href,
			scale: 2,
		},
	},
	symbolsStatic: {
		type: 'sprites',
		src: new URL('../../assets/sprites/symbolsStatic/symbolsStatic.json', import.meta.url).href,
	},
	symbolsStaticBackgrounds: {
		type: 'sprites',
		src: new URL('../../assets/sprites/symbolsStaticBackgrounds/symbolsStaticBackgrounds.json', import.meta.url).href,
		preload: true,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
	clickSound: {
		type: 'audio',
		src: new URL('../../assets/audio/Candy_Crypt_click.mp3', import.meta.url).href,
		preload: true,
	},
	cwLandingSound: {
		type: 'audio',
		src: new URL('../../assets/audio/Candy_Crypt_CW_landing02.mp3', import.meta.url).href,
		preload: true,
	},
	// Base game backgrounds
	backgroundImageBaseLandscape: {
		type: 'sprite',
		src: new URL('../../assets/backgrounds/Base_Game_BG_Landscape_v02.png', import.meta.url).href,
		preload: true,
	},
	backgroundImageBasePortrait: {
		type: 'sprite',
		src: new URL('../../assets/backgrounds/Base_Game_BG_Portrait_v02.png', import.meta.url).href,
		preload: true,
	},
	// Bonus game backgrounds
	backgroundImageBonusLandscape: {
		type: 'sprite',
		src: new URL('../../assets/backgrounds/Bonus_Game_BG_Landscape_v02.png', import.meta.url).href,
		preload: true,
	},
	backgroundImageBonusPortrait: {
		type: 'sprite',
		src: new URL('../../assets/backgrounds/Bonus_Game_BG_Portrait_v02.png', import.meta.url).href,
		preload: true,
	},
	// Reel frames
	reelFrameLandscape: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelFrames/Base_Game_BG_Landscape_Frame_v02.png', import.meta.url).href,
	},
	reelFramePortrait: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelFrames/Base_Game_BG_Portrait_Frame_v02.png', import.meta.url).href,
	},
	// Reel frame backgrounds
	reelFrameBackgroundLandscape: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelFrameBackgrounds/Base_Game_BG_Landscape_ReelsBG_v02.png', import.meta.url).href,
	},
	reelFrameBackgroundPortrait: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelFrameBackgrounds/Base_Game_BG_Portrait_ReelsBG_v02.png', import.meta.url).href,
	},
	// Free Spin Intro PNG
	Bonus_Screen_Intro: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeSpinIntro/Bonus_Screen_Intro.png', import.meta.url).href,
	},
	// Free Spin Intro PNGs - specific spin counts
	Bonus_Screen_10FS: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeSpinIntro/Bonus_Screen_10FS_v02.png', import.meta.url).href,
	},
	Bonus_Screen_15FS: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeSpinIntro/Bonus_Screen_15FS_v02.png', import.meta.url).href,
	},
	Bonus_Screen_20FS: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeSpinIntro/Bonus_Screen_20FS_v02.png', import.meta.url).href,
	},
	// Extra Spins Retrig PNGs
	extraSpinsRetrig1: {
		type: 'sprite',
		src: new URL('../../assets/sprites/extraSpins/Bonus_Extra_Spins_v01.png', import.meta.url).href,
	},
	extraSpinsRetrig2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/extraSpins/Bonus_Extra_Spins_x3_v01.png', import.meta.url).href,
	},
	extraSpinsRetrig3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/extraSpins/Bonus_Extra_Spins_x10_v01.png', import.meta.url).href,
	},
	// Free Spin Outro PNG
	Bonus_Screen_Outro: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeSpinOutro/Bonus_Screen_Outro.png', import.meta.url).href,
	},
	// Bonus Level Frames
	bonusLevelFrameX2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelFrames/Bonus_Game_Frame_Level_x2_v07A.png', import.meta.url).href,
	},
	bonusLevelFrameX3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelFrames/Bonus_Game_Frame_Level_x3_v07A.png', import.meta.url).href,
	},
	bonusLevelFrameX10: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelFrames/Bonus_Game_Frame_Level_x10_v07A.png', import.meta.url).href,
	},
	// Level Bar Headers
	levelBarHeaderX2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/levelBarHeaders/Bonus_Game_Level_x2_grey.png', import.meta.url).href,
	},
	levelBarHeaderX3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/levelBarHeaders/Bonus_Game_Level_x3_grey.png', import.meta.url).href,
	},
	levelBarHeaderX10: {
		type: 'sprite',
		src: new URL('../../assets/sprites/levelBarHeaders/Bonus_Game_Level_x10_grey.png', import.meta.url).href,
	},
	levelBarHeaderX2Color: {
		type: 'sprite',
		src: new URL('../../assets/sprites/levelBarHeaders/Bonus_Game_Level_x2_color.png', import.meta.url).href,
	},
	levelBarHeaderX3Color: {
		type: 'sprite',
		src: new URL('../../assets/sprites/levelBarHeaders/Bonus_Game_Level_x3_color.png', import.meta.url).href,
	},
	levelBarHeaderX10Color: {
		type: 'sprite',
		src: new URL('../../assets/sprites/levelBarHeaders/Bonus_Game_Level_x10_color.png', import.meta.url).href,
	},
	// Bonus Level Characters
	bonusLevelCharacterGrey: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelCharacters/Bonus_Game_CW_grey.png', import.meta.url).href,
	},
	bonusLevelCharacterColor: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelCharacters/Bonus_Game_CW_color.png', import.meta.url).href,
	},
	// Bonus Level Frame Backgrounds
	bonusLevelFrameBackgroundX2: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelFrameBackgrounds/Bonus_Game_Frame_Level_x2_BG_v07A.png', import.meta.url).href,
	},
	bonusLevelFrameBackgroundX3: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelFrameBackgrounds/Bonus_Game_Frame_Level_x3_BG_v07A.png', import.meta.url).href,
	},
	bonusLevelFrameBackgroundX10: {
		type: 'sprite',
		src: new URL('../../assets/sprites/bonusLevelFrameBackgrounds/Bonus_Game_Frame_Level_x10_BG_v07A.png', import.meta.url).href,
	},
} as const;
