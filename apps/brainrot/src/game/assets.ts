export default {
	loader: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/loader/loader.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/loader/loader.json', import.meta.url).href,
			scale: 2,
		},
		preload: true,
	},
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
		preload: true,
	},
	H1: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/h1.json', import.meta.url).href,
			scale: 2,
		},
	},
	H1Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/h1/brbo_67/brbo_67.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/h1/brbo_67/brbo_67.json', import.meta.url).href,
			scale: 1,
		},
	},
	H2: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/h2.json', import.meta.url).href,
			scale: 2,
		},
	},
	H2Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/h2/brbo_baby_oil/baby_oil.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/h2/brbo_baby_oil/baby_oil.json', import.meta.url).href,
			scale: 1,
		},
	},
	H3: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/h3.json', import.meta.url).href,
			scale: 2,
		},
	},
	H3Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/h3/brbo_giga_chad/giga_chad.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/h3/brbo_giga_chad/giga_chad.json', import.meta.url).href,
			scale: 1,
		},
	},
	H4: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/h4.json', import.meta.url).href,
			scale: 2,
		},
	},
	H4Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/h4/brbo_troll_face/troll_face.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/h4/brbo_troll_face/troll_face.json', import.meta.url).href,
			scale: 1,
		},
	},
	H5: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/h5.json', import.meta.url).href,
			scale: 2,
		},
	},
	L1: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/l1.json', import.meta.url).href,
			scale: 2,
		},
	},
	L1Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/l1/brbo_watermelon/watermelon.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/l1/brbo_watermelon/watermelon.json', import.meta.url).href,
			scale: 1,
		},
	},
	L2: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/l2.json', import.meta.url).href,
			scale: 2,
		},
	},
	L2Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/l2/brbo_plum/brbo_plum.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/l2/brbo_plum/brbo_plum.json', import.meta.url).href,
			scale: 1,
		},
	},
	L3: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/l3.json', import.meta.url).href,
			scale: 2,
		},
	},
	L3Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/l3/brbo_mango_soft/mango_soft.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/l3/brbo_mango_soft/mango_soft.json', import.meta.url).href,
			scale: 1,
		},
	},
	L4: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols/symbols.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols/l4.json', import.meta.url).href,
			scale: 2,
		},
	},
	L4Animated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/l4/brbo_grapes/brbo_grapes.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/l4/brbo_grapes/brbo_grapes.json', import.meta.url).href,
			scale: 1,
		},
	},
	MAnimated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/m/brbo_brain/brain.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/m/brbo_brain/brain.json', import.meta.url).href,
			scale: 1,
		},
	},
	SAnimated: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbolsAnimated/s/brbo_mustard_bottle/mustard_bottle.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolsAnimated/s/brbo_mustard_bottle/mustard_bottle.json', import.meta.url).href,
			scale: 1,
		},
	},
	M: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols2/symbols2.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols2/M.json', import.meta.url).href,
			scale: 2,
		},
	},
	S: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols2/symbols2.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols2/S.json', import.meta.url).href,
			scale: 2,
		},
	},
	explosion: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href,
			scale: 2,
		},
	},
	W: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbols3/W.json', import.meta.url).href,
			scale: 2,
		},
	},
	reelsFrame: {
		type: 'sprites',
		src: new URL('../../assets/sprites/reelsFrame/reels_frame.json', import.meta.url).href,
	},
	reelFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelFrame/reelFrame.png', import.meta.url).href,
	},
	reelBackground: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reel/reel.png', import.meta.url).href,
	},
	reelDivider: {
		type: 'sprite',
		src: new URL('../../assets/sprites/divider/divider.png', import.meta.url).href,
	},
	topBanner: {
		type: 'sprite',
		src: new URL('../../assets/sprites/topBanner/brainrotTopBanner.png', import.meta.url).href,
	},
	reelGlow: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelGlow/reel_glow.png', import.meta.url).href,
	},
	betFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/betFrame/bet_frame.png', import.meta.url).href,
	},
	buyFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyFrame/buy_frame.png', import.meta.url).href,
	},
	// UI Bespoke Assets
	uiBottomOverlay: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/bottomOverlay.png', import.meta.url).href,
	},
	uiAutoplay: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/AUTOPLAY.png', import.meta.url).href,
	},
	uiAutoplayOutline: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/autoplayOutline.png', import.meta.url).href,
	},
	uiBet: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/BET.png', import.meta.url).href,
	},
	uiCredit: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/CREDIT.png', import.meta.url).href,
	},
	uiInfo: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/info.png', import.meta.url).href,
	},
	uiPays: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/PAYS.png', import.meta.url).href,
	},
	uiSettings: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/settings.png', import.meta.url).href,
	},
	uiSpek: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/spek.png', import.meta.url).href,
	},
	uiMain: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/UI.png', import.meta.url).href,
	},
	uiWin: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/WIN.png', import.meta.url).href,
	},
	uiSpin: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/Spin.png', import.meta.url).href,
	},
	uiSpinOutline: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/spinOutline.png', import.meta.url).href,
	},
	spinButton: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/spinButton/spin_button.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/spinButton/spin_button.json', import.meta.url).href,
			scale: 2,
		},
	},
	anticipation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/anticipation/anticipation.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/anticipation/anticipation.json', import.meta.url).href,
			scale: 2,
		},
	},
	goldFont: {
		type: 'font',
		src: new URL('../../assets/fonts/goldFont/mm_gold.xml', import.meta.url).href,
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
	globalMultiplier: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/globalMultiplier/multiframe.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/globalMultiplier/multiframe.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntro: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsIntroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_screen_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	fsOutroNumber: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/fsIntro/fs_total_number.json', import.meta.url).href,
			scale: 2,
		},
	},
	foregroundAnimation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/foregroundAnimation/basegame.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/foregroundAnimation/basegame.json', import.meta.url).href,
			images: [
				new URL('../../assets/spines/foregroundAnimation/basegame.png', import.meta.url).href,
				new URL('../../assets/spines/foregroundAnimation/basegame2.png', import.meta.url).href,
				new URL('../../assets/spines/foregroundAnimation/basegame3.png', import.meta.url).href,
				new URL('../../assets/spines/foregroundAnimation/basegame4.png', import.meta.url).href,
			],
			scale: 2.3,
		},
		preload: true,
	},
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
	reelhouse: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/reelhouse/reelhouse_glow.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/reelhouse/reelhouse_glow.json', import.meta.url).href,
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
	transition: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/transition/brbo_transition.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/transition/brbo_transition.json', import.meta.url).href,
			scale: 1.2,
		},
	},
	skibidiToilet: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/characters/skibidiToilet/skibidi_toilet.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/characters/skibidiToilet/skibidi_toilet.json', import.meta.url).href,
			scale: 2,
		},
	},
	tungtung: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/characters/tungtung/sahur.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/characters/tungtung/sahur.json', import.meta.url).href,
			scale: 2,
		},
	},
	symbolsStatic: {
		type: 'sprites',
		src: new URL('../../assets/sprites/symbolsStatic/symbolsStatic.json', import.meta.url).href,
	},
	coins: {
		type: 'spriteSheet',
		src: new URL('../../assets/sprites/coin/SD2_Coin.json', import.meta.url).href,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
} as const;
