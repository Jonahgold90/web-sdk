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
	loadingScreen: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/loadingScreen/loading_screen.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/loadingScreen/loading_screen.json', import.meta.url).href,
			scale: 0.5,
		},
		preload: true,
	},
	introScreen: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/introScreen/brbo_intro.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/introScreen/brbo_intro.json', import.meta.url).href,
			scale: 0.5,
		},
		preload: true,
	},
	pressToContinueText: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/pressToContinueText/pressToContinue.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/pressToContinueText/pressToContinue.json', import.meta.url).href,
			scale: 0.75,
		},
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
			atlas: new URL('../../assets/spines/symbolRemovalEffect/brbo_overlay_effects.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/symbolRemovalEffect/brbo_overlay_effects.json', import.meta.url).href,
			scale: 0.25,
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

	reelFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/reelFrame/reelFrame.png', import.meta.url).href,
	},
	tumbleFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/tumbleFrame/tumbleFrame.png', import.meta.url).href,
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
		type: 'sprites',
		src: new URL('../../assets/sprites/betFrame/bet.json', import.meta.url).href,
	},
	buyFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyFrame/buy_frame.png', import.meta.url).href,
	},
	buyText: {
		type: 'sprite',
		src: new URL('../../assets/sprites/buyFrame/buy.png', import.meta.url).href,
	},
	buyButtonSpine: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/buyFrame/brbo_buy_feature.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/buyFrame/brbo_buy_feature.json', import.meta.url).href,
			scale: 1,
		},
	},
	freeSpinCounterFrame: {
		type: 'sprite',
		src: new URL('../../assets/sprites/freeeSpinCounterFrame/freeSpinCounterFrame.png', import.meta.url).href,
	},
	freeSpinCounterText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/freeSpinCounterText/freespin_left.json', import.meta.url).href,
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
	uiPlay: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/play.png', import.meta.url).href,
	},
	uiCredit: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/CREDIT.png', import.meta.url).href,
	},
	uiCoins: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/coins.png', import.meta.url).href,
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
	mutedState: {
		type: 'sprite',
		src: new URL('../../assets/sprites/uiSlotsAssetsBespoke/mutedState.png', import.meta.url).href,
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
			atlas: new URL('../../assets/spines/newAnticipation/brbo_anticipation.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/newAnticipation/brbo_anticipation.json', import.meta.url).href,
			scale: 2,
		},
	},
	payOutline: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/winFrame/brbo_win_frame6.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/winFrame/brbo_win_frame6.json', import.meta.url).href,
			scale: 1.5,
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
	pinkFont: {
		type: 'font',
		src: new URL('../../assets/fonts/pinkFont/pinkFont.xml', import.meta.url).href,
		preload: true,
	},
	greenFont: {
		type: 'font',
		src: new URL('../../assets/fonts/greenFont/greenFont.xml', import.meta.url).href,
		preload: true,
	},
	yellowFont: {
		type: 'font',
		src: new URL('../../assets/fonts/yellowFont/yellowFont.xml', import.meta.url).href,
		preload: true,
	},
	bigwin: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/bigwin/brbo_bigwin.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/bigwin/brbo_bigwin.json', import.meta.url).href,
			images: [
				new URL('../../assets/spines/bigwin/brbo_bigwin.png', import.meta.url).href,
				new URL('../../assets/spines/bigwin/brbo_bigwin_2.png', import.meta.url).href,
			],
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
	freeSpinIntroOutro: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/freeSpinIntroOutro/brbo_banner.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/freeSpinIntroOutro/brbo_banner.json', import.meta.url).href,
			images: [
				new URL('../../assets/spines/freeSpinIntroOutro/brbo_banner.png', import.meta.url).href,
				new URL('../../assets/spines/freeSpinIntroOutro/brbo_banner_2.png', import.meta.url).href,
			],
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
				new URL('../../assets/spines/foregroundAnimation/basegame_2.png', import.meta.url).href,
				new URL('../../assets/spines/foregroundAnimation/basegame_3.png', import.meta.url).href,
			],
			scale: 2.3,
		},
		preload: true,
	},
	foregroundFeatureAnimation: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/foregroundFeatureAnimation/freegame.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/foregroundFeatureAnimation/freegame.json', import.meta.url).href,
			images: [
				new URL('../../assets/spines/foregroundFeatureAnimation/freegame.png', import.meta.url).href,
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
	multiOverlay: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/multiOverlay/brbo_multiplier_overlay.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/multiOverlay/brbo_multiplier_overlay.json', import.meta.url).href,
			scale: 2,
		},
	},
	multiHit: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/multiHit/brbo_multipler_hit.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/multiHit/brbo_multipler_hit.json', import.meta.url).href,
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
	transitionMobile: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/transitionMobile/brbo_transition_protrait.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/transitionMobile/brbo_transition_protrait.json', import.meta.url).href,
			images: [
				new URL('../../assets/spines/transitionMobile/brbo_transition_protrait.png', import.meta.url).href,
				new URL('../../assets/spines/transitionMobile/brbo_transition_protrait_2.png', import.meta.url).href,
			],
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
	multiplierTextAmounts: {
		type: 'sprites',
		src: new URL('../../assets/sprites/multiTextAmounts/multiplier_nu.json', import.meta.url).href,
		preload: true,
	},
	sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sounds.json', import.meta.url).href,
		preload: true,
	},
	mainGameLoopMusic: {
		type: 'audio',
		src: new URL('../../assets/audio/music/Main game loop.mp3', import.meta.url).href,
		preload: true,
	},
	bonusGameLoopMusic: {
		type: 'audio',
		src: new URL('../../assets/audio/music/Bonus game loop 1.mp3', import.meta.url).href,
		preload: true,
	},
	spinButtonClickSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/Spin button click.mp3', import.meta.url).href,
		preload: true,
	},
	skibidiToiletLaserSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/Skibbidy toilet eye laser.wav', import.meta.url).href,
		preload: true,
	},
	smallWinSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/Small Win 1.mp3', import.meta.url).href,
		preload: true,
	},
	bonusTriggerSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/Bonus trigger.mp3', import.meta.url).href,
		preload: true,
	},
	reelLand1Sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/reelLands/Single_land_1.mp3', import.meta.url).href,
		preload: true,
	},
	reelLand2Sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/reelLands/Single_land_2.mp3', import.meta.url).href,
		preload: true,
	},
	reelLand3Sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/reelLands/Single_land_3.mp3', import.meta.url).href,
		preload: true,
	},
	reelLand4Sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/reelLands/Single_land_4.mp3', import.meta.url).href,
		preload: true,
	},
	reelLand5Sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/reelLands/Single_land_5.mp3', import.meta.url).href,
		preload: true,
	},
	reelLand6Sound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/reelLands/Single_land_6.mp3', import.meta.url).href,
		preload: true,
	},
	transitionSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/TransitionNoLaugh.mp3', import.meta.url).href,
		preload: true,
	},
	anticipationSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/Anticipation.mp3', import.meta.url).href,
		preload: true,
	},
	buttonPressSound: {
		type: 'audio',
		src: new URL('../../assets/audio/sfx/ButtonPress.wav', import.meta.url).href,
		preload: true,
	},
} as const;
