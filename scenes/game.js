//inside, door, gap, door, outside

// What buildWorld puts in a scene: each stage (scenes/levels.js) switches parts off and sets its own rules, so anything
// its goal does not need is simply not built.
//   inside:            the house (doors, inside map and mask, owl, workbench, weighing station, shelves)
//   glaze:             the glaze station (needs inside)
//   clays:             CLAY_TYPES keys that get a patch to dig outside
//   models:            ORDER_SHAPES names that get a model on the workbench
//   maxGlazeDips:      glaze dips one pot takes
//   potsBreakOnGround: whether dropped pots can be damaged by walking onto them
//   orders:            null for random timed orders, else a list of fixedOrder()s that all arrive at once
//   prePlaced:         pots lying on the ground at the start: [{clay, shape, x, y}] (x, y the pot's middle)
//   kilnDelivers:      a glaze-fired pot taken out of the kiln fills its order straight away (no completed shelf)
//   kilnHint:          explain the fire levels the first time the fox uses the kiln

// Builds the HUD and world of one scene from a config like a LEVELS[i].world (scenes/levels.js). Returns the parts
// a scene wires up further: {player, kiln, hud, completedShelf (null without the house)}.
function buildWorld(config) {
    Crafty.background("#EEE");
    worldRules = {maxGlazeDips: config.maxGlazeDips, potsBreakOnGround: config.potsBreakOnGround};

    // HUD (the music button, timer and inventory bar are built together once the holders exist, below)
    Crafty.e("InventorySlot").attr({x: 20, y: 60});
    Crafty.e("OrderPanel").attr({x: GAME_SCREEN_WIDTH - 300, y: 60}).start(config.orders);

    // Outside map, 5763x2458 drawn into OUTSIDE_MAP_BOX; z keeps it behind everything.
    Crafty.e("2D, DOM, backgroundOutside")
        .attr(OUTSIDE_MAP_BOX).attr({z: OUTSIDE_MAP_Z});


    // Out-of-bounds masks (COLLISION_AREAS): read before the fox exists, since it checks them on every step.
    collisionMap.load();
    if (DEBUG_HITBOXES) {
        collisionMap.showDebug();
    }

    // The fox starts on the ground, left of the middle of the map.
    var player = Crafty.e("Fox").attr({x: 542, y: 656});
    if (player.feetBlocked(player.x, player.y)) {
        console.warn("The fox starts out of bounds: move its start or repaint the collision mask");
    }

    if (config.inside) {
        // Inside sits left of Outside. The gap is wider than the screen, so the camera never shows both.
        // House interior art at a quarter of its 8364x2246 source size, keeping its aspect ratio.
        Crafty.e("2D, DOM, backgroundInside")
            .attr(INSIDE_MAP_BOX).attr({z: -1});

        // The same art with only the foreground items the fox walks behind, drawn over him (below the HUD).
        Crafty.e("2D, DOM, overlayInside")
            .attr(INSIDE_MAP_BOX).attr({z: 50});
    }


    // Click to move: press the ground to walk there, or a far station to walk to it (see Fox.enableClickToMove).
    player.enableClickToMove();

    // Debug aid for laying out the scene: log world coordinates of any click.
    player.logClickPosition = function (e) {
        console.log("location: x: " + Math.round(e.realX) + ", y: " + Math.round(e.realY));    }.bind(player);
    Crafty.s("Mouse").bind("MouseDown", player.logClickPosition);
    // The mouse system outlives the scene, so drop the handler with the player.
    player.bind("Remove", function () {
        Crafty.s("Mouse").unbind("MouseDown", player.logClickPosition);
    });

    // The master potter, inside the house. He keeps throwing pots while his hands are free.
    var owl = null;
    if (config.inside) {
        owl = Crafty.e("2D, DOM, owl, Mouse, Potter")
            .attr({x: -1660, y: 327, w: 160, h: 152});

        // Clicking the owl the fox is touching takes his oldest finished pot while the fox has a free slot; with a full
        // pack it gives him what he can work on instead (a pot to trim, or wedged clay and a model, see
        // Potter.receiveFrom) and says why if he can't take anything.
        owl.bind("MouseDown", function () {
            if (!player.touches(this)) {
                return;
            }
            var packFull = player.inventory.items.length >= player.inventory.capacity;
            if (this.hasFinishedPot() && !packFull) {
                this.takePot(player);
            } else {
                showStatus(this.receiveFrom(player).status);
            }
        });
    }

    // The kiln, Outside. The torch sits on top of the fire in its picture.
    var kiln = Crafty.e("Kiln, Mouse")
        .attr(KILN_ART_BOX)
        .placeArt();

    // Ambient loops and sound effects, driven by game events (see GameSounds).
    Crafty.e("GameSounds").listen(player, kiln);
    // Background theme, layered under the ambient loop at a lower volume than on the menu scenes.
    audioController.playMusic(MUSIC_TRACK, GAME_MUSIC_VOLUME);

    // The torch lights the kiln. The fox stands on it, e.g. at (1526, 555), and clicks.
    var torch = Crafty.e("2D, DOM, Color, Mouse, DebugHitbox")
        .attr({x: 1520, y: 549, w: 52, h: 72}) // the 40x60 torch grown 6 px each side to be easier to reach
        .color(TORCH_COLOR, 0); // invisible: the kiln picture shows the fire, the torch only takes the click
    torch.bind("MouseDown", function () {
        if (player.touches(this)) {
            kiln.light();
        }
    });

    // The forest, Outside left: a row of trees filling FOREST_BOX. Hold on a tree the fox touches to chop logs.
    var treeW = FOREST_BOX.w / FOREST_TREES.length;
    FOREST_TREES.forEach(function (tree, i) {
        Crafty.e("Forest")
            .attr({x: FOREST_BOX.x + i * treeW, y: FOREST_BOX.y, w: treeW, h: FOREST_BOX.h})
            .plant(tree);
    });

    // One HUD entity owns the music button, timer and inventory bar: hud.enable(false) hides it all.
    var hud = Crafty.e("GameHud").build(player, owl, kiln);

    // Clicking the kiln the fox is touching loads the selected logs or pot (unfired at any dryness, or
    // bisque-fired for its glaze firing), or collects a fired pot. Nothing moves while the kiln fires; while it cools only wood goes in.
    var kilnHinted = false;
    kiln.bind("MouseDown", function () {
        if (!player.touches(this)) {
            showStatus("I can't reach the kiln from here");
            return;
        }
        if (config.kilnHint && !kilnHinted) {
            kilnHinted = true;
            showStatus("Logs set the fire: 1 log is low (black clay), 2 mid (red clay), 3 high (white clay)");
        }
        var held = player.inventory.selectedItem();
        var packFull = player.inventory.items.length >= player.inventory.capacity;
        if (this.state === "firing") {
            showStatus("I shouldn't reach into the kiln while it's burning");
            return;
        }
        // Wood: the selected log, or any log in the pack when what is selected is no use to the kiln, so
        // carrying clay in the other slot doesn't stop you stoking it. Something the kiln can fire still
        // wins, so a log never jumps ahead of a pot you meant to put in. Wood may go in while it cools.
        var logIndex = -1;
        if (held && held.type === "log") {
            logIndex = player.inventory.items.indexOf(held);
        } else if (held && !this.passFor(held)) {
            logIndex = player.inventory.find(function (item) { return item.type === "log"; });
        }
        if (logIndex >= 0) {
            showStatus(transferItem(player.inventory, this.woodInventory, logIndex)
                ? "Wood loaded into the kiln" : "The kiln is full of wood");
            return;
        }
        if (this.state === "cooling") {
            showStatus("I'll wait, the kiln is still cooling down");
            return;
        }
        // A ready kiln is collected from unless the pack is full: then the selected pot goes in beside the fired ones.
        if (held && (this.state !== "ready" || packFull) && transferItem(player.inventory, this.inventory)) {
            showStatus("Kiln loaded");
            return;
        }
        var out = this.nextOut(); // a finished pot first, then a fresh pot, then a log
        if (this.state === "ready") {
            if (held && held.type === "pot" && packFull && this.passFor(held) && this.inventory.items.length >= this.inventory.capacity) {
                showStatus("The kiln is full");
            } else {
                showStatus(out && transferItem(out.inventory, player.inventory, out.index)
                    ? "Took the pot out of the kiln"
                    : "You can't carry the pot: your pack is full or holds clay");
            }
        } else if ((!held || !this.passFor(held)) && out) {
            // Not lit yet: empty hands, or hands holding something the kiln can't fire, take back the pot,
            // else a log, one per click.
            showStatus(transferItem(out.inventory, player.inventory, out.index)
                ? "Took the " + (out.inventory === this.inventory ? "pot" : "log") + " out of the kiln"
                : "You can't carry that");
        } else if (held && held.type === "pot" && held.pot.cracked) {
            showStatus("This pot is cracked, it can't be fired");
        } else if (this.state === "empty" && held && held.state === "glazeCooled") {
            showStatus("This pot is finished, take it to the completed shelf");
        } else if (held && held.type === "pot") {
            showStatus("The kiln is full");
        } else {
            // The press did nothing: say what the kiln is doing.
            showStatus({
                empty: "The kiln is cold and empty",
                loaded: "The kiln is loaded, add wood and light the torch"
            }[this.state]);
        }
    });

    if (config.kilnDelivers) {
        // No completed shelf: a finished (glaze-fired, uncracked) pot taken out of the kiln fills its order and is used up.
        player.bind("ItemMoved", function (move) {
            var pot = move.item;
            if (move.from !== kiln.inventory || move.to !== player.inventory || pot.state !== "glazeCooled" || pot.pot.cracked) {
                return;
            }
            var order = findOpenOrder(pot);
            if (order) {
                player.inventory.pull(player.inventory.items.indexOf(pot));
                player.inventory.changed();
                pot.advance("shelved");
                deliverOrder(order);
                showStatus("Order delivered!");
            }
        });
    }

    // Pots lying on the ground at the start (with their pictures drawn like any dropped item).
    config.prePlaced.forEach(function (spec) {
        Crafty.e("DroppedItem").lieAt(player, makePot(spec.clay, spec.shape), spec.x, spec.y);
    });

    // Sandbox test pots: a grey box faking a table, 100 px under the kiln and 50 px right of it, with one pot per stage in a grid.
    if (config.testTable) {
        var cell = {w: ITEM_SHAPES.pot.w * DROPPED_ITEM_SCALE, h: ITEM_SHAPES.pot.h * DROPPED_ITEM_SCALE};
        var gap = 10;
        var cols = 3;
        var rows = Math.ceil(config.testTable.length / cols);
        var table = Crafty.e("2D, DOM, Color")
            .attr({x: KILN_ART_BOX.x + 50, y: KILN_ART_BOX.y + KILN_ART_BOX.h + 100,
                w: cols * (cell.w + gap) + gap, h: rows * (cell.h + gap) + gap, z: DROPPED_ITEM_Z - 1})
            .color("#8C8C8C");
        config.testTable.forEach(function (spec, i) {
            var onTable = Crafty.e("DroppedItem").lieAt(player, makePotAtStage(spec.clay, spec.shape, spec.stage),
                table.x + gap + (i % cols) * (cell.w + gap) + cell.w / 2,
                table.y + gap + Math.floor(i / cols) * (cell.h + gap) + cell.h / 2);
            onTable.immune = true;
        });
    }

    // Sandbox test logs: a few lying 100 px left of the kiln, in a grid whose right edge and bottom line up with it.
    if (config.testLogs) {
        var logW = ITEM_SHAPES.log.w * DROPPED_ITEM_SCALE;
        var logH = ITEM_SHAPES.log.h * DROPPED_ITEM_SCALE;
        var logCols = 3;
        for (var l = 0; l < config.testLogs; l++) {
            var logRow = Math.floor(l / logCols);
            var logRows = Math.ceil(config.testLogs / logCols);
            Crafty.e("DroppedItem").lieAt(player, {type: "log"},
                KILN_ART_BOX.x - 100 - logW / 2 - (logCols - 1 - l % logCols) * (logW + 10),
                KILN_ART_BOX.y + KILN_ART_BOX.h - logH / 2 - (logRows - 1 - logRow) * (logH + 10));
        }
    }

    // Each clay node's dig zone is cut from its patch's art (see Clay.clay). The white patch is moved from
    // the forest to the bottom right, near the kiln (its middle ends up around 1329, 817).
    config.clays.forEach(function (key) {
        Crafty.e("Clay").clay(CLAY_TYPES[key], key === "white" ? {x: 860, y: 259} : undefined);
    });

    TouchControls.follow(player);
    makeCameraTrackEntity(player, 0);
    Crafty.e("PlayerNotification").follow(player);

    // A bar above each thing that can be busy, filling while it works (see components/timer_bar.js).
    Crafty.e("TimerBar").follow(player, TIMER_BAR_OFFSET_Y).onHold();
    Crafty.e("TimerBar").follow(kiln, TIMER_BAR_OFFSET_Y).onKiln();
    if (owl) {
        Crafty.e("TimerBar").follow(owl, TIMER_BAR_OFFSET_Y).onPotter(owl);
    }

    if (!config.inside) {
        return {player: player, kiln: kiln, hud: hud, completedShelf: null};
    }

    // Glazing station, Inside left of the door: click a bucket to dip the selected pot.
    if (config.glaze) {
        Crafty.e("GlazeStation").station([{x: -1298, y: 322}, {x: -1366, y: 306}], player);
    }

    // Inside stations. The workbench is wedged on by holding and its models clicked (see
    // Workbench); the shelves are clicked while the fox touches them.
    Crafty.e("Workbench").place(-1850, 242, 260, 50, config.models);

    // Weighing station (the purple rectangle): dug clay goes on its piles and is weighed off (see WeighingStation).
    Crafty.e("WeighingStation").place(-2695 - 70 / 2 - 30, 432 + 70 / 4 + 70 / 2, 280, 70);
    var dryingShelf = Crafty.e("DryingShelf").place(-2401, 405, 182, 43);
    var completedShelf = Crafty.e("CompletedShelf").place(-2180, 405, 183, 43);
    // Unfired pots dry fastest on the drying shelf, slower in the fox's pack and the owl's hands, not in the kiln.
    Crafty.e("PotDrier").dry(dryingShelf.inventory, [player.inventory, owl.inventory]);
    // Clicking any slot square puts the fox's drying pot on (if there is room); otherwise a filled slot gives its
    // pot up. Clicking the shelf elsewhere also puts one on.
    dryingShelf.bind("SlotClicked", function (index) {
        if (!player.touches(this)) {
            return;
        }
        var held = player.inventory.selectedItem();
        if (isDrying(held) && this.inventory.canAdd(held)) {
            this.useWith(player);
        } else if (this.inventory.items[index]) {
            this.takeAt(player, index);
        } else {
            this.useWith(player);
        }
    });
    [dryingShelf, completedShelf].forEach(function (shelf) {
        shelf.bind("MouseDown", function () {
            if (player.touches(this)) {
                this.useWith(player);
            }
        });
    });

    // House doors, one per area, each leading to its partner. Invisible trigger zones; the outside one is
    // exactly the door picture.
    var outsideDoor = Crafty.e("2D, DebugHitbox")
        .attr(DOOR_BOXES.outside);
    fitArt(Crafty.e("2D, DOM, doorOutside"), DOOR_ART_CONTENT, DOOR_BOXES.outside);
    var insideDoor = Crafty.e("2D, DOM, Color, DebugHitbox")
        .attr(DOOR_BOXES.inside)
        .color(INSIDE_DOOR_COLOR, 0);
    // Where each door leads: the spot in DOOR_DESTINATIONS for the area beyond it.
    outsideDoor.arrival = DOOR_DESTINATIONS.inside;
    insideDoor.arrival = DOOR_DESTINATIONS.outside;
    outsideDoor.line = "Into the workshop we go";
    insideDoor.line = "Back out into the fresh air";

    // A destination must be in bounds and clear of both doors, or the fox is stuck or walks straight back.
    [{name: "outside", spot: DOOR_DESTINATIONS.outside}, {name: "inside", spot: DOOR_DESTINATIONS.inside}].forEach(function (d) {
        if (player.feetBlocked(d.spot.x, d.spot.y)) {
            console.warn("DOOR_DESTINATIONS." + d.name + " is out of bounds: pick a clear spot");
        }
        [outsideDoor, insideDoor].forEach(function (door) {
            var inset = FOX_HITBOX_INSET;
            if (door.intersect(d.spot.x + inset, d.spot.y + inset, player.w - 2 * inset, player.h - 2 * inset)) {
                console.warn("DOOR_DESTINATIONS." + d.name + " touches a door: the fox would go straight back");
            }
        });
    });

    // Debug (DEBUG_HITBOXES): show where the fox lands, as a box the size of its sprite, labelled by area.
    if (DEBUG_HITBOXES) {
        [{name: "outside", spot: DOOR_DESTINATIONS.outside}, {name: "inside", spot: DOOR_DESTINATIONS.inside}].forEach(function (d) {
            Crafty.e("2D, DebugHitbox").attr({x: d.spot.x, y: d.spot.y, w: player.w, h: player.h}).debugBorder(DEBUG_DESTINATION_COLOR);
            Crafty.e("2D, DOM, Text, DebugOutlineLayer")
                .attr({x: d.spot.x + 4, y: d.spot.y + 4, w: player.w - 8, h: 20, z: 1001})
                .text("to " + d.name)
                .textColor(DEBUG_DESTINATION_COLOR)
                .textFont({size: "14px", weight: "bold"})
                .css({pointerEvents: "none"});
        });
    }

    // Walking into a door puts the fox at its configured destination (so no ping-pong).
    function useDoor() {
        if (!player.touches(this)) {
            return;
        }
        player.teleportTo(this.arrival.x, this.arrival.y);
        Crafty.trigger("DoorUsed");
        showStatus(this.line);
        // The sprite faces right unflipped, left when flipped on X.
        if (this.arrival.facing === "right") {
            player.unflip("X");
        } else if (this.arrival.facing === "left") {
            player.flip("X");
        }
    }
    outsideDoor.bind("EnterFrame", useDoor);
    insideDoor.bind("EnterFrame", useDoor);

    return {player: player, kiln: kiln, hud: hud, completedShelf: completedShelf};
}
