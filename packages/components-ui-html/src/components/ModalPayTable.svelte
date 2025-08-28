<script lang="ts">
  import { Popup } from 'components-shared';
  import { zIndex } from 'constants-shared/zIndex';
  import { stateModal, stateUrlDerived } from 'state-shared';
  import { stateBet } from 'state-shared';

  import BaseContent from './BaseContent.svelte';
  import BaseScrollable from './BaseScrollable.svelte';

  import { symbolPayouts } from '../paytableData'; // make sure path is correct
  
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

{#if stateModal.modal?.name === 'payTable'}
  <Popup zIndex={zIndex.modal} onclose={() => (stateModal.modal = null)}>
    <BaseContent maxWidth="100%">
      <BaseScrollable type="column">
        <div style="padding: 24px; color: white; font-family: sans-serif; max-height: 70vh; overflow-y: auto;">

          <!-- About the Game -->
          <div style="margin-bottom: 40px; text-align: center;">
            <h2 style="font-size: 1.5rem; font-weight: bold;">CANDY CRYPT — RULES & INFO</h2>
            <p style="margin-top: 8px; font-size: 1rem; color: #ccc; max-width: 760px; margin-left: auto; margin-right: auto;">
              Candy Crypt is a 5-reel, 3-row, <strong>20-line</strong> slot. In the base game, <strong>Chocolate {getSocialText('Cash', 'Coins')} (CC)</strong> appears
              as a <em>regular line symbol</em> (no collection). Trigger <strong>Free Spins</strong> to activate the
              <strong>Collector Wild</strong>, which <em>collects</em> all on-screen Chocolate {getSocialText('Cash', 'Coins')} values. Every <strong>4 Collectors</strong> award <strong>+10 spins</strong>
              and step the collector multiplier <strong>×1 → ×2 → ×3 → ×10</strong>.
            </p>
          </div>

          <!-- Regular Symbols Grid -->
          <h3 style="font-size: 1.25rem; font-weight: bold; text-align: center; margin-bottom: 16px;">
            PAYTABLE — LINE SYMBOLS ({getSocialText('PAYS SHOWN AS CURRENCY', 'WINS SHOWN AS COINS')})
          </h3>

          <div
            style="
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 32px;
              justify-items: center;
              margin-bottom: 36px;
            "
          >
            {#each regularSymbols as symbol}
              <div style="text-align: center;">
                <img src={symbol.image} alt={symbol.name} width="120" height="120" />
                <div style="margin-top: 6px;">
                  {#each symbol.payouts as payout}
                    {#if payout.multiplier > 0}
                      <div style="color: #ffcc00; font-weight: bold; font-size: 1rem;">
                        {formatPayout(payout, stateBet.betAmount)}
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <!-- Special Symbols Section -->
          <h3 style="font-size: 1.25rem; font-weight: bold; text-align: center; margin-bottom: 16px;">
            SPECIAL SYMBOLS & FEATURES
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
              <div style="max-width: 320px;">
                <img src={symbol.image} alt={symbol.name} width="120" height="120" />
                <strong style="display: block; margin-top: 8px; font-size: 1.05rem;">{symbol.name}</strong>
                {#if symbol.payouts?.length}
                  <div style="margin-top: 6px;">
                    {#each symbol.payouts as payout}
                      {#if payout.multiplier > 0}
                        <div style="color: #ffcc00; font-weight: bold; font-size: 1rem;">
                          {formatPayout(payout, stateBet.betAmount)}
                        </div>
                      {/if}
                    {/each}
                  </div>
                {/if}
                {#if symbol.description}
                  <div style="font-size: 0.9rem; color: #ccc; margin-top: 8px; text-align: left;">
                    {@html symbol.description}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

<!-- RTP & Max Win Info -->
<div style="margin-top: 40px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
  <h3 style="font-size: 1.25rem; font-weight: bold; text-align: center; margin-bottom: 16px;">
    RTP & MAX {getSocialText('WIN', 'PRIZE')}
  </h3>
  <ul style="list-style: disc; margin-left: 20px;">
    <li>Base Game RTP: <strong>96.00%</strong></li>
    <li>Boost {getSocialText('Bet', 'Play')} Mode RTP ({getSocialText('costs', 'for')} 1.5× {getSocialText('bet', 'play')}): <strong>96.00%</strong></li>
    <li>Bonus Game: <strong>96.00%</strong></li>
    <li>Maximum {getSocialText('win', 'prize')} (all modes): <strong>10,000×</strong> total {getSocialText('bet', 'play')}.</li>
  </ul>
</div>

<!-- Bet Modes / Costs -->
<div style="margin-top: 28px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
  <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">{getSocialText('BET', 'PLAY')} MODES</h3>
  <p>
    <strong>Base Game</strong> — <strong>{getSocialText('Costs', 'For')} 1×</strong> the base {getSocialText('bet', 'play')}. Standard play on 20 fixed lines.  
    Land 3 or more scatters to trigger free spins.
  </p>
  <p style="margin-top: 8px;">
    <strong>Boost {getSocialText('Bet', 'Play')}</strong> — <strong>{getSocialText('Costs', 'For')} 1.5×</strong> the base {getSocialText('bet', 'play')} and <strong>raises Scatter frequency</strong> to increase
    the chance of triggering Free Spins. 
  </p>
  <p style="margin-top: 8px;">
    <strong>{getSocialText('Bonus Buy', 'Bonus Feature')}</strong> — <strong>{getSocialText('Costs', 'For')} 100×</strong> the base {getSocialText('bet', 'play')}. Instantly triggers the Free Spins bonus {getSocialText('at the cost of', 'for')} <strong>100× your {getSocialText('bet', 'play')}</strong>.  
    Collector Wilds and progression behave exactly as in naturally triggered Free Spins.
  </p>
</div>


<!-- How Features Work -->
<div style="margin-top: 28px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
  <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">FEATURES & PROGRESSION</h3>
  <p>
    <strong>Free Spins Trigger:</strong> Landing Scatters awards Free Spins:  
    <strong>3 Scatters = 10 spins</strong>, <strong>4 Scatters = 15 spins</strong>, <strong>5 Scatters = 20 spins</strong>.
  </p>
  <p style="margin-top: 8px;">
    <strong>Collector Wild (bonus only):</strong> In Free Spins, Collector Wilds <strong>collect all on-screen Chocolate {getSocialText('Cash', 'Coins')}</strong> values.  
    Collection is {getSocialText('paid', 'won')} immediately and is multiplied by the current <strong>Collector Multiplier</strong>.  
    Collector Wilds substitute for all symbols except Scatters.
  </p>
  <p style="margin-top: 8px;">
    <strong>Level-Up Progress & Batches:</strong> Every time you collect <strong>4 Collectors</strong>, you bank the next level and <strong>+10 extra spins</strong>.  
    <em>From Level 2 onward, spins are awarded in batches of 10.</em> The current level’s multiplier applies
    <em>until the current 10-spin batch finishes</em>; the <strong>next</strong> batch then starts with the <strong>next level’s multiplier</strong>.  
    You can also <strong>get ahead</strong> in collections — e.g., if you collect 6 Collectors during the first 4 spins of Level 1,
    you’re already halfway through Level 2’s progress even though Level 2’s multiplier isn’t active yet.
  </p>
  <p style="margin-top: 8px;">
    <strong>Retriggers:</strong> Free Spins are extended via <strong>level-ups</strong> (every 4 Collectors). A maximum of 3 retriggers per bonus can occur.  
    There are <em>no Scatter retriggers</em> during Free Spins.
  </p>
</div>


          <!-- Line Rules -->
          <div style="margin-top: 28px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
            <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">LINE RULES</h3>
            <ul style="list-style: disc; margin-left: 20px;">
              <li><strong>20 fixed {getSocialText('paylines', 'playlines')}.</strong></li>
              <li>All line {getSocialText('pays', 'wins')} are left-to-right on consecutive reels starting from reel 1.</li>
              <li>Wins on different lines are added together.</li>
              <li>In the base game, <strong>Chocolate {getSocialText('Cash', 'Coins')} (CC)</strong> behaves as a <em>regular line symbol</em> (no collecting).</li>
            </ul>
          </div>

          <!-- Obtainable Values (Special) -->
          <div style="margin-top: 28px; padding: 0 16px; color: white; font-size: 1rem; line-height: 1.6;">
            <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">OBTAINABLE SPECIAL VALUES</h3>
            <p>
              <strong>Chocolate {getSocialText('Cash', 'Coins')} (CC) Values in Free Spins:</strong>
              <strong>2×, 5×, 10×, 15×, 20×, 25×, 50×, 2000×</strong>.
            </p>
          </div>

        </div>
      </BaseScrollable>
    </BaseContent>
  </Popup>
{/if}
