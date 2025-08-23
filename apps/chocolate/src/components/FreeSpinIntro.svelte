<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { waitForResolve } from 'utils-shared/wait';
	import { getContext } from '../game/context';
	import PressToContinue from './PressToContinue.svelte';
	import ContinueButton from './ContinueButton.svelte';
	
	// Use the URL approach for static assets
	const BonusScreenIntro = new URL('../../assets/sprites/freeSpinIntro/Bonus_Screen_Intro.png', import.meta.url).href;

	const context = getContext();

	let show = $state(false);
	let freeSpinsFromEvent = $state(0);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => (show = true),
		freeSpinIntroHide: () => (show = false),
		freeSpinIntroUpdate: async (emitterEvent) => {
			freeSpinsFromEvent = emitterEvent.totalFreeSpins;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

{#if show}
	<div 
		style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; cursor: pointer;"
		onclick={() => oncomplete()}
	>
		<div style="text-align: center;">
			<img 
				src={BonusScreenIntro} 
				alt="Free Spins Bonus" 
				style="max-width: 80vw; max-height: 60vh; width: auto; height: auto; margin: 0; display: block;"
			/>
			<ContinueButton onclick={() => oncomplete()} />
		</div>
	</div>
{/if}
