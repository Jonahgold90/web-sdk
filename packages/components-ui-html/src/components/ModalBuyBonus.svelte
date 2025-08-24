<script lang="ts">
	import { stateBet, stateModal } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import { numberToCurrencyString } from 'utils-shared/amount';
	import type { EmitterEventModal } from '../types';
	import buyFreeSpinsImg from '../../static/assets/sprites/buyConfirmation/BUY_FREE_SPINS.png';

	const { eventEmitter } = getContextEventEmitter<EmitterEventModal>();
	const bonusCost = $derived(numberToCurrencyString(stateBet.betAmount * 100));

	function confirm() {
		stateBet.activeBetModeKey = 'BONUS';
		eventEmitter.broadcast({ type: 'bet' });
		stateModal.modal = null;
	}

	function cancel() {
		stateModal.modal = null;
	}
</script>

<!-- Disabled - now using PIXI BuyConfirmation component -->
<!-- 
{#if stateModal.modal?.name === 'buyBonus'}
	<div class="confirmation-modal">
		<img src={buyFreeSpinsImg} alt="Buy Free Spins" class="confirmation-bg" />
		<div class="cost">{bonusCost}</div>
		<button class="btn-no" on:click={cancel}>NO</button>
		<button class="btn-yes" on:click={confirm}>YES</button>
	</div>
{/if}
-->

<style>
	@font-face {
		font-family: 'yellowFont';
		src: url('/apps/chocolate/static/assets/fonts/yellowFont/yellowFont.png') format('png');
	}

	.confirmation-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 20px;
	}

	.confirmation-bg {
		max-width: 90vw;
		max-height: 70vh;
		width: auto;
		height: auto;
		object-fit: contain;
	}

	.cost {
		font-family: 'yellowFont', 'Arial Black', sans-serif;
		color: #FFD700;
		font-size: 32px;
		font-weight: 900;
		text-shadow: 2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000;
		text-align: center;
		margin: 20px 0;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.btn-no, .btn-yes {
		font-family: 'Arial Black', sans-serif;
		font-size: 16px;
		font-weight: 900;
		padding: 12px 24px;
		border: 3px solid;
		border-radius: 8px;
		cursor: pointer;
		text-transform: uppercase;
		text-shadow: 1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
		transition: all 0.2s ease;
		margin: 0 10px;
		min-width: 80px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.btn-no {
		background: linear-gradient(145deg, #f44336, #d32f2f);
		color: white;
		border-color: #b71c1c;
	}

	.btn-no:hover {
		background: linear-gradient(145deg, #d32f2f, #c62828);
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
	}

	.btn-yes {
		background: linear-gradient(145deg, #4CAF50, #388e3c);
		color: white;
		border-color: #2e7d32;
	}

	.btn-yes:hover {
		background: linear-gradient(145deg, #388e3c, #2e7d32);
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.confirmation-bg {
			max-width: 95vw;
			max-height: 60vh;
		}
		
		.cost {
			font-size: 28px;
			margin: 15px 0;
		}
		
		.btn-no, .btn-yes {
			font-size: 14px;
			padding: 10px 20px;
			margin: 0 8px;
			min-width: 70px;
		}
	}

	/* Small mobile */
	@media (max-width: 480px) {
		.confirmation-bg {
			max-height: 50vh;
		}
		
		.cost {
			font-size: 24px;
			margin: 12px 0;
		}
		
		.btn-no, .btn-yes {
			font-size: 12px;
			padding: 8px 16px;
			margin: 0 6px;
			min-width: 60px;
		}
	}
</style>
