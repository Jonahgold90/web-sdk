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

	// --- Custom: Direct MP3 background music logic ---
	let skyvaultMusicHowl: Howl | null = null;
	
	// Calculate music volume from state values
	function getMusicVolume() {
		const masterVolume = stateSound.volumeValueMaster / 100;
		const musicVolume = stateSound.volumeValueMusic / 100;
		// Scale down the maximum volume to 60% to make it less loud at 100%
		const volumeScale = 0.5;
		return masterVolume * musicVolume * volumeScale;
	}
	
	// Reactive effect to update background music volume when sound settings change
	$effect(() => {
		// Explicitly reference both values to ensure reactivity
		const masterVol = stateSound.volumeValueMaster;
		const musicVol = stateSound.volumeValueMusic;
		
		if (skyvaultMusicHowl) {
			const musicVolume = getMusicVolume();
			console.log('Updating background music volume:', musicVolume, 'master:', masterVol, 'music:', musicVol);
			skyvaultMusicHowl.volume(musicVolume);
		}
	});
	
	function playSkyvaultMusic() {
		if (skyvaultMusicHowl) {
			// If already playing, do nothing
			if (skyvaultMusicHowl.playing()) return;
			// If not playing, just play it
			skyvaultMusicHowl.play();
			return;
		}
		skyvaultMusicHowl = new Howl({
			src: ['./assets/audio/skyvault_fantasy_bg_music.mp3'],
			loop: true,
			volume: getMusicVolume(), // Use the calculated music volume
		});
		skyvaultMusicHowl.play();
	}
	function stopSkyvaultMusic() {
		if (skyvaultMusicHowl) {
			skyvaultMusicHowl.stop();
			skyvaultMusicHowl.unload();
			skyvaultMusicHowl = null;
		}
	}
	// --- End custom ---

	context.eventEmitter.subscribeOnMount({
		// ui
		soundBetMode: async ({ betModeKey }) => {
			if (betModeKey === 'SUPERSPIN') {
				sound.players.once.play({ name: 'sfx_winlevel_end' });
				await waitForTimeout(SECOND);
				playSkyvaultMusic();
			} else {
				playSkyvaultMusic();
			}
		},
		soundPressGeneral: () => sound.players.once.play({ name: 'sfx_btn_general' }),
		soundPressBet: () => sound.players.once.play({ name: 'sfx_btn_spin' }),
		// scatterCounter
		soundScatterCounterIncrease: () => (context.stateGame.scatterCounter = context.stateGame.scatterCounter + 1), // prettier-ignore
		soundScatterCounterClear: () => (context.stateGame.scatterCounter = 0),
		// game
		soundMusic: ({ name }) => {
			if (name === 'bgm_main' || name === 'bgm_freespin') {
				playSkyvaultMusic();
			} else {
				sound.players.music.play({ name });
			}
		},
		soundLoop: ({ name }) => sound.players.loop.play({ name }),
		soundOnce: ({ name, forcePlay }) => sound.players.once.play({ name, forcePlay }),
		soundStop: ({ name }) => {
			if ((name === 'bgm_main' || name === 'bgm_freespin') && skyvaultMusicHowl) {
				stopSkyvaultMusic();
			} else {
				sound.stop({ name });
			}
		},
		soundFade: async ({ name, duration, from, to }) => {
			if ((name === 'bgm_main' || name === 'bgm_freespin') && skyvaultMusicHowl) {
				skyvaultMusicHowl.fade(from, to, duration);
			} else {
				await sound.fade({ name, duration, from, to });
			}
		},
	});

	onMount(() => {
		if (stateBet.activeBetModeKey === 'SUPERSPIN') {
			playSkyvaultMusic();
		} else {
			playSkyvaultMusic();
			//How to control volume per soundfile(use fade)
			// sound.players.music.fade({ name: 'bgm_main', from: 0, to: 1, duration: 2000 });
			//How to control rate per soundfile
			// sound.players.music.rate({ rate: 2, name: 'bgm_main'}); // change play back rate(1: default, 0: slow, 1+ fasterm and higher pitch )
		}
	});
</script>
