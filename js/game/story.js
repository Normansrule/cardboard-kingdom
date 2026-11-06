// Cardboard Kingdom - the story. Every cutscene and conversation lives here.
// ['who', 'line', 'mood'] is dialogue. Objects are commands (see script.js).
(function () {
  'use strict';
  const CK = window.CK;
  const f = (k) => CK.flag(k);
  const S = {};
  CK.Story = { scripts: S };

  // ===================================================================
  // SPRING - Blossom Hollow
  // ===================================================================
  S.spring_intro = [
    { card: { title: 'Chapter 1: Spring', sub: 'Blossom Hollow' } },
    { narrate: 'Sam opens their eyes. The ceiling is gone. Above them, cherry blossoms drift down like pink confetti... made of tissue paper.' },
    ['sam', "Okay. Either I fell asleep in Grandma's box, or I finally lost it over that hydraulics problem set.", 'shock'],
    { coop: [['jules', "Sam. SAM. We're tiny. Or everything is cardboard. Or both. Why is the sky made of tissue paper?!", 'shock']] },
    ['pip', 'HALT! Who goes there? State your name, your business, and whether you are a monster!', 'angry'],
    ['sam', "Uh. Sam. Business: very confused. And no, I'm not a monster. I'm a... civil engineering student?", 'shock'],
    ['pip', 'A civil... engine... ear? Sir Corrugate! Come quick! It\'s a giant with a very long job title!'],
    { coop: [['jules', "And I'm Jules! Business: roommate. Also not a monster. I do have a lot of opinions about snacks."]] },
    ['corry', 'Pip, be polite. Hello, friend. I am Sir Corrugate, knight of the Cardboard Kingdom. This loud little crane is my squire.', 'happy'],
    ['pip', 'Squire-in-training. Soon to be a full knight. Probably. If I pass the folding exam.'],
    ['corry', "You're in Blossom Hollow. I'm afraid you've arrived at a soggy time. The brook floods every spring now, and monsters raid our docks at night.", 'sad'],
    ['sam', 'Monsters?'],
    ['pip', 'Big wet ones! They come from the Brinemarsh and steal our cardboard. Mayor Mossworth says they want to turn the whole kingdom into mush!'],
    ['corry', "Every knight needs armor. Here. It's a little big, but it was the best box in the recycling pile.", 'happy'],
    { narrate: 'Sir Corrugate hands Sam a cardboard helmet, a breastplate made from a cereal box, and a sword made from a paper towel tube.' },
    { coop: [
      { narrate: 'Then he hands Jules a raincoat made from a shipping box and a huge paper parasol.' },
      ['jules', "A parasol? In a war against WATER? ...Oh. Oh, that's actually genius.", 'happy'],
    ] },
    ['sam', "This is... exactly what I built when I was eight. I haven't made anything just for fun in years.", 'happy'],
    ['pip', 'In a battle, cardboard comes alive! You turn into a GIANT version of whatever you wear. It is extremely cool and only slightly terrifying.'],
    ['corry', "But mind the water. Cardboard's one true enemy. Get too soaked and you go floppy. Build gutters and barricades if a fight gets wet."],
    ['corry', "Let's find Mayor Mossworth. He's the tortoise in the top hat, just east of the houses."],
    { journal: 'Woke up in the Cardboard Kingdom. Met Sir Corrugate (a gentle bear knight) and Pip (a crane squire). Monsters raid Blossom Hollow at night.' },
  ];

  S.sp_mayor = [
    { if: () => f('spring_boss'), then: [['mayor', 'Monsters and bunnies building a harbor together. I never would have believed it. Thank you, Royal... er, Sam.', 'happy']] },
    { if: () => f('spring_dam'), then: [['mayor', 'The check dam is holding! Our homes are dry! Now, about those monsters...', 'happy']] },
    { if: () => f('sp_met_mayor'), then: [['mayor', 'The brook is north of the village, up the path past the bridge. If anyone can stop it flooding, it is a civil engine-ear.']] },
    ['mayor', 'Ah! Sir Corrugate, Pip, and... a very tall visitor. Welcome to Blossom Hollow. Mind the puddles.'],
    ['mayor', 'Three homes have gone soggy this month. Blossom Brook rises higher every spring. It never used to.', 'sad'],
    ['sam', "Rivers don't usually change for no reason. Something upstream must be sending more water down. Or the banks got weaker."],
    ['mayor', 'The Royal Advisors say it is the monsters. They sent this letter. Sealed with a silver feather. Very official.'],
    { narrate: '"By order of the Silver Quill Society, advisors to the Queen: the floods are caused by Brinemarsh monsters. Build no defenses. Trust the Society. Pay the Society."' },
    ['pip', '"Build no defenses"? That\'s a weird thing to say to a village that is currently underwater.'],
    ['sam', "If the brook keeps flooding, the village needs a check dam. A small low wall across the stream that slows the water down and holds it back."],
    ['corry', 'Can you build one out of cardboard?'],
    ['sam', "Cardboard is surprisingly strong if you stack it right. I'd need to think about the water pressure. Pressure gets bigger the deeper you go.", 'happy'],
    ['mayor', 'Then please, take a look at Blossom Brook. The blueprint stand is up the north path. And knock on doors, folks will share what scraps they can.'],
    { flag: 'sp_met_mayor' },
    { journal: 'Mayor Mossworth got a letter from the "Silver Quill Society" blaming the monsters, telling the village not to build defenses. Suspicious.' },
  ];

  S.sp_clover = [
    { if: () => f('spring_boss'), then: [['bunny', "Skipper showed me how to make a paper boat! It floats! Mostly!", 'happy']] },
    ['bunny', "Are you a knight? You look like a knight. A tall, confused knight."],
    ['bunny', "My mama says not to go near the docks at night because of the monsters. But one time I saw a little monster crying. Monsters can cry?", 'sad'],
  ];
  S.sp_robin = [
    ['robin', "I deliver the mail! Lately it's all letters from the Silver Quill Society. Shiny silver seals. Ooh, I do love a shiny seal.", 'happy'],
    ['robin', "Funny thing, though. They never let me deliver letters TO the Queen. Only from 'the Queen's advisors'."],
  ];

  S.sp_knock_a = [
    ['bunny', "Oh! A knight! Here, we saved some cardboard scraps for the brave folks fixing things. Use them at a workbench!", 'happy'],
    { scraps: 6 },
  ];
  S.sp_knock_b = [['hedgehog', "Thank you for the dam! We moved back in this morning. The floors are only a LITTLE squishy.", 'happy'], { scraps: 4 }];
  S.sp_knock_c = [
    { narrate: 'The door creaks open. Something yellow and spongy is stuffing cardboard into a sack.' },
    ['swabby', "Uh oh. Uh... ARRR? I mean, nobody's here! I'm a, um, very wet bunny!", 'shock'],
    ['pip', 'That is NOT a bunny! Get them!'],
    { battle: 'sp_swab1' },
    ['swabby', "Okay, okay! I'm sorry! It's just... our boats are falling apart. The water keeps rising in the Brinemarsh. We need cardboard to patch our homes.", 'sad'],
    ['swabby', "Please don't tell the Captain I got caught. She says we only take what we need."],
    { narrate: 'The Swabby squishes out the window and drips away into the blossoms.' },
    ['sam', 'Their homes are flooding too?', 'sad'],
    ['corry', 'Hmm. That is not what the letter said.'],
  ];
  S.sp_knock_d = [['bunny', "We're back home! The puddles are gone and my carrots stopped floating away. Have a juice box!", 'happy'], { snacks: 1 }];
  S.sp_knock_e = [
    ['hedgehog', "Psst. My grandpa says the brook only started flooding after silver-masked birds came by with shovels. Probably nothing. Have some scraps.", 'happy'],
    { scraps: 5 },
  ];

  S.sp_site = [
    { if: () => f('spring_dam'), then: [{ narrate: 'The check dam holds firm. Blossom Brook burbles politely into the lake.' }] },
    { if: () => !f('sp_met_mayor'), then: [['corry', "That's the blueprint stand for Blossom Brook. Let's talk to Mayor Mossworth first so we know what we're dealing with."]] },
    ['sam', "Okay. A check dam across the brook. The deeper the water, the harder it pushes. So the bottom of the wall has to be the strongest part.", 'happy'],
    ['pip', 'That sounds like math.'],
    ['sam', "It's hydrostatics. Which, I'm realizing, is just a fancy word for 'how hard water leans on stuff'.", 'happy'],
    { puzzle: 'spring_dam' },
    { flag: 'spring_dam' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { sfx: 'win' },
    ['mayor', "The brook! It's calm! And look, the puddles are draining from the village!", 'happy'],
    ['corry', 'The soggy houses are being rebuilt already. Bunnies are fast builders when they have hope.', 'happy'],
    ['sam', "That actually worked. I designed something and it WORKED. I forgot how good that feels.", 'happy'],
    { journal: 'Built a check dam on Blossom Brook. Wider at the bottom because water pressure grows with depth (p = ρgh).' },
    { wait: 0.4 },
    { night: true },
    { music: 'spring', night: true },
    ['pip', 'Uh oh. The lanterns are lighting up by the lake. Lots of lanterns. On BOATS.', 'shock'],
    ['corry', 'The monsters are raiding the docks! To the south shore, quickly!'],
    { save: true },
  ];

  S.sp_boss = [
    { narrate: 'Patched-up boats bob at the docks. A huge spongy figure in a patchwork coat steps onto the planks.' },
    ['bess', "Alright, crew, quick and quiet! Take only the loose boxes. Leave the homes alone! ...Oh. Company.", 'angry'],
    ['corry', 'Captain Barnacle Bess! Leave Blossom Hollow in peace!'],
    ['bess', "Peace? Peace is a dry bed, knight. My crew hasn't had one in months. We need that cardboard more than you know.", 'angry'],
    ['bess', "Stand aside, or we'll mop the floor with ya. Gently. But thoroughly.", 'angry'],
    { battle: 'sp_boss' },
    { flag: 'spring_boss' },
    { fn: () => CK.OW && CK.OW.refresh() },
    ['bess', "Oof. Alright. You've got a strong arm and a stronger box.", 'sad'],
    ['skipper', 'MOM! Are you okay?!', 'sad'],
    ['sam', "...Mom?", 'shock'],
    ['bess', "This is Skipper. My kid. Everyone on those boats is somebody's kid, knight.", 'sad'],
    ['bess', "The Brinemarsh used to be a quiet swamp. Then the water started rising. Every night, higher. Our village is floating on patched-up rafts now.", 'sad'],
    ['bess', "We take cardboard to patch the holes. Just enough to stay afloat. We never wanted to scare anyone.", 'sad'],
    ['pip', "But the Silver Quill Society said YOU were causing the floods!"],
    ['bess', "The birds in the silver masks? Ha! They're the ones who came to the marsh with shovels and pumps. Pushed the water at us, then told everyone we're the danger.", 'angry'],
    ['corry', "The Society are the Queen's own advisors. Why would they...", 'sad'],
    { narrate: 'Pip spots something glinting between the dock planks: a long silver feather, sharpened like a pen.' },
    ['pip', "A silver quill. Corry, it's theirs. They were HERE. Tonight.", 'shock'],
    ['sam', "If someone is pushing water around on purpose, then this was never a monster problem. It's a drainage problem. And maybe a people problem.", 'angry'],
    ['bess', "The water pumping starts on the Sunpatch Shore. That's where we're anchored next. Come see for yourself, if you're brave enough.", 'happy'],
    ['sam', "Sunpatch? Isn't it spring?"],
    ['pip', "In the Cardboard Kingdom the seasons are places, silly. You just walk to summer! It's down the east road.", 'happy'],
    { journal: 'TWIST: The monsters were never the villains. Captain Bess and the Brinemarsh folk are losing their homes to rising water. A silver quill was left at the docks.' },
    { choice: { who: 'sam', text: 'Head to Sunpatch Shores now?', options: [{ label: 'Set sail for summer!', then: [{ chapter: 'summer', label: 'Off to Sunpatch Shores!' }] }, { label: 'Look around a little longer', then: [['corry', "Talk to Bess at the docks when you're ready to go."]] }] } },
  ];
  S.sp_bess_after = [
    { choice: { who: 'bess', text: 'Ready to see what the Society is doing on the shore?', options: [{ label: 'Set sail for summer!', then: [{ chapter: 'summer', label: 'Off to Sunpatch Shores!' }] }, { label: 'Not yet', then: [['bess', "We'll be here. Bobbing. Slightly damp."]] }] } },
  ];
  S.sp_skipper = [['skipper', "Mom says you're okay for a giant. I think your helmet is cool. Can I try it on? No? Okay.", 'happy']];

  // ===================================================================
  // SUMMER - Sunpatch Shores
  // ===================================================================
  S.summer_intro = [
    { card: { title: 'Chapter 2: Summer', sub: 'Sunpatch Shores' } },
    { narrate: 'Warm sand. Salt air. Cardboard beach huts with striped awnings. The Brinemarsh flotilla bobs offshore like a little floating town.' },
    ['pip', "SUMMER! Ooh, sandcastles! Sand-cardboard-castles! Is that a thing? It's a thing now.", 'happy'],
    ['corry', 'Something is wrong. Look east. That great grey wall was not here last year.'],
    ['sam', "A sea wall. A big one. It's blocking the storm surge from the east side of the beach... and pushing all the water toward the town and the marsh.", 'angry'],
    ['bess', "That's the 'Royal Sea Wall'. And behind it, the Royal Moat Engine. Pumps the capital's floodwater right out onto us.", 'angry'],
    ['bess', "My Skipper's waiting by the harbor canal. Kid knows every inch of this beach. Go say hi."],
    { coop: [['jules', "There's a lemonade stand. Sam, there's a LEMONADE stand. Priorities.", 'happy']] },
    { journal: 'Arrived at Sunpatch Shores. The Silver Quill Society built a sea wall that shoves storm water onto the town and the Brinemarsh flotilla.' },
  ];
  S.su_skipper = [
    { if: () => f('su_met_skipper'), then: [['skipper', "The harbor blueprint is right here by the canal! Remember: houses dry, boats free!", 'happy']] },
    ['skipper', "You came! Mom said you would. Okay, okay, so here's the problem.", 'happy'],
    ['skipper', "When the storm comes in tonight, the sea pours down the canal and floods the huts. But if you block the canal, our boats can't get to the docks.", 'sad'],
    ['skipper', "The ducks want a wall. We need a canal. Everybody's mad at everybody.", 'sad'],
    ['sam', "Then we don't choose. We use floodgates. They close during the storm and open when it's calm. Real cities do exactly this.", 'happy'],
    ['corry', "Walls that know when to open. How very kind of them."],
    { flag: 'su_met_skipper' },
  ];
  S.su_site = [
    { if: () => f('summer_gates'), then: [{ narrate: 'The floodgates gleam in the sun. A duck is sunbathing on top of one.' }] },
    { if: () => !f('su_met_skipper'), then: [['pip', "A harbor blueprint! Let's find Skipper first, they know how the water moves here."]] },
    ['sam', "Levees on the sand to keep the surge out. Gates on the canal so the boats can still get through. And not too many pieces, we're on a budget.", 'happy'],
    { puzzle: 'summer_gates' },
    { flag: 'summer_gates' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { sfx: 'win' },
    ['duck', "The huts are safe AND the boats can dock? Quack! I mean, wow!", 'happy'],
    ['skipper', "Ducks and Brinemarsh folk sharing a harbor! Mom's gonna cry. She's a sponge, so it'll be a lot.", 'happy'],
    { journal: 'Designed harbor floodgates: levees for the sand, gates for the canal, so the town stays dry and the boats can still sail.' },
    ['corry', "Now for that wall. A Quill Agent is guarding the gap near the east road."],
  ];
  S.su_wallagent = [
    ['agent', "Halt. This wall is property of the Silver Quill Society. Everything shiny is property of the Silver Quill Society.", 'angry'],
    ['sam', "Your wall is flooding a whole town."],
    ['agent', "Flooded land is cheap land. Cheap land is Society land. It is called 'economics', giant. Look it up.", 'angry'],
    ['pip', "That's not economics! That's being a big shiny jerk!", 'angry'],
    { battle: 'su_door' },
    { flag: 'su_wall_beaten' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { narrate: 'The agent flaps off in a huff, dropping a few shiny bottle caps.' },
    { scraps: 5 },
    { if: () => !f('summer_night'), then: [
      ['corry', "The sun is setting. If the storm comes tonight, the Moat Engine will start pumping."],
      { night: true },
      { music: 'summer', night: true },
      ['bess', "Here comes the surge! The gates are holding! Now shut that engine down, knights!", 'angry'],
    ] },
  ];
  S.su_boss = [
    { narrate: 'The Royal Moat Engine roars. Water gushes from its spout, aimed straight at the beach. A silver quill emblem shines on its side.' },
    ['corry', "It's pumping water from the capital's moat... and dumping it here, where the poorest folks live.", 'angry'],
    ['sam', "Classic. Move the problem downstream so you don't have to look at it. Let's shut it off.", 'angry'],
    { battle: 'su_boss' },
    { flag: 'summer_boss' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { narrate: 'The engine coughs, sputters, and goes quiet. Inside the control box, Pip finds a thick ledger stamped with a silver quill.' },
    ['pip', "'Project Puddle. Step one: Flood the marsh and the shores. Step two: Blame the monsters. Step three: Buy the soggy land for one bottle cap each.'", 'shock'],
    ['pip', "'Step four: Hoard every shiny thing in the Kingdom. Signed, Magister Corvin.' ...Corvin? CORVIN?! The Queen's chief advisor?!", 'angry'],
    ['bess', "So there it is. We were never the villains. We were the excuse.", 'sad'],
    ['corry', "The Queen trusts Corvin with everything. If we're going to show her this, we need proof she can't ignore."],
    ['skipper', "Mom says the Royal Archive keeps every true record in the Kingdom. It's in Amberleaf Woods. Where the leaves are!", 'happy'],
    { journal: "TWIST: Magister Corvin, the Queen's chief advisor, leads the Silver Quill Society. 'Project Puddle': flood the land, blame the monsters, buy it cheap, hoard the shiny things." },
    { choice: { who: 'corry', text: 'Travel to Amberleaf Woods?', options: [{ label: 'Onward to autumn!', then: [{ chapter: 'fall', label: 'Into Amberleaf Woods...' }] }, { label: 'Stay a bit longer', then: [['bess', "Talk to me on the beach when you're ready."]] }] } },
  ];
  S.su_bess = [
    { if: () => f('summer_boss'), then: [{ choice: { who: 'bess', text: 'Ready for Amberleaf Woods?', options: [{ label: 'Onward to autumn!', then: [{ chapter: 'fall', label: 'Into Amberleaf Woods...' }] }, { label: 'Not yet', then: [['bess', "Enjoy the beach. It's nice when it's not trying to drown us."]] }] } }] },
    ['bess', "My crew's never been this close to a dry dock. Whatever you're planning, knight, we're behind you.", 'happy'],
  ];
  S.su_dabble = [
    { if: () => f('summer_gates'), then: [['duck', "I used to think the Brinemarsh folk were scary. Turns out Skipper is just a really good swimmer with a really big smile.", 'happy']] },
    ['duck', "Every summer the storms get worse. The Society says it's the monsters' 'wet magic'. Do monsters even HAVE magic? They mostly just seem damp."],
  ];
  S.su_nib = [['mouse', "I'm building a sandcastle that can survive the tide! Secret: I put a little moat around it so the water goes AROUND instead of THROUGH.", 'happy'], ['sam', "That's a diversion channel. You're a natural engineer.", 'happy']];
  S.su_knock_a = [['duck', "Oh, how nice! Here, I found these scraps washed up on the beach.", 'happy'], { scraps: 6 }];
  S.su_knock_b = [['duck', "Our hut is dry for the first time all summer! Take a juice box, take two!", 'happy'], { snacks: 2 }];
  S.su_knock_c = [
    { narrate: 'Knock knock. The door is opened by a magpie in a silver mask, counting a pile of bottle caps.' },
    ['agent', "This hut has been 'acquired' by the Society. The duck who lived here was 'relocated'. Go away.", 'angry'],
    { battle: 'su_door' },
    { narrate: 'The agent drops the bottle caps and flees. A very relieved duck waddles back inside.' },
    { scraps: 8 },
  ];
  S.su_knock_d = [['mouse', "We were going to sell our hut to the Society for one bottle cap. Now we're staying! Thank you!", 'happy'], { scraps: 6 }];
  S.su_knock_e = [['duck', "Hello! Would you like a seashell? It's not worth anything. It's just pretty.", 'happy'], ['sam', "...Thanks. I think that's the best kind of thing.", 'happy']];

  // ===================================================================
  // FALL - Amberleaf Woods
  // ===================================================================
  S.fall_intro = [
    { card: { title: 'Chapter 3: Fall', sub: 'Amberleaf Woods' } },
    { narrate: 'Paper leaves in orange, red and gold spin down from cardboard maples. It smells like cinnamon and old books.' },
    ['corry', "Amberleaf Woods. I used to jump in the leaf piles here when I was a cub. Before I was a knight.", 'happy'],
    ['pip', "Corry, you were a cub? Were you small? Were you adorable? I need to know."],
    ['corry', "I was... a medium box.", 'happy'],
    ['sam', "The river is way too high for autumn. And look at the drains. Every culvert is stuffed with leaves.", 'angry'],
    ['pip', "Someone's been clogging them on purpose! Let's ask the locals."],
    { coop: [['jules', "Leaf piles. Jack-o'-lanterns. Cider. This is the best season and I will not be taking questions.", 'happy']] },
  ];
  S.fa_ember = [
    { if: () => f('fall_bridge'), then: [['fox', "The new bridge is so pretty! Triangles everywhere. Very fashionable.", 'happy']] },
    { if: () => f('fa_met_ember'), then: [['fox', "The blueprint stand is right by the old bridge. Cross the river and you'll reach the Archive."]] },
    ['fox', "Knights! Thank goodness. Masked birds came through and stuffed the drains with leaves. Then the river rose and swept the Old Bridge away.", 'sad'],
    ['fox', "Now nobody can reach the Royal Archive on the other side. Professor Hoot is stuck over there with all the books!", 'sad'],
    ['sam', "They're cutting off the Archive. Whatever's in there, Corvin doesn't want anyone to read it."],
    ['corry', "We need a new bridge. Can a bridge be made of cardboard?"],
    ['sam', "If it's a truss. Triangles. A square can squish flat, but a triangle can't change shape unless a side breaks.", 'happy'],
    { flag: 'fa_met_ember' },
  ];
  S.fa_bristle = [['hedgehog', "I've been raking leaves out of the drains all day. The Leaflings keep jumping back in. They just want to be a cozy pile, but they keep picking the worst spots!", 'sad']];
  S.fa_hoot = [
    { if: () => f('fall_boss'), then: [['owl', "The charter is safe. Every rule in it still matters. Especially the second one.", 'happy'], { choice: { who: 'owl', text: 'Travel to Frostfold Peak?', options: [{ label: 'To the capital!', then: [{ chapter: 'winter', label: 'Up to Frostfold Peak...' }] }, { label: 'Not yet', then: [] }] } }] },
    ['owl', "Hoo! Visitors! The bridge washed away and I've been reading the same book for six days. It's a great book. It's about drainage.", 'happy'],
    ['owl', "The Archive door is just up the path. But something big and leafy has been rumbling around inside at night. Be careful."],
  ];
  S.fa_leafy = [['leafling', "We just wanted to be a big cozy pile! Not a drain clog! This spot by the tree is much better. Thank you for showing us.", 'happy']];
  S.after_fa_e2 = [
    ['leafling', "Ow. Okay. We get it. Drains are for water, piles are for jumping. We'll go sit by the big tree.", 'sad'],
    ['pip', "See? Even leaves just want a nice place to be.", 'happy'],
  ];
  S.fa_site = [
    { if: () => f('fall_bridge'), then: [{ narrate: 'The truss bridge stands firm over the rushing river. Triangles: undefeated.' }] },
    { if: () => !f('fa_met_ember'), then: [['corry', "A blueprint stand by the broken bridge. Let's ask the forest folk what happened first."]] },
    ['sam', "A truss bridge. Every connection makes a triangle. The bottom gets stretched, the top gets squished.", 'happy'],
    ['sam', "Cardboard handles stretching way better than squishing. Long squished pieces buckle. Keep that in mind.", 'happy'],
    { puzzle: 'fall_bridge' },
    { flag: 'fall_bridge' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { sfx: 'win' },
    ['fox', "A bridge made of triangles! It doesn't even wobble! The whole village is crossing it just for fun!", 'happy'],
    { journal: 'Built a cardboard truss bridge. Triangles keep their shape. Tension members can be long; compression members buckle if too long.' },
    ['corry', "The sun is setting. The Archive is just across the river, east."],
    { night: true },
    { music: 'fall', night: true },
  ];
  S.fa_archive_day = [['owl', "Hoo! The Archive doors are sealed during the day by Society order. They only open at night when the 'cleaning crew' comes. Suspicious crew.", 'sad']];
  S.fa_boss = [
    { narrate: 'The Archive doors creak open. Inside, the drains gurgle. A mountain of soggy leaves heaves itself up, with two big glowing eyes.' },
    ['pip', "It's ENORMOUS! The Society stuffed all the clogged leaves in here to flood the Archive and ruin the records!", 'shock'],
    ['corry', "Forgive us, great leafy one. We must get past.", 'angry'],
    { battle: 'fa_boss' },
    { flag: 'fall_boss' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { narrate: 'The Clogwood Beast slumps into a huge, happy leaf pile. The drains gurgle and run clear. Behind it, a dusty glass case glows.' },
    ['owl', "The founding charter of the Cardboard Kingdom! It's the oldest record we have. Nobody has been able to read the signature. Until now, maybe.", 'happy'],
    { narrate: 'The paper is crayon on the back of a pizza box. A drawing of a castle. A bear knight with a sash. An origami crane. Words in big, wobbly letters:' },
    { narrate: '"THE CARDBOARD KINGDOM. Rule 1: Everybody gets a home. Rule 2: Nobody gets left out in the rain. Built by SAM, age 8. Helper: Grandma."' },
    ['sam', '...', 'shock'],
    ['sam', "That's my handwriting. That's the fridge box from when we moved. Grandma folded the crane. I drew the bear on the side with a marker...", 'shock'],
    ['corry', "Sam. You... drew me?", 'shock'],
    ['pip', "Grandma folded ME? I have a GRANDMA?", 'happy'],
    ['sam', "I built this whole place when I was a kid. I used to build things all the time. Bridges for my toy cars. Dams in the creek.", 'sad'],
    ['sam', "Then it all turned into problem sets and grades and deadlines. I forgot why I ever liked it.", 'sad'],
    ['corry', "You built a kingdom with tape and hope. Rule 2, Sam. Nobody gets left out in the rain. Not even you.", 'happy'],
    ['owl', "And THAT is why Corvin wanted this flooded. If the Queen sees Rule 2 in the founder's own hand, his whole scheme is finished.", 'angry'],
    { journal: "TWIST: The founding charter of the Cardboard Kingdom was written by Sam, age 8. Sam built this world as a kid. Sir Corrugate and Pip came from that fridge box." },
    { choice: { who: 'corry', text: 'Take the charter and the ledger to the Queen at Frostfold Peak?', options: [{ label: 'To the capital!', then: [{ chapter: 'winter', label: 'Up to Frostfold Peak...' }] }, { label: 'Wait a moment', then: [['owl', "Talk to me when you're ready. I'll keep the charter dry."]] }] } },
  ];
  S.fa_knock_a = [['hedgehog', "Visitors! Have some acorn scraps. Wait, those are just scraps. Have some scraps.", 'happy'], { scraps: 8 }];
  S.fa_knock_b = [['fox', "Our burrow drained out once the bridge was fixed! I baked a juice box. Don't ask how.", 'happy'], { snacks: 1 }];
  S.fa_knock_c = [
    { narrate: 'Knock knock. Inside, two Quill Agents are stuffing leaves into the burrow chimney.' },
    ['agent', "You again?! Corvin will hear about this!", 'angry'],
    { battle: 'fa_agents' },
    { scraps: 10 },
  ];
  S.fa_knock_d = [['hedgehog', "My great-grandma told me the Kingdom was founded by a giant. A kind one. Who liked glue sticks.", 'happy'], { scraps: 6 }];

  // ===================================================================
  // WINTER - Frostfold Peak
  // ===================================================================
  S.winter_intro = [
    { card: { title: 'Chapter 4: Winter', sub: 'Frostfold Peak' } },
    { narrate: 'Snow. Real, soft, cold snow, settling on cardboard rooftops. At the top of the mountain, a grey cloud sits over the reservoir, raining and raining.' },
    ['pip', "Brrr. My wings are crinkling. Is that a cloud... in a cage?"],
    ['sam', "That's where all the water comes from. Snowmelt plus a storm that never stops. The Society must be using it to flood everything below.", 'angry'],
    ['corry', "The Queen's castle is just ahead. Agents are guarding the gate. Let's be brave, and polite, and then brave again if needed."],
    ['bess', "We sailed up the river with you. Every monster in the Brinemarsh is here. Whatever happens, you're not alone.", 'happy'],
  ];
  S.wi_gate = [
    ['agent', "No audiences with the Queen. Magister Corvin speaks for her now.", 'angry'],
    ['corry', "Then we'll speak for ourselves, thank you.", 'angry'],
    { battle: 'wi_guard' },
    { flag: 'wi_gate_beaten' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { narrate: 'The agents scatter like dropped bottle caps. Queen Corrina steps out of the gate, startled.' },
  ];
  S.wi_queen = [
    { if: () => !f('wi_gate_beaten'), then: [['queen', "...who's there? Corvin said not to speak with anyone.", 'sad']] },
    { if: () => f('wi_queen_told') && !f('winter_night'), then: [['queen', "Go to the Summit, Royal Engineer. Night is falling. Be careful.", 'sad']] },
    { if: () => f('wi_queen_told'), then: [['queen', "The Summit Reservoir is northeast. The whole Kingdom is counting on you.", 'happy']] },
    ['queen', "A giant? With Sir Corrugate? And... Captain Bess of the Brinemarsh?! Guards! Oh. I have no guards. Corvin had them all replaced.", 'sad'],
    ['corry', "Your Majesty. Please. Read this ledger. And then read this."],
    { narrate: 'The Queen reads Project Puddle. Her long neck droops lower and lower. Then she reads the charter, and goes very still.' },
    ['queen', "'Nobody gets left out in the rain.' I read this when I was crowned. I forgot it. I let Corvin tell me who to be afraid of.", 'sad'],
    ['queen', "Captain Bess. I am so sorry. Your people were drowning and my advisors called you monsters, and I believed them.", 'sad'],
    ['bess', "...Well. That's the first time a queen's said sorry to me. It's a decent start.", 'happy'],
    ['queen', "Sam. You wrote this. You're the Founder. The Architect.", 'happy'],
    ['sam', "I'm not some legendary architect. I'm a tired student who almost quit. I just remembered how to like building things again.", 'sad'],
    ['queen', "That sounds exactly like an architect to me. Please, take this. It belonged to the Kingdom's first engineer. I think it was always meant for you.", 'happy'],
    { give: 'hardhat' },
    { narrate: 'Inside the hard hat, in faded marker, a name: ROSIE.' },
    ['sam', "Rosie? That's... that's my grandma's name.", 'shock'],
    ['queen', "Long before your charter, a girl named Rosie came to the Kingdom. She built our first bridges and the great Summit Dam. Then one summer she grew up, and stopped coming.", 'sad'],
    ['corry', "The Founder before the Founder. Sam, your grandmother was the first Builder.", 'shock'],
    ['sam', "Her sketchbook. The mountain dam with the question mark. 'Something's missing.' It's the Summit Dam.", 'shock'],
    { journal: "TWIST: Grandma Rosie was the Kingdom's FIRST Builder. The Summit Dam is hers, and she never finished it. 'Something's missing.'" },
    ['queen', "Corvin is at the Summit Reservoir with the caged storm. Tonight he plans to open the floodgates on the whole Kingdom and blame the Brinemarsh one last time.", 'angry'],
    { flag: 'wi_queen_told' },
    { night: true },
    { music: 'winter', night: true },
    ['corry', "Night has fallen. To the Summit, northeast. Equip your new costume at a workbench or from the menu!", 'angry'],
    { save: true },
  ];
  S.wi_summit_day = [['pip', "The Summit path is guarded by a whole lot of shiny magpie nonsense. Let's talk to the Queen first."]];
  S.wi_boss = [
    { narrate: 'On the frozen summit, beside a silver cage holding a heavy grey cloud, stands a tall magpie in a velvet robe. A silver quill gleams behind his ear.' },
    ['corvin', "Well, well. The little giant. You've cost me a sea wall, an engine and a perfectly good leaf monster.", 'angry'],
    ['sam', "You flooded people's homes so you could buy them for bottle caps.", 'angry'],
    ['corvin', "Floods are coming whether I profit or not, child. This cloud rains forever. I simply... direct it. Downhill. Onto those who can't complain.", 'angry'],
    ['corvin', "And the Kingdom thanks me for blaming the monsters! Fear is the shiniest thing of all.", 'angry'],
    ['pip', "You're not a royal advisor. You're a hoarder with a feather pen!", 'angry'],
    { battle: 'wi_corvin' },
    { narrate: "Corvin staggers. His silver quill clatters onto the ice and unfolds. It isn't silver at all. It's a gum wrapper." },
    ['pip', "Corvin... you're FOLDED. Like me! You're paper!", 'shock'],
    ['corvin', "...Rosie folded me. From a gum wrapper. Her very first creation. I was so shiny. She said I was the shiniest thing she ever made.", 'sad'],
    ['corvin', "Then she grew up and stopped coming. I thought if I collected every shiny thing in the Kingdom, I'd be worth coming back for.", 'sad'],
    ['sam', "She didn't leave because of you. She left because she grew up. That happens. It doesn't mean you stopped mattering.", 'sad'],
    ['sam', "Rule Two, Corvin. Nobody gets left out in the rain. Not even you.", 'happy'],
    { journal: "TWIST: Magister Corvin was folded from a gum wrapper by Grandma Rosie. He hoarded shiny things because he felt forgotten." },
    { narrate: 'Corvin reaches for Sam\'s hand, and stumbles back into the silver cage. CRACK. The bars snap. The grey cloud swells, darker and darker, and the rain turns into a roaring downpour.' },
    ['corvin', "No... NO! Without the cage it'll flood everything! I'm sorry, I'm so sorry, you can't stop the rain!", 'shock'],
    { narrate: 'The magpies flee. Corvin is swept into a snowbank, sputtering. The storm rises over the summit, enormous and sad.' },
    ['corry', "Everyone, hold the line! For Rule 2!", 'angry'],
    { battle: 'wi_drizzle' },
    { narrate: 'Nothing works. Every swing passes through. The rain only grows heavier, and a voice rumbles out of the cloud. It sounds familiar.' },
    ['drizzle', "...what's the point. it's all just homework. nothing I build matters. why try. why try. why try.", 'sad'],
    ['sam', "...That's me. That's what I said, the night I fell asleep in the box. I've been saying it for months.", 'shock'],
    ['corry', "The rain started the year the Founder stopped visiting. We always thought it was a curse.", 'sad'],
    ['sam', "It's not a curse. It's me. All the giving up. It's been raining on the kingdom I built.", 'sad'],
    ['pip', "Then we can't beat it. You don't beat rain, Sam.", 'sad'],
    ['pip', "...You give it somewhere to go.", 'happy'],
    ['sam', "A spillway. A dam that doesn't fight the water, it guides it. Sends it down a safe channel to turn a waterwheel. Rain becomes a river. A river becomes power.", 'happy'],
    ['sam', "That's what was missing from Grandma's dam. She built it to HOLD the water. Nobody gave it somewhere to go.", 'happy'],
    { coop: [['jules', "Okay, I don't know what a stilling basin is, but I know how to carry boxes really fast. Point me at stuff!", 'happy']] },
    ['corvin', "...I'll hold the cage door. It's the least a gum wrapper can do.", 'sad'],
    ['bess', "Brinemarsh crew, grab every box you've got!", 'happy'],
    ['queen', "Every builder in the Kingdom, to the Summit!", 'happy'],
    { puzzle: 'winter_spillway' },
    { flag: 'winter_done' },
    { fn: () => CK.OW && CK.OW.refresh() },
    { sfx: 'win' },
    { narrate: 'The water pours over the spillway in a smooth, silver sheet. Far below, the great waterwheel creaks, turns, and every lantern in the Kingdom flickers on.' },
    ['drizzle', "...oh. I'm... going somewhere. I'm useful? I thought I was just sad.", 'happy'],
    ['sam', "You're allowed to be sad. You just don't get to flood everything. We'll find a place for you.", 'happy'],
    { narrate: 'The Grey Drizzle shrinks into a soft little cloud and floats down to rest over the cherry trees, where a little rain is exactly what they need.' },
    { journal: 'TWIST: The endless storm was Sam\'s own discouragement. It could not be defeated, only given somewhere to go. The spillway turned rain into a river that lights the Kingdom.' },
    { scene: 'ending', label: 'Spring returns...' },
  ];
  S.wi_mama = [['bear', "My cub keeps asking why the Brinemarsh folk are scary. I don't have an answer anymore. I think they're just cold, like us.", 'sad']];
  S.wi_bess = [['bess', "We built a snow fort with the bunnies. Turns out we're very good at packing snow. It's basically wet sand.", 'happy']];
  S.wi_mouse = [['mouse', "The ice on the pond is extra thick this year. Perfect for sliding. Not perfect for... fish. Sorry, fish.", 'happy']];
  S.wi_knock_a = [['bunny', "Royal Engineer! Here, warm scraps. They were next to the stove.", 'happy'], { scraps: 10 }];
  S.wi_knock_b = [['mouse', "Hot cocoa? I mean, juice box? We're out of cocoa.", 'happy'], { snacks: 2 }];
  S.wi_knock_c = [{ narrate: 'Knock knock. Slush oozes under the door.' }, { battle: 'wi_slush' }, ['bear', "Thank you! It wandered in from the snowmelt and wouldn't leave.", 'happy'], { scraps: 8 }];
  S.wi_knock_d = [['owl', "Professor Hoot's cousin here. Fascinating spillway work. Truly. Have some scraps.", 'happy'], { scraps: 12 }];

  CK.Story.endingLines = [
    'Spring came back to the Cardboard Kingdom.',
    'Captain Bess and the Brinemarsh folk built Harbor Town on the Sunpatch Shore, side by side with the ducks.',
    'Magister Corvin and the Silver Quill Society were sentenced to rebuild every home they flooded. By hand. With tape. Corvin asked for the hardest ones first.',
    "They complained a lot. Then, slowly, they got pretty good at it.",
    'The little Drizzle cloud waters the cherry blossoms every morning, and is much happier.',
    'Pip passed the folding exam. Sir Corrugate learned to swim, a little. He wears floaties. They are very dignified floaties.',
  ];
})();
