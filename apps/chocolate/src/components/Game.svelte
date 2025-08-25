<script lang="ts">
	import { onMount } from 'svelte';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App, Text, REM } from 'pixi-svelte';
	import { stateModal, stateBet } from 'state-shared';

	import { UI, UiGameName } from 'components-ui-pixi';
	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import Background from './Background.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import Board from './Board.svelte';
	import Anticipations from './Anticipations.svelte';
	import Win from './Win.svelte';
	import FreeSpinIntro from './FreeSpinIntro.svelte';
	import FreeSpinCounter from './FreeSpinCounter.svelte';
	import FreeSpinOutro from './FreeSpinOutro.svelte';
	import BonusLevelFrames from './BonusLevelFrames.svelte';
	import RetrigPopup from './RetrigPopup.svelte';
	import Transition from './Transition.svelte';
	import I18nTest from './I18nTest.svelte';
	import ControlBar from './ControlBar.svelte';
	import BuyButton from './BuyButton.svelte';
	import XBetButton from './XBetButton.svelte';
	import BuyConfirmation from './BuyConfirmation.svelte';

	const context = getContext();

	onMount(() => (context.stateLayout.showLoadingScreen = true));

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
		hotKey: (event) => {
			if (event.key === 'Space' && event.action === 'keyDown') {
				console.log('Spacebar pressed - triggering spin');
				// Use the same handlePlay function
				handlePlay();
			}
		},
	});

	// Control bar handlers
	const handlePlay = () => {
		console.log('Broadcasting bet event');
		context.eventEmitter.broadcast({ type: 'bet' });
	};

	const handleGameInfo = () => {
		stateModal.modal = { name: 'gameRules' };
	};
</script>

<App>
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />
	<EnablePixiExtension />

	<Background />

	{#if context.stateLayout.showLoadingScreen}
		<LoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
	{:else}
		<ResumeBet />
		<!--
			The reason why <Sound /> is rendered after clicking the loading screen:
			"Autoplay with sound is allowed if: The user has interacted with the domain (click, tap, etc.)."
			Ref: https://developer.chrome.com/blog/autoplay
		-->
		<Sound />

		<MainContainer>
			<BoardFrame />
		</MainContainer>

		<MainContainer>
			<Board />
			<Anticipations />
		</MainContainer>

		<!-- Old UI replaced by ControlBar
		<UI>
			{#snippet gameName()}
				<UiGameName name="LINES GAME" />
			{/snippet}
			{#snippet logo()}
				<Text
					anchor={{ x: 1, y: 0 }}
					text="ADD YOUR LOGO"
					style={{
						fontFamily: 'proxima-nova',
						fontSize: REM * 1.5,
						fontWeight: '600',
						lineHeight: REM * 2,
						fill: 0xffffff,
					}}
				/>
			{/snippet}
		</UI>
		-->
		<Win />
		<FreeSpinIntro />
		<RetrigPopup />
		<FreeSpinCounter />
		<BonusLevelFrames />
		<FreeSpinOutro />
		<Transition />
		<BuyButton />
		<XBetButton />
		<BuyConfirmation />

		<I18nTest />

		<!-- Control Bar -->
		<ControlBar 
			onPlay={handlePlay}
			onGameInfo={handleGameInfo}
		/>
	{/if}
</App>

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.0" />
	{/snippet}
</Modals>
