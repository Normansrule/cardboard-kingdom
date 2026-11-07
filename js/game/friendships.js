// Cardboard Kingdom - Neighbors you care about (v2.24).
// The Kingdom's named villagers become friends the way they do in Stardew Valley and Animal Crossing,
// at the player's own pace (no timers, no streaks, nothing you can miss):
//  * Hearts: 0 to 5 for each of the nine named neighbors. A chat each time you come to their place
//    (a new place, or day turning to night) and a present each visit both help.
//  * Presents come from your patch things (Tansy's Garden page or buried treasure). Each neighbor
//    loves a few things and likes a few more; what you learn shows on their page.
//  * Heart stories: at one, three and five hearts each neighbor shares something real. A small,
//    ordinary worry (a dad on night shift, a sister who moved away, a castle the big kids knocked
//    over) and, at five hearts, how it turns out. Then they give you a keepsake hat.
//  * Signature looks: Robin's mail bag, Bristle's rake, Ember's sketchbook... and they change as
//    the stories do (Clover carries her own lantern once she's brave).
//  * The Neighbors page (pause menu) shows who everyone is: wants, fears, quirks, loves, hearts.
// Writing rules are in docs/CHARACTERS.md: everyone wants something specific and fears something
// ordinary, jokes come from character, nobody is a villain, secrets are kind.
(function () {
  'use strict';
  const CK = window.CK;
  const D = CK.D, U = CK.U, Input = CK.Input;
  const W = CK.W, H = CK.H;
  const C = D.C, TAU = Math.PI * 2;
  const f = (k) => CK.flag(k);
  const OW = CK.Overworld.prototype;
  const S = CK.Story.scripts;
  const PLACE = { spring: 'Blossom Hollow', summer: 'Sunpatch Shores', fall: 'Amberleaf Woods', winter: 'Frostfold Peak' };
  const CALM = { spring: 'spring_dam', summer: 'summer_gates', fall: 'fall_bridge', winter: 'winter_done' };
  const PTS = 4, MAXH = 5, CHAT = 2, LOVE = 6, LIKE = 4, OK = 2;

  // ================================================================ THE NEIGHBORS
  // spk: their dialogue speaker. sig: the story flags their own talk script reacts to, so we know
  // when they have something new to say. chats[k]: small talk after heart story k (0, 1, 3, 5).
  const N = {
    clover: {
      ch: 'spring', spk: 'bunny', name: 'Clover', species: 'Bunny', title: 'Seven and three quarters. Bravest bunny in Blossom Hollow (she says)',
      wants: 'To be brave enough to go down to the docks at night, and give the little crying monster her flower crown.',
      fears: 'The dark. Mostly the bit of the dark right behind her.',
      quirk: 'Narrates her own life like a storybook ("And then Clover, the bravest bunny, ate the whole radish"). Calls everybody "knight".',
      secret: 'Her papa works nights at the mill. She waits up for his boots on the bridge, because the dark is the part of the day without him in it.',
      loves: ['pinwheel', 'balloons', 'flowerpot'], likes: ['beachball', 'bunting', 'birdbath', 'paperlantern', 'toadhouse'], hint: 'Things that spin, float or bloom.',
      keep: 'paperboat', sig: ['spring_boss'],
      onLove: 'A {item}! For ME? I am going to tell everyone. I am going to tell the frogs.',
      onLike: 'Ooh, a {item}. That\'s going on the Brave List. Number... I\'ll work out the number.',
      chats: {
        0: [['bunny', 'Did you know bunnies can hop twice their own height? I can do one and a half. I\'m practising.', 'happy'], ['bunny', 'Shh. I\'m being a statue. ...Okay, I\'m done. Did I look like a statue?', 'happy']],
        1: [['bunny', 'I touched another frog. On purpose. It\'s going on the list. The frog did not want to be on the list.', 'happy'], ['bunny', 'Do knights get scared? You don\'t have to say. You can just nod.', 'idea']],
        3: [['bunny', 'Papa saw my lantern in the window and waved at it from the bridge! He waved at my LANTERN.', 'happy'], ['bunny', 'The dark is less dark now. It\'s about medium dark. Pink in the middle.', 'happy']],
        5: [['bunny', 'Puddle says hi! Puddle can\'t say hi, but Puddle waves. With the crown on. It slides over one eye.', 'happy'], ['bunny', 'When I grow up I want to be a knight, a florist and a lighthouse. In that order.', 'happy']],
      },
      events: {
        1: { ask: 'What are you writing, Clover?', title: 'The Brave List', sum: 'Clover keeps a Brave List: a frog, a hairy radish, saying hello to a knight. I told her mine, and she was on it.', lines: [
          { narrate: 'Clover is sitting on a mushroom with a crayon and a very serious face.' },
          ['bunny', 'This is my Brave List. Everything brave I ever did. Do you want to hear it? You have to say yes.', 'happy'],
          ['bunny', 'One: touched a frog. Two: ate a radish, even the hairy bit. Three: said hello to a knight. That\'s you. You\'re number three.', 'happy'],
          ['sam', 'That\'s a really good list. Can I tell you mine?'],
          ['bunny', 'KNIGHTS have a list?', 'shock'],
          ['sam', 'One: moved to a city where I didn\'t know anybody. Two: asked a question in a lecture hall with three hundred people in it. Three: talked to a very brave bunny.', 'happy'],
          ['bunny', 'You put ME on YOUR list.', 'heart'],
          ['bunny', 'Okay. I\'m writing it down. Four: was on a knight\'s list.', 'happy'],
        ] },
        3: { ask: 'You look tired, Clover.', title: 'The Dark Part', lines: [
          { narrate: 'Clover is sitting on her doorstep in her pyjamas. Her ears are flat.' },
          ['bunny', 'I\'m not tired. I\'m listening. Papa works nights at the mill. His boots go clomp clomp on the bridge when he\'s coming home.', 'sad'],
          ['bunny', 'The dark is the bit of the day that doesn\'t have him in it. So I wait for the clomps.', 'sad'],
          ['corry', 'Little one, I have been afraid of rain my whole life. I go out in it anyway, because my friends are out there.', 'happy'],
          ['sam', 'What if the dark had something of yours in it? Something friendly.', 'idea'],
          ['sam', 'Grandma used to fold me a paper lantern when I couldn\'t sleep. Like this, and this... and a glow-stick in the middle.', 'happy'],
          { narrate: 'Sam folds. Clover watches every single crease.' },
          ['bunny', 'It\'s pink. It\'s MY dark now. With a pink bit in it.', 'heart'],
          { journal: 'Clover waits up for her papa every night. I folded her a paper lantern, so the dark has something of hers in it.' },
        ] },
        5: { ask: 'Clover wants to show you something', title: 'The Docks at Night', need: 'spring_boss', lines: [
          { narrate: 'Clover marches up with her lantern on a stick in one paw and her flower crown in the other.' },
          ['bunny', 'Knight. I\'m going to the docks. Tonight. You can come. You don\'t have to hold my paw. ...You can if you want.', 'happy'],
          { narrate: 'Down at the docks, a very small monster sits on a crate, watching the water.' },
          ['bunny', 'Hello. I\'m Clover. I saw you crying one time. I brought you a crown, because crowns are for when you\'re sad AND for when you\'re brave.', 'happy'],
          { narrate: 'The little monster puts the crown on. It is much too big and slides over one eye. It does not take it off.' },
          ['bunny', 'Your name is Puddle now. Is that okay? ...It\'s okay. Puddle nodded.', 'heart'],
          ['pip', 'Is that number five on the Brave List?', 'happy'],
          ['bunny', 'Number five is: made a friend in the dark. And this is for you. Skipper showed me how. It\'s a boat, but for your head.', 'happy'],
        ], journal: 'Clover walked to the docks at night with her lantern and made friends with a little monster she named Puddle. She folded me a paper boat hat.' },
      },
    },
    robin: {
      ch: 'spring', spk: 'robin', name: 'Robin Redbox', species: 'Robin', title: 'Letter carrier of Blossom Hollow. Eleven years, never once late',
      wants: 'To deliver a letter to the Queen herself, in person, just once.',
      fears: 'Being forgettable. Everybody remembers the post. Nobody remembers the post-bird.',
      quirk: 'Knows every address by heart and every neighbor by their handwriting. Hums the same three notes while she sorts. Cannot resist a shiny seal.',
      secret: 'In eleven years of delivering letters, nobody has ever written one to her.',
      loves: ['birdhouse', 'windchime', 'bunting'], likes: ['birdbath', 'pinwheel', 'balloons', 'paperlantern', 'bench'], hint: 'Things birds like, and things that flutter.',
      keep: 'mailcap', prop: 'mailbag', sig: [],
      onLove: 'A {item}! Oh, oh, I\'m going to hum. I\'m humming. You can\'t stop me.',
      onLike: 'A {item}, for me? Signed for, received, delighted.',
      chats: {
        0: [['robin', 'Three letters for the Burrows, one for the Mayor, and a postcard for a frog. I don\'t ask. I just deliver.', 'happy'], ['robin', 'Hm hm hmmm. Oh! Sorry. I hum when I sort. It\'s the same three notes. I don\'t know the rest of the song.', 'happy']],
        1: [['robin', 'Nib sent a letter with a thumbprint seal again. It\'s my favourite seal. It\'s a bit sticky.', 'happy'], ['robin', 'You can tell a lot about a neighbor from their handwriting. The Mayor writes VERY slowly. You can tell.', 'happy']],
        3: [['robin', 'Pip wrote me a postcard! It\'s just the word HELLO, very loopy. I\'ve read it forty times.', 'heart'], ['robin', 'I asked Postmistress Pell if anybody ever writes to her. She said "not often." So I wrote to her.', 'happy']],
        5: [['robin', 'I keep your letter in the front pocket. For emergencies. Emergencies of feeling forgettable.', 'heart'], ['robin', 'The Queen sent a thank-you note to the whole village. I delivered it to myself first. Then everyone else.', 'happy']],
      },
      events: {
        1: { ask: 'Can I see your seal collection?', title: 'Every Seal Is Someone', sum: 'Robin keeps a wax seal from every neighbor who sends a letter. "If you keep the seals, you keep a little bit of everybody."', lines: [
          { narrate: 'Robin opens her bag very carefully, like it might have a bird in it. It is full of wax seals, sorted into little paper envelopes.' },
          ['robin', 'This one is an acorn, from the Burrows. This one is a thumbprint, from Nib, who can\'t spell his name yet but has a VERY good thumb.', 'happy'],
          ['robin', 'And this silver one I keep so I remember to be careful who I trust.', 'sad'],
          ['robin', 'Every seal is someone. If you keep the seals, you keep a little bit of everybody.', 'happy'],
          ['sam', 'That\'s a really nice way to keep track of people.', 'happy'],
          ['robin', 'Isn\'t it? Hm hm hmmm.', 'heart'],
        ] },
        3: { ask: 'Do you ever get letters, Robin?', title: 'Eleven Thousand Letters', lines: [
          { narrate: 'It\'s raining a little. Robin is sorting under her porch roof, very slowly.' },
          ['robin', 'Eleven years. Eleven thousand, four hundred and six letters.', 'sad'],
          ['robin', 'None of them were for me. It\'s silly. I know everybody\'s handwriting by heart, and nobody knows mine.', 'sad'],
          ['pip', 'I know your handwriting now! It\'s very loopy. Loopy is the best kind.', 'happy'],
          ['robin', '...It IS quite loopy, isn\'t it.', 'happy'],
          { journal: 'Robin Redbox has delivered 11,406 letters in eleven years and never once got one. That doesn\'t seem right.' },
        ] },
        5: { ask: 'I have a letter for you, Robin', title: 'Post for Robin', lines: [
          { narrate: 'Sam spent all morning on it. An envelope with ROBIN REDBOX on the front, and a seal made from a bottle cap pressed into candle wax.' },
          ['robin', '...It\'s addressed to me.', 'shock'],
          { narrate: 'She reads it. Then she reads it again, in case it changed.' },
          ['robin', 'Nobody ever told me I\'m good at my job before. Excuse me. I have to deliver this properly.', 'heart'],
          { narrate: 'Robin puts the letter in her bag, walks once around her house, and knocks on her own door. "Post!" she calls. "Oh! For me?" she answers.' },
          ['corry', 'Magnificent. A Great Deed, of the postal kind. Into the Ledger it goes.', 'happy'],
          ['robin', 'Every postie needs an assistant, and every assistant needs a cap. Here. It\'s my spare. Wear it on deliveries.', 'happy'],
        ], journal: 'I wrote Robin Redbox the first letter she ever got. She delivered it to herself, properly, and gave me her spare cap.' },
      },
    },
    mayor: {
      ch: 'spring', spk: 'mayor', name: 'Mayor Mossworth', species: 'Tortoise', title: 'Mayor of Blossom Hollow for fifty-one years (nobody else wanted the hat)',
      wants: 'To be a mayor his village can rely on again, after he believed the Society\'s letter.',
      fears: 'That he\'s become too slow for the job. Tortoises are slow. He always knew that. He just never minded before.',
      quirk: 'Gives speeches... with pauses... for applause... that does not come. Polishes his top hat when he\'s worried, which is constantly.',
      secret: 'He still keeps the very first map of Blossom Hollow, drawn in crayon by a girl in a hard hat. He\'s in the corner, very small, waving.',
      loves: ['bench', 'sundial', 'well'], likes: ['flowerpot', 'wateringcan', 'birdbath', 'bunting', 'picnic'], hint: 'Things for sitting on, and things that keep time.',
      keep: 'tophat', sig: ['spring_boss', 'spring_dam', 'sp_met_mayor'],
      onLove: 'A {item}! My word. This calls for a speech. ...Ahem. Thank you. That was the speech.',
      onLike: 'How thoughtful. A {item}. I shall put it somewhere dignified.',
      chats: {
        0: [['mayor', 'Mind the puddles. I say it to everyone. It used to be a joke. Then it was a warning. I hope it becomes a joke again.', 'happy'], ['mayor', 'Citizens of... oh. It\'s only you. I was practising.', 'sweat']],
        1: [['mayor', 'Your applause the other day was most appreciated. I have been standing a little taller. About a centimetre.', 'happy'], ['mayor', 'A good mayor listens. I am listening. ...Go on. Say something. I am very good at it.', 'happy']],
        3: [['mayor', 'I put MEASURE TWICE on the noticeboard. Somebody added "CUT ONCE". Democracy at work.', 'happy'], ['mayor', 'I read every letter twice now. Slowly. It turns out slow is rather good at reading.', 'happy']],
        5: [['mayor', 'I took the map to the Burrows and showed the cubs. They wanted to know who the girl in the hard hat was. I told them. They gasped.', 'happy'], ['mayor', 'The hat suits you. I always said it would suit somebody. I just didn\'t know it would be you.', 'heart']],
      },
      events: {
        1: { ask: 'Practising a speech, Mayor?', title: 'A Speech for a Flower Pot', sum: 'The Mayor was practising a speech to a flower pot, pausing for applause that never came. So we clapped. He stood a centimetre taller.', lines: [
          { narrate: 'The Mayor is standing in front of a flower pot, holding his notes very close to his face.' },
          ['mayor', 'Citizens of Blossom Hollow. (Pause for applause.)', 'happy'],
          ['mayor', '(Longer pause for applause.)', 'sweat'],
          { narrate: 'Sam claps. Pip claps. Corry claps so hard his helmet rattles.' },
          ['mayor', 'Oh! Applause! Nobody has ever... ahem. Thank you. Thank you very much. I will be here all week. I will be here all year, in fact. I am the Mayor.', 'heart'],
        ] },
        3: { ask: 'Are you all right, Mayor?', title: 'Too Slow', need: 'sp_met_mayor', lines: [
          { narrate: 'The Mayor is polishing his hat. He has been polishing it for some time. It is extremely shiny.' },
          ['mayor', 'I read the Society\'s letter three times, Sam. And I believed it every time. Silver feathers. Very official.', 'sad'],
          ['mayor', 'Three homes went soggy while I was being polite. A tortoise is slow. I have always known that. I just never minded before.', 'sad'],
          ['sam', 'You weren\'t slow. You were trusting. Those are different things. The fix isn\'t being faster. It\'s checking twice.', 'happy'],
          ['sam', 'Engineers check everything twice. Measure twice, cut once.', 'idea'],
          ['mayor', 'Measure twice... I could put that on the noticeboard. In big letters. Slowly.', 'happy'],
          { journal: 'Mayor Mossworth feels foolish for believing the Society\'s letter. Told him what Grandma always told me: measure twice.' },
        ] },
        5: { ask: 'The Mayor has something to show you', title: 'The First Map', need: 'spring_dam', lines: [
          { narrate: 'The Mayor unrolls something very old, very carefully. A crayon map of a brook, a bridge, three houses, and in the corner, a very small tortoise. Waving.' },
          ['mayor', 'Before I was Mayor, before there was a village, there was a girl in a hard hat with a crayon.', 'happy'],
          ['mayor', 'She said: "You can be in charge, Mossworth. You\'re the most patient." I have tried to be worthy of that for fifty-one years.', 'happy'],
          ['sam', '...That\'s Grandma\'s handwriting.', 'shock'],
          ['mayor', 'Then the patience was worth it. I got to meet you.', 'heart'],
          ['mayor', 'I am keeping the map. But a Mossworth always gives the spare hat. It is a little squashed. So am I.', 'happy'],
        ], journal: 'Mayor Mossworth keeps a crayon map of Blossom Hollow, drawn by Grandma Rosie when she was a girl. He\'s in the corner, waving. He gave me his spare top hat.' },
      },
    },
    dabble: {
      ch: 'summer', spk: 'duck', name: 'Dabble', species: 'Duck', title: 'Sunpatch Shores\' unofficial lifeguard and future juice-stand owner',
      wants: 'To open her juice stand on the boardwalk. The sign has been painted for three summers.',
      fears: 'Things changing while she isn\'t looking. Her big sister moved away last spring.',
      quirk: 'Rates everything out of ten waves. Sunbathes so hard she forgets lunch. Quacks when she laughs and is very embarrassed about it.',
      secret: 'She never opened the juice stand because her sister was supposed to run it with her.',
      loves: ['beachball', 'surfboard', 'sandcastle'], likes: ['balloons', 'picnic', 'pinwheel', 'bunting', 'crates'], hint: 'Beach things. Anything that says summer.',
      keep: 'visor', prop: 'pitcher', sig: ['summer_gates'],
      onLove: 'A {item}! Ten waves. TEN WAVES. I\'ve never given ten waves. Quack. Sorry. Quack.',
      onLike: 'Ooh, a {item}. Eight waves. Maybe eight and a half.',
      chats: {
        0: [['duck', 'Today is a nine-wave day. Yesterday was a four. There was seaweed in my sunhat.', 'happy'], ['duck', 'I make juice every morning for a stand I haven\'t opened yet. I drink it myself. It\'s a lot of juice.', 'sweat']],
        1: [['duck', 'You gave my juice nine waves and I have thought about it every day since.', 'happy'], ['duck', 'The sign says DABBLE & WADDLE\'S. Don\'t ask about the Waddle part. ...Okay, you can ask another day.', 'sad']],
        3: [['duck', 'I walked halfway to Harbor Town today. Then I walked back. That\'s still halfway more than before.', 'happy'], ['duck', 'Grandma\'s jokes. Were they REALLY that bad? Tell me one. ...Oh no. Oh, that\'s terrible. Ten waves.', 'happy']],
        5: [['duck', 'Waddle runs the stand on weekends, I run it on weekdays, and on boat days we close and go sailing.', 'happy'], ['duck', 'You\'re still our first regular. Regulars drink free. That\'s the rule. Waddle made it, so it\'s official.', 'heart']],
      },
      events: {
        1: { ask: 'What\'s in the jug?', title: 'Nine Waves', sum: 'Dabble makes juice every morning for a stand she hasn\'t opened. I gave it nine waves out of ten. The sign says DABBLE & WADDLE\'S.', lines: [
          { narrate: 'Dabble pours a paper cup of something very orange and holds it out with both wings.' },
          ['duck', 'Homemade. Sunpatch oranges, a squeeze of lemon, a secret. Rate it out of ten waves. Be honest. Be nice. Be honestly nice.', 'happy'],
          ['sam', '...Nine waves.', 'happy'],
          ['duck', 'NINE. Out of TEN. I need to sit down. I\'m already sitting down. I need to sit down more.', 'heart'],
          { narrate: 'Behind her, leaning on a beach hut, is a painted sign: DABBLE & WADDLE\'S JUICE. It is very sun-faded.' },
        ] },
        3: { ask: 'Who\'s Waddle?', title: 'Fifteen Minutes Away', need: 'summer_gates', lines: [
          ['duck', 'My big sister. We painted that sign together, three summers ago. Then she moved to Harbor Town with the Brinemarsh crew. She\'s good at boats.', 'sad'],
          ['duck', 'It\'s a fifteen-minute waddle. I haven\'t gone once. If I go and she\'s happy without me, then it\'s real.', 'sad'],
          ['sam', 'When I moved away for college I didn\'t call Grandma for a whole month. If I called, it was real.', 'sad'],
          ['sam', 'Then I called. She\'d been sitting by the phone with a list of jokes. Just in case.', 'happy'],
          ['duck', 'A list of jokes?', 'shock'],
          ['sam', 'They were terrible.', 'happy'],
          ['duck', 'Hmph. ...Ten waves, though.', 'happy'],
          { journal: 'Dabble\'s sister Waddle moved to Harbor Town, fifteen minutes up the beach, and Dabble hasn\'t visited. Told her about not calling Grandma for a month.' },
        ] },
        5: { ask: 'Is that the juice stand? It\'s open!', title: 'Dabble & Waddle\'s', need: 'summer_gates', lines: [
          { narrate: 'The juice stand is open. Behind the counter are two ducks in matching visors, arguing about lemons.' },
          ['duck', 'I went! It took fifteen minutes and three years.', 'happy'],
          ['duck', 'She\'d kept a visor for me on a hook by her door. The whole time. She was scared to visit ME.', 'heart'],
          ['pip', 'You were both scared of the same fifteen minutes! From opposite ends!', 'happy'],
          ['duck', 'You\'re our first regular. Regulars get a visor. That\'s the rule. I made the rule this morning.', 'happy'],
        ], journal: 'Dabble finally walked to Harbor Town. Her sister had kept a visor for her the whole time. The juice stand is open, and I\'m the first regular.' },
      },
    },
    nib: {
      ch: 'summer', spk: 'mouse', name: 'Nib', species: 'Mouse', title: 'Sandcastle engineer, age six and a half',
      wants: 'To be an engineer like you. Specifically like you. He has said so several times.',
      fears: 'That his ideas are silly. The big kids knocked his castle over and laughed.',
      quirk: 'Measures everything in mouse-lengths. Keeps a notebook of inventions, most of them moats. Says "technically" a lot, sometimes correctly.',
      secret: 'His first castle washed away and he cried so hard he got the hiccups for an hour. He has never told anyone.',
      loves: ['sandcastle', 'barrel', 'crates'], likes: ['wateringcan', 'spool', 'wheelbarrow', 'beachball', 'sled'], hint: 'Things you can build with, and things that hold water.',
      keep: 'hardhat', prop: 'pencil', sig: [],
      onLove: 'A {item}! TECHNICALLY this is the best present anyone has ever had. I measured.',
      onLike: 'A {item}. That\'s about nine mouse-lengths of nice.',
      chats: {
        0: [['mouse', 'The sea is eleven thousand mouse-lengths away from my castle. TECHNICALLY. I counted most of them.', 'happy'], ['mouse', 'Are you an engineer? You look like an engineer. You have engineer eyebrows.', 'idea']],
        1: [['mouse', 'Invention forty-three: a moat with a door in it. For visitors.', 'happy'], ['mouse', 'I\'m drawing YOUR bridge in my notebook. I gave it more moats. Sorry.', 'sweat']],
        3: [['mouse', 'Data! I fell over in the sand today. Data. I dropped my ice lolly. Data. It still hurts. But it\'s data.', 'happy'], ['mouse', 'I wrote "that\'s not a failure, that\'s data" on the inside of my hat. In case I forget.', 'happy']],
        5: [['mouse', 'The big kids want a castle class every Tuesday. I said only if we do moats first. They said fine.', 'happy'], ['mouse', 'When I grow up I\'m going to build a real bridge. And you can test it. By walking on it. Carefully.', 'heart']],
      },
      events: {
        1: { ask: 'What are you inventing, Nib?', title: 'Invention Forty-Two', sum: 'Nib\'s notebook is full of moats. Invention forty-two is a bridge over the moat, so the moat doesn\'t feel lonely. It\'s the best one.', lines: [
          { narrate: 'Nib holds up a notebook covered in sand and very serious drawings.' },
          ['mouse', 'Invention forty: a moat. Invention forty-one: a moat, but bigger.', 'happy'],
          ['mouse', 'Invention forty-two: a bridge over the moat, so the moat doesn\'t feel lonely.', 'idea'],
          ['sam', 'Forty-two is a really good one. Bridges are my favourite thing.', 'happy'],
          ['mouse', 'TECHNICALLY it\'s the best one. You have very good taste. For a giant.', 'heart'],
        ] },
        3: { ask: 'Nib, where\'s your castle?', title: 'That\'s Data', lines: [
          { narrate: 'Nib is sitting next to a flat patch of sand with a flag lying in it.' },
          ['mouse', 'The big kids jumped on it. They said moats are for babies.', 'sad'],
          ['mouse', 'Maybe I should do something else. Like being a rock. Rocks don\'t have ideas.', 'sad'],
          ['sam', 'My first bridge fell down too. Lolly sticks and glue. I cried so hard I got hiccups.', 'sad'],
          ['sam', 'Grandma sat down in the mud next to me and said: "Well. Now we know where it was weakest. That\'s not a failure, Sam. That\'s data."', 'happy'],
          ['mouse', '...Data.', 'idea'],
          ['mouse', 'Can I write that down?', 'happy'],
          ['sam', 'Write it down.', 'happy'],
          { journal: 'The big kids knocked over Nib\'s castle. Told him what Grandma told me about my first lolly-stick bridge: that\'s not a failure, that\'s data.' },
        ] },
        5: { ask: 'Nib wants you to watch the tide', title: 'High Tide', need: 'summer_gates', lines: [
          { narrate: 'The tide comes in. It reaches Nib\'s new castle, with three moats and a bridge... and goes around it. All the way around.' },
          { narrate: 'The big kids are watching. One of them asks how it works.' },
          ['mouse', 'I said maybe. Then I said yes. Being nice is technically also engineering.', 'happy'],
          ['mouse', 'I made you this. It\'s a yogurt pot. I painted it. It says SAM on the front.', 'happy'],
          ['mouse', 'And NIB on the back. Smaller. Because you\'re the boss engineer.', 'heart'],
          ['sam', 'We\'re both engineers, Nib.', 'happy'],
          ['mouse', 'TECHNICALLY.', 'star'],
        ], journal: 'Nib\'s new castle survived high tide, and now he teaches the big kids moats. He made me a hard hat from a yogurt pot. SAM on the front, NIB on the back.' },
      },
    },
    ember: {
      ch: 'fall', spk: 'fox', name: 'Ember', species: 'Fox', title: 'Amberleaf\'s best-dressed fox and costume-maker for the Lantern Walk',
      wants: 'To make the Lantern Walk costumes the most beautiful the Woods have ever seen.',
      fears: 'That pretty things don\'t matter. That she was no use at all in the flood.',
      quirk: 'Names every colour exactly ("that\'s not orange, that\'s pumpkin-spice-at-dusk"). Sketches outfits for everyone she meets, including trees.',
      secret: 'While everyone else was sandbagging, she sat in her burrow sewing, and felt ashamed of it.',
      loves: ['paperlantern', 'pumpkins', 'bunting'], likes: ['spool', 'applecrate', 'scarecrow', 'pinwheel', 'balloons'], hint: 'Pretty things, and anything for a party.',
      keep: 'beret', prop: 'sketchbook', sig: ['fall_bridge', 'fa_met_ember'],
      onLove: 'A {item}! The colour! That\'s not red, that\'s first-cherry-of-June. I\'m going to cry. Fashionably.',
      onLike: 'A {item}. I\'m already thinking of an outfit to match.',
      chats: {
        0: [['fox', 'Your costume is lovely. Have you thought about a cape? Everything is better with a cape. Except swimming.', 'happy'], ['fox', 'That tree is wearing autumn so well. Look at it. It KNOWS.', 'happy']],
        1: [['fox', 'Pip\'s two capes are coming along. One for flying, one for "just in case".', 'happy'], ['fox', 'I sketched Corry in a ruff. He said it was "too magnificent". I said that\'s not a thing.', 'happy']],
        3: [['fox', 'People walk across the bridge just to walk across it. Triangles everywhere. I keep thinking about that.', 'happy'], ['fox', 'I made a cape for Bristle. He says it gets caught in his prickles. He wears it anyway.', 'heart']],
        5: [['fox', 'Next year\'s Lantern Walk theme is "Bridges". Obviously. You\'re all wearing triangles.', 'happy'], ['fox', 'The beret is pumpkin-spice-at-dusk. Don\'t let anyone call it orange.', 'heart']],
      },
      events: {
        1: { ask: 'What are you drawing, Ember?', title: 'Everything Is Better With a Cape', sum: 'Ember sketched me in a cape. Pip asked for one and was promised two. Pip has not recovered.', lines: [
          { narrate: 'Ember turns her sketchbook around. It\'s Sam, in costume, with a long swishing cape.' },
          ['fox', 'You. But with a cape. Everything is better with a cape.', 'happy'],
          ['pip', 'Can I have a cape?', 'shock'],
          ['fox', 'You can have TWO capes.', 'happy'],
          ['pip', 'This is the greatest day of my entire paper life.', 'heart'],
        ] },
        3: { ask: 'You seem quiet today, Ember.', title: 'Only Pretty Things', need: 'fall_bridge', lines: [
          ['fox', 'When the river rose, Bristle raked the drains. The Professor saved the books. And I sat in my burrow and sewed Lantern Walk costumes. In a flood.', 'sad'],
          ['fox', 'I\'m only good at pretty things, Sam.', 'sad'],
          ['sam', 'You told me the bridge should look nice, remember? Now people cross it just to walk on it.', 'happy'],
          ['sam', 'A bridge people love is a bridge people look after. That\'s real engineering. You did that.', 'happy'],
          ['corry', 'And a knight fights twice as well in a fine cape. This is well known.', 'happy'],
          ['fox', '...A pumpkin-spice-at-dusk cape?', 'happy'],
          ['corry', 'Obviously.', 'star'],
          { journal: 'Ember feels useless because she sewed costumes while the others fought the flood. But the bridge looks good because of her, and people love it. That matters.' },
        ] },
        5: { ask: 'Is it time for the Lantern Walk?', title: 'The Lantern Walk', need: 'fall_bridge', lines: [
          { narrate: 'The Lantern Walk winds through Amberleaf Woods. Every critter is wearing something Ember made. Even the Leaflings have little paper hats.' },
          ['fox', 'Look at them, Sam. Nobody is thinking about floods tonight. They\'re thinking about how nice they look.', 'happy'],
          ['fox', 'That matters too. Doesn\'t it?', 'idea'],
          ['sam', 'That\'s the whole point of fixing the floods.', 'happy'],
          ['fox', 'Then here. For the one who fixed them. Don\'t you dare call it orange.', 'heart'],
        ], journal: 'The Lantern Walk was the most beautiful the Woods have ever seen. Ember made a costume for everyone, and a beret for me.' },
      },
    },
    bristle: {
      ch: 'fall', spk: 'hedgehog', name: 'Bristle', species: 'Hedgehog', title: 'Keeper of the drains (self-appointed, unpaid, tireless)',
      wants: 'For every drain in Amberleaf Woods to run clear. And, secretly, to jump in a leaf pile again.',
      fears: 'Being a bother. He would rake a whole forest before he asked for help with one corner.',
      quirk: 'Apologises to doors when he bumps them. His prickles stand up when he\'s nervous, which is how you can tell.',
      secret: 'He hurt his paw raking alone all week and told nobody, because everyone was busy.',
      loves: ['wheelbarrow', 'haybale', 'applecrate'], likes: ['barrel', 'wateringcan', 'pumpkins', 'scarecrow', 'gnome'], hint: 'Garden-work things, and cosy autumn things.',
      keep: 'prickles', prop: 'rake', sig: ['fall_bridge'],
      onLove: 'A {item}?! For me? Oh. Oh no. I\'m prickling. That\'s a good prickle. Sorry. Thank you.',
      onLike: 'A {item}! You didn\'t have to. Sorry. I mean thank you. I mean both.',
      chats: {
        0: [['hedgehog', 'Sorry! Was I in the way? I\'m always a bit in the way. Sorry.', 'sweat'], ['hedgehog', 'That drain runs at about a bucket a minute. That\'s good. That\'s a happy drain.', 'happy']],
        1: [['hedgehog', 'The Leaflings like that corner because it\'s out of the wind. I\'ve started leaving them a little pile there. So they don\'t need the drain.', 'happy'], ['hedgehog', 'I said sorry to a door today. It was open. I walked into the air where it would have been.', 'sweat']],
        3: [['hedgehog', 'Paw\'s much better. Pip carried my rake home for me. Pip carried it VERY fast.', 'happy'], ['hedgehog', 'I asked Ember for help with my roof. She said yes. I didn\'t even say sorry first. Well. Only once.', 'happy']],
        5: [['hedgehog', 'There\'s a leaf pile with my shape in it by the big tree. Nobody\'s allowed to rake it. That\'s my rule. My first rule.', 'happy'], ['hedgehog', 'You wore the hood! You don\'t have to. Thank you for wearing it. Sorry. Thank you.', 'heart']],
      },
      events: {
        1: { ask: 'Need a hand, Bristle?', title: 'A Cozy Pile', sum: 'Bristle says sorry for everything and won\'t take help. He understands the Leaflings, though. He\'d like to be a cozy pile sometimes.', lines: [
          ['hedgehog', 'Oh! No no. Sorry. I\'m fine. I\'m totally fine. Sorry.', 'sweat'],
          { narrate: 'His prickles are standing straight up.' },
          ['hedgehog', 'The Leaflings aren\'t bad, you know. They just want to be cozy. I understand. I\'d like to be a cozy pile sometimes.', 'happy'],
          ['pip', 'You could be a cozy pile! I\'ll help! I\'ll be the leaves!', 'happy'],
          ['hedgehog', 'You\'re... very kind. Sorry. I mean, thank you.', 'heart'],
        ] },
        3: { ask: 'What happened to your paw?', title: 'Not a Bother', need: 'fall_bridge', lines: [
          { narrate: 'Bristle\'s paw is wrapped in a leaf, tied with grass. He\'s raking with the other one.' },
          ['hedgehog', 'I\'ve been raking every drain in the Woods since the rain started. By myself. Everyone was busy, I didn\'t want to be a bother.', 'sad'],
          ['sam', 'Bristle. Letting your friends help isn\'t being a bother. It\'s letting them be your friends.', 'happy'],
          ['pip', 'Also you\'re talking to a crane. Cranes LOVE carrying things. It\'s our whole thing.', 'happy'],
          { narrate: 'They rake the last drain together, all four of them. It takes ten minutes.' },
          ['hedgehog', '...Oh. That was nice. Sorry. I mean thank you.', 'heart'],
          { journal: 'Bristle hurt his paw raking every drain in the Woods alone, so he wouldn\'t be a bother. We did the last one together. Ten minutes.' },
        ] },
        5: { ask: 'That\'s a big leaf pile, Bristle', title: 'The Leaf Pile', need: 'fall_bridge', lines: [
          { narrate: 'It\'s the biggest leaf pile in Amberleaf Woods. The Leaflings are sitting in it. Bristle is standing at the edge.' },
          ['hedgehog', 'I haven\'t jumped in a leaf pile since I was a hoglet. What if I get stuck? Prickles. Leaves. It\'s a known problem.', 'sweat'],
          ['corry', 'Then we shall un-stick you. Together. That is what knights are for.', 'happy'],
          { narrate: 'Whump. A shower of paper leaves. A hedgehog-shaped hole. A muffled, very happy squeak.' },
          ['hedgehog', 'I\'m stuck. I\'m SO stuck. This is the best day of my life.', 'heart'],
          ['hedgehog', 'I made you this, so we match. Sorry. You don\'t have to wear it. Please wear it.', 'happy'],
        ], journal: 'Bristle jumped in a leaf pile for the first time since he was a hoglet, and got stuck, and loved it. He made me a prickle hood so we match.' },
      },
    },
    hoot: {
      ch: 'fall', spk: 'owl', name: 'Professor Hoot', species: 'Owl', title: 'Keeper of the Royal Archive. Author of eleven books, all about drainage',
      wants: 'For somebody, anybody, to read his books.',
      fears: 'That knowledge just gets forgotten, like a book left out in the rain.',
      quirk: 'Talks in footnotes ("Hoo. Footnote: that was a joke"). Loses his glasses about forty times a day. They\'re usually on his head.',
      secret: 'He has written eleven books about water going where it should, and never once seen it happen. He was always inside, with the books.',
      loves: ['telescope', 'sundial', 'birdhouse'], likes: ['bench', 'birdbath', 'paperlantern', 'scarecrow', 'windchime'], hint: 'Things for thinking, and things that measure.',
      keep: 'specs', prop: 'specs', sig: ['fall_boss'],
      onLove: 'Hoo! A {item}! Footnote: I am overjoyed. Second footnote: very overjoyed.',
      onLike: 'A {item}! I shall write a short paper about it. Very short. Very grateful.',
      // Hoot's own talk ends with the way to Frostfold once the Archive is safe, so small talk keeps it
      tail: () => (f('fall_boss') ? [{ choice: { who: 'owl', text: 'Travel to Frostfold Peak?', options: [{ label: 'To the capital!', then: [{ chapter: 'winter', label: 'Up to Frostfold Peak...' }] }, { label: 'Not yet', then: [] }] } }] : []),
      chats: {
        0: [['owl', 'Hoo. Have you seen my glasses? ...Ah. On my head. Footnote: they are always on my head.', 'sweat'], ['owl', 'Did you know a culvert is just a tunnel for water? Footnote: I find that beautiful.', 'happy']],
        1: [['owl', 'You\'ve borrowed Volume Seven! It\'s the first time the card has been stamped. I stamped it myself. Twice.', 'heart'], ['owl', 'Footnote: I have started Volume Twelve. It\'s about you. Well, about your dam. Mostly the dam.', 'happy']],
        3: [['owl', 'I went outside yesterday. On purpose. I got my feet wet. Footnote: it was cold, and wonderful.', 'happy'], ['owl', 'There is a puddle by the Archive that drains in four minutes. I timed it. I\'ve timed it eleven times.', 'happy']],
        5: [['owl', 'Bristle is on Volume Three. He reads very slowly and says sorry to every page. My best student.', 'heart'], ['owl', 'Footnote: the drains are running clear. Second footnote: I saw it myself.', 'happy']],
      },
      events: {
        1: { ask: 'What are you reading, Professor?', title: 'Culverts: A Love Story', sum: 'Professor Hoot has written eleven books about drainage. Nobody has ever borrowed one. I said I\'d read Volume Seven. He had to sit down more.', lines: [
          ['owl', 'My own book! Volume Seven. "Culverts: A Love Story."', 'happy'],
          ['owl', 'Nobody has borrowed it in... well. Ever. Footnote: I check every morning.', 'sad'],
          ['sam', 'I\'d read it.', 'happy'],
          ['owl', 'You WOULD?', 'shock'],
          ['owl', 'Hoo. I need to sit down. I am sitting down. I need to sit down more.', 'heart'],
        ] },
        3: { ask: 'Have you ever seen a drain run clear?', title: 'Feet Wet', need: 'fall_bridge', lines: [
          ['owl', 'A confession. Footnote: an embarrassing one.', 'sweat'],
          ['owl', 'I have written eleven books about water going where it should. And I have never once seen it happen. I was always inside, with the books.', 'sad'],
          ['owl', 'I was afraid that out there I\'d just be... ordinary. In here, I know everything.', 'sad'],
          ['sam', 'Out there, you\'d be someone who knows everything AND got their feet wet. That\'s better.', 'happy'],
          ['owl', '...Feet wet. Hoo. Footnote: I am going to think about that all night.', 'idea'],
          { journal: 'Professor Hoot has written eleven books about drainage and never seen a drain run clear. He was always inside, afraid he\'d be ordinary out there.' },
        ] },
        5: { ask: 'Professor, come and see something', title: 'Even Better Than the Diagram', need: 'fall_bridge', lines: [
          { narrate: 'Sam walks the Professor down to Bristle\'s drain by the new bridge. The water swirls, slides into the culvert and runs away, clean and quick. Exactly like Volume Seven said it would.' },
          ['owl', '...It works. It actually works. It\'s even better than the diagram.', 'heart'],
          ['owl', 'Bristle! Do you READ?', 'shock'],
          ['hedgehog', 'Sorry. Um. A little?', 'sweat'],
          ['owl', 'Splendid. We start tomorrow. Volume One.', 'happy'],
          ['owl', 'And these are for you, Sam. My spare reading glasses. Footnote: wear them on your head. That\'s where they live.', 'happy'],
        ], journal: 'Professor Hoot saw a drain run clear for the first time. "Even better than the diagram." Bristle is his first reader. He gave me his spare reading glasses.' },
      },
    },
    mama: {
      ch: 'winter', spk: 'bear', name: 'Mama Burrow', species: 'Bear', title: 'Frostfold\'s knitter, cook and snow-digger-outer',
      wants: 'To answer her cub Bramble\'s questions honestly, even the hard ones.',
      fears: 'That she taught her cub to be afraid of the Brinemarsh folk, without ever meaning to.',
      quirk: 'Knits through every conversation and never looks down. Feeds anybody who stands still. Calls everyone "dear", including the Queen.',
      secret: 'The scary bedtime stories about the Brinemarsh were the ones her own mother told her. She told them because she didn\'t know any others.',
      loves: ['snowman', 'sled', 'icelantern'], likes: ['picnic', 'bench', 'haybale', 'applecrate', 'paperlantern'], hint: 'Snowy things, and anything that feels like home.',
      keep: 'earmuffs', prop: 'knitting', sig: [],
      onLove: 'A {item}! Oh, dear. Oh, you dear. Come here. No, closer. That\'s a hug. You\'re being hugged.',
      onLike: 'A {item}, how lovely, dear. Have you eaten? You haven\'t. Sit.',
      chats: {
        0: [['bear', 'Hold this wool, dear. You\'re the right height. Everyone is the right height for holding wool.', 'happy'], ['bear', 'Have you eaten? You haven\'t. I can tell. It\'s in the eyebrows.', 'happy']],
        1: [['bear', 'Scarf number thirty-four is for the Queen. Blue. She said she didn\'t need one. Everybody needs one, dear.', 'happy'], ['bear', 'Bramble asked why snow is cold. I said, "so cocoa is warm." He accepted this.', 'happy']],
        3: [['bear', 'I told Bramble a new bedtime story. A crab, a bear and a very nervous lighthouse. He made me tell it twice.', 'happy'], ['bear', 'I\'m learning new stories from Captain Bess. Hers all have more shouting. Bramble loves the shouting.', 'happy']],
        5: [['bear', 'The splashling comes for supper on Thursdays now. It eats very wetly. I put down a towel.', 'happy'], ['bear', 'Thirty-two scarves, one pair of earmuffs, and one very good answer. That\'s my winter, dear.', 'heart']],
      },
      events: {
        1: { ask: 'What are you knitting, Mama Burrow?', title: 'Scarf Number Thirty-One', sum: 'Mama Burrow is knitting a scarf for everybody in Frostfold. Bramble\'s is yellow, the warmest colour. Corry is number thirty-two.', lines: [
          ['bear', 'A scarf for everybody in Frostfold, dear. I\'m on number thirty-one. Here, hold this. You\'re the right height.', 'happy'],
          { narrate: 'Sam holds the wool. It keeps going. There is a lot of wool.' },
          ['bear', 'Bramble\'s is yellow. He says yellow is the warmest colour. He\'s right. I checked.', 'happy'],
          ['corry', 'Madam, might a knight have a scarf? For the Ledger. For warmth. Mostly for warmth.', 'happy'],
          ['bear', 'You\'re thirty-two, dear. Red. Already started.', 'heart'],
        ] },
        3: { ask: 'Did Bramble ask again?', title: 'My Mother\'s Story', need: 'winter_done', lines: [
          ['bear', 'He asked why the Brinemarsh folk are scary. I opened my mouth to answer, and out came my mother\'s bedtime story. The one with the teeth.', 'sad'],
          ['bear', 'It wasn\'t the Society that taught him to be scared, Sam. It was me. With a story I never even liked.', 'sad'],
          ['sam', 'Then tell him a new one. Stories are like bridges. You can build a better one right next to the old one.', 'happy'],
          ['bear', 'I don\'t know any good ones, dear.', 'sad'],
          ['pip', 'You know Captain Bess! She\'s a whole good story all by herself. With extra shouting.', 'happy'],
          { journal: 'Mama Burrow realised she taught her cub to fear the Brinemarsh folk with her own mother\'s bedtime story. Told her to build a new story next to the old one.' },
        ] },
        5: { ask: 'Something smells wonderful, Mama Burrow', title: 'Supper at the Burrow', need: 'winter_done', lines: [
          { narrate: 'The Burrow\'s table is full: bears, bunnies, and Captain Bess\'s crew, dripping politely on the rug.' },
          { narrate: 'Bramble and a little splashling are building a snow fort out of the mashed potatoes.' },
          ['bess', 'Never been asked to supper by a bear before. Best stew in the Kingdom. Don\'t tell my cook.', 'happy'],
          ['bear', 'Bramble asked me what Bess\'s crew are like. I said, "Come and see." Best answer I ever gave.', 'heart'],
          ['bear', 'These are for you, dear. I knitted them while we talked. You didn\'t notice. Nobody ever notices.', 'happy'],
        ], journal: 'Mama Burrow had Captain Bess\'s crew to supper so Bramble could "come and see". He and a splashling built a fort out of mashed potatoes. She knitted me earmuffs.' },
      },
    },
  };
  const IDS = Object.keys(N);
  // other modules (together.js) add lines before the menu and options to it
  const PRE = [], EXTRA = [];
  const TIERS = [1, 3, 5];

  // ================================================================ STATE
  function st() {
    const G = CK.G;
    if (!G.fr) G.fr = {};
    const s = G.fr;
    for (const k of ['pts', 'chat', 'gift', 'ev', 'heard', 'known']) s[k] = s[k] || {};
    s.v = s.v || 1;
    return s;
  }
  const pts = (id) => st().pts[id] || 0;
  const hearts = (id) => Math.min(MAXH, Math.floor(pts(id) / PTS));
  const evSeen = (id) => st().ev[id] || 0;
  const met = (id) => st().heard[id] !== undefined;
  const nextTier = (id) => TIERS.find((t) => t > evSeen(id));
  const calm = (id) => f(CALM[N[id].ch]);
  // the next heart story, if it's ready to be told
  function readyEvent(id) {
    const t = nextTier(id);
    if (!t || hearts(id) < t) return null;
    const ev = N[id].events[t];
    if (ev.need && !f(ev.need)) return null;
    return Object.assign({ tier: t }, ev);
  }
  const best = () => IDS.filter((id) => evSeen(id) >= 5).length;
  const giftable = () => (CK.Garden ? CK.Garden.DECOR.filter((d) => CK.Garden.spare(d.id) > 0) : []);
  const reaction = (id, dec) => (N[id].loves.includes(dec) ? 'love' : N[id].likes.includes(dec) ? 'like' : 'ok');
  const sigOf = (id) => N[id].sig.map((k) => (f(k) ? 1 : 0)).join('');

  // ================================================================ LOOKS
  // signature props and the little changes that follow their stories
  function propOf(id) {
    if (id === 'clover') return evSeen(id) >= 5 ? 'lantern' : undefined;
    return N[id].prop;
  }
  function dressUp(ow) {
    for (const id of IDS) {
      const p = propOf(id), spk = CK.Data.speakers[N[id].spk];
      if (spk && spk.o) spk.o.prop = p;
      if (!ow) continue;
      for (const e of ow.ents || []) if (e.type === 'npc' && e.id === id) {
        e.o = Object.assign({}, e.o || {}, { prop: p });
        // best friends always send a heart when you walk up
        e.greetEmote = hearts(id) >= 3 ? 'heart' : null;
      }
    }
  }

  // ================================================================ TALKING
  function burst(ow, e, n) {
    if (!ow || !e || !ow.fx) return;
    for (let i = 0; i < n; i++) ow.fx.emit({ x: e.px + U.rand(-14, 14), y: e.py - 70, vx: U.rand(-40, 40), vy: U.rand(-90, -50), life: 1.1, size: 20, text: '♥', shape: 'text', color: '#ff7aa0' });
  }
  function addPts(id, n, ow, e) {
    const s = st(), before = hearts(id);
    s.pts[id] = Math.min(MAXH * PTS, pts(id) + n);
    const after = hearts(id);
    burst(ow, e, after > before ? 6 : 2);
    if (after > before) {
      CK.Audio.sfx('levelup');
      CK.toast(`♥ ${N[id].name}: ${after} heart${after > 1 ? 's' : ''}!`, '#ffe3ef');
      if (after >= 2 && hearts(id) === after) dressUp(ow);
    }
  }
  function pickChat(id) {
    const pool = N[id].chats[evSeen(id)] || N[id].chats[0];
    const s = st();
    s.cix = s.cix || {};
    const k = (s.cix[id] = ((s.cix[id] || 0) + 1) % pool.length);
    return pool[k];
  }

  // what they say: their own story lines whenever the story has moved on, small talk otherwise
  function talkScript(ow, e, orig) {
    const id = e.id, R = N[id], s = st(), ch0 = CK.G.chapter;
    const fresh = s.heard[id] !== sigOf(id);
    const lines = [];
    if (fresh) lines.push({ await: () => CK.runScript(orig) }, { fn: () => { s.heard[id] = sigOf(id); } });
    else lines.push(pickChat(id));
    lines.push({ fn: () => {
      if (CK.G.chapter !== ch0 || CK.OW !== ow) return [];
      const out = [];
      if (s.chat[id] !== s.v) {
        s.chat[id] = s.v;
        addPts(id, CHAT, ow, e);
        CK.Pastimes.tally('nchats');
      }
      for (const fx of PRE) { const l = fx(id, ow, e); if (l && l.length) out.push(...l); }
      const opts = [];
      for (const fx of EXTRA) { const o = fx(id, ow, e); if (o) opts.push(o); }
      const ev = readyEvent(id);
      if (ev) opts.push({ label: '♥ ' + ev.ask, then: eventScript(id, ev, ow, e) });
      if (s.gift[id] !== s.v && giftable().length) opts.push({ label: 'Give a present', then: [{ await: () => openGift(id) }, { fn: () => giftReaction(id, ow, e) }] });
      else if (s.gift[id] === s.v && !ev) { /* already had a present this visit */ }
      if (opts.length) {
        opts.push({ label: 'See you later!', then: [] });
        out.push({ choice: { who: R.spk, text: `${R.name} ${hearts(id) >= 3 ? 'beams at you.' : hearts(id) >= 1 ? 'smiles at you.' : 'looks at you.'}`, options: opts } });
      }
      if (!fresh && R.tail) out.push(...R.tail());
      out.push({ fn: () => dressUp(ow) }, { save: true });
      return out;
    } });
    return lines;
  }

  function eventScript(id, ev, ow, e) {
    const R = N[id];
    const out = [{ card: { title: ev.title, sub: `${R.name} · ${'♥'.repeat(ev.tier)}`, dur: 1.6 } }].concat(ev.lines);
    out.push({ fn: () => {
      st().ev[id] = ev.tier;
      burst(ow, e, 8);
      const more = [];
      if (ev.tier === 5) {
        more.push({ fn: () => { CK.Closet.give(R.keep); CK.Audio.sfx('win'); } }, { await: () => keepsake(id) });
        if (ev.journal) more.push({ journal: ev.journal });
        if (best() === IDS.length) more.push(['pip', 'Sam. SAM. Every single neighbor in the Kingdom is your best friend. I counted. Twice.', 'heart'], { journal: 'Best friends with every named neighbor in the Kingdom. Pip counted twice.' });
      } else CK.toast(`Heart story: ${ev.title}. Read it again on the Neighbors page.`, '#ffe3ef');
      more.push({ fn: () => dressUp(ow) }, { save: true });
      return more;
    } });
    return out;
  }

  // ================================================================ PRESENTS
  let lastGift = null;
  function giftReaction(id, ow, e) {
    const dec = lastGift; lastGift = null;
    if (!dec) return [];
    const R = N[id], s = st(), d = CK.Garden.DECOR.find((q) => q.id === dec);
    const r = reaction(id, dec);
    const pt = CK.G.pt;
    pt.decor[dec] = Math.max(0, (pt.decor[dec] || 0) - 1);
    if (!pt.decor[dec]) delete pt.decor[dec];
    s.gift[id] = s.v;
    s.known[id] = s.known[id] || {};
    s.known[id][dec] = r;
    const item = d.name.toLowerCase();
    const line = r === 'love' ? [R.spk, R.onLove.replace('{item}', item), 'heart'] : r === 'like' ? [R.spk, R.onLike.replace('{item}', item), 'happy'] : [R.spk, `Oh! A ${item}. That's... thoughtful. I'll find a nice spot for it.`, 'happy'];
    return [{ sfx: r === 'ok' ? 'blip' : 'chest' }, line, { fn: () => {
      addPts(id, r === 'love' ? LOVE : r === 'like' ? LIKE : OK, ow, e);
      if (r !== 'ok') CK.Pastimes.tally('goodGifts');
      if (r === 'love') CK.toast(`${R.name} loves ${d.name}! (noted on the Neighbors page)`, '#ffe3ef');
    } }];
  }

  const GCOLS = 8;
  class GiftScene {
    constructor(id) { this.id = id; this.sel = 0; this.t = 0; this.transparent = true; this.finished = false; this.pick = null; this.row0 = 0; }
    list() { return giftable(); }
    // three rows show at a time; the window scrolls to keep the choice in view
    rect(i) { const w = 66, h = 62, r = Math.floor(i / GCOLS) - this.row0; return [W / 2 - (GCOLS * (w + 6) - 6) / 2 + (i % GCOLS) * (w + 6), 150 + r * (h + 6), w, h]; }
    visible(i) { const r = Math.floor(i / GCOLS) - this.row0; return r >= 0 && r < 3; }
    close(pick) { this.pick = pick; lastGift = pick; this.finished = true; CK.Scenes.remove(this); }
    update(dt) {
      this.t += dt;
      const L = this.list(), n = L.length;
      if (CK.autoSkip) return this.close(L[0] ? L[0].id : null);
      if (!n || Input.hit('back')) { CK.Audio.sfx('back'); return this.close(null); }
      const mv = (d) => { this.sel = (this.sel + d + n) % n; CK.Audio.sfx('blip'); };
      if (Input.hit('left')) mv(-1);
      if (Input.hit('right')) mv(1);
      if (Input.hit('up') && this.sel >= GCOLS) mv(-GCOLS);
      if (Input.hit('down') && this.sel + GCOLS < n) mv(GCOLS);
      const sr = Math.floor(this.sel / GCOLS);
      if (sr < this.row0) this.row0 = sr;
      if (sr > this.row0 + 2) this.row0 = sr - 2;
      for (let i = 0; i < n; i++) {
        if (!this.visible(i)) continue;
        const r = this.rect(i);
        if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) this.sel = i;
        if (Input.mouse.pressed && D.inRect(Input.mouse.x, Input.mouse.y, ...r)) { this.sel = i; return this.close(L[i].id); }
      }
      if (Input.hit('ok')) { CK.Audio.sfx('select'); return this.close(L[this.sel].id); }
    }
    draw(ctx) {
      const P = D.pal(), R = N[this.id], L = this.list(), k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 4));
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(0, (1 - k) * 24); ctx.globalAlpha = Math.min(1, this.t * 5);
      D.panel(ctx, 130, 60, W - 260, H - 110, { theme: true });
      D.portrait(ctx, R.spk, 152, 74, 'happy');
      D.text(ctx, 'A present for ' + R.name, 280, 112, { size: D.T.heading, weight: 800, color: P.text });
      D.text(ctx, 'Pick something from your patch things (not the ones already out in the patch).', 280, 138, { size: D.T.small, weight: 600, color: P.soft });
      const known = st().known[this.id] || {};
      L.forEach((d, i) => {
        if (!this.visible(i)) return;
        const [x, y, w, h] = this.rect(i), on = i === this.sel;
        D.rr(ctx, x, y + 40, w, h, 10); ctx.fillStyle = on ? P.sheetHi : P.sheet; ctx.fill(); stroke(ctx, on ? 3 : 1.5, on ? P.accent : P.line);
        CK.Garden.drawDecor(ctx, d.id, x + w / 2, y + 40 + h - 10, 0.9, 0.3);
        if (known[d.id] === 'love') { ctx.save(); D.heart(ctx, x + w - 11, y + 52, 7, '#ff7aa0'); stroke(ctx, 1.2); ctx.restore(); }
        const left = CK.Garden.spare(d.id);
        if (left > 1) D.text(ctx, '×' + left, x + 6, y + 40 + h - 6, { size: 12, weight: 800, color: P.soft });
      });
      const rows = Math.ceil(L.length / GCOLS);
      if (this.row0 > 0) D.text(ctx, '▲ more', W - 150, 176, { size: 12, weight: 800, align: 'right', color: P.soft });
      if (this.row0 + 3 < rows) D.text(ctx, '▼ more', W - 150, 404, { size: 12, weight: 800, align: 'right', color: P.soft });
      const d = L[this.sel];
      if (d) {
        const kn = known[d.id];
        D.text(ctx, d.name, 160, 426, { size: D.T.ui, weight: 800, color: P.text });
        D.text(ctx, kn === 'love' ? `♥ ${R.name} loves these.` : kn === 'like' ? `${R.name} likes these.` : kn === 'ok' ? `${R.name} was polite about this one.` : 'You haven\'t given them one before.', 160, 448, { size: D.T.small, weight: 700, color: kn === 'love' ? '#d84a7a' : P.soft });
        D.text(ctx, 'Hint: ' + R.hint, W - 160, 426, { size: D.T.small, weight: 700, align: 'right', color: P.accent });
      }
      D.text(ctx, 'Arrows: choose   ·   Z: give   ·   X: never mind', W / 2, H - 66, { size: D.T.small, weight: 700, align: 'center', color: P.soft });
      ctx.restore();
    }
  }
  function openGift(id) { const g = new GiftScene(id); CK.Scenes.push(g); return g; }
  const stroke = (ctx, lw, col) => { ctx.strokeStyle = col || C.ink; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

  // ================================================================ KEEPSAKE
  class KeepsakeCard {
    constructor(id) { this.id = id; this.t = 0; this.transparent = true; this.finished = false; }
    update(dt) {
      this.t += dt;
      if (CK.autoSkip || (this.t > 0.7 && (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed))) { this.finished = true; CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal(), R = N[this.id], it = CK.Closet.item(R.keep), k = D.calm() ? 1 : CK.Ease.ui(Math.min(1, this.t * 3));
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2 + (1 - k) * 30); ctx.rotate(-0.01); ctx.globalAlpha = Math.min(1, this.t * 4);
      D.panel(ctx, -300, -160, 600, 320, { theme: true, airmail: true });
      D.text(ctx, 'A keepsake from ' + R.name, -268, -118, { size: D.T.small, weight: 800, color: P.label });
      D.text(ctx, it.name, -268, -82, { size: D.T.title, weight: 700, color: P.text });
      for (let i = 0; i < 5; i++) { D.heart(ctx, -262 + i * 26, -50, 10, '#ff7aa0'); stroke(ctx, 1.4); }
      D.text(ctx, 'Best friends', -128, -45, { size: D.T.small, weight: 800, color: '#d84a7a' });
      D.stamp(ctx, 130, -136, 140, 140, { holes: P.sheet, margin: 7, hole: 3, pitch: 10, fill: '#fff0f5', art: (c, ix, iy, iw, ih) => CK.Closet.drawTopper(c, R.keep, ix + iw / 2, iy + ih * 0.68, 2.6, 'down') });
      D.wrap(ctx, it.blurb, 370, D.T.ui, 600).slice(0, 4).forEach((l, i) => D.text(ctx, l, -268, 0 + i * 24, { size: D.T.ui, weight: 600, color: P.text }));
      D.text(ctx, 'It\'s in Tansy\'s Catalogue now (Kingdom Book). Try it on!', -268, 118, { size: D.T.small, weight: 700, color: P.soft });
      ctx.restore();
    }
  }
  function keepsake(id) { const c = new KeepsakeCard(id); CK.Scenes.push(c); return c; }

  // ================================================================ OVERWORLD HOOKS
  // a new visit is coming to a place (or day turning to night there): everyone has news again
  const baseUpdate = OW.update;
  OW.update = function (dt, active) {
    baseUpdate.call(this, dt, active);
    if (!this.ch || !PLACE[this.ch.id]) return;
    const s = st(), key = this.ch.id + (this.night ? '_n' : '_d');
    if (s.key !== key) { s.key = key; s.v++; }
    if (this._frDressed !== s.v) { this._frDressed = s.v; dressUp(this); }
  };
  const baseRefresh = OW.refresh;
  OW.refresh = function () { baseRefresh.call(this); this._frDressed = 0; };

  const baseInteract = OW.interact;
  OW.interact = function (e, who) {
    if (e && e.type === 'npc' && N[e.id] && N[e.id].ch === (this.ch && this.ch.id)) {
      // swap the talk for ours just while the chain runs, so letters and costume pieces still come first
      const orig = e.talk, ow = this;
      e.talk = () => talkScript(ow, e, typeof orig === 'function' ? orig(CK.G) : orig);
      try { return baseInteract.call(this, e, who); } finally { e.talk = orig; }
    }
    return baseInteract.call(this, e, who);
  };

  const HEADY = { critter: 92, mayor: 70 };
  const baseDrawEnt = OW.drawEnt;
  OW.drawEnt = function (ctx, e) {
    baseDrawEnt.call(this, ctx, e);
    if (e.type !== 'npc' || !N[e.id] || CK.talkingWho) return;
    const dx = this.player.x - e.px, dy = this.player.y - e.py;
    if (Math.abs(dx) < 120 && Math.abs(dy) < 120) return;
    if (!readyEvent(e.id)) return;
    const x = e.px - this.camX + (e.paceOff || 0), y = e.py - this.camY - (HEADY[e.look] || 90) + Math.sin(this.t * 3.5 + e.x) * 3;
    CK.drawEmote(ctx, 'heart', x, y, this.t);
  };

  // ================================================================ JOBS + CHALLENGE
  if (CK.Pastimes.JOBS) {
    const anyMet = () => IDS.some(met);
    CK.Pastimes.JOBS.push(
      { id: 'nchat', key: 'nchats', n: [1, 3], pay: 10, text: (n) => (n > 1 ? `Catch up with ${n} named neighbors` : 'Catch up with a named neighbor'), ok: anyMet },
      { id: 'ngift', key: 'goodGifts', n: [1, 1], pay: 15, text: () => 'Give a neighbor a present they like', ok: () => anyMet() && giftable().length > 0 },
    );
  }
  if (CK.Pastimes.CHALLENGES) CK.Pastimes.CHALLENGES.push({ id: 'bestfriends', name: 'Best Friends', what: 'neighbors at five hearts', tiers: [1, 4, 9], val: best, gold: 'sweetheart' });

  // ================================================================ NEIGHBORS PAGE
  class NeighborsScreen {
    constructor() { this.transparent = true; this.sel = 0; this.t = 0; this.story = -1; }
    tile(i) { return [56 + (i % 3) * 98, 92 + Math.floor(i / 3) * 128, 92, 120]; }
    update(dt) {
      this.t += dt;
      if (this.story >= 0) {
        if (Input.hit('ok') || Input.hit('back') || Input.mouse.pressed) { CK.Audio.sfx('back'); this.story = -1; }
        return;
      }
      const mv = (d) => { this.sel = (this.sel + d + 9) % 9; CK.Audio.sfx('blip'); };
      if (Input.hit('left')) mv(-1);
      if (Input.hit('right')) mv(1);
      if (Input.hit('up')) mv(-3);
      if (Input.hit('down')) mv(3);
      for (let i = 0; i < 9; i++) if (Input.mouse.moved && D.inRect(Input.mouse.x, Input.mouse.y, ...this.tile(i))) this.sel = i;
      const id = IDS[this.sel];
      if ((Input.hit('ok') || Input.key('KeyZ')) && evSeen(id) > 0) { CK.Audio.sfx('select'); this.story = this.sel; return; }
      if (Input.hit('back') || (Input.mouse.pressed && !D.inRect(Input.mouse.x, Input.mouse.y, 40, 24, W - 80, H - 48))) { CK.Audio.sfx('back'); CK.Scenes.remove(this); }
    }
    draw(ctx) {
      const P = D.pal();
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 40, 20, W - 80, H - 40, { theme: true });
      D.text(ctx, 'Neighbors', 60, 66, { size: D.T.title, weight: 700, color: P.text });
      D.text(ctx, `Best friends: ${best()} of 9`, 360, 66, { size: D.T.small, weight: 800, color: '#d84a7a', align: 'right' });
      IDS.forEach((id, i) => this.drawTile(ctx, P, id, i));
      this.drawDetail(ctx, P, IDS[this.sel]);
      D.text(ctx, 'Arrows: browse   ·   Z: read their heart stories   ·   X: close', W / 2, H - 30, { size: D.T.small, weight: 700, align: 'center', color: P.soft });
      if (this.story >= 0) this.drawStories(ctx, P, IDS[this.story]);
    }
    drawTile(ctx, P, id, i) {
      const [x, y, w, h] = this.tile(i), on = i === this.sel, R = N[id], sp = CK.Data.speakers[R.spk], m = met(id);
      D.rr(ctx, x, y, w, h, 12); ctx.fillStyle = on ? P.sheetHi : P.sheet; ctx.fill(); stroke(ctx, on ? 3 : 1.5, on ? P.accent : P.line);
      ctx.save(); D.rr(ctx, x + 6, y + 6, w - 12, 76, 9); ctx.clip();
      ctx.fillStyle = m ? sp.bg || '#fff3dc' : '#d8cfc0'; ctx.fillRect(x + 6, y + 6, w - 12, 76);
      // someone you haven't met is a question mark until you say hello
      if (m) D.char(ctx, sp.look, x + w / 2 + (sp.look === 'mayor' ? -6 : 0), y + (sp.look === 'mayor' ? 74 : 92), Object.assign({ s: sp.look === 'mayor' ? 1.2 : 1.05, noShadow: true, mood: hearts(id) >= 3 ? 'happy' : undefined }, sp.o, { prop: propOf(id) }));
      else { D.ellipse(ctx, x + w / 2, y + 72, 22, 6, 'rgba(0,0,0,.12)'); D.text(ctx, '?', x + w / 2, y + 60, { size: 40, weight: 800, align: 'center', color: 'rgba(90,70,50,.45)' }); }
      ctx.restore();
      D.text(ctx, m ? R.name.split(' ')[R.name.startsWith('Mayor') || R.name.startsWith('Professor') || R.name.startsWith('Mama') ? 1 : 0] : '???', x + w / 2, y + 98, { size: 13, weight: 800, align: 'center', color: P.text });
      for (let k = 0; k < 5; k++) { D.heart(ctx, x + 14 + k * 16, y + 110, 6, k < hearts(id) ? '#ff7aa0' : 'rgba(0,0,0,.12)'); if (k < hearts(id)) stroke(ctx, 1); }
      if (readyEvent(id)) { ctx.save(); ctx.translate(x + w - 12, y + 12); ctx.scale(0.5, 0.5); CK.drawEmote(ctx, 'heart', 0, 0, this.t); ctx.restore(); }
    }
    drawDetail(ctx, P, id) {
      const R = N[id], x0 = 368, w = W - 80 - (x0 - 40) - 24;
      let y = 96;
      if (!met(id)) {
        D.text(ctx, 'Someone you haven\'t met yet', x0, y + 10, { size: D.T.heading, weight: 800, color: P.text });
        D.text(ctx, `Lives in ${PLACE[R.ch]}. Walk up and say hello!`, x0, y + 40, { size: D.T.ui, weight: 600, color: P.soft });
        return;
      }
      D.text(ctx, R.name, x0, y + 8, { size: D.T.heading, weight: 800, color: P.text });
      D.text(ctx, `${R.species} · ${PLACE[R.ch]}`, x0 + w, y + 8, { size: D.T.small, weight: 700, align: 'right', color: P.accent });
      const tl = D.wrap(ctx, R.title, w, 14, 600);
      tl.slice(0, 2).forEach((l, i) => D.text(ctx, l, x0, y + 30 + i * 18, { size: 14, weight: 600, color: P.soft }));
      y += 34 + tl.slice(0, 2).length * 18;
      const row = (label, text, col) => {
        D.text(ctx, label, x0, y, { size: 13, weight: 800, color: col || P.label });
        const ls = D.wrap(ctx, text, w - 74, 14, 500);
        ls.forEach((l, i) => D.text(ctx, l, x0 + 74, y + i * 18, { size: 14, weight: 500, color: P.text }));
        y += ls.length * 18 + 8;
      };
      row('Wants', R.wants);
      row('Fears', R.fears);
      row('Quirk', R.quirk);
      row('Secret', evSeen(id) >= 3 ? R.secret : '(three hearts, and they might tell you)', '#7a4ab0');
      // loves: what you've found out by giving presents
      D.text(ctx, 'Loves', x0, y + 20, { size: 13, weight: 800, color: '#d84a7a' });
      const known = st().known[id] || {};
      R.loves.forEach((dec, i) => {
        const bx = x0 + 74 + i * 56, by = y;
        D.rr(ctx, bx, by, 50, 44, 8); ctx.fillStyle = P.sheet; ctx.fill(); stroke(ctx, 1.2, P.line);
        if (known[dec] === 'love') CK.Garden.drawDecor(ctx, dec, bx + 25, by + 38, 0.62, 0.3);
        else D.text(ctx, '?', bx + 25, by + 30, { size: 22, weight: 800, align: 'center', color: P.soft });
      });
      const likes = R.likes.filter((d) => known[d] === 'like').map((d) => CK.Garden.DECOR.find((q) => q.id === d).name);
      const lx = x0 + 74 + 3 * 56 + 6;
      D.wrap(ctx, 'Hint: ' + R.hint, x0 + w - lx, 13, 600).slice(0, 2).forEach((l, i) => D.text(ctx, l, lx, y + 14 + i * 16, { size: 13, weight: 600, color: P.soft }));
      if (likes.length) D.text(ctx, 'Likes: ' + likes.join(', '), lx, y + 48, { size: 12, weight: 600, color: P.soft });
      y += 62;
      // heart stories
      D.text(ctx, 'Stories', x0, y + 6, { size: 13, weight: 800, color: '#3e7a5a' });
      TIERS.forEach((t, i) => {
        const bx = x0 + 74 + i * 152, seen = evSeen(id) >= t, ev = R.events[t];
        D.rr(ctx, bx, y - 10, 146, 26, 8); ctx.fillStyle = seen ? '#ffe3ef' : P.sheet; ctx.fill(); stroke(ctx, 1.2, seen ? '#d84a7a' : P.line);
        D.heart(ctx, bx + 14, y + 3, 6, seen ? '#ff7aa0' : 'rgba(0,0,0,.15)');
        const ls = D.wrap(ctx, seen ? ev.title : `${t} heart${t > 1 ? 's' : ''}`, 112, 11, 700);
        D.text(ctx, ls[0] + (ls.length > 1 ? '…' : ''), bx + 26, y + 8, { size: 11, weight: 700, color: seen ? '#8a2a4a' : P.soft });
      });
      y += 30;
      const ev = readyEvent(id), nt = nextTier(id);
      const status = evSeen(id) >= 5 ? `Best friends. Keepsake: ${CK.Closet.item(R.keep).name}.` : ev ? `${R.name} has something to tell you. Go and talk to them!` : nt && hearts(id) >= nt ? `Their next story opens up once ${PLACE[R.ch]} is back on its feet.` : `Chat each visit and bring presents. Next story at ${nt} heart${nt > 1 ? 's' : ''}.`;
      D.text(ctx, status, x0, y + 6, { size: 13, weight: 700, color: '#3e7a5a' });
      if (CK.Neighbors9.detailExtra) CK.Neighbors9.detailExtra(ctx, P, id, x0, y + 28, w);
    }
    drawStories(ctx, P, id) {
      const R = N[id];
      ctx.fillStyle = P.scrim; ctx.fillRect(0, 0, W, H);
      D.panel(ctx, 90, 40, W - 180, H - 80, { theme: true, lines: 14, lineTop: 100 });
      D.portrait(ctx, R.spk, 110, 56, 'happy');
      D.text(ctx, R.name + '\'s stories', 240, 100, { size: D.T.heading, weight: 800, color: P.text });
      let y = 132;
      for (const t of TIERS) {
        if (evSeen(id) < t) break;
        const ev = R.events[t];
        D.text(ctx, '♥'.repeat(t) + '  ' + ev.title, 240, y, { size: 15, weight: 800, color: '#d84a7a' });
        y += 20;
        const sum = (ev.sum || ev.journal || (ev.lines.find((l) => l && l.journal) || {}).journal || ev.lines.filter(Array.isArray).slice(0, 1).map((l) => l[1]).join(' '));
        D.wrap(ctx, sum, W - 180 - 170, 14, 500).slice(0, 4).forEach((l) => { D.text(ctx, l, 240, y, { size: 14, weight: 500, color: P.text }); y += 19; });
        y += 12;
      }
      D.text(ctx, 'Z or X: back', W / 2, H - 58, { size: D.T.small, weight: 700, align: 'center', color: P.soft });
    }
  }

  CK.NeighborsScreen = NeighborsScreen;
  CK.Neighbors9 = { N, IDS, st, hearts, evSeen, readyEvent, best, met, addPts, burst, dressUp, PRE, EXTRA, propOf, PTS, PLACE };
  CK.debugFriends = {
    set(id, h) { st().pts[id] = h * PTS; st().heard[id] = st().heard[id] || ''; dressUp(CK.OW); },
    meetAll() { for (const id of IDS) if (!met(id)) st().heard[id] = ''; },
    seen(id, t) { st().ev[id] = t; dressUp(CK.OW); },
    script: (id) => { const e = CK.OW.ents.find((q) => q.id === id); return talkScript(CK.OW, e, e.talk); },
    gift: openGift,
  };
})();
