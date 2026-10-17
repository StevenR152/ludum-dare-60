# Doors Between Outside and Inside (PRD)

Oct 18, 2026 · @Steve

## Problem

The design doc has the fox working both inside and outside the master's house. Today the Game scene only has Outside (clay, kiln, owl) and a door that does nothing. There is no Inside and no way to get there.

## Goal

The fox walks into the Outside door and appears Inside. It walks into the Inside door and appears back Outside, just below the Outside door. It can go back and forth as often as it likes.

## Approach

Everything lives in `scenes/game.js`, in the one Game scene. No new Crafty scene, because the game progress - clay work and the timer must keep running while the fox is indoors.

- **One world, two areas.** Following the layout note at the top of `game.js` (`inside, door, gap, door, outside`), Inside sits to the left of Outside with a gap between them, so the camera never shows both at once.
- **Inside placeholder.** A very faint house interier coloured rectangle the same size as Outside (2000×1080) stands in until the inside art is ready.
- **Two door entities**, one per area. Each door knows its partner.
- **Teleport on click.** When the fox is touching a door and the player clicks (or taps) it, the fox moves to a spot just below the partner door, centred on it and clear of it. Walking into a door alone does nothing.
- **Camera.** The existing `makeCameraTrackEntity` follow keeps working. The view jumps with the fox, and no camera change is needed.

## Acceptance

1. Clicking the Outside door while the fox touches it puts the fox Inside, below the Inside door and not touching it.
2. Clicking the Inside door while the fox touches it puts the fox Outside, below the Outside door and not touching it.
3. The fox does not ping-pong. Standing where it arrives triggers nothing.
4. The camera follows the fox in both areas.
5. Clay patches, the HUD and the game timer behave as before.
6. It works with the keyboard and with touch controls.
7. The owl now lives inside the house not Outside (he's making pottery inside)

## Non-goals

- Inside art and inside objects (master's table, glaze buckets)
- Walls, map bounds or blocking the fox from walking off an area
- Fade or transition effects, and the door sound
- A separate Crafty scene for Inside
