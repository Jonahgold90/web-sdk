<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventFreeSpinOutro =
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { waitForResolve } from 'utils-shared/wait';
	import { getContext } from '../game/context';
	
	// Use the URL approach for static assets
	const BonusScreenOutro = new URL('../../assets/sprites/freeSpinOutro/Bonus_Screen_Outro.png', import.meta.url).href;
	const BonusScreenOutroText = new URL('../../assets/sprites/freeSpinOutro/bonusGame_winScreen_txt.png', import.meta.url).href;

	const context = getContext();

	let show = $state(false);
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => (show = true),
		freeSpinOutroHide: () => (show = false),
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

{#if show}
	<div 
		style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; cursor: pointer;"
		onclick={() => oncomplete()}
	>
		<div style="text-align: center; position: relative;">
			<img 
				src={BonusScreenOutro} 
				alt="Free Spins Outro" 
				style="max-width: 80vw; max-height: 60vh; width: auto; height: auto;"
			/>
			
			<!-- Text overlay image -->
			<img 
				src={BonusScreenOutroText} 
				alt="Congratulations Text" 
				style="position: absolute; top: 10%; left: 50%; transform: translateX(-50%); max-width: 80%; width: auto; height: auto; z-index: 2;"
			/>
			
			<!-- Win amount positioned over the background -->
			{#if amount > 0}
				<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #FFD700; font-family: 'Arial Black', Arial, sans-serif; font-size: 3vw; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); z-index: 3;">
					{bookEventAmountToCurrencyString(amount)}
				</div>
			{/if}
			
			<div style="color: white; margin-top: 20px; font-family: Arial, sans-serif; font-size: 18px;">
				Click anywhere to continue
			</div>
		</div>
	</div>
{/if}
