# Fair play

[![Play in your browser](media/buttons/play.svg)](https://normansrule.github.io/cardboard-kingdom/play.html)

Cardboard Kingdom wants you to stay a while because there's something nice to do, not because it's nagging you. These are the rules the game follows, starting with 2.22.

## What it never does

- **No microtransactions.** There's no real money anywhere: no shop with a price tag, no premium currency, no ads, no loot boxes.
- **No streaks or daily rewards.** Nothing is lost by taking a week off.
- **No timers and nothing that expires.** Odd Jobs stay on the board until you finish them. New ones arrive after a rest at the campfire, which you choose to take.
- **No fear of missing out.** Every critter, crane, landmark and skin can still be found later. Nothing is limited-time.

## What it does instead

- **Bottle caps are earned by playing.** Battles, sketching critters, finding paper cranes, digging up treasure, visiting landmarks, Odd Jobs and challenge tiers all pay caps. Caps buy paints, hats and garden pieces in the Kingdom Book. Some skins and garden pieces can't be bought at all; they're gold-tier challenge rewards or buried treasure.
- **Visitors, not appointments.** Critters visit your patch in Blossom Hollow when it has something they like. Who's there changes each time you arrive, but nobody leaves for good and nothing is lost if you stay away.
- **Friends at your own pace.** Neighbors get a chat and a present once per visit to their place (or when day turns to night there), not once per real day. Hearts never go down, a missed visit costs nothing, and every heart story waits for you.
- **Favours never expire.** A neighbor's favour waits on the Neighbors page until you get round to it. There's no deadline and no penalty.
- **Goals you can see.** The Kingdom Book shows every job, challenge tier, Field Guide entry and place, so you always know what's left and can decide you're done.
- **A break reminder.** After 60 minutes of play (change it to 30, 45 or 90, or turn it off in Settings), at a calm moment, a postcard suggests a stretch and a glass of water. It never interrupts a battle or a conversation.
- **Story Mode is kind.** In Story Mode critters don't run off, so nobody gets stuck on a sketch.

## Where the world generator's ideas came from

The world layout in `js/game/worldgen.js` is original code, written for this game. No code was copied from these projects. They were studied for ideas:

| Project | License | What we learned from it |
|---|---|---|
| [mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse) | MIT | The simple tiled model: tiles with adjacency rules, collapse the lowest-entropy cell, propagate. Used for the detail layer. |
| [Azgaar/Fantasy-Map-Generator](https://github.com/Azgaar/Fantasy-Map-Generator) | MIT | Settings → generators → world data → renderer, and markers (landmarks, signposts) placed after the land exists. |
| [redblobgames/mapgen4](https://github.com/redblobgames/mapgen4) | Apache-2.0 | Moisture and elevation fields that drive biomes, and trails that follow distance downhill. |
| [IceCreamYou/THREE.Terrain](https://github.com/IceCreamYou/THREE.Terrain) | MIT | Layered value noise (fBm) and scattering decoration by height and slope. |
| [BenPyton/ProceduralDungeon](https://github.com/BenPyton/ProceduralDungeon) | MIT | Checking every room stays reachable; here, a flood fill so no prop blocks a path. |
| princeton-vl/infinigen, Zylann/godot_voxel, TokisanGames/Terrain3D, fegennari/3DWorld, CesiumGS/cesium-unreal | various | Inspiration only, for how real worlds layer biomes, scatter and landmarks. They're 3D engine projects, and none of their code fits a canvas game. |
