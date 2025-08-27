<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventWin =
		| { type: 'winShow' }
		| { type: 'winHide' }
		| { type: 'winUpdate'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { Container } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider, ResponsiveBitmapText } from 'components-pixi';
	import { waitForResolve, waitForTimeout } from 'utils-shared/wait';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { CanvasSizeRectangle, MainContainer } from 'components-layout';
	import { OnMount } from 'components-shared';
	import { onMount } from 'svelte';

	import WinCoins from './WinCoins.svelte';
	import WinAnimation from './WinAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getContext } from '../game/context';

	const context = getContext();

	let show = $state(false);
	
	// Debug show state
	// $effect(() => {
	// 	console.log('Win component show state changed:', show);
	// });
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});
	let skipAnimation = $state<(() => void) | null>(null);
	let hasSkipped = $state(false);

	// Add keyboard event listener for spacebar skip
	onMount(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if ((event.code === 'Space' || event.key === ' ') && show && skipAnimation && !hasSkipped) {
				event.preventDefault();
				console.log('Win: Skipping animation via spacebar');
				skipAnimation();
			}
		};

		document.addEventListener('keydown', handleKeyPress);
		
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	});

	context.eventEmitter.subscribeOnMount({
		winShow: () => {
			// console.log('Win component: winShow received');
			show = true;
			hasSkipped = false; // Reset skip state for new win
		},
		winHide: () => {
			// console.log('Win component: winHide received');
			show = false;
		},
		winUpdate: async (emitterEvent) => {
			// console.log('Win component: winUpdate received', emitterEvent);
			// console.log('Win component: winLevelData details:', {
			//	winLevel: emitterEvent.winLevelData?.level,
			//	type: emitterEvent.winLevelData?.type,
			//	hasAnimation: !!emitterEvent.winLevelData?.animation,
			//	animation: emitterEvent.winLevelData?.animation
			// });
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<!-- HTML overlay for reliable click detection -->
{#if show}
	<div 
		class="win-skip-overlay"
		style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; cursor: pointer;"
		onclick={() => {
			// console.log('Win: HTML overlay clicked, skipAnimation available:', !!skipAnimation, 'hasSkipped:', hasSkipped);
			if (skipAnimation && !hasSkipped) {
				// console.log('Win: Skipping animation via HTML overlay click');
				skipAnimation();
			}
		}}
	></div>
{/if}

<FadeContainer {show}>
	{#if winLevelData}
		{@const isBigWin = winLevelData.type === 'big'}
		{@const duration = winLevelData.presentDuration}
		<WinCountUpProvider {amount} {duration} oncomplete={() => onCountUpComplete()}>
			{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
				{#if isBigWin}
					<CanvasSizeRectangle 
						backgroundColor={0x000000} 
						backgroundAlpha={0.5}
						interactive={true}
						onclick={() => {
							// console.log('Win: Background clicked, skipAnimation available:', !!skipAnimation, 'hasSkipped:', hasSkipped);
							if (skipAnimation && !hasSkipped) {
								// console.log('Win: Skipping animation via click on background');
								skipAnimation();
							}
						}}
					/>
				{/if}

				<OnMount
					onmount={async () => {
						// Set up skip function
						// console.log('Win: Setting up skip function');
						skipAnimation = () => {
							if (hasSkipped) return; // Prevent double execution
							hasSkipped = true;
							// console.log('Win: Fast-forwarding animation - calling finishCountUp and oncomplete');
							finishCountUp();
							oncomplete();
						};
						
						// console.log('Win: Starting normal animation flow');
						await startCountUp();
						// console.log('Win: Count up completed, waiting 300ms');
						await waitForTimeout(300);
						// console.log('Win: Calling oncomplete after timeout');
						oncomplete();
					}}
				/>

				<MainContainer>
					<Container
						x={context.stateGameDerived.boardLayout().x}
						y={context.stateGameDerived.boardLayout().y}
						interactive={true}
						onclick={() => {
							// console.log('Win: Container clicked, skipAnimation available:', !!skipAnimation, 'hasSkipped:', hasSkipped);
							if (skipAnimation && !hasSkipped) {
								// console.log('Win: Skipping animation via click on win text');
								skipAnimation();
							}
						}}
					>
						{#if winLevelData?.animation}
							<WinAnimation animationMap={winLevelData.animation}>
								<ResponsiveBitmapText
									anchor={0.5}
									maxWidth={2130}
									text={bookEventAmountToCurrencyString(countUpAmount)}
									interactive={true}
									style={{
										fontFamily: 'gold',
										fontSize: SYMBOL_SIZE * 3.6,
										align: 'center',
										fontWeight: 'bold',
										letterSpacing: 0,
									}}
								/>
							</WinAnimation>
						{:else}
							<ResponsiveBitmapText
								anchor={0.5}
								maxWidth={context.stateLayoutDerived.canvasSizes().width /
									context.stateLayoutDerived.mainLayout().scale}
								text={bookEventAmountToCurrencyString(countUpAmount)}
								interactive={true}
								style={{
									fontFamily: 'gold',
									fontSize: SYMBOL_SIZE,
									align: 'center',
									fontWeight: 'bold',
									letterSpacing: 0,
								}}
							/>
						{/if}
					</Container>
				</MainContainer>

				<WinCoins emit={!countUpCompleted} levelAlias={winLevelData?.alias} />
			{/snippet}
		</WinCountUpProvider>
	{/if}
</FadeContainer>
