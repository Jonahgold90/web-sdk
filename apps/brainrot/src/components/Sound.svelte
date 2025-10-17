<script lang="ts" module>
	import { sound, type MusicName, type SoundEffectName, type SoundName } from '../game/sound';

	export type EmitterEventSound =
		| { type: 'soundMusic'; name: MusicName }
		| { type: 'soundOnce'; name: SoundEffectName; forcePlay?: boolean }
		| { type: 'soundLoop'; name: SoundEffectName }
		| { type: 'soundStop'; name: SoundName }
		| { type: 'soundFade'; name: SoundName; from: number; to: number; duration: number }
		| { type: 'soundScatterCounterIncrease' }
		| { type: 'soundScatterCounterClear' }
		| { type: 'soundSkibidiLaser' }
		| { type: 'soundSmallWin' }
		| { type: 'soundTransition' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl, Howler } from 'howler';

	import { waitForTimeout } from 'utils-shared/wait';
	import { SECOND } from 'constants-shared/time';
	import { stateBet, stateSound } from 'state-shared';

	import { getContext } from '../game/context';

	const context = getContext();

	// Helper to ensure audio context is resumed
	const ensureAudioContext = () => {
		if (Howler.ctx && Howler.ctx.state === 'suspended') {
			Howler.ctx.resume();
		}
	};

	let baseMusicHowl: Howl;
	let bonusMusicHowl: Howl;
	let currentMusicHowl: Howl | null = null;
	let spinButtonClickHowl: Howl;
	let skibidiToiletLaserHowl: Howl;
	let smallWinHowl: Howl;
	let bonusTriggerHowl: Howl;
	let reelLandHowls: Howl[] = [];
	let transitionHowl: Howl;

	// Calculate actual volume based on master and music settings
	const calculateMusicVolume = (baseMultiplier: number = 0.3) => {
		const masterVolume = stateSound.volumeValueMaster / 100; // 0-1
		const musicVolume = stateSound.volumeValueMusic / 100; // 0-1
		return masterVolume * musicVolume * baseMultiplier;
	};

	// Calculate actual volume for sound effects
	const calculateSfxVolume = (baseMultiplier: number = 0.5) => {
		const masterVolume = stateSound.volumeValueMaster / 100; // 0-1
		const sfxVolume = stateSound.volumeValueSoundEffect / 100; // 0-1
		return masterVolume * sfxVolume * baseMultiplier;
	};

	// Create the music and SFX instances once when component loads
	onMount(() => {
		baseMusicHowl = new Howl({
			src: ['./assets/audio/music/Main game loop.mp3'],
			loop: true,
			volume: calculateMusicVolume(0.2) // 0.2 base volume for main game
		});

		bonusMusicHowl = new Howl({
			src: ['./assets/audio/music/Bonus game loop 1.mp3'],
			loop: true,
			volume: calculateMusicVolume(0.25) // 0.25 base volume for bonus game
		});

		spinButtonClickHowl = new Howl({
			src: ['./assets/audio/sfx/Spin button click.mp3'],
			volume: calculateSfxVolume()
		});

		skibidiToiletLaserHowl = new Howl({
			src: ['./assets/audio/sfx/Skibbidy toilet eye laser.wav'],
			volume: calculateSfxVolume()
		});

		smallWinHowl = new Howl({
			src: ['./assets/audio/sfx/Small Win 1.mp3'],
			volume: calculateSfxVolume()
		});

		bonusTriggerHowl = new Howl({
			src: ['./assets/audio/sfx/Bonus trigger.mp3'],
			volume: calculateSfxVolume(0.3) // 0.3 base volume for bonus trigger (quieter)
		});

		// Initialize reel land sounds
		reelLandHowls = [
			new Howl({ src: ['./assets/audio/sfx/reelLands/Single_land_1.mp3'], volume: calculateSfxVolume(1.0) }),
			new Howl({ src: ['./assets/audio/sfx/reelLands/Single_land_2.mp3'], volume: calculateSfxVolume(1.0) }),
			new Howl({ src: ['./assets/audio/sfx/reelLands/Single_land_3.mp3'], volume: calculateSfxVolume(1.0) }),
			new Howl({ src: ['./assets/audio/sfx/reelLands/Single_land_4.mp3'], volume: calculateSfxVolume(1.0) }),
			new Howl({ src: ['./assets/audio/sfx/reelLands/Single_land_5.mp3'], volume: calculateSfxVolume(1.0) }),
			new Howl({ src: ['./assets/audio/sfx/reelLands/Single_land_6.mp3'], volume: calculateSfxVolume(1.0) })
		];

		transitionHowl = new Howl({
			src: ['./assets/audio/sfx/TransitionNoLaugh.mp3'],
			volume: calculateSfxVolume(0.75)
		});

		// Start with base game music
		currentMusicHowl = baseMusicHowl;
		baseMusicHowl.play();
	});

	// Volume control for music based on master volume and music toggle
	$effect(() => {
		if (baseMusicHowl) {
			baseMusicHowl.volume(calculateMusicVolume(0.2)); // 0.2 base volume for main game
		}
		if (bonusMusicHowl) {
			bonusMusicHowl.volume(calculateMusicVolume(0.25)); // 0.25 base volume for bonus game
		}
	});

	// Volume control for SFX based on master volume and SFX toggle
	$effect(() => {
		if (spinButtonClickHowl) {
			spinButtonClickHowl.volume(calculateSfxVolume());
		}
		if (skibidiToiletLaserHowl) {
			skibidiToiletLaserHowl.volume(calculateSfxVolume());
		}
		if (smallWinHowl) {
			smallWinHowl.volume(calculateSfxVolume());
		}
		if (bonusTriggerHowl) {
			bonusTriggerHowl.volume(calculateSfxVolume(0.3)); // 0.3 base volume for bonus trigger (quieter)
		}
		if (reelLandHowls.length > 0) {
			reelLandHowls.forEach(howl => howl.volume(calculateSfxVolume(1.0)));
		}
		if (transitionHowl) {
			transitionHowl.volume(calculateSfxVolume(0.75));
		}
	});

	// Switch music based on game type
	$effect(() => {
		if (!baseMusicHowl || !bonusMusicHowl) return;

		const shouldPlayBonus = context.stateGame.gameType === 'freegame';
		const targetMusic = shouldPlayBonus ? bonusMusicHowl : baseMusicHowl;

		if (currentMusicHowl !== targetMusic) {
			// Stop current music
			if (currentMusicHowl) {
				currentMusicHowl.stop();
			}

			// Start new music
			currentMusicHowl = targetMusic;
			currentMusicHowl.play();
		}
	});

	context.eventEmitter.subscribeOnMount({
		// ui
		soundBetMode: async ({ betModeKey }) => {
			if (betModeKey === 'SUPERSPIN') {
				// check if SUPERSPIN, when changing the bet mode.
				sound.players.once.play({ name: 'sfx_winlevel_end' });
				await waitForTimeout(SECOND);
			}
			// Music is always playing, no need to start it
		},
		soundPressGeneral: () => sound.players.once.play({ name: 'sfx_btn_general' }),
		soundPressBet: () => {
			// Use custom spin button click sound
			if (spinButtonClickHowl && stateSound.volumeValueSoundEffect > 0) {
				spinButtonClickHowl.play();
			}
		},
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		// game - completely block old bgm calls, our custom music is always running
		soundMusic: ({ name }) => {
			// Block all old background music from the audio sprite
			// This includes base/bonus music AND big win music (we want our custom loops to play instead)
			if (
				name === 'bgm_main' ||
				name === 'bgm_freespin' ||
				name === 'bgm_winlevel_big' ||
				name === 'bgm_winlevel_superwin' ||
				name === 'bgm_winlevel_mega' ||
				name === 'bgm_winlevel_epic' ||
				name === 'bgm_winlevel_max'
			) {
				// Do nothing - our custom music handles this
				return;
			}
			// Allow other music types if any exist
			sound.players.music.play({ name });
		},
		soundLoop: ({ name }) => sound.players.loop.play({ name }),
		soundOnce: ({ name, forcePlay }) => {
			// Only intercept sounds we have custom replacements for
			if (name === 'sfx_winlevel_small') {
				// Use custom small win sound
				if (smallWinHowl && stateSound.volumeValueSoundEffect > 0) {
					smallWinHowl.play();
				}
			} else if (name === 'sfx_scatter_win_v2') {
				// Use custom bonus trigger sound
				if (bonusTriggerHowl && stateSound.volumeValueSoundEffect > 0) {
					bonusTriggerHowl.play();
				}
			} else if (name === 'jng_intro_fs') {
				// Block this sound - we're using custom bonus trigger instead
				return;
			} else if (name.startsWith('sfx_reel_stop_')) {
				// Replace template reel stop sounds with custom reel land sounds
				if (reelLandHowls.length > 0 && stateSound.volumeValueSoundEffect > 0) {
					// Get the reel number from the sound name (sfx_reel_stop_1 -> 0, etc)
					const reelIndex = parseInt(name.replace('sfx_reel_stop_', '')) - 1;
					// Use the corresponding reel land sound, or random if index is out of bounds
					const soundIndex = reelIndex >= 0 && reelIndex < reelLandHowls.length
						? reelIndex
						: Math.floor(Math.random() * reelLandHowls.length);
					reelLandHowls[soundIndex].play();
				}
			} else {
				// Let all other sounds play from audio sprite
				sound.players.once.play({ name, forcePlay });
			}
		},
		soundStop: ({ name }) => {
			// Stop custom transition sound
			if (name === 'transition' && transitionHowl) {
				transitionHowl.stop();
			} else {
				// Stop audio sprite sounds
				sound.stop({ name });
			}
		},
		soundFade: async ({ name, duration, from, to }) => {
			if (name !== 'bgm_main' && name !== 'bgm_freespin') {
				await sound.fade({ name, duration, from, to });
			}
		},
		soundSkibidiLaser: () => {
			// Play skibidi toilet laser sound
			if (skibidiToiletLaserHowl && stateSound.volumeValueSoundEffect > 0) {
				skibidiToiletLaserHowl.play();
			}
		},
		soundTransition: () => {
			// Play transition sound
			console.log('soundTransition event received');
			console.log('transitionHowl:', transitionHowl);
			console.log('volumeValueSoundEffect:', stateSound.volumeValueSoundEffect);
			console.log('AudioContext state:', Howler.ctx?.state);
			ensureAudioContext();
			console.log('AudioContext state after resume:', Howler.ctx?.state);
			if (transitionHowl && stateSound.volumeValueSoundEffect > 0) {
				console.log('Attempting to play transition sound');
				transitionHowl.play();
			} else if (!transitionHowl) {
				console.log('transitionHowl not initialized');
			} else if (stateSound.volumeValueSoundEffect <= 0) {
				console.log('Sound effects volume is 0 or muted');
			}
		},
	});
</script>
