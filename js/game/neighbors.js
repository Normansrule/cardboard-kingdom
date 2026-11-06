// Cardboard Kingdom - the Neighbor Round.
// Costume Quest's best bit is going door to door. Once you've rebuilt something in a place, a heart
// appears over every door you've already knocked on: go back and see how everyone is doing now.
// The repair you made shows up in their lives (dry floors, a parade route, a full tidepool), and one
// neighbor per place has an errand: something borrowed that needs to go home.
// Every three visits earns a Battle Stamp: Handle with Care, Measure Twice, All Hands, No One Left Behind.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, TS = 48;
  const f = (k) => CK.flag(k);

  // the repair that opens each place's round
  const OPENS = { spring: 'spring_dam', summer: 'summer_gates', fall: 'fall_bridge', winter: 'winter_done', lanternmere: 'lm_lights', gullpoint: 'gp_shore' };
  const PLACE = { spring: 'Blossom Hollow', summer: 'Sunpatch Shores', fall: 'Amberleaf Woods', winter: 'Frostfold Peak', lanternmere: 'Lanternmere', gullpoint: 'Gull Point' };

  // visit: what they say now. errand: something borrowed that has to go home. back: when it gets there.
  const ROUND = {
    sp_a: { ch: 'spring', visit: [['bunny', 'The parade route goes right past my door again! I have been practicing my wave. It is mostly wrist.', 'happy']],
      errand: { item: 'a borrowed trowel', to: 'sp_b', ask: [['bunny', 'Oh! Would you take this trowel back to the house with the yellow roof? I borrowed it in March. Of last year.', 'sad']] } },
    sp_b: { ch: 'spring', visit: [['hedgehog', 'The floors finally stopped squelching. I named the last puddle Gerald. I will miss Gerald.', 'happy']],
      back: [['hedgehog', 'My trowel! I had given it up for lost. I was going to plant the whole seed swap with a spoon.', 'happy'], ['sam', 'A spoon would have worked. Slowly.', 'happy']] },
    sp_c: { ch: 'spring', visit: [['bunny', 'Someone patched my door with a very neat square of cardboard. There was a note: SORRY. GOOD DOOR. I think it was the Swabby.', 'happy'], ['corry', 'A reformed pirate with excellent carpentry. The Ledger is moved.', 'happy']] },
    sp_d: { ch: 'spring', visit: [['bunny', 'We are home! The carrots are back in the ground where carrots belong. They tried to float to the docks, you know.', 'happy']] },
    sp_e: { ch: 'spring', visit: [['hedgehog', 'Grandpa watched your dam go up from his window. He says you listened to the brook before you built anything. He says that is the whole trick.', 'happy'], ['hedgehog', 'Then he fell asleep. But he meant it.', 'happy']] },

    su_a: { ch: 'summer', visit: [['duck', 'The storm surge stopped at the gates! I watched it give up and go home. Good riddance, water.', 'happy']],
      errand: { item: 'a beach umbrella', to: 'su_b', ask: [['duck', 'My neighbor lent me her beach umbrella for the storm and it HELD. Could you take it back to the red hut? I would, but I am... sunbathing.', 'happy']] } },
    su_b: { ch: 'summer', visit: [['duck', 'Dry floors! I keep stamping on them just to hear them go clomp.', 'happy']],
      back: [['duck', 'My umbrella! It looks... braver. Did it see things? It saw things.', 'shock']] },
    su_c: { ch: 'summer', visit: [['duck', 'That Society agent left his bottle caps behind. I made them into a wind chime. It sounds like money leaving.', 'happy']] },
    su_d: { ch: 'summer', visit: [['mouse', 'We nearly sold for ONE bottle cap. Now the hut is worth... well, it is still a hut. But it is OUR hut.', 'happy']] },
    su_e: { ch: 'summer', visit: [['duck', 'I found a seashell for every hut you saved. This one is yours. It is a bit chipped. It has been through a lot. Like all of us.', 'happy'], ['sam', "I'm keeping it on my desk.", 'happy']] },

    fa_a: { ch: 'fall', visit: [['hedgehog', 'The bridge is back, so the procession can cross again! I am carrying the big pumpkin. Nobody else asked to. Nobody else is allowed.', 'happy']],
      errand: { item: 'a slightly damp lantern', to: 'fa_b', ask: [['hedgehog', 'I borrowed Ember\'s lantern for the procession and dropped it in a puddle and I am too embarrassed to take it back. Could you? Orange roof.', 'sad']] } },
    fa_b: { ch: 'fall', visit: [['fox', 'The burrow drained! I can see my floor. It is a nice floor. I had forgotten I had a floor.', 'happy']],
      back: [['fox', 'My lantern! It is damp. ...Tell Bristle it is fine. Tell Bristle I am not mad. I am a LITTLE mad.', 'happy']] },
    fa_c: { ch: 'fall', visit: [['hedgehog', 'Those agents stuffed leaves down my chimney. Now I just have a very warm, very leafy chimney. It is cozy, actually.', 'happy']] },
    fa_d: { ch: 'fall', visit: [['hedgehog', 'Great-grandma\'s giant story has a new ending. The kind giant comes back and fixes the bridge, with friends. I am telling it at the lantern walk.', 'happy'], ['pip', 'Sam. Sam, you are a bedtime story.', 'happy']] },

    wi_a: { ch: 'winter', visit: [['bunny', 'The Royal Engineer! The spillway sings when the snow melts now. Did you know it would sing?', 'happy'], ['sam', '...No. I just wanted it to hold.', 'happy']],
      errand: { item: 'a pair of big mittens', to: 'wi_c', ask: [['bunny', 'These are Mama Burrow\'s mittens. She left them here after she dug us out. The purple house, would you mind?', 'happy']] } },
    wi_b: { ch: 'winter', visit: [['mouse', 'We got cocoa! At last! I saved you a mug. Well. I saved you the smell of a mug. It was very good cocoa.', 'happy']] },
    wi_c: { ch: 'winter', visit: [['bear', 'That little slush still writes to me. Postcards from the river. It is doing well.', 'happy']],
      back: [['bear', 'My mittens! My paws have been in my pockets for a whole week. Thank you, dear.', 'happy']] },
    wi_d: { ch: 'winter', visit: [['owl', 'With the spillway in, I can finally finish my paper: "On Water, and Where It Would Like To Go." Very peer-reviewed. My cousin read it.', 'happy']] },

    lm_a: { ch: 'lanternmere', visit: [['hedgehog', 'I moved my bed back out of the closet. I can see the stars from my pillow. I have not slept in three days, it is wonderful.', 'happy']],
      errand: { item: 'a star chart', to: 'lm_c', ask: [['hedgehog', 'I borrowed this star chart from the house by the water. I have counted every star on it. Could you take it back?', 'happy']] } },
    lm_b: { ch: 'lanternmere', visit: [['duck', 'I saw the moon! It is smaller than I thought. And nicer. Like a neighbor you finally meet.', 'happy']] },
    lm_c: { ch: 'lanternmere', visit: [['fox', 'Grandma was right. There ARE that many stars. I have stopped arguing with her about everything. Most things.', 'happy']],
      back: [['fox', 'My star chart! Someone has put a tiny tick next to every single star. ...Of course they have.', 'happy'], ['pip', 'It was not me. (It was me.)', 'happy']] },

    gp_a: { ch: 'gullpoint', visit: [['owl', 'The tidepools are full again. I sit by them in the mornings. A crab waved at me. I waved back. We have an understanding.', 'happy']],
      errand: { item: 'a red bucket', to: 'gp_b', ask: [['owl', 'This bucket belongs to the red house. I borrowed it to carry tidepool water. Would you take it home?', 'happy']] } },
    gp_b: { ch: 'gullpoint', visit: [['mouse', 'Chowder? STILL no? Ah well. The crabs have started leaving shells on my step. I think it is rent.', 'happy']],
      back: [['mouse', 'My bucket! It is full of... a crab. Hello, crab. You can stay.', 'shock']] },
    gp_c: { ch: 'gullpoint', visit: [['bear', 'Brack came for tea. Didn\'t say a word for an hour. Then he said, "The reef was a good idea." Then he left.', 'happy'], ['bear', 'That is a lot, for Brack.', 'happy']] },
  };
  CK.Neighbors = ROUND;
  const GIFTS = ['handle', 'measure', 'allhands', 'noone'];
  const ALL = Object.keys(ROUND).length;

  function round() {
    const G = CK.G;
    if (!G.round) G.round = { visited: {}, carry: null, returned: {}, gifts: 0 };
    return G.round;
  }
  const open = (id) => ROUND[id] && f(OPENS[ROUND[id].ch]) && f('knock_' + id);
  const carryingFor = (id) => round().carry && round().carry.to === id;
  // something to do at this door?
  const pending = (id) => !!ROUND[id] && ((open(id) && !round().visited[id]) || (carryingFor(id) && f(OPENS[ROUND[id].ch])));
  CK.roundPending = pending;
  const visits = () => Object.keys(round().visited).length;
  CK.roundCount = () => [visits(), ALL];

  function visitScript(id) {
    const R = ROUND[id], st = round();
    if (carryingFor(id)) {
      const c = st.carry;
      return [
        { narrate: `You hand over ${c.item}.` },
        { fn: () => { st.returned[c.from] = true; st.carry = null; } },
      ].concat(R.back || [], [{ scraps: 3 }, { save: true }]);
    }
    const lines = [{ fn: () => { st.visited[id] = true; } }].concat(R.visit);
    if (R.errand) {
      lines.push({ fn: () => {
        if (st.carry) return [['sam', `I'm already carrying ${st.carry.item}. I'll come back for this one.`, 'sad'], { fn: () => { delete st.visited[id]; } }];
        st.carry = { item: R.errand.item, to: R.errand.to, from: id };
        return R.errand.ask.concat([{ narrate: `Neighbor errand: take ${R.errand.item} home. (Look for the heart over the door.)` }]);
      } });
    }
    lines.push({ fn: () => {
      const n = visits(), out = [];
      CK.toast(`Neighbor Round: ${n} of ${ALL} visits`);
      // every three visits, a thank-you stamp
      if (n % 3 === 0 && st.gifts < GIFTS.length && n / 3 > st.gifts) {
        const id2 = GIFTS[st.gifts++];
        out.push({ narrate: 'Tucked in with the thanks: a little paper stamp, hand-cut by the whole street.' }, { await: () => CK.giveStamp(id2) });
      }
      const ch = R.ch;
      if (Object.keys(ROUND).filter((k) => ROUND[k].ch === ch).every((k) => st.visited[k])) {
        out.push({ journal: `Finished the Neighbor Round in ${PLACE[ch]}. Everyone is doing better than "fine". Most of them are doing "clomp".` });
      }
      out.push({ save: true });
      return out;
    } });
    return lines;
  }

  // knocking on a door with a heart over it is a visit
  const baseInteract = CK.Overworld.prototype.interact;
  CK.Overworld.prototype.interact = function (e, who) {
    if (e && e.type === 'house' && pending(e.id) && !(e.broken && !f(e.broken))) {
      CK.Audio.sfx('knock');
      this.fx.emit({ x: e.px, y: e.py - 30, life: 0.8, size: 18, text: carryingFor(e.id) ? 'special delivery!' : 'knock knock!', shape: 'text', color: '#fff', vy: -30 });
      CK.runScript([{ wait: 0.4 }].concat(visitScript(e.id)));
      return;
    }
    return baseInteract.call(this, e, who);
  };
  CK.houseLabel = (h) => (pending(h.id) ? (carryingFor(h.id) ? 'Return it' : 'Visit') : null);

  // a bouncing heart (or the errand's envelope) over doors with someone to see
  const baseDrawEnt = CK.Overworld.prototype.drawEnt;
  CK.Overworld.prototype.drawEnt = function (ctx, e) {
    baseDrawEnt.call(this, ctx, e);
    if (e.type !== 'house' || !pending(e.id)) return;
    const x = e.x * TS - this.camX + 48, y = e.y * TS - this.camY - 64 + Math.sin(this.t * 4 + e.x) * 4;
    if (carryingFor(e.id)) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, 19, 16, 0, 0, Math.PI * 2); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.strokeStyle = D.C.ink; ctx.lineWidth = 2; ctx.stroke();
      CK.drawEnvelope(ctx, x, y, 20, 14, '#ffe2a8'); ctx.restore();
    } else CK.drawEmote(ctx, 'heart', x, y, this.t);
  };

  // the first time a place's round opens, say so
  const baseUpdate = CK.Overworld.prototype.update;
  CK.Overworld.prototype.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    const ch = this.ch.id;
    if (active && !CK.scriptRunning && OPENS[ch] && f(OPENS[ch]) && !f('nr_open_' + ch) && Object.keys(ROUND).some((k) => ROUND[k].ch === ch && pending(k))) {
      CK.setFlag('nr_open_' + ch);
      CK.toast('Neighbor Round! Hearts over doors: go see how everyone is doing.', '#ffe3ef');
    }
  };
})();
