// Import symbol assets
import h1 from './components/assets/h1.png';
import h2 from './components/assets/h2.png';
import h3 from './components/assets/h3.png';
import h4 from './components/assets/h4.png';

import l1 from './components/assets/l1.png';
import l2 from './components/assets/l2.png';
import l3 from './components/assets/l3.png';
import l4 from './components/assets/l4.png';
import l5 from './components/assets/l5.png';

import cc from './components/assets/cc.png';
import scatter from './components/assets/s.png';
import cw from './components/assets/cw.png';
// import ccValues from './components/assets/cc_values.png';

export const symbolPayouts = [
  // Collector Wild
  {
    name: 'Collector Wild',
    image: cw,
    payouts: [],
    description:
      '<strong>Bonus only.</strong> Substitutes for all symbols except Scatter.<br/>' +
      'When it lands in Free Spins, it <strong>collects all on-screen CC values</strong> and pays them immediately. ' +
      'Every <strong>4</strong> Collectors award <strong>+10</strong> spins and step the Collector Multiplier ' +
      '<strong>×1 → ×2 → ×3 → ×10</strong>, which applies to subsequent collections.',
  },

  // Scatter
  {
    name: 'Scatter',
    image: scatter,
    payouts: [
      { match: '3x', multiplier: 0, description: '10 spins' },
    ],
    description:
      '<strong>3 Scatters anywhere</strong> award <strong>10 Free Spins</strong>. During Free Spins there are no Scatter retriggers; ' +
      'extra spins are granted via <em>Collector</em> level-ups.',
  },

  // CC — base-only line symbol
  {
    name: 'Chocolate Cash (CC)',
    image: cc,
    payouts: [
      { match: '5x', multiplier: 6 },
      { match: '4x', multiplier: 1.5 },
      { match: '3x', multiplier: 0.5 },
    ],
    description:
      'In the base game, CC acts as a regular line symbol with the pays above. In Free Spins, CC shows prize values (1×–2000x) ' +
      'that are collected by Collector Wilds instead of paying as a line symbol.',
  },

  // HIGHS
  {
    name: 'H1',
    image: h1,
    payouts: [
      { match: '5x', multiplier: 50 },
      { match: '4x', multiplier: 20 },
      { match: '3x', multiplier: 10 },
    ],
  },
  {
    name: 'H2',
    image: h2,
    payouts: [
      { match: '5x', multiplier: 15 },
      { match: '4x', multiplier: 5 },
      { match: '3x', multiplier: 3 },
    ],
  },
  {
    name: 'H3',
    image: h3,
    payouts: [
      { match: '5x', multiplier: 10 },
      { match: '4x', multiplier: 3 },
      { match: '3x', multiplier: 2 },
    ],
  },
  {
    name: 'H4',
    image: h4,
    payouts: [
      { match: '5x', multiplier: 8 },
      { match: '4x', multiplier: 2 },
      { match: '3x', multiplier: 1 },
    ],
  },
  // {
  //   name: 'H5',
  //   image: h5,
  //   payouts: [
  //     { match: '5x', multiplier: 5 },
  //     { match: '4x', multiplier: 1 },
  //     { match: '3x', multiplier: 0.8 },
  //   ],
  // },

  // LOWS
  {
    name: 'L1',
    image: l1,
    payouts: [
      { match: '5x', multiplier: 3 },
      { match: '4x', multiplier: 0.7 },
      { match: '3x', multiplier: 0.3 },
    ],
  },
  {
    name: 'L2',
    image: l2,
    payouts: [
      { match: '5x', multiplier: 2.5 },
      { match: '4x', multiplier: 0.6 },
      { match: '3x', multiplier: 0.25 },
    ],
  },
  {
    name: 'L3',
    image: l3,
    payouts: [
      { match: '5x', multiplier: 2 },
      { match: '4x', multiplier: 0.5 },
      { match: '3x', multiplier: 0.2 },
    ],
  },
  {
    name: 'L4',
    image: l4,
    payouts: [
      { match: '5x', multiplier: 1.5 },
      { match: '4x', multiplier: 0.4 },
      { match: '3x', multiplier: 0.15 },
    ],
  },
  {
    name: 'L5',
    image: l5,
    payouts: [
      { match: '5x', multiplier: 1 },
      { match: '4x', multiplier: 0.3 },
      { match: '3x', multiplier: 0.1 },
    ],
  },


];
