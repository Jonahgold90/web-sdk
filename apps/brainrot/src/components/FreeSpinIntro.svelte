<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { CanvasSizeRectangle } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';
	import { BitmapText, SpineProvider, SpineSlot, SpineTrack, SpineEventEmitterProvider, Container } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import PressToContinue from './PressToContinue.svelte';

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
				<SpineSlot slotName="place_holder__free_spin">
					<BitmapText
						anchor={{ x: 0.5, y: 0.5 }}
						text={freeSpinsFromEvent}
						style={{
							fontFamily: 'gold',
							fontSize: canvasSize.width * 0.05,
							fontWeight: 'bold',
						}}
					/>
				</SpineSlot>
			</SpineEventEmitterProvider>
		</SpineProvider>
	</Container>

	<PressToContinue onpress={() => oncomplete()} />
</FadeContainer>
