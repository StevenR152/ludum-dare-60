# The Owl Master's Kiln — Game Design Doc (LD60)

Oct 17, 2026 · @Steve

## What is it

Our Ludum Dare 60 game. The theme is Old Tech, so we're going with pottery.

You're a young fox helping an old owl master potter who can't see anymore. He still throws the pots on his kick wheel. You do everything else: dig the clay, glaze it, fire it in the kiln.

Pottery is about as old tech as it gets: kick wheel, wood kiln, hand-dipped glaze. It should feel chill to play, with a few tense moments, like getting a pot out before it cracks.

## How it plays

- The master's book has the orders: what clay, how much, what colour.
- Walk the fox around inside and outside, and click things to work them.
- Most actions have a timer bar. Finish in time, or hold for just the right length.
- You can only carry one thing at a time.
- Mess up and you get a cracked, ugly or shattered pot.
- Fun extras: the master sneezes and scares you, and rough ground makes you drop stuff.

## Pottery steps

The master throws and trims the pots. You do the rest: harvest clay, wedge it, dry it, gather wood, fire it, glaze it, fire it again.

## Base game loop #1

Loop #1 is one order, start to finish.

This is super simple for now, to get the end to end working quickly so people can work on different sections of game.

&#91;embedded content: Base game loop #1 · 7 steps across inside and outside\]

Drying, trimming and the second firing come later.

## What we're building first

**Art:** indoor and outdoor scenes, the fox, the owl master, a basic pot, the door, clay patches, the master's table, 3 glaze buckets, the kiln. Next up: drying and kiln art.

**Mechanics:** click zones with timers (then later they only work when the fox is there), one-item inventory, master making pots at different speeds, and a config file for clays, timings and colours.

## Sound

- **Music:** background tracks, style still open.
- **Sounds that'll probably need something:** timer bars, glaze dipping, kiln firing, pots cracking or shattering, the master's sneeze, picking up and dropping stuff, the door.

## Later

Once loop #1 is fun, we'll add more:

- More clay types, glazes and additives
- Drying hacks like a plastic sheet or a fan
- Firing a few pots at once
- Multiplayer kick wheel
- Make 1000 pots
- Other old crafts like weaving and fermentation

## Still deciding

- [ ] One kiln or two?
- [ ] Fire orders together or one at a time?
- [ ] 3 glaze buckets or more?
- [ ] What happens when you fail an order?
- [ ] Game name
