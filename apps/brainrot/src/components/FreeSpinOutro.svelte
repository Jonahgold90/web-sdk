<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventFreeSpinOutro =
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { SpineProvider, SpineTrack, SpineSlot, SpineEventEmitterProvider, Container, Text } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { waitForResolve } from 'utils-shared/wait';
	import { CanvasSizeRectangle } from 'components-layout';
	import { OnMount } from 'components-shared';

	import { getContext } from '../game/context';
	import PressToContinue from './PressToContinue.svelte';

	type AnimationName = 'brbo_banner_in' | 'brbo_banner_loop' | 'brbo_banner_out';

	const context = getContext();
	const canvasSize = $derived(context.stateLayoutDerived.canvasSizes());

	let show = $state(true);
	let animationName = $state<AnimationName>('brbo_banner_in');
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => {
			show = true;
			animationName = 'brbo_banner_in';
		},
		freeSpinOutroHide: async () => {
			animationName = 'brbo_banner_out';
		},
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<FadeContainer {show} oncomplete={() => { if (!show) animationName = 'brbo_banner_in'; }}>
	{#if winLevelData}
		{@const duration = winLevelData.presentDuration}
		<WinCountUpProvider {amount} {duration} oncomplete={() => onCountUpComplete()}>
			{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
				<OnMount onmount={() => startCountUp()} />

				<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />

				<Container x={canvasSize.width / 2} y={canvasSize.height / 2}>
					<SpineProvider key="freeSpinIntroOutro" width={canvasSize.width * 0.25}>
						<SpineTrack
							trackIndex={0}
							{animationName}
							loop={animationName === 'brbo_banner_loop'}
							listener={{
								complete: (entry) => {
									if (entry.animation?.name === 'brbo_banner_in') {
										animationName = 'brbo_banner_loop';
									} else if (entry.animation?.name === 'brbo_banner_out') {
										show = false;
									}
								},
							}}
						/>
						<SpineEventEmitterProvider>
							<SpineSlot slotName="frame">
								<Text
									text={bookEventAmountToCurrencyString(countUpAmount)}
									anchor={{ x: 0.5, y: 0.5 }}
									style={{
										fontFamily: 'Darling Coffee',
										fontSize: 200,
										fill: 0xFFFFFF,
										align: 'center'
									}}
								/>
							</SpineSlot>
						</SpineEventEmitterProvider>
					</SpineProvider>
				</Container>

				<PressToContinue onpress={() => (countUpCompleted ? oncomplete() : finishCountUp())} />
			{/snippet}
		</WinCountUpProvider>
	{/if}
</FadeContainer>
