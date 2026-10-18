//inside, door, gap, door, outside

Crafty.defineScene("Game", function() {
    Crafty.background("#EEE");

    // HUD (the music button, timer and inventory bar are built together once the holders exist, below)
    Crafty.e("PlayerNotification");
    Crafty.e("StatusMessage");
    Crafty.e("InventorySlot").attr({x: 20, y: 60});
    Crafty.e("OrderPanel").attr({x: GAME_SCREEN_WIDTH - 300, y: 60}).start();

    // Outside map, drawn at half its 4000x2160 source size; z keeps it behind everything.
    Crafty.e("2D, DOM, backgroundOutside")
        .attr({x: 0, y: 0, w: 2000, h: 1080, z: -1});


    // The fox starts on the ground, bottom-middle of the map.
    var player = Crafty.e("Fox").attr({x: 920, y: 820});

    // Inside sits left of Outside. The gap is wider than the screen, so the camera never shows both.
    var INSIDE_X = -2000 - 1200;

    // Placeholder house interior until the inside art lands.
    Crafty.e("2D, DOM, Color")
        .attr({x: INSIDE_X, y: 0, w: 2000, h: 1080, z: -1})
        .color('#F5EDE3');

   

    // Debug aid for laying out the scene: log world coordinates of any click.
    player.logClickPosition = function (e) {
        console.log("Player at x: " + Math.round(this.x) + ", y: " + Math.round(this.y));
    }.bind(player);
    Crafty.s("Mouse").bind("MouseDown", player.logClickPosition);
    // The mouse system outlives the scene, so drop the handler with the player.
    player.bind("Remove", function () {
        Crafty.s("Mouse").unbind("MouseDown", player.logClickPosition);
    });

    // The master potter, inside the house. He keeps throwing pots while his hands are free.
    var owl = Crafty.e("2D, DOM, owl, Mouse, Potter")
        .attr({x: INSIDE_X + 1250, y: 820, w: 160, h: 152});

    // Clicking the owl the fox is touching takes his oldest finished pot, if the fox can carry it;
    // otherwise it hands him a pot to trim, or weighed clay and a model (see Potter.receiveFrom).
    owl.bind("Click", function () {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
            return;
        }
        if (!this.hasFinishedPot()) {
            showStatus(this.receiveFrom(player));
        } else if (!this.takePot(player)) {
            showStatus("You can't carry the pot: your pack is full");
        }
    });

    // The kiln, Outside. Its square stops short of the torch beside it (1850, 615).
    var kiln = Crafty.e("Kiln, Mouse")
        .attr({x: 1605, y: 527, w: 240, h: 232});

    // Ambient loops and sound effects, driven by game events (see GameSounds).
    Crafty.e("GameSounds").listen(player, kiln);

    // The torch lights the kiln. The fox stands on it, e.g. at (1850, 615), and clicks.
    var torch = Crafty.e("2D, DOM, Color, Mouse")
        .attr({x: 1850, y: 615, w: 40, h: 60})
        .color(TORCH_COLOR);
    torch.bind("Click", function () {
        if (this.intersect(player.x, player.y, player.w, player.h)) {
            kiln.light();
        }
    });

    // The forest, Outside left: hold on it to chop logs. Fox positions (5, 350) to (370, 555).
    Crafty.e("Forest").attr({x: 5, y: 350, w: 525, h: 307});

    // One HUD entity owns the music button, timer and inventory bar: hud.enable(false) hides it all.
    Crafty.e("GameHud").build(player, owl, kiln);

    // Clicking the kiln the fox is touching loads the selected logs or pot (unfired at any dryness, or
    // bisque-fired for its glaze firing), or collects a fired pot.
    kiln.bind("Click", function () {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
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
    Crafty.e("GlazeStation").station(INSIDE_X + 800, 780, player);

    // Inside stations. The workbench is wedged on by holding, its scales and models clicked (see
    // Workbench); the shelves are clicked while the fox touches them. The third completed pot ends the
    // game, after a pause to see it.
    Crafty.e("Workbench").place(INSIDE_X + 600, 560, 520, 200);
    var dryingShelf = Crafty.e("DryingShelf").place(INSIDE_X + 1500, 330, 280, 160);
    var completedShelf = Crafty.e("CompletedShelf").place(INSIDE_X + 1500, 700, 300, 160);
    // Unfired pots dry fastest on the drying shelf, slower in the fox's pack and the owl's hands, not in the kiln.
    Crafty.e("PotDrier").dry(dryingShelf.inventory, [player.inventory, owl.inventory]);
    // Clicking a pot on the drying shelf takes that pot; clicking the shelf elsewhere puts one on.
    dryingShelf.bind("SlotClicked", function (index) {
        if (this.intersect(player.x, player.y, player.w, player.h)) {
            this.takeAt(player, index);
        }
    });
    [dryingShelf, completedShelf].forEach(function (shelf) {
        shelf.bind("Click", function () {
            if (this.intersect(player.x, player.y, player.w, player.h)) {
                this.useWith(player);
            }
        });
    });
    completedShelf.bind("OrdersComplete", function () {
        this.delay(function () { player.trigger("GameOver"); }, 1500, 0);
    });

    var clayOne = Crafty.e("Clay")
        .attr({x: 195, y: 775, w: 80, h: 80})
        .clay(CLAY_TYPES.brown);

    var clayTwo = Crafty.e("Clay")
        .attr({x: 440, y: 640, w: 80, h: 80})
        .clay(CLAY_TYPES.red);

    var clayThree = Crafty.e("Clay")
        .attr({x: 865, y: 765, w: 80, h: 80})
        .clay(CLAY_TYPES.blue);

    // House doors, one per area, each leading to its partner. Taller and thinner than the clay squares.
    var outsideDoor = Crafty.e("2D, DOM, Color, Mouse")
        .attr({x: 1120, y: 527, w: 60, h: 110})
        .color('#8B5A2B');
    var insideDoor = Crafty.e("2D, DOM, Color, Mouse")
        .attr({x: INSIDE_X + 1120, y: 527, w: 60, h: 110})
        .color('#8B5A2B');
    outsideDoor.partner = insideDoor;
    insideDoor.partner = outsideDoor;

    // Clicking a door the fox is standing at puts the fox just below its partner, centred and clear of it.
    function useDoor() {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
            return;
        }
        var door = this.partner;
        player.x = door.x + (door.w - player.w) / 2;
        player.y = door.y + door.h + 20;
    }
    outsideDoor.bind("Click", useDoor);
    insideDoor.bind("Click", useDoor);

    makeCameraTrackEntity(player, 0);
    TouchControls.follow(player);

    // Bound on an entity so the handler is removed with the scene.
    player.bind("GameOver", function () {
        track("game_complete", {seconds: gameState.seconds});
        Crafty.scene("End");
    });
});
