import h1 from './components/assets/h1.png';
import h2 from './components/assets/h2.png';
import h3 from './components/assets/h3.png';
import h4 from './components/assets/h4.png';
import h5 from './components/assets/h5.png';

import l1 from './components/assets/l1.png'; // A
import l2 from './components/assets/l2.png'; // K
import l3 from './components/assets/l3.png'; // Q
import l4 from './components/assets/l4.png'; // J

import wild from './components/assets/w.png';
import scatter from './components/assets/s.png';

export const symbolPayouts = [
  {
    name: 'Wild',
    image: wild,
    payouts: [],
    description: 'Substitutes for all symbols except Scatter.',
  },
  {
    name: 'Scatter',
    image: scatter,
    payouts: [
      { match: '3x', multiplier: 0, description: '10 spins' },
      { match: '4x', multiplier: 0, description: '15 spins' },
      { match: '5x', multiplier: 0, description: '20 spins' },
    ],
    description: 'Pays anywhere and triggers the Free Spins bonus.',
  },
  {
    name: 'Wizard',
    image: h1,
    payouts: [
      { match: '5x', multiplier: 5.0 },
      { match: '4x', multiplier: 2.5 },
      { match: '3x', multiplier: 1.0 },
    ],
  },
  {
    name: 'Chest',
    image: h2,
    payouts: [
      { match: '5x', multiplier: 4.0 },
      { match: '4x', multiplier: 2.0 },
      { match: '3x', multiplier: 0.8 },
    ],
  },
  {
    name: 'H3',
    image: h3,
    payouts: [
      { match: '5x', multiplier: 3.5 },
      { match: '4x', multiplier: 1.8 },
      { match: '3x', multiplier: 0.7 },
    ],
  },
  {
    name: 'Ship',
    image: h4,
    payouts: [
      { match: '5x', multiplier: 3.0 },
      { match: '4x', multiplier: 1.5 },
      { match: '3x', multiplier: 0.6 },
    ],
  },
  {
    name: 'Goblet',
    image: h5,
    payouts: [
      { match: '5x', multiplier: 1.0 },
      { match: '4x', multiplier: 0.5 },
      { match: '3x', multiplier: 0.2 },
    ],
  },
  {
    name: 'Heart',
    image: l1,
    payouts: [
      { match: '5x', multiplier: 1.5 },
      { match: '4x', multiplier: 0.7 },
      { match: '3x', multiplier: 0.3 },
    ],
  },
  {
    name: 'Clove',
    image: l2,
    payouts: [
      { match: '5x', multiplier: 1.2 },
      { match: '4x', multiplier: 0.6 },
      { match: '3x', multiplier: 0.2 },
    ],
  },
  {
    name: 'Spade',
    image: l3,
    payouts: [
      { match: '5x', multiplier: 1.0 },
      { match: '4x', multiplier: 0.5 },
      { match: '3x', multiplier: 0.1 },
    ],
  },
  {
    name: 'Diamond',
    image: l4,
    payouts: [
      { match: '5x', multiplier: 0.8 },
      { match: '4x', multiplier: 0.4 },
      { match: '3x', multiplier: 0.1 },
    ],
  },
];
