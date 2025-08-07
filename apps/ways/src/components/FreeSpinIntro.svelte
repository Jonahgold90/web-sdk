<script lang="ts" module>
	export type EmitterEventFreeSpinIntro =
		| { type: 'freeSpinIntroShow' }
		| { type: 'freeSpinIntroHide' }
		| { type: 'freeSpinIntroUpdate'; totalFreeSpins: number };
</script>

<script lang="ts">
	import { CanvasSizeRectangle } from 'components-layout';
	import { stateUrlDerived } from 'state-shared';
	import { FadeContainer } from 'components-pixi';
	import { waitForResolve } from 'utils-shared/wait';
	import { BitmapText, Container, Sprite } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import PressToContinue from './PressToContinue.svelte';
	import FreeSpinAnimation from './FreeSpinAnimation.svelte';

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

	const BG_WIDTH = 920;
	const BG_HEIGHT = 720;

</script>



<FadeContainer {show}>
	<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />

	<FreeSpinAnimation>
		{#snippet children({ sizes })}
			<!-- Center the whole frame -->
			<Container
				x={sizes.width / 2}
				y={sizes.height / 2}
				pivot={{ x: BG_WIDTH / 2, y: BG_HEIGHT / 2 }}
			>

	
				<!-- Overlay content relative to background size -->
				<Container>
					<!-- Header Text -->
					<Sprite
						anchor={{ x: 0.5, y: 1.2 }}
						width={350}
						height={156}
						key="freespins_en.png"
						x={BG_WIDTH / 2}
						y={BG_HEIGHT * 0.55}
					/>
	
					<!-- Free spin count -->
					<BitmapText
						anchor={{ x: 0.5, y: 0.5 }}
						text={freeSpinsFromEvent}
						style={{
							fontFamily: 'Cinzel-Black',
							fontSize: 90, // tune as needed
							fontWeight: 'bold',
						}}
						x={BG_WIDTH / 2}
						y={BG_HEIGHT / 2 + 35}
					/>
	
					<!-- Bottom label -->
					<Sprite
						anchor={{ x: 0.5, y: 0 }}
						width={183}
						height={42}
						key="freespins.png"
						x={BG_WIDTH / 2}
						y={BG_HEIGHT * 0.63}
					/>
				</Container>
			</Container>
		{/snippet}
	</FreeSpinAnimation>
	

	<PressToContinue onpress={() => oncomplete()} />
</FadeContainer>
