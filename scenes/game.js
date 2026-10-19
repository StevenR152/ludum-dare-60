//inside, door, gap, door, outside

Crafty.defineScene("Game", function() {
    Crafty.background("#EEE");

    // HUD (the music button, timer and inventory bar are built together once the holders exist, below)
    Crafty.e("PlayerNotification");
    Crafty.e("StatusMessage");
    Crafty.e("InventorySlot").attr({x: 20, y: 60});
    Crafty.e("OrderPanel").attr({x: GAME_SCREEN_WIDTH - 300, y: 60}).start();

    // Outside map, 5763x2458 drawn into OUTSIDE_MAP_BOX; z keeps it behind everything.
    Crafty.e("2D, DOM, backgroundOutside")
        .attr(OUTSIDE_MAP_BOX).attr({z: OUTSIDE_MAP_Z});


    // The fox starts on the ground, left of the middle of the map.
    var player = Crafty.e("Fox").attr({x: 512, y: 706});

    // Inside sits left of Outside. The gap is wider than the screen, so the camera never shows both.
    var INSIDE_X = -2000 - 1200;

    // House interior art at a quarter of its 8364x2246 source size, keeping its aspect ratio.
    Crafty.e("2D, DOM, backgroundInside")
        .attr({x: INSIDE_X, y: 0, w: 8364 / 4, h: 2246 / 4, z: -1});

    // The same art with only the foreground items the fox walks behind, drawn over him (below the HUD).
    Crafty.e("2D, DOM, overlayInside")
        .attr({x: INSIDE_X, y: 0, w: 8364 / 4, h: 2246 / 4, z: 50});


    // Debug aid for laying out the scene: log world coordinates of any click.
    player.logClickPosition = function (e) {
        console.log("location: x: " + Math.round(e.realX) + ", y: " + Math.round(e.realY));    }.bind(player);
    Crafty.s("Mouse").bind("MouseDown", player.logClickPosition);
    // The mouse system outlives the scene, so drop the handler with the player.
    player.bind("Remove", function () {
        Crafty.s("Mouse").unbind("MouseDown", player.logClickPosition);
    });

    // The master potter, inside the house. He keeps throwing pots while his hands are free.
    var owl = Crafty.e("2D, DOM, owl, Mouse, Potter")
        .attr({x: -1660, y: 362, w: 160, h: 152});

    // Clicking the owl the fox is touching takes his oldest finished pot, if the fox can carry it;
    // otherwise it hands him a pot to trim, or wedged clay and a model (see Potter.receiveFrom).
    owl.bind("MouseDown", function () {
        if (!player.touches(this)) {
            return;
        }
        if (!this.hasFinishedPot()) {
            showStatus(this.receiveFrom(player));
        } else if (!this.takePot(player)) {
            showStatus("You can't carry the pot: your pack is full");
        }
    });

    // The kiln, Outside. The torch sits on top of the fire in its picture.
    var kiln = Crafty.e("Kiln, Mouse")
        .attr(KILN_ART_BOX)
        .placeArt();

    // Ambient loops and sound effects, driven by game events (see GameSounds).
    Crafty.e("GameSounds").listen(player, kiln);

    // The torch lights the kiln. The fox stands on it, e.g. at (1526, 555), and clicks.
    var torch = Crafty.e("2D, DOM, Color, Mouse, DebugHitbox")
        .attr({x: 1526, y: 555, w: 40, h: 60})
        .color(TORCH_COLOR);
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
    Crafty.e("GameHud").build(player, owl, kiln);

    // Clicking the kiln the fox is touching loads the selected logs or pot (unfired at any dryness, or
    // bisque-fired for its glaze firing), or collects a fired pot.
    kiln.bind("MouseDown", function () {
        if (!player.touches(this)) {
            return;
        }
        var carried = player.inventory.selectedItem();
        if (carried && carried.type === "log") {
            var moved = false;
            while (transferItem(player.inventory, this.woodInventory)) {
                moved = true;
            }
            if (!moved) {
                showStatus("The kiln is full of wood");
            }
            return;
        }
        if (transferItem(player.inventory, this.inventory)) {
            return;
        }
        var held = player.inventory.selectedItem();
        if ((this.state === "empty" || this.state === "loaded") && held && held.type === "pot" && held.pot.cracked) {
            showStatus("This pot is cracked, it can't be fired");
        } else if (this.state === "empty" && held && held.state === "glazeCooled") {
            showStatus("This pot is finished, take it to the completed shelf");
        } else if (this.state === "ready" && !transferItem(this.inventory, player.inventory)) {
            showStatus("You can't carry the pot: your pack is full or holds clay");
        } else if (held && held.type === "pot") {
            if (this.state === "firing" || this.state === "cooling") {
                showStatus("The kiln is busy");
            } else {
                showStatus("The kiln is full");
            }
        }
    });

    // Glazing station, Inside left of the door: click a bucket to dip the selected pot.
    Crafty.e("GlazeStation").station([{x: -1445 + 35 + 50, y: 247 + 50}, {x: -1340 + 35 + 25, y: 277 + 40}], player);

    // Inside stations. The workbench is wedged on by holding and its models clicked (see
    // Workbench); the shelves are clicked while the fox touches them. The third completed pot ends the
    // game, after a pause to see it.
    Crafty.e("Workbench").place(-1850, 242, 260, 50);

    // Weighing station (the purple rectangle): dug clay goes on its piles and is weighed off (see WeighingStation).
    Crafty.e("WeighingStation").place(-2695 - 70 / 2 - 30, 432 + 70 / 4 + 70 / 2, 280, 70);
    var dryingShelf = Crafty.e("DryingShelf").place(-2401, 405, 182, 43);
    var completedShelf = Crafty.e("CompletedShelf").place(-2180, 405, 183, 43);
    // Unfired pots dry fastest on the drying shelf, slower in the fox's pack and the owl's hands, not in the kiln.
    Crafty.e("PotDrier").dry(dryingShelf.inventory, [player.inventory, owl.inventory]);
    // Clicking a pot on the drying shelf takes that pot; clicking the shelf elsewhere puts one on.
    dryingShelf.bind("SlotClicked", function (index) {
        if (player.touches(this)) {
            this.takeAt(player, index);
        }
    });
    [dryingShelf, completedShelf].forEach(function (shelf) {
        shelf.bind("MouseDown", function () {
            if (player.touches(this)) {
                this.useWith(player);
            }
        });
    });
    completedShelf.bind("OrdersComplete", function () {
        this.delay(function () { player.trigger("GameOver"); }, 1500, 0);
    });

    // Each clay node's dig zone is cut from its patch's art (see Clay.clay). The white patch is moved from
    // the forest to the bottom right, near the kiln (its middle ends up around 1329, 817).
    var clayOne = Crafty.e("Clay").clay(CLAY_TYPES.black);
    var clayTwo = Crafty.e("Clay").clay(CLAY_TYPES.red);
    var clayThree = Crafty.e("Clay").clay(CLAY_TYPES.white, {x: 860, y: 259});

    // House doors, one per area, each leading to its partner. Invisible trigger zones; the outside one is
    // exactly the door picture.
    var outsideDoor = Crafty.e("2D, DebugHitbox")
        .attr(DOOR_ART_BOX);
    fitArt(Crafty.e("2D, DOM, doorOutside"), DOOR_ART_CONTENT, DOOR_ART_BOX);
    var insideDoor = Crafty.e("2D, DOM, Color, DebugHitbox")
        .attr({x: -2626, y: 268, w: 54, h: 112})
        .color('#8B5A2B', 0);
    outsideDoor.partner = insideDoor;
    insideDoor.partner = outsideDoor;

    // Walking into a door puts the fox just below its partner, centred and clear of it (so no ping-pong).
    function useDoor() {
        if (!player.touches(this)) {
            return;
        }
        var door = this.partner;
        player.x = door.x + (door.w - player.w) / 2;
        player.y = door.y + door.h + 20;
    }
    outsideDoor.bind("EnterFrame", useDoor);
    insideDoor.bind("EnterFrame", useDoor);

    makeCameraTrackEntity(player, 0);
    TouchControls.follow(player);

    // Bound on an entity so the handler is removed with the scene.
    player.bind("GameOver", function () {
        track("game_complete", {seconds: gameState.seconds});
        Crafty.scene("End");
    });
});
