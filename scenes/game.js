//inside, door, gap, door, outside

Crafty.defineScene("Game", function() {
    Crafty.background("#EEE");
    audioController.playMusic(MUSIC_TRACK);

    // HUD
    Crafty.e("MuteButton").attr({x: 20, y: 20});
    Crafty.e("GameTimer").attr({x: GAME_SCREEN_WIDTH - 100, y: 20});
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

    // Clicking the owl the fox is touching takes his finished pot, if the fox's hands are free,
    // then hands him the selected backpack clay if he's idle. One click can do both.
    owl.bind("Click", function () {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
            return;
        }
        if (!gameState.heldItem) {
            var pot = this.takePot();
            if (pot) {
                gameState.heldItem = pot;
                Crafty.trigger("InventoryChanged");
            }
        }
        if (!this.isIdle()) {
            if (player.backpack.length > 0) {
                showStatus("The master is busy, come back when he's done");
            }
            return;
        }
        var clay = player.takeSelected();
        if (!clay) {
            showStatus("The master needs clay to make pots");
            return;
        }
        showStatus("Gave the master one kilo of " + clay.name + " clay");
        this.trigger("ClayDelivered", 1);
    });

    // The kiln, Outside. Its square covers where the fox stands at the kiln: fox positions (1605, 527) to (1800, 657).
    var kiln = Crafty.e("Kiln, Mouse")
        .attr({x: 1605, y: 527, w: 355, h: 232});

    // Clicking the kiln the fox is touching loads an unfired pot, or collects a fired one with empty hands.
    kiln.bind("Click", function () {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
            return;
        }
        if (gameState.heldItem) {
            if (this.loadPot(gameState.heldItem)) {
                gameState.heldItem = null;
                Crafty.trigger("InventoryChanged");
            }
            return;
        }
        var pot = this.takePot();
        if (pot) {
            gameState.heldItem = pot;
            Crafty.trigger("InventoryChanged");
        }
    });

    // Testing aid: SPACE (a tap on touch screens) drops whatever the fox holds; it just disappears.
    player.addComponent("Keyboard");
    player.bind("KeyDown", function (e) {
        if (e.key === Crafty.keys.SPACE && gameState.heldItem) {
            gameState.heldItem = null;
            Crafty.trigger("InventoryChanged");
        }
    });

    // Glazing station, Inside left of the door. Placeholder buckets, not clickable yet.
    Crafty.e("GlazeStation").station(INSIDE_X + 800, 780);

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
