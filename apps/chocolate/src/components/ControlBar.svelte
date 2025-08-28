<script lang="ts">
	import { stateBet, stateBetDerived, stateUi, stateSound, stateConfig, stateModal } from 'state-shared';
	import { i18nDerived } from 'components-ui-pixi/src/i18n/i18nDerived';
	import { stateGame } from '../game/stateGame.svelte';
	import { eventEmitter } from '../game/eventEmitter';
	import { numberToCurrencyString, bookEventAmountToCurrencyString } from 'utils-shared/amount';

	// Icons as simple SVG strings (you can replace with your icon system)
	const MenuIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
	const XIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
	const ChevronUpIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18,15 12,9 6,15"></polyline></svg>`;
	const ChevronDownIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"></polyline></svg>`;
	const RotateCwIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23,4 23,10 17,10"></polyline><path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"></path></svg>`;
	const ZapIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon></svg>`;
	const RefreshCwIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23,4 23,10 17,10"></polyline><path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"></path></svg>`;
	const InfoIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
	const Volume2Icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon><path d="M19.07,4.93A10,10,0,0,1,23,12a10,10,0,0,1-3.93,7.07"></path><path d="M15.54,8.46A5,5,0,0,1,17,12a5,5,0,0,1-1.46,3.54"></path></svg>`;
	const MusicIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9,18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;

	// Props
	interface Props {
		onPlay?: () => void;
		onGameInfo?: () => void;
	}

	const { onPlay = () => {}, onGameInfo = () => {} }: Props = $props();

	// Component state
	let isMenuOpen = $state(false);
	let isAutoSpinMenuOpen = $state(false);

	// Bet levels from config
	const betLevels = stateConfig.betAmountOptions;
	const minBet = Math.min(...betLevels);
	const maxBet = Math.max(...betLevels);

	// Game state derived values
	const isGameActive = $derived(stateGame.gameType === 'freegame' || stateBet.autoSpinsCounter > 0);
	const canPlay = $derived(!isGameActive && stateBet.betAmount > 0 && stateBet.betAmount <= stateBet.balanceAmount);
	const lastWin = $derived(stateBet.winBookEventAmount);
	const autoSpinRemaining = $derived(stateBet.autoSpinsCounter);
	const isAutoSpinning = $derived(stateBet.autoSpinsCounter > 0);

	// // Debug logging
	// $effect(() => {
	// 	console.log('Control Bar State:', {
	// 		isGameActive,
	// 		canPlay,
	// 		betAmount: stateBet.betAmount,
	// 		betCost: stateBetDerived.betCost(),
	// 		activeBetModeKey: stateBet.activeBetModeKey,
	// 		balanceAmount: stateBet.balanceAmount,
	// 		gameType: stateGame.gameType,
	// 		autoSpinsCounter: stateBet.autoSpinsCounter
	// 	});
	// });

	// Sound click handler
	const playClickSound = () => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_ui_click' });
	};

	// Bet control functions
	const canIncreaseBet = () => {
		const currentIndex = betLevels.findIndex(level => Math.abs(level - stateBet.betAmount) < 0.001);
		let nextBet = null;
		
		if (currentIndex >= 0 && currentIndex < betLevels.length - 1) {
			nextBet = betLevels[currentIndex + 1];
		} else if (currentIndex === -1) {
			nextBet = betLevels.find(level => level > stateBet.betAmount);
		}
		
		return nextBet && nextBet <= stateBet.balanceAmount;
	};

	const increaseBet = () => {
		// console.log('Increase bet clicked!', { isGameActive, currentBet: stateBet.betAmount });
		if (isGameActive) return;
		playClickSound();
		
		const currentIndex = betLevels.findIndex(level => Math.abs(level - stateBet.betAmount) < 0.001);
		let nextBet = null;
		
		if (currentIndex >= 0 && currentIndex < betLevels.length - 1) {
			nextBet = betLevels[currentIndex + 1];
		} else if (currentIndex === -1) {
			nextBet = betLevels.find(level => level > stateBet.betAmount);
		}
		
		if (nextBet && nextBet <= stateBet.balanceAmount) {
			// console.log('Setting bet to:', nextBet);
			stateBetDerived.setBetAmount(nextBet);
		}
	};

	const decreaseBet = () => {
		if (isGameActive) return;
		playClickSound();
		
		const currentIndex = betLevels.findIndex(level => Math.abs(level - stateBet.betAmount) < 0.001);
		
		if (currentIndex > 0) {
			stateBetDerived.setBetAmount(betLevels[currentIndex - 1]);
		} else if (currentIndex === -1) {
			const lowerLevels = betLevels.filter(level => level < stateBet.betAmount);
			if (lowerLevels.length > 0) {
				stateBetDerived.setBetAmount(lowerLevels[lowerLevels.length - 1]);
			}
		}
	};

	const toggleTurbo = () => {
		playClickSound();
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	const toggleAutoSpin = () => {
		// console.log('Toggle auto-spin clicked', { isAutoSpinning });
		playClickSound();
		if (isAutoSpinning) {
			stateBet.autoSpinsCounter = 0;
		} else {
			isAutoSpinMenuOpen = !isAutoSpinMenuOpen;
		}
	};

	const handleAutoSpinSelect = (count: number) => {
		// console.log('Auto-spin count selected:', count);
		playClickSound();
		stateBet.autoSpinsCounter = count;
		isAutoSpinMenuOpen = false;
		// Start auto-betting
		eventEmitter.broadcast({ type: 'autoBet' });
	};

	const toggleMenu = () => {
		// console.log('Menu button clicked!');
		playClickSound();
		isMenuOpen = !isMenuOpen;
	};

	const toggleSound = () => {
		playClickSound();
		stateSound.volumeValueSoundEffect = stateSound.volumeValueSoundEffect > 0 ? 0 : 75;
	};

	const toggleMusic = () => {
		playClickSound();
		stateSound.volumeValueMusic = stateSound.volumeValueMusic > 0 ? 0 : 75;
	};

	const handleInfo = () => {
		playClickSound();
		isMenuOpen = false;
		stateModal.modal = { name: 'payTable' };
	};


	const handlePlayClick = () => {
		// console.log('Play button clicked!', { canPlay, isGameActive });
		playClickSound();
		onPlay();
	};

	// Format currency helper
	const formatCurrency = (amount: number) => {
		return numberToCurrencyString(amount);
	};

	// Format win amount (book event amount to currency)
	const formatWinAmount = (bookEventAmount: number) => {
		return bookEventAmountToCurrencyString(bookEventAmount);
	};
</script>

<div class="control-bar">
	<div class="control-content">
		<!-- Left Section -->
		<div class="left-section">
			<!-- Menu Button with popup -->
			<div class="menu-container">
				<!-- Vertical Menu -->
				{#if isMenuOpen}
					<div class="menu-popup">
						<div class="menu-content">
							<!-- Info Row -->
							<button onclick={handleInfo} class="menu-item">
								<div class="menu-icon">{@html InfoIcon}</div>
								<span>Info</span>
							</button>

							<!-- Sound Row -->
							<button onclick={toggleSound} class="menu-item">
								<div class="menu-icon" class:muted={stateSound.volumeValueSoundEffect === 0}>{@html Volume2Icon}</div>
								<span class:muted={stateSound.volumeValueSoundEffect === 0}>Sound FX</span>
							</button>

							<!-- Music Row -->
							<button onclick={toggleMusic} class="menu-item">
								<div class="menu-icon" class:muted={stateSound.volumeValueMusic === 0}>{@html MusicIcon}</div>
								<span class:muted={stateSound.volumeValueMusic === 0}>Music</span>
							</button>
						</div>
					</div>
				{/if}
				<button onclick={toggleMenu} class="menu-button">
					{#if isMenuOpen}
						<div class="icon">{@html XIcon}</div>
					{:else}
						<div class="icon">{@html MenuIcon}</div>
					{/if}
				</button>
			</div>

			<!-- Balance Display -->
			<div class="balance-section">
				<span class="label">Balance</span>
				<span class="value">{formatCurrency(stateBet.balanceAmount)}</span>
			</div>

			<!-- Win Display -->
			<div class="win-section">
				<span class="label">Win</span>
				<span class="value" class:has-win={lastWin > 0}>{formatWinAmount(lastWin)}</span>
			</div>
		</div>

		<!-- Center Section - Play Button -->
		<button onclick={handlePlayClick} disabled={!canPlay} class="play-button" class:disabled={!canPlay}>
			<div class="play-icon">{@html RotateCwIcon}</div>
		</button>

		<!-- Right Section -->
		<div class="right-section">
			<!-- Bet Controls -->
			<div class="bet-controls">
				<div class="bet-display">
					<span class="label">{i18nDerived.bet()}</span>
					<span class="value">{formatCurrency(stateBetDerived.betCost())}</span>
				</div>
				<div class="bet-buttons">
					<button 
						onclick={increaseBet}
						disabled={isGameActive || stateBet.betAmount >= maxBet || !canIncreaseBet()}
						class="bet-button"
					>
						<div class="bet-icon">{@html ChevronUpIcon}</div>
					</button>
					<button 
						onclick={decreaseBet}
						disabled={isGameActive || stateBet.betAmount <= minBet}
						class="bet-button"
					>
						<div class="bet-icon">{@html ChevronDownIcon}</div>
					</button>
				</div>
			</div>
			
			<!-- Action Buttons -->
			<div class="action-buttons">
				<!-- Auto Spin Button -->
				<div class="auto-spin-container">
					<button 
						onclick={toggleAutoSpin}
						class="action-button auto-spin"
						class:active={isAutoSpinning}
					>
						<div class="action-icon" class:spinning={isAutoSpinning}>{@html RefreshCwIcon}</div>
						{#if isAutoSpinning && autoSpinRemaining > 0}
							<span class="auto-count">{autoSpinRemaining}</span>
						{/if}
					</button>
					
					<!-- Auto Spin Menu -->
					{#if isAutoSpinMenuOpen}
						<div class="auto-spin-menu">
							{#each [10, 25, 50, 100] as count}
								<button onclick={() => handleAutoSpinSelect(count)} class="auto-option">
									{count}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Turbo Button -->
				<button 
					onclick={toggleTurbo}
					class="action-button turbo"
					class:active={stateBet.isTurbo}
				>
					<div class="action-icon">{@html ZapIcon}</div>
				</button>

			</div>
		</div>
	</div>
</div>

<style>
	.control-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		font-weight: bold;
		display: flex;
		justify-content: center;
		pointer-events: auto;
		padding: 0;
	}

	@media (min-width: 640px) {
		.control-bar {
			padding: 0.5rem 1rem;
		}
	}

	.menu-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.menu-popup {
		position: absolute;
		bottom: 100%;
		left: 0;
		margin-bottom: 0.5rem;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(12px);
		border-radius: 0.5rem;
		border: 1px solid rgba(100, 116, 139, 0.5);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		z-index: 60;
		width: 8rem;
		min-width: max-content;
	}

	.menu-content {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
		color: white;
		cursor: pointer;
		font-weight: bold;
		text-align: left;
	}

	.menu-item:hover {
		background: rgba(100, 116, 139, 0.5);
	}

	.menu-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: white;
		transition: color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-icon :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	.menu-icon.muted {
		color: rgb(148, 163, 184);
	}

	.menu-item:hover .menu-icon {
		color: rgb(251, 146, 60);
	}

	.menu-item span.muted {
		color: rgb(148, 163, 184);
	}

	.control-content {
		position: relative;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(12px);
		border-top: 1px solid rgba(100, 116, 139, 0.5);
		border-radius: 0;
		padding: 0.125rem;
		width: 100%;
		max-width: none;
		display: flex;
		align-items: center;
		gap: 0.0625rem;
		justify-content: space-between;
		min-height: 2.5rem;
		overflow: visible;
	}

	@media (min-width: 480px) {
		.control-content {
			padding: 0.75rem 1rem;
			gap: 0.5rem;
		}
	}

	@media (min-width: 640px) {
		.control-content {
			padding: 0.75rem 2rem;
			gap: 2rem;
			justify-content: center;
			border-radius: 0.5rem 0.5rem 0 0;
			max-width: 64rem;
		}
	}

	@media (min-width: 1024px) {
		.control-content {
			padding: 0.75rem 3rem;
			gap: 8rem;
		}
	}

	.left-section,
	.right-section {
		display: flex;
		align-items: center;
		gap: 0.0625rem;
		flex: 1;
		min-width: 0;
	}

	.left-section {
		justify-content: flex-start;
	}

	.right-section {
		justify-content: flex-end;
	}

	@media (min-width: 480px) {
		.left-section,
		.right-section {
			gap: 0.5rem;
		}
	}

	@media (min-width: 640px) {
		.left-section,
		.right-section {
			gap: 1rem;
			flex: initial;
		}
	}

	.menu-button {
		padding: 0.125rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
		cursor: pointer;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.menu-button {
			padding: 0.5rem;
		}
	}

	.menu-button:hover {
		background: rgba(100, 116, 139, 0.5);
	}

	.icon {
		width: 0.875rem;
		height: 0.875rem;
		color: white;
		transition: color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	@media (min-width: 640px) {
		.icon {
			width: 1.5rem;
			height: 1.5rem;
		}
	}

	.menu-button:hover .icon {
		color: rgb(251, 146, 60);
	}

	.balance-section,
	.win-section {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex-shrink: 1;
	}

	.label {
		color: rgb(203, 213, 225);
		font-size: 0.5rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		line-height: 1;
	}

	@media (min-width: 480px) {
		.label {
			font-size: 0.875rem;
		}
	}

	@media (min-width: 640px) {
		.label {
			display: block;
		}
	}

	.value {
		color: white;
		font-size: 0.75rem;
		font-weight: 900;
		white-space: nowrap;
		line-height: 1.1;
	}

	@media (min-width: 480px) {
		.value {
			font-size: 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.value {
			font-size: 1.25rem;
		}
	}

	@media (min-width: 1024px) {
		.value {
			font-size: 1.5rem;
		}
	}

	.value.has-win {
		color: rgb(34, 197, 94);
	}

	.play-button {
		position: relative;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		transform: scale(1);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		background: rgb(71, 85, 105);
		border: none;
		cursor: pointer;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.play-button {
			width: 3.5rem;
			height: 3.5rem;
		}
	}

	@media (min-width: 1024px) {
		.play-button {
			width: 4rem;
			height: 4rem;
		}
	}

	.play-button:not(.disabled):hover {
		background: rgb(100, 116, 139);
		transform: scale(1.05);
	}

	.play-button:not(.disabled):active {
		transform: scale(0.95);
	}

	.play-button.disabled {
		background: rgb(30, 41, 59);
		cursor: not-allowed;
	}

	.play-button::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid transparent;
		transition: all 0.2s;
	}

	.play-button:not(.disabled):hover::before {
		border-color: rgba(255, 255, 255, 0.5);
	}

	.play-icon {
		width: 0.875rem;
		height: 0.875rem;
		color: white;
		transition: color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.play-icon :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	@media (min-width: 640px) {
		.play-icon {
			width: 1.75rem;
			height: 1.75rem;
		}
	}

	@media (min-width: 1024px) {
		.play-icon {
			width: 2rem;
			height: 2rem;
		}
	}

	.play-button:not(.disabled):hover .play-icon {
		color: rgb(251, 146, 60);
	}

	.play-button.disabled .play-icon {
		color: rgb(71, 85, 105);
	}

	.bet-controls {
		background: rgba(15, 23, 42, 0.8);
		border-radius: 0.375rem;
		padding: 0.125rem;
		display: flex;
		align-items: center;
		gap: 0.125rem;
		flex-shrink: 0;
	}

	@media (min-width: 480px) {
		.bet-controls {
			padding: 0.5rem 0.75rem;
			gap: 0.75rem;
		}
	}

	@media (min-width: 640px) {
		.bet-controls {
			padding: 0.5rem 1rem;
			gap: 0.75rem;
		}
	}

	.bet-display {
		display: flex;
		flex-direction: column;
	}

	.bet-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.bet-button {
		width: 1.25rem;
		height: 1rem;
		background: rgb(51, 65, 85);
		border: none;
		border-radius: 0.125rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
		cursor: pointer;
	}

	@media (min-width: 640px) {
		.bet-button {
			width: 2rem;
			height: 1.5rem;
		}
	}

	.bet-button:not(:disabled):hover {
		background: rgb(71, 85, 105);
	}

	.bet-button:disabled {
		background: rgb(30, 41, 59);
		cursor: not-allowed;
	}

	.bet-icon {
		width: 0.625rem;
		height: 0.625rem;
		color: white;
		transition: color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bet-icon :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	@media (min-width: 640px) {
		.bet-icon {
			width: 1rem;
			height: 1rem;
		}
	}

	.bet-button:not(:disabled):hover .bet-icon {
		color: rgb(251, 146, 60);
	}

	.bet-button:disabled .bet-icon {
		color: rgb(71, 85, 105);
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: 0.0625rem;
	}

	@media (min-width: 640px) {
		.action-buttons {
			gap: 0.5rem;
		}
	}

	.auto-spin-container {
		position: relative;
	}

	.action-button {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
		background: rgb(71, 85, 105);
		border: none;
		cursor: pointer;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.action-button {
			width: 3rem;
			height: 3rem;
		}
	}

	.action-button:hover {
		background: rgb(100, 116, 139);
	}

	.action-button.active.auto-spin {
		background: rgb(34, 197, 94);
	}

	.action-button.active.auto-spin:hover {
		background: rgb(22, 163, 74);
	}

	.action-button.active.turbo {
		background: rgb(234, 179, 8);
	}

	.action-button.active.turbo:hover {
		background: rgb(202, 138, 4);
	}


	.action-icon {
		width: 0.75rem;
		height: 0.75rem;
		color: white;
		transition: color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-icon :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	@media (min-width: 640px) {
		.action-icon {
			width: 1.25rem;
			height: 1.25rem;
		}
	}

	.action-icon.spinning {
		animation: spin 2s linear infinite;
	}

	.action-button:hover .action-icon {
		color: rgb(251, 146, 60);
	}

	.action-button.active.turbo .action-icon {
		color: rgb(15, 23, 42);
	}

	.action-button.active.turbo:hover .action-icon {
		color: rgb(251, 146, 60);
	}

	.auto-count {
		font-size: 0.5rem;
		font-weight: bold;
		color: white;
		line-height: 1;
	}

	@media (min-width: 640px) {
		.auto-count {
			font-size: 0.75rem;
		}
	}

	.auto-spin-menu {
		position: absolute;
		bottom: 100%;
		right: 0;
		margin-bottom: 0.5rem;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(12px);
		border-radius: 0.5rem;
		border: 1px solid rgba(100, 116, 139, 0.5);
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 4rem;
	}

	.auto-option {
		padding: 0.5rem;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		color: white;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: center;
	}

	.auto-option:hover {
		background: rgba(100, 116, 139, 0.5);
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>