<script lang="ts">
	import { stateBet, stateBetDerived } from 'state-shared';
	import { getContextEventEmitter } from 'utils-event-emitter';
	import type { EmitterEventModal } from '../types';
	import { i18nDerived } from '../i18n/i18nDerived';

	const { eventEmitter } = getContextEventEmitter<EmitterEventModal>();

	const toggleTurbo = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	const turboEnabled = $derived(stateBet.isTurbo);
</script>

<div class="turbo-container">
	<label class="turbo-label">
		<span class="turbo-text">{i18nDerived.turbo()}</span>
		<button
			class="turbo-toggle"
			class:active={turboEnabled}
			onclick={toggleTurbo}
			data-test="turbo-toggle"
		>
			<span class="toggle-slider" class:active={turboEnabled}></span>
		</button>
	</label>
</div>

<style>
	.turbo-container {
		padding: 0.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	.turbo-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}

	.turbo-text {
		color: white;
		font-size: 1rem;
	}

	.turbo-toggle {
		position: relative;
		width: 50px;
		height: 26px;
		background-color: #ccc;
		border: none;
		border-radius: 26px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.turbo-toggle.active {
		background-color: #4caf50;
	}

	.toggle-slider {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.3s;
	}

	.toggle-slider.active {
		transform: translateX(24px);
	}
</style>