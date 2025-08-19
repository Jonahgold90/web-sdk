export const stateConfig = $state({
	jurisdiction: {
		socialCasino: false,
		disabledFullscreen: false,
		disabledTurbo: false,
		disabledSuperTurbo: false,
		disabledAutoplay: false,
		disabledSlamstop: false,
		disabledSpacebar: false,
		disabledBuyFeature: false,
		displayNetPosition: false,
		displayRTP: false,
		displaySessionTimer: false,
		minimumRoundDuration: 0,
	},
	betAmountOptions: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 750, 1000],
	betMenuOptions: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 750, 1000],
});
