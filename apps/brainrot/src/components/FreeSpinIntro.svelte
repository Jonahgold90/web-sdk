<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { CanvasSizeRectangle, OnPressFullScreen } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';
	import { Text, SpineProvider, SpineSlot, SpineTrack, SpineEventEmitterProvider, Container } from 'pixi-svelte';
	import { OnHotkey } from 'components-shared';

	import { getContext } from '../game/context';

	type AnimationName = 'brbo_banner_in' | 'brbo_banner_loop' | 'brbo_banner_out';

	const context = getContext();
	const canvasSize = $derived(context.stateLayoutDerived.canvasSizes());

	let show = $state(false);
	let animationName = $state<AnimationName>('brbo_banner_in');
	let freeSpinsFromEvent = $state(0);
	let oncomplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinIntroShow: () => {
			show = true;
			animationName = 'brbo_banner_in';
		},
		freeSpinIntroHide: () => {
			animationName = 'brbo_banner_out';
		},
		freeSpinIntroUpdate: async (emitterEvent) => {
			freeSpinsFromEvent = emitterEvent.totalFreeSpins;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});
</script>

<FadeContainer {show} oncomplete={() => { if (!show) animationName = 'brbo_banner_in'; }}>
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
						anchor={{ x: 0.5, y: 0.5 }}
						text={`${freeSpinsFromEvent} FREE SPINS`}
						style={{
							fontFamily: 'Darling Coffee',
							fontSize: 150,
							fill: 0xFFFFFF,
							align: 'center'
						}}
					/>
				</SpineSlot>
			</SpineEventEmitterProvider>
		</SpineProvider>
	</Container>

	<OnHotkey hotkey="Space" onpress={() => oncomplete()} />
	<OnPressFullScreen onpress={() => oncomplete()} />
</FadeContainer>
