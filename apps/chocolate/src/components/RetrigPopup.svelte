<script lang="ts" module>
	export type EmitterEventRetrigPopup =
		| { type: 'retrigPopupShow' }
		| { type: 'retrigPopupHide' }
		| { type: 'retrigPopupUpdate'; retrigCount: number; extraSpins: number };
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { getContext } from '../game/context';
	
	const context = getContext();

	let show = $state(false);
	let retrigCount = $state(1);
	let extraSpins = $state(0);
	let oncomplete = $state(() => {});

	// Use the URL approach for static assets
	const extraSpinsImage1 = new URL('../../assets/sprites/extraSpins/Bonus_Extra_Spins_v01.png', import.meta.url).href;
	const extraSpinsImage3 = new URL('../../assets/sprites/extraSpins/Bonus_Extra_Spins_x3_v01.png', import.meta.url).href;
	const extraSpinsImage10 = new URL('../../assets/sprites/extraSpins/Bonus_Extra_Spins_x10_v01.png', import.meta.url).href;

	// Map retrig count to image paths
	const getRetrigImagePath = (count: number) => {
		switch (count) {
			case 1:
				return extraSpinsImage1;
			case 2:
				return extraSpinsImage3;
			case 3:
			default:
				return extraSpinsImage10;
		}
	};

	const currentImagePath = $derived(getRetrigImagePath(retrigCount));

	context.eventEmitter.subscribeOnMount({
		retrigPopupShow: () => (show = true),
		retrigPopupHide: () => (show = false),
		retrigPopupUpdate: async (emitterEvent) => {
			retrigCount = emitterEvent.retrigCount;
			extraSpins = emitterEvent.extraSpins;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

{#if show}
	<div 
		style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 15vh; cursor: pointer;"
		onclick={() => oncomplete()}
	>
		<div style="text-align: center;">
			<img 
				src={currentImagePath} 
				alt="Extra Spins Retrig" 
				style="max-width: 80vw; max-height: 60vh; width: auto; height: auto;"
			/>
			<div style="color: white; margin-top: 20px; font-family: Arial, sans-serif; font-size: 18px;">
				Click anywhere to continue
			</div>
		</div>
	</div>
{/if}