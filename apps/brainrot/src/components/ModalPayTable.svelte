<script lang="ts">
  import { Popup } from 'components-shared';
  import { zIndex } from 'constants-shared/zIndex';
  import { stateModal, stateUrlDerived } from 'state-shared';
  import { stateBet } from 'state-shared';

  import BaseContent from '../../../../packages/components-ui-html/src/components/BaseContent.svelte';
  import BaseScrollable from '../../../../packages/components-ui-html/src/components/BaseScrollable.svelte';
  import { i18nDerived } from '../i18n/i18nDerived';

  import { symbolPayouts, multiplierValues } from '../paytableData';

  // Helper function to get social-compatible text
  const getSocialText = (regularText: string, socialText: string) =>
    stateUrlDerived.social() ? socialText : regularText;

  const regularSymbols = symbolPayouts.filter((s) => !s.description && !s.isSpecial);
  const specialSymbols = symbolPayouts.filter((s) => s.isSpecial || s.description);

  function formatPayout(payout, playAmount: number) {
    if (payout?.multiplier && payout.multiplier > 0) {
      const value = payout.multiplier * playAmount;
      const currency = getSocialText('$', '') + value.toFixed(2) + getSocialText('', ' coins');
      return `${payout.match} = ${currency}`;
    } else if (payout?.description) {
      return `${payout.match} = ${payout.description}`;
    } else {
      return '';
    }
  }
</script>

<style>
  .paytable-content {
    padding: 24px;
    color: white;
    font-family: sans-serif;
    max-height: 70vh;
    overflow-y: auto;
    max-width: 900px;
    margin: 0 auto;
  }

  .game-intro {
    margin-bottom: 40px;
    text-align: center;
  }

  .game-intro h2 {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .game-intro p {
    margin-top: 8px;
    font-size: 1rem;
    color: #ccc;
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 16px;
  }

  .symbols-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    justify-items: center;
    margin-bottom: 36px;
  }

  .symbol-item {
    text-align: center;
  }

  .symbol-item img {
    width: 120px;
    height: 120px;
  }

  .payout-value {
    color: #ffcc00;
    font-weight: bold;
    font-size: 1rem;
    margin-top: 6px;
  }

  .special-symbols {
    display: flex;
    justify-content: center;
    gap: 48px;
    flex-wrap: wrap;
    text-align: center;
  }

  .special-symbol-item {
    max-width: 320px;
  }

  .special-symbol-item img {
    width: 120px;
    height: 120px;
  }

  .special-symbol-name {
    display: block;
    margin-top: 8px;
    font-size: 1.05rem;
    font-weight: bold;
  }

  .special-symbol-desc {
    font-size: 0.9rem;
    color: #ccc;
    margin-top: 8px;
    text-align: left;
  }

  .info-section {
    margin-top: 28px;
    padding: 0 16px;
    color: white;
    font-size: 1rem;
    line-height: 1.6;
  }

  .info-section h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .info-section.center h3 {
    text-align: center;
    margin-bottom: 16px;
  }

  .info-section ul {
    list-style: disc;
    margin-left: 20px;
  }

  .info-section p {
    margin-top: 8px;
  }

  .info-section p:first-of-type {
    margin-top: 0;
  }

  .multiplier-values {
    color: #ffcc00;
    font-weight: bold;
  }

  /* Tablet styles */
  @media (max-width: 768px) {
    .symbols-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .symbol-item img {
      width: 100px;
      height: 100px;
    }

    .special-symbols {
      gap: 32px;
    }

    .special-symbol-item {
      max-width: 280px;
    }

    .special-symbol-item img {
      width: 100px;
      height: 100px;
    }
  }

  /* Mobile styles */
  @media (max-width: 480px) {
    .paytable-content {
      padding: 12px;
      font-size: 0.85rem;
    }

    .game-intro {
      margin-bottom: 24px;
    }

    .game-intro h2 {
      font-size: 1.1rem;
    }

    .game-intro p {
      font-size: 0.85rem;
      padding: 0 8px;
    }

    .section-title {
      font-size: 1rem;
      margin-bottom: 12px;
    }

    .symbols-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .symbol-item img {
      width: 70px;
      height: 70px;
    }

    .payout-value {
      font-size: 0.75rem;
    }

    .special-symbols {
      gap: 24px;
    }

    .special-symbol-item {
      max-width: 100%;
      padding: 0 12px;
    }

    .special-symbol-item img {
      width: 80px;
      height: 80px;
    }

    .special-symbol-name {
      font-size: 0.95rem;
    }

    .special-symbol-desc {
      font-size: 0.8rem;
    }

    .info-section {
      margin-top: 20px;
      padding: 0 8px;
      font-size: 0.85rem;
    }

    .info-section h3 {
      font-size: 1rem;
      margin-bottom: 6px;
    }

    .info-section ul {
      margin-left: 16px;
    }

    .info-section p {
      margin-top: 6px;
    }
  }

  /* Extra small mobile */
  @media (max-width: 360px) {
    .paytable-content {
      padding: 8px;
    }

    .game-intro h2 {
      font-size: 1rem;
    }

    .symbols-grid {
      gap: 12px;
    }

    .symbol-item img {
      width: 60px;
      height: 60px;
    }

    .payout-value {
      font-size: 0.7rem;
    }

    .special-symbol-item img {
      width: 70px;
      height: 70px;
    }
  }
</style>

{#if stateModal.modal?.name === 'payTable'}
  <Popup zIndex={zIndex.modal} onclose={() => (stateModal.modal = null)}>
    <BaseContent maxWidth="100%">
      <BaseScrollable type="column">
        <div class="paytable-content">

          <!-- About the Game -->
          <div class="game-intro">
            <h2>BRAINROT BONANZA — RULES & INFO</h2>
            <p>
              Brainrot Bonanza is a <strong>6×5 grid</strong> tumble slot with <strong>Pay Anywhere</strong> mechanics.
              Land <strong>8+ matching symbols</strong> anywhere on screen to {getSocialText('win', 'win a prize')}.
              Land <strong>4+ Scatters</strong> to trigger <strong>10 Free Spins</strong> with <strong>Multiplier symbols</strong>!
            </p>
          </div>

          <!-- Regular Symbols Grid -->
          <h3 class="section-title">
            {getSocialText('PAYTABLE', 'WINTABLE')}
          </h3>

          <div class="symbols-grid">
            {#each regularSymbols as symbol}
              <div class="symbol-item">
                <img src={symbol.image} alt={symbol.name} />
                <div>
                  {#each symbol.payouts as payout}
                    {#if payout.multiplier > 0}
                      <div class="payout-value">
                        {formatPayout(payout, stateBet.betAmount)}
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <!-- Special Symbols Section -->
          <h3 class="section-title">
            SPECIAL SYMBOLS & FEATURES
          </h3>

          <div class="special-symbols">
            {#each specialSymbols as symbol}
              <div class="special-symbol-item">
                <img src={symbol.image} alt={symbol.name} />
                <strong class="special-symbol-name">{symbol.name}</strong>
                {#if symbol.payouts?.length}
                  <div>
                    {#each symbol.payouts as payout}
                      {#if payout.multiplier > 0}
                        <div class="payout-value">
                          {formatPayout(payout, stateBet.betAmount)}
                        </div>
                      {/if}
                    {/each}
                  </div>
                {/if}
                {#if symbol.description}
                  <div class="special-symbol-desc">
                    {@html symbol.description
                      .replace('{{PAY_WIN}}', getSocialText('pay', 'win'))
                      .replace('{{WIN_PRIZE}}', getSocialText('win', 'prize'))}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

<!-- RTP & Max Win Info -->
<div class="info-section center">
  <h3>RTP & MAX {getSocialText('WIN', 'PRIZE')}</h3>
  <ul>
    <li>Base Game RTP: <strong>96.00%</strong></li>
    <li>Ante {getSocialText('Bet', 'Play')} Mode RTP (1.25× {getSocialText('bet', 'play')}): <strong>96.00%</strong></li>
    <li>{getSocialText('Bonus Buy', 'Bonus Feature')} RTP: <strong>96.00%</strong></li>
    <li>Maximum {getSocialText('win', 'prize')} (all modes): <strong>25,000×</strong> total {getSocialText('bet', 'play')}</li>
  </ul>
</div>

<!-- Bet Modes -->
<div class="info-section">
  <h3>{getSocialText('BET', 'PLAY')} MODES</h3>
  <p>
    <strong>Base Game</strong> — Standard {getSocialText('play', 'game')} at 1× {getSocialText('bet', 'play')}. Land 4+ Scatters to trigger Free Spins.
  </p>
  <p>
    <strong>Ante {getSocialText('Bet', 'Play')}</strong> — 1.25× {getSocialText('bet', 'play')} with <strong>increased Scatter frequency</strong> for better Free Spins chances.
  </p>
  <p>
    <strong>{getSocialText('Bonus Buy', 'Bonus Feature')}</strong> — Instantly triggers Free Spins for 100× {getSocialText('bet', 'play')} by guaranteeing 4+ Scatters on the entry spin.
  </p>
</div>

<!-- How Wins Work -->
<div class="info-section">
  <h3>HOW {getSocialText('WINS', 'PRIZES')} WORK</h3>

  <p>
    <strong>Pay Anywhere:</strong> Land <strong>8+ matching symbols</strong> anywhere on the 6×5 grid to {getSocialText('win', 'win a prize')}.
    Symbols don't need to be connected—they're counted across the entire board. More symbols = bigger {getSocialText('payout', 'prize')} (up to 12+).
  </p>

  <p>
    <strong>Tumbles:</strong> Winning symbols disappear and new ones fall down. If new symbols create another {getSocialText('win', 'prize')} (8+ matching), they tumble too.
    All {getSocialText('wins', 'prizes')} in a chain are added together.
  </p>
</div>

<!-- Features & Free Spins -->
<div class="info-section">
  <h3>FEATURES & FREE SPINS</h3>
  <ul>
    <li><strong>Free Spins:</strong> 4+ Scatters = 10 Free Spins. 3+ Scatters during Free Spins = +5 spins.</li>
    <li><strong>Multipliers:</strong> Only appear during Free Spins. All values on screen are summed and applied to tumble chain {getSocialText('wins', 'prizes')}.</li>
  </ul>
</div>

<!-- Game Rules -->
<div class="info-section">
  <h3>GAME RULES</h3>
  <ul>
    <li>6×5 grid with 30 visible symbols per {getSocialText('spin', 'play')}</li>
    <li>8+ matching symbols anywhere = {getSocialText('win', 'prize')}</li>
    <li>Winning symbols tumble until no more {getSocialText('wins', 'prizes')}</li>
    <li>Multipliers only appear during Free Spins</li>
    <li>Max {getSocialText('win', 'prize')}: <strong>25,000×</strong> {getSocialText('bet', 'play')}</li>
  </ul>
</div>

<!-- Obtainable Multiplier Values -->
<div class="info-section">
  <h3>MULTIPLIER VALUES</h3>
  <p>
    <span class="multiplier-values">
      {multiplierValues.map(v => `${v}×`).join(', ')}
    </span>
  </p>
</div>

<!-- User Interaction Section -->
<div class="info-section">
  <h3 style="text-align: center; margin-bottom: 20px;">CONTROLS & INTERFACE</h3>
  <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px;">
    <div style="display: grid; gap: 12px;">

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">{getSocialText('Spin', 'Play')} Button</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Click to {getSocialText('spin', 'play')} or slam stop. During autoplay, stops the sequence.</span>
      </div>

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">{getSocialText('Bet', 'Play')} Adjust</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Use + and − buttons to adjust your {getSocialText('bet', 'play')} amount.</span>
      </div>

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">Autoplay</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Set automatic {getSocialText('spins', 'plays')} (10, 25, 50, or 100). Click again to stop.</span>
      </div>

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">Turbo Mode</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Toggle for faster gameplay and reduced animations.</span>
      </div>

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">Info Button</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Opens this paytable and game rules screen.</span>
      </div>

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">Settings Menu</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Access sound, music, and game preferences.</span>
      </div>

      <div style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">{getSocialText('Bonus Buy', 'Feature Play')}</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Instantly trigger Free Spins for 100× your {getSocialText('bet', 'play')}.</span>
      </div>

      <div style="padding: 12px;">
        <strong style="color: #fff; display: block; margin-bottom: 4px;">Volume Button</strong>
        <span style="color: #bbb; font-size: 0.9rem;">Click to open volume slider to adjust overall game volume.</span>
      </div>

    </div>
  </div>
</div>

<!-- Legal Disclaimer -->
<div style="margin-top: 40px; padding: 20px; background: rgba(255, 255, 255, 0.03); border-top: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px;">
  <p style="font-size: 0.75rem; color: #999; text-align: center; line-height: 1.6; margin: 0;">
    <strong style="display: block; margin-bottom: 8px; color: #bbb;">Important Information:</strong>
    Malfunction voids all {getSocialText('wins', 'prizes')} and {getSocialText('plays', 'plays')}. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many {getSocialText('plays', 'plays')}. The game display is not representative of any physical device and is for illustrative purposes only. {getSocialText('Winnings are', 'Wins are')} settled according to the amount received from the Remote Game Server and not from events within the web browser.
  </p>
</div>

        </div>
      </BaseScrollable>
    </BaseContent>
  </Popup>
{/if}
