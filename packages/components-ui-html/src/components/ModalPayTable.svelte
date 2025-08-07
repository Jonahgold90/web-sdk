<script lang="ts">
	import { Popup } from 'components-shared';
	import { zIndex } from 'constants-shared/zIndex';
	import { stateModal } from 'state-shared';
	import { stateBet } from 'state-shared';

	import BaseContent from './BaseContent.svelte';
	import BaseScrollable from './BaseScrollable.svelte';

	import { symbolPayouts } from '../paytableData'; // adjust path if needed

	const regularSymbols = symbolPayouts.filter(s => !s.description);
	const specialSymbols = symbolPayouts.filter(s => s.description);

	function formatPayout(payout, bet) {
		if (payout.multiplier && payout.multiplier > 0) {
			const value = payout.multiplier * bet;
			return `${payout.match} = $${value.toFixed(2)}`;
		} else if (payout.description) {
			return `${payout.match} = ${payout.description}`;
		} else {
			return '';
		}
	}
</script>

{#if stateModal.modal?.name === 'payTable'}
	<Popup zIndex={zIndex.modal} onclose={() => (stateModal.modal = null)}>
		<BaseContent maxWidth="100%">
			<BaseScrollable type="column">
				<div style="padding: 24px; color: white; font-family: sans-serif; max-height: 70vh; overflow-y: auto;">

					<!-- About the Game -->
					<div style="margin-bottom: 40px; text-align: center;">
						<h2 style="font-size: 1.5rem; font-weight: bold;">GAME RULES & INFO</h2>
						<p style="margin-top: 8px; font-size: 1rem; color: #ccc; max-width: 700px; margin-left: auto; margin-right: auto;">
							Sky Vault is a 5-reel, 3-row fantasy ways slot where players uncover ancient magical treasures. Trigger Free Spins by landing 3 or more Scatter symbols anywhere, and aim to match rare artifacts for massive payouts!
						</p>
					</div>


					<!-- Regular Symbols Grid -->
					<div
						style="
							display: grid;
							grid-template-columns: repeat(3, 1fr);
							gap: 32px;
							justify-items: center;
							margin-bottom: 48px;
						"
					>
						{#each regularSymbols as symbol}
							<div style="text-align: center;">
								<img src={symbol.image} alt={symbol.name} width="120" height="120" />
								<strong style="display: block; margin-top: 8px; font-size: 1.1rem;">{symbol.name}</strong>
								<div style="margin-top: 4px;">
									{#each symbol.payouts as payout}
										{#if payout.multiplier > 0}
											<div style="color: #ffcc00; font-weight: bold; font-size: 1.05rem;">{formatPayout(payout, stateBet.betAmount)}</div>
										{/if}
									{/each}
								</div>
							</div>
						{/each}
					</div>

					<!-- Special Symbols Section -->
					<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 24px;">
						SPECIAL SYMBOLS
					</h3>

					<div
						style="
							display: flex;
							justify-content: center;
							gap: 48px;
							flex-wrap: wrap;
							text-align: center;
						"
					>
						{#each specialSymbols as symbol}
							<div>
								<img src={symbol.image} alt={symbol.name} width="120" height="120" />
								<strong style="display: block; margin-top: 8px; font-size: 1.1rem;">{symbol.name}</strong>
								<div style="margin-top: 4px;">
									{#each symbol.payouts as payout}
										<div style="color: #ffcc00; font-weight: bold; font-size: 1.05rem;">{formatPayout(payout, stateBet.betAmount)}</div>
									{/each}
								</div>
								{#if symbol.description}
									<div style="font-size: 0.85rem; color: #ccc; margin-top: 8px;">
										{symbol.description}
									</div>
								{/if}
							</div>
						{/each}
					</div>
					<!-- RTP & Max Win Info -->
						<div style="margin-top: 48px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
							<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 24px;">
								RTP & MAX WIN INFO
							</h3>
							<p>
								All games modes have an RTP of <strong>96.00%</strong>.
							</p>
							<p>
								The highest possible win across all game modes is <strong>5000x</strong> the underlying bet.
							</p>
						</div>
					<!-- Feature Modes Info -->
					<div style="margin-top: 48px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
						<h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 12px;">FEATURE MODES</h3>

						<p><strong>Super Boost</strong> — For <strong>5x the bet</strong>, Super Boost guarantees 1 Scatter on every spin and greatly increases your chances of triggering the bonus.</p>

						<p style="margin-top: 16px;"><strong>Vault Bonus</strong> — For <strong>100x the bet</strong>, Vault Bonus increases the frequency of Wild symbols and applies a random multiplier on top of Wilds.</p>
					</div>
					<!-- Multiplier Mechanics -->
					<div style="margin-top: 48px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
						<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 24px;">
							MULTIPLIER MECHANICS
						</h3>
						<p>
							In certain game modes, Wild symbols may include a multiplier (e.g., 2x, 3x, 5x) displayed directly on the symbol. When a multiplier Wild substitutes in a winning combination, the total win for that combination is <strong>multiplied by the Wild’s value</strong>.
						</p>
						<p>
							Multipliers only apply to wins that <strong>include a Wild symbol</strong>.
						</p>
						<p>
							Wild multipliers are active during the <strong>Vault Bonus</strong> feature.
						</p>
					</div>
					<!-- Free Spins Retriggers -->
					<div style="margin-top: 48px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
						<h3 style="font-size: 1.5rem; font-weight: bold; text-align: center; margin-bottom: 24px;">
							FREE SPINS RETRIGGERS
						</h3>
						<p style="text-align: center;">
							During the Vault Bonus, landing 2 or more Scatter symbols retriggers the feature and awards extra spins:
						</p>
						<p style="text-align: center; margin-top: 8px;">
							<strong>2</strong> Scatters = <strong>+4</strong> spins  <strong>3</strong> Scatters = <strong>+6</strong> spins  <strong>4</strong> Scatters = <strong>+8</strong> spins  <strong>5</strong> Scatters = <strong>+10</strong> spins
						</p>
					</div>


				</div>
			</BaseScrollable>
		</BaseContent>
	</Popup>
{/if}
