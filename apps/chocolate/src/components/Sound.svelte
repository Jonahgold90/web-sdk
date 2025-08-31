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
	let clickSoundHowl: Howl;
	let cwLandingSoundHowl: Howl;
	let currentMusicHowl: Howl | null = null;

	// Create the music and click sound instances once when component loads
	onMount(() => {
		baseMusicHowl = new Howl({
			src: ['./assets/audio/candy_crypt_base_bg_music.mp3'],
			loop: true,
			volume: stateSound.volumeValueMusic > 0 ? 0.2 : 0
		});

		bonusMusicHowl = new Howl({
			src: ['./assets/audio/candy_crypt_bg_music.mp3'],
			loop: true,
			volume: stateSound.volumeValueMusic > 0 ? 0.2 : 0
		});

		// Start with base game music
		currentMusicHowl = baseMusicHowl;
		baseMusicHowl.play();

		clickSoundHowl = new Howl({
			src: ['./assets/audio/Candy_Crypt_click.mp3'],
			volume: stateSound.volumeValueSoundEffect > 0 ? 0.2 : 0
		});

		cwLandingSoundHowl = new Howl({
			src: ['./assets/audio/Candy_Crypt_CW_landing02.mp3'],
			volume: stateSound.volumeValueSoundEffect > 0 ? 0.3 : 0
		});
	});

	// Simple volume control based on toggle state
	$effect(() => {
		if (baseMusicHowl) {
			baseMusicHowl.volume(stateSound.volumeValueMusic > 0 ? 0.2 : 0);
		}
		if (bonusMusicHowl) {
			bonusMusicHowl.volume(stateSound.volumeValueMusic > 0 ? 0.2 : 0);
		}
		if (clickSoundHowl) {
			clickSoundHowl.volume(stateSound.volumeValueSoundEffect > 0 ? 0.2 : 0);
		}
		if (cwLandingSoundHowl) {
			cwLandingSoundHowl.volume(stateSound.volumeValueSoundEffect > 0 ? 0.3 : 0);
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
		soundPressGeneral: () => {
			if (clickSoundHowl && stateSound.volumeValueSoundEffect > 0) {
				clickSoundHowl.play();
			}
		},
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
		soundOnce: ({ name, forcePlay }) => {
			if (name === 'sfx_ui_click') {
				// Use custom click sound
				if (clickSoundHowl && stateSound.volumeValueSoundEffect > 0) {
					clickSoundHowl.play();
				}
			} else {
				sound.players.once.play({ name, forcePlay });
			}
		},
		soundStop: ({ name }) => sound.stop({ name }),
		soundFade: async ({ name, duration, from, to }) => {
			if (name !== 'bgm_main' && name !== 'bgm_freespin') {
				await sound.fade({ name, duration, from, to });
			}
		},
		// CW landing sound - play when symbols are revealed on reels
		boardReveal: ({ board }) => {
			// Check if any CW symbols landed on the board
			const hasCW = board.some(reel => reel.some(symbol => symbol.name === 'CW'));
			if (hasCW && cwLandingSoundHowl && stateSound.volumeValueSoundEffect > 0) {
				cwLandingSoundHowl.play();
			}
		},
	});

	onMount(() => {
		// Music is already created and playing in onMount, nothing needed here
	});
</script>
