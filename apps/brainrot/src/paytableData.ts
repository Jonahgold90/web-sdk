// Symbol asset paths (served from static folder)
const h1 = '/assets/sprites/paytableSymbols/h1.png';
const h2 = '/assets/sprites/paytableSymbols/h2.png';
const h3 = '/assets/sprites/paytableSymbols/h3.png';
const h4 = '/assets/sprites/paytableSymbols/h4.png';

const l1 = '/assets/sprites/paytableSymbols/l1.png';
const l2 = '/assets/sprites/paytableSymbols/l2.png';
const l3 = '/assets/sprites/paytableSymbols/l3.png';
const l4 = '/assets/sprites/paytableSymbols/l4.png';

const scatter = '/assets/sprites/paytableSymbols/s.png';
const multiplier = '/assets/sprites/paytableSymbols/m.png';

import { stateUrlDerived } from 'state-shared';

// Helper function to get social-compatible text
const getSocialText = (regularText: string, socialText: string) =>
  stateUrlDerived.social() ? socialText : regularText;

export const symbolPayouts = [
  // Premium Symbols
  {
    name: 'H1',
    image: h1,
    payouts: [
      { match: '12+', multiplier: 50.00 },
      { match: '10-11', multiplier: 25.00 },
      { match: '8-9', multiplier: 10.00 },
    ],
  },
  {
    name: 'H2',
    image: h2,
    payouts: [
      { match: '12+', multiplier: 25.00 },
      { match: '10-11', multiplier: 10.00 },
      { match: '8-9', multiplier: 2.50 },
    ],
  },
  {
    name: 'H3',
    image: h3,
    payouts: [
      { match: '12+', multiplier: 15.00 },
      { match: '10-11', multiplier: 5.00 },
      { match: '8-9', multiplier: 2.00 },
    ],
  },
  {
    name: 'H4',
    image: h4,
    payouts: [
      { match: '12+', multiplier: 12.00 },
      { match: '10-11', multiplier: 2.00 },
      { match: '8-9', multiplier: 1.50 },
    ],
  },

  // Low Symbols
  {
    name: 'L1',
    image: l1,
    payouts: [
      { match: '12+', multiplier: 10.00 },
      { match: '10-11', multiplier: 1.50 },
      { match: '8-9', multiplier: 1.00 },
    ],
  },
  {
    name: 'L2',
    image: l2,
    payouts: [
      { match: '12+', multiplier: 8.00 },
      { match: '10-11', multiplier: 1.00 },
      { match: '8-9', multiplier: 0.80 },
    ],
  },
  {
    name: 'L3',
    image: l3,
    payouts: [
      { match: '12+', multiplier: 5.00 },
      { match: '10-11', multiplier: 1.00 },
      { match: '8-9', multiplier: 0.50 },
    ],
  },
  {
    name: 'L4',
    image: l4,
    payouts: [
      { match: '12+', multiplier: 4.00 },
      { match: '10-11', multiplier: 0.90 },
      { match: '8-9', multiplier: 0.40 },
    ],
  },

  // Scatter Symbol
  {
    name: 'Scatter',
    image: scatter,
    payouts: [
      { match: '6', multiplier: 100.00 },
      { match: '5', multiplier: 5.00 },
      { match: '4', multiplier: 3.00 },
    ],
    description:
      '<strong>4+ Scatters anywhere</strong> trigger <strong>10 Free Spins</strong>. During Free Spins, landing <strong>3+ Scatters</strong> ' +
      'awards <strong>+5 additional spins</strong> (retrigger). Scatters also {{PAY_WIN}} as shown above when they appear.',
    isSpecial: true,
  },

  // Multiplier Symbol
  {
    name: 'Multiplier',
    image: multiplier,
    payouts: [],
    description:
      '<strong>Free Spins only.</strong><br/>' +
      '• Multiplier values range from <strong>2×</strong> to <strong>1000×</strong><br/>' +
      '• All values on screen are summed and applied to tumble chain {{WIN_PRIZE}}',
    isSpecial: true,
  },
];

// Multiplier values obtainable in Free Spins
export const multiplierValues = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 1000];
