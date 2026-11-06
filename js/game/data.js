// Cardboard Kingdom - game data: cast, party, costumes, enemies, encounters.
(function () {
  'use strict';
  const CK = window.CK;
  const Data = (CK.Data = {});

  // Who can talk, and how their portrait is drawn.
  Data.speakers = {
    sam: { name: 'Sam', look: 'sam', ps: 2.4, py: 20, bg: '#dfe9ff' },
    corry: { name: 'Sir Corrugate', look: 'corry', ps: 1.9, py: 22, bg: '#ffe6cc' },
    pip: { name: 'Pip', look: 'pip', ps: 2.3, py: 0, bg: '#ffe3ef' },
    mayor: { name: 'Mayor Mossworth', look: 'mayor', ps: 2.4, py: -18, bg: '#e3f6d6' },
    bess: { name: 'Captain Bess', look: 'bess', ps: 1.5, py: 16, bg: '#d9efff' },
    skipper: { name: 'Skipper', look: 'skipper', ps: 2.4, py: 8, bg: '#eaffd6' },
    queen: { name: 'Queen Corrina', look: 'queen', ps: 1.6, py: 10, bg: '#efe6ff' },
    corvin: { name: 'Magister Corvin', look: 'magpie', ps: 2.2, py: 20, bg: '#d8d6e6', o: { big: true } },
    agent: { name: 'Quill Agent', look: 'magpie', ps: 2.2, py: 20, bg: '#e2e0ee' },
    drizzle: { name: 'The Grey Drizzle', look: 'drizzle', ps: 2.2, py: -6, bg: '#cfd6e2' },
    swabby: { name: 'Soggy Swabby', look: 'swabby', ps: 2.2, py: 10, bg: '#fff6c8' },
    bunny: { name: 'Clover', look: 'critter', ps: 2.2, py: 0, bg: '#ffeef3', o: { species: 'bunny', color: '#fff', hat: 'flowers' } },
    hedgehog: { name: 'Bristle', look: 'critter', ps: 2.2, py: 0, bg: '#f3eadc', o: { species: 'hedgehog', color: '#e6c9a3' } },
    duck: { name: 'Dabble', look: 'critter', ps: 2.2, py: 0, bg: '#fff8d6', o: { species: 'duck', color: '#ffe67a', hat: 'sunhat' } },
    fox: { name: 'Ember', look: 'critter', ps: 2.2, py: 0, bg: '#ffe8d6', o: { species: 'fox', color: '#f29a52', scarf: '#5aa9e6' } },
    owl: { name: 'Professor Hoot', look: 'critter', ps: 2.2, py: 0, bg: '#efe6d6', o: { species: 'owl', color: '#b98d62' } },
    mouse: { name: 'Nib', look: 'critter', ps: 2.2, py: 0, bg: '#f1f1f1', o: { species: 'mouse', color: '#d6d0cc', hat: 'beanie', hatColor: '#5aa9e6' } },
    robin: { name: 'Robin Redbox', look: 'critter', ps: 2.2, py: 0, bg: '#ffe6e0', o: { species: 'robin', color: '#9a6a4a' } },
    bear: { name: 'Mama Burrow', look: 'critter', ps: 2.2, py: 0, bg: '#f3e2cf', o: { species: 'bear', color: '#a8774c', scarf: '#ef6b6b' } },
    leafling: { name: 'Leafling', look: 'critter', ps: 2.2, py: 0, bg: '#ffe2c4', o: { species: 'hedgehog', color: '#e8743b' } },
    jules: { name: 'Jules', look: 'jules', ps: 2.4, py: 20, bg: '#e6f7ef' },
    okafor: { name: 'Dr. Okafor', look: 'okafor', ps: 2.3, py: 20, bg: '#efe9dd' },
    student: { name: 'Student', look: 'human', ps: 2.3, py: 20, bg: '#e9e9ef', o: { hair: '#2b2b2b', top: '#9a8fb0' } },
    biscuit: { name: 'Biscuit', look: 'cat', ps: 3, py: -10, bg: '#fff1dc' },
    penwright: { name: 'Mr. Penwright', look: 'penwright', ps: 2.3, py: 34, bg: '#e6e9ef' },
    grandma: { name: 'Grandma Rosie', look: 'grandma', ps: 2.3, py: 20, bg: '#fde8ee' },
    narrator: { name: '', look: null },
  };

  // Party base stats (level 1) and growth per level
  Data.party = {
    sam: { name: 'Sam', hp: 30, hpG: 5, atk: 6, atkG: 1.4 },
    corry: { name: 'Sir Corrugate', hp: 38, hpG: 6, atk: 5, atkG: 1.2 },
    pip: { name: 'Pip', hp: 24, hpG: 4, atk: 7, atkG: 1.6 },
    jules: { name: 'Jules', hp: 32, hpG: 5, atk: 6, atkG: 1.4 },
  };

  Data.costumes = {
    knight: { name: 'Box Knight', hp: 0, atk: 1, special: 'Tape Slash', desc: 'A mighty swing at one foe (2.5x).', color: '#ef6b6b' },
    tower: { name: 'Castle Tower', hp: 8, atk: 0, special: 'Fortify', desc: 'Whole party takes half damage for 2 enemy turns.', color: '#cbbba5' },
    kite: { name: 'Paper Kite', hp: -2, atk: 1, special: 'Gust', desc: 'A whirl of wind hits every foe (1.3x).', color: '#ff8fb1' },
    lighthouse: { name: 'Lighthouse', hp: 4, atk: 0, special: 'Beacon', desc: 'Dazzles all foes: light damage, they skip a turn.', color: '#fff36a' },
    bulldozer: { name: 'Bulldozer', hp: 6, atk: 2, special: 'Earthworks', desc: 'Huge hit on one foe (3x) and dries off the party.', color: '#ffc93c' },
    bridge: { name: 'Suspension Bridge', hp: 6, atk: 0, special: 'Span of Friends', desc: 'Heals the whole party 50% and dries them off.', color: '#ef6b6b' },
    snowplow: { name: 'Snowplow', hp: 4, atk: 2, special: 'Plow Through', desc: 'Pushes through every foe (1.7x).', color: '#6fa8dc' },
    umbrella: { name: 'Paper Parasol', hp: 4, atk: 1, special: 'Rain Shield', desc: 'Dries the party; water hits do 60% less for 2 enemy turns.', color: '#5aa9e6' },
    hardhat: { name: 'Hard Hat Engineer', hp: 8, atk: 3, special: 'Calculated Strike', desc: 'Hits every foe 2x. Always a perfect hit.', color: '#ffc93c' },
  };

  // What each costume does outside of battle (worn by the lead player)
  Data.fieldPowers = {
    bulldozer: 'Shove aside Silver Quill barricades',
    snowplow: 'Plow through snowdrifts',
    bridge: 'Span shallow water',
    lighthouse: 'Brighter nights; reveals hidden boxes',
    umbrella: 'Stay dry in the rain',
    kite: 'Ride the breeze: walk a little faster',
  };

  // Soak: water fills a meter; full = floppy (lose a turn). Mid-battle builds cost scraps.
  Data.builds = {
    barricade: { name: 'Barricade', cost: 3, desc: 'A cardboard wall in front of the party. Soaks up the next 3 water attacks.' },
    gutter: { name: 'Gutter', cost: 2, desc: 'Drains everyone (-60 soak) and channels water away for 2 turns.' },
  };

  // Nib's Swap Shop
  Data.shop = [
    { id: 'juice1', name: 'Juice Box', cost: 4, desc: 'Heals one friend and dries them off.' },
    { id: 'juice3', name: '3 Juice Boxes', cost: 10, desc: 'A bargain. Nib insists.' },
    { id: 'poncho', name: 'Rain Ponchos', cost: 14, once: true, desc: 'Party gets 25% less soaked forever.' },
    { id: 'wax', name: 'Wax Crayon Seal', cost: 18, once: true, desc: 'Floppy fighters bounce back with less soak.' },
  ];

  // Cardboard reinforcement grades (bought at workbenches)
  Data.reinforce = [
    { name: 'Single-Wall', cost: 0, def: 0, water: 0, fact: 'One wavy layer (the "flute") glued between two flat sheets. Light, but it gets soggy fast.' },
    { name: 'Double-Wall', cost: 12, def: 1, water: 0.12, fact: 'Two flutes stacked. Like a second row of tiny arches, it spreads loads out.' },
    { name: 'Triple-Wall', cost: 28, def: 2, water: 0.24, fact: 'Three flutes! Engineers use triple-wall boxes to ship engines.' },
    { name: 'Laminated', cost: 50, def: 3, water: 0.36, fact: 'Layers glued with the flutes crossing, like plywood. Stiff in every direction.' },
    { name: 'Wax-Sealed', cost: 80, def: 4, water: 0.5, fact: 'A wax coat keeps water out of the fibers. Waterproofing is half of all good engineering.' },
  ];

  // Enemies. water: attacks soak (reinforcement helps). moves pick randomly by weight.
  Data.enemies = {
    swabby: { name: 'Soggy Swabby', hp: 18, atk: 4, def: 0, xp: 4, scraps: 3, draw: 'swabby',
      moves: [{ name: 'Mop Bonk', power: 1, w: 3, water: true }, { name: 'Bucket Splash', power: 0.8, w: 1, water: true, soak: true }] },
    splashling: { name: 'Splashling', hp: 13, atk: 5, def: 0, xp: 3, scraps: 2, draw: 'splashling',
      moves: [{ name: 'Splish', power: 1, w: 3, water: true }, { name: 'Big Splash', power: 0.6, all: true, w: 1, water: true }] },
    barnacle: { name: 'Barnacle Brute', hp: 30, atk: 4, def: 2, xp: 6, scraps: 4, draw: 'barnacle',
      moves: [{ name: 'Shell Slam', power: 1.3, w: 2 }, { name: 'Tide Pull', power: 0.7, all: true, w: 1, water: true }] },
    magpie: { name: 'Quill Agent', hp: 26, atk: 6, def: 1, xp: 7, scraps: 6, draw: 'magpie',
      moves: [{ name: 'Peck', power: 1, w: 3 }, { name: 'Shiny Distraction', power: 0.5, w: 1, drain: true }, { name: 'Ink Splat', power: 0.8, all: true, w: 1 }] },
    pumpbot: { name: 'Pump Bot', hp: 30, atk: 6, def: 2, xp: 7, scraps: 5, draw: 'pumpbot',
      moves: [{ name: 'Hose Blast', power: 0.8, all: true, w: 2, water: true }, { name: 'Gear Bump', power: 1.1, w: 2 }] },
    leafling: { name: 'Leafling', hp: 30, atk: 7, def: 1, xp: 8, scraps: 5, draw: 'leafling',
      moves: [{ name: 'Leaf Toss', power: 1, w: 3 }, { name: 'Damp Mulch', power: 0.8, w: 1, water: true, soak: true }] },
    slush: { name: 'Slush Slime', hp: 44, atk: 8, def: 2, xp: 10, scraps: 7, draw: 'slush',
      moves: [{ name: 'Slush Slap', power: 1, w: 3, water: true }, { name: 'Melt Wave', power: 0.7, all: true, w: 1, water: true, soak: true }] },

    // bosses
    bess: { name: 'Captain Barnacle Bess', hp: 120, atk: 7, def: 1, xp: 30, scraps: 25, draw: 'bess', boss: true, s: 1,
      moves: [{ name: 'Mop Sweep', power: 0.8, all: true, w: 2, water: true }, { name: 'Bucket Brigade', power: 1.3, w: 2, water: true, soak: true }, { name: 'All Hands!', summon: 'swabby', w: 1 }] },
    moatengine: { name: 'The Royal Moat Engine', hp: 210, atk: 9, def: 2, xp: 50, scraps: 40, draw: 'moatengine', boss: true,
      moves: [{ name: 'Pump Surge', power: 0.85, all: true, w: 2, water: true }, { name: 'Gear Grind', power: 1.4, w: 2 }, { name: 'Deploy Pump Bot', summon: 'pumpbot', w: 1 }] },
    clogwood: { name: 'The Clogwood Beast', hp: 300, atk: 11, def: 3, xp: 70, scraps: 50, draw: 'clogwood', boss: true,
      moves: [{ name: 'Leaf Avalanche', power: 0.85, all: true, w: 2 }, { name: 'Damp Rot', power: 1.3, w: 2, water: true, soak: true }, { name: 'Regrow', heal: 0.12, w: 1 }] },
    corvin: { name: 'Magister Corvin', hp: 360, atk: 13, def: 3, xp: 90, scraps: 70, draw: 'corvin', boss: true,
      moves: [{ name: 'Silver Quill', power: 1.5, w: 2 }, { name: 'Ledger of Lies', power: 0.6, all: true, w: 2, drain: true }, { name: 'Summon Agent', summon: 'magpie', w: 1 }] },
    drizzle: { name: 'The Grey Drizzle', hp: 480, atk: 13, def: 2, xp: 0, scraps: 0, draw: 'drizzle', boss: true, floor: 0.3,
      moves: [{ name: 'Downpour', power: 0.9, all: true, w: 2, water: true, soak: true }, { name: 'Heavy Thoughts', power: 1.3, w: 2, drain: true }, { name: '"What\'s the point?"', power: 0.7, all: true, w: 1, drain: true }] },
  };

  // Encounter groups
  Data.battles = {
    sp_swab1: { enemies: ['swabby'], season: 'spring' },
    sp_swab2: { enemies: ['swabby', 'splashling'], season: 'spring' },
    sp_swab3: { enemies: ['splashling', 'splashling', 'swabby'], season: 'spring' },
    sp_barn: { enemies: ['barnacle', 'swabby'], season: 'spring' },
    sp_boss: { enemies: ['bess'], season: 'spring', boss: true, music: 'boss' },
    su_agents: { enemies: ['magpie', 'magpie'], season: 'summer' },
    su_pumps: { enemies: ['pumpbot', 'magpie'], season: 'summer' },
    su_mix: { enemies: ['pumpbot', 'splashling', 'pumpbot'], season: 'summer' },
    su_door: { enemies: ['magpie'], season: 'summer' },
    su_boss: { enemies: ['moatengine'], season: 'summer', boss: true, music: 'boss' },
    fa_leaf1: { enemies: ['leafling', 'leafling'], season: 'fall' },
    fa_leaf2: { enemies: ['leafling', 'magpie', 'leafling'], season: 'fall' },
    fa_agents: { enemies: ['magpie', 'magpie', 'pumpbot'], season: 'fall' },
    fa_boss: { enemies: ['clogwood'], season: 'fall', boss: true, music: 'boss' },
    wi_slush: { enemies: ['slush', 'slush'], season: 'winter' },
    wi_agents: { enemies: ['magpie', 'slush', 'magpie'], season: 'winter' },
    wi_guard: { enemies: ['magpie', 'magpie', 'magpie'], season: 'winter' },
    wi_corvin: { enemies: ['magpie', 'corvin', 'magpie'], season: 'winter', boss: true, music: 'boss' },
    wi_drizzle: { enemies: ['drizzle'], season: 'winter', boss: true, music: 'boss', final: true },
  };

  Data.seasons = {
    spring: { name: 'Spring', ground: '#a3dc86', ground2: '#93d077', path: '#f0d9a6', sand: '#f6e2a8', water: '#6ccff0', waterD: '#3fa9d6', sky: ['#bfe8ff', '#ffe3f1'], night: ['#1d1a4a', '#4a2f6e'], tree: 'blossom', particle: 'petal' },
    summer: { name: 'Summer', ground: '#b6e27a', ground2: '#a5d66b', path: '#f3d39a', sand: '#f8e3a6', water: '#3fc4e0', waterD: '#1f98c4', sky: ['#7fd6ff', '#fff2b8'], night: ['#13234f', '#3b2e6b'], tree: 'palm', particle: 'sparkle' },
    fall: { name: 'Fall', ground: '#d8be6e', ground2: '#cdb060', path: '#e7c993', sand: '#ecd7a2', water: '#5aa6c8', waterD: '#3a83a8', sky: ['#ffd9a8', '#ffb38a'], night: ['#22163f', '#5a2d4a'], tree: 'maple', particle: 'leaf' },
    campus: { name: 'Campus', ground: '#9cbf86', ground2: '#90b37a', path: '#cfc8bb', sand: '#d8d0c0', water: '#8fb6c8', waterD: '#6f97aa', sky: ['#b8c0c8', '#d8dce0'], night: ['#1e2236', '#3a3a52'], tree: 'oak', particle: 'none' },
    campusColor: { name: 'Campus', ground: '#9ee07a', ground2: '#8fd46c', path: '#f3dca6', sand: '#f6e2a8', water: '#5fd0f5', waterD: '#3aa9da', sky: ['#9fdcff', '#ffe3f1'], night: ['#1d1a4a', '#4a2f6e'], tree: 'oak', particle: 'petal' },
    winter: { name: 'Winter', ground: '#eef5fc', ground2: '#e2ecf7', path: '#d7e2ee', sand: '#e9eef3', water: '#9fd6ee', waterD: '#78bfdc', sky: ['#cfe6ff', '#f4f8ff'], night: ['#121a3e', '#2c2c63'], tree: 'pine', particle: 'snow' },
  };
})();
