<script lang="ts" module>
	import { sound, type MusicName, type SoundEffectName, type SoundName } from '../game/sound';

	export type EmitterEventSound =
		| { type: 'soundMusic'; name: MusicName }
		| { type: 'soundOnce'; name: SoundEffectName; forcePlay?: boolean }
		| { type: 'soundLoop'; name: SoundEffectName }
		| { type: 'soundStop'; name: SoundName }
		| { type: 'soundFade'; name: SoundName; from: number; to: number; duration: number }
		| { type: 'soundScatterCounterIncrease' }
		| { type: 'soundScatterCounterClear' };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';

	import { waitForTimeout } from 'utils-shared/wait';
	import { SECOND } from 'constants-shared/time';
	import { stateBet, stateSound } from 'state-shared';

	import { getContext } from '../game/context';

	const context = getContext();

	let baseMusicHowl: Howl;
	let bonusMusicHowl: Howl;
	let currentMusicHowl: Howl | null = null;

	// Calculate actual volume based on master and music settings
	const calculateVolume = () => {
		const masterVolume = stateSound.volumeValueMaster / 100; // 0-1
		const musicVolume = stateSound.volumeValueMusic / 100; // 0-1
		return masterVolume * musicVolume * 0.3; // 0.3 base volume for music
	};

	// Create the music instances once when component loads
	onMount(() => {
		baseMusicHowl = new Howl({
			src: ['./assets/audio/music/Main game loop.mp3'],
			loop: true,
			volume: calculateVolume()
		});

		bonusMusicHowl = new Howl({
			src: ['./assets/audio/music/Bonus game loop 1.mp3'],
			loop: true,
			volume: calculateVolume()
		});

		// Start with base game music
		currentMusicHowl = baseMusicHowl;
		baseMusicHowl.play();
	});

	// Volume control based on master volume and music toggle
	$effect(() => {
		const volume = calculateVolume();
		if (baseMusicHowl) {
			baseMusicHowl.volume(volume);
		}
		if (bonusMusicHowl) {
			bonusMusicHowl.volume(volume);
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
		soundPressBet: () => sound.players.once.play({ name: 'sfx_btn_spin' }),
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		// game - just ignore bgm calls since our music is always running
		soundMusic: ({ name }) => {
			if (name !== 'bgm_main' && name !== 'bgm_freespin') {
				sound.players.music.play({ name });
			}
		},
		soundLoop: ({ name }) => sound.players.loop.play({ name }),
		soundOnce: ({ name, forcePlay }) => sound.players.once.play({ name, forcePlay }),
		soundStop: ({ name }) => sound.stop({ name }),
		soundFade: async ({ name, duration, from, to }) => {
			if (name !== 'bgm_main' && name !== 'bgm_freespin') {
				await sound.fade({ name, duration, from, to });
			}
		},
	});
</script>
