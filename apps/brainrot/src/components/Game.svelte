<script lang="ts">
	import { onMount } from 'svelte';

	import { EnablePixiExtension } from 'components-pixi';
	import { EnableHotkey } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { GameVersion } from 'components-ui-html';

	import { getContext } from '../game/context';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import Background from './Background.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import TumbleFrame from './TumbleFrame.svelte';
	import MultiplierGrid from './MultiplierGrid.svelte';
	import Board from './Board.svelte';
	import Anticipations from './Anticipations.svelte';
	import ClusterWinAmounts from './ClusterWinAmounts.svelte';
	import TumbleBoard from './TumbleBoard.svelte';
	import TumbleWinAmount from './TumbleWinAmount.svelte';
	import GlobalMultiplier from './GlobalMultiplier.svelte';
	import BuyButtonPopup from './BuyButtonPopup.svelte';
	import SkibidiToilet from './SkibidiToilet.svelte';
	import TungTung from './TungTung.svelte';
	import Win from './Win.svelte';
	import FreeSpinIntro from './FreeSpinIntro.svelte';
	import FreeSpinOutro from './FreeSpinOutro.svelte';
	import Transition from './Transition.svelte';
	import UIOverlay from './UIOverlay.svelte';
	import VolumeControl from './VolumeControl.svelte';
	import ModalPayTable from './ModalPayTable.svelte';

	const context = getContext();

	onMount(() => (context.stateLayout.showLoadingScreen = true));

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});
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
			<TumbleFrame />
		</MainContainer>

		<MainContainer>
			<MultiplierGrid />
		</MainContainer>

		<MainContainer>
			<Board />
			<Anticipations />
			<!-- TumbleWinAmount moved to UIOverlay control bar -->
			<GlobalMultiplier />
		</MainContainer>

		<MainContainer>
			<TumbleBoard />
			<ClusterWinAmounts />
		</MainContainer>

		<!-- Character spines - hidden on mobile as they get cut off at screen edges -->
		{#if !context.stateLayoutDerived.isStacked()}
			<MainContainer>
				<SkibidiToilet />
				<TungTung />
			</MainContainer>
		{/if}

		<MainContainer>
			<BuyButtonPopup />
		</MainContainer>

		<Win />
		<FreeSpinIntro />
		<FreeSpinOutro />
		<Transition />

		<!-- Custom UI Overlay -->
		<UIOverlay />

		<!-- Volume Control Panel -->
		<VolumeControl />
	{/if}
</App>

<!-- Brainrot-specific PayTable Modal -->
<ModalPayTable />
