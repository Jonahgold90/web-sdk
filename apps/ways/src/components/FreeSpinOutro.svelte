<script lang="ts" module>
	import type { WinLevelData } from '../game/winLevelMap';

	export type EmitterEventFreeSpinOutro =
		| { type: 'freeSpinOutroShow' }
		| { type: 'freeSpinOutroHide' }
		| { type: 'freeSpinOutroCountUp'; amount: number; winLevelData: WinLevelData };
</script>

<script lang="ts">
	import { Sprite, Container, BitmapText } from 'pixi-svelte';
	import { FadeContainer, WinCountUpProvider } from 'components-pixi';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { waitForResolve } from 'utils-shared/wait';
	import { CanvasSizeRectangle } from 'components-layout';
	import { OnMount } from 'components-shared';
	import { stateUrlDerived } from 'state-shared';

	import { getContext } from '../game/context';
	import FreeSpinAnimation from './FreeSpinAnimation.svelte';
	import PressToContinue from './PressToContinue.svelte';
	import WinCoins from './WinCoins.svelte';

	type AnimationName = 'intro' | 'idle';

	const context = getContext();

	let show = $state(true);
	let animationName = $state<AnimationName>('intro');
	let amount = $state(0);
	let winLevelData = $state<WinLevelData>();
	let oncomplete = $state(() => {});
	let onCountUpComplete = $state(() => {});

	context.eventEmitter.subscribeOnMount({
		freeSpinOutroShow: () => (show = true),
		freeSpinOutroHide: async () => (show = false),
		freeSpinOutroCountUp: async (emitterEvent) => {
			amount = emitterEvent.amount;
			winLevelData = emitterEvent.winLevelData;
			await waitForResolve((resolve) => (oncomplete = resolve));
		},
	});

	const BG_WIDTH = 920;
	const BG_HEIGHT = 720;
</script>

<FadeContainer {show}>
	{#if winLevelData}
		{@const duration = winLevelData.presentDuration}
		{@const isBigWin = winLevelData.type === 'big'}
		<WinCountUpProvider {amount} {duration} oncomplete={() => onCountUpComplete()}>
			{#snippet children({ countUpAmount, startCountUp, finishCountUp, countUpCompleted })}
				<OnMount onmount={() => startCountUp()} />

				<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />

				<FreeSpinAnimation>
					{#snippet children({ sizes })}
						<Container
							x={sizes.width / 2}
							y={sizes.height / 2}
							pivot={{ x: BG_WIDTH / 2, y: BG_HEIGHT / 2 }}
						>
							<!-- Header Text -->
							<Sprite
								anchor={{ x: 0.5, y: 1.2 }}
								width={350}
								height={156}
								key="freespins_en.png"
								x={BG_WIDTH / 2}
								y={BG_HEIGHT * 0.55}
							/>

							<!-- Win amount -->
							<BitmapText
								anchor={{ x: 0.5, y: 0.5 }}
								text={bookEventAmountToCurrencyString(countUpAmount)}
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
								key="totalwin.png"
								x={BG_WIDTH / 2}
								y={BG_HEIGHT * 0.63}
							/>
						</Container>
					{/snippet}
				</FreeSpinAnimation>

				<WinCoins emit={!countUpCompleted} levelAlias={winLevelData?.alias} />

				<PressToContinue onpress={() => (countUpCompleted ? oncomplete() : finishCountUp())} />
			{/snippet}
		</WinCountUpProvider>
	{/if}
</FadeContainer>
