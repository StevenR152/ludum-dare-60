//inside, door, gap, door, outside

Crafty.defineScene("Game", function() {
    Crafty.background("#EEE");
    audioController.playMusic(MUSIC_TRACK);

    // HUD (the music button, timer and inventory bar are built together once the holders exist, below)
    Crafty.e("PlayerNotification");
    Crafty.e("StatusMessage");

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

    // Clicking the owl the fox is touching takes his finished pot, if the fox can carry it,
    // then hands him the selected clay if he's idle. One click can do both.
    owl.bind("Click", function () {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
            return;
        }
        var tookPot = false;
        if (this.output.items.length > 0) {
            tookPot = transferItem(this.output, player.inventory);
            if (!tookPot) {
                showStatus("You can't carry the pot: your pack is full or holds clay");
            }
        }
        var clay = player.inventory.selectedItem();
        if (tookPot && clay.type !== "clay") {
            return;
        }
        if (!clay) {
            if (this.isIdle()) {
                showStatus("The master needs clay to make pots");
            }
            return;
        }
        if (transferItem(player.inventory, this.input)) {
            showStatus("Gave the master one kilo of " + clay.name + " clay");
        } else {
            showStatus(this.isIdle() ? "The master only wants clay" : "The master is busy, come back when he's done");
        }
    });

    // The kiln, Outside. Its square covers where the fox stands at the kiln: fox positions (1605, 527) to (1800, 657).
    var kiln = Crafty.e("Kiln, Mouse")
        .attr({x: 1605, y: 527, w: 355, h: 232});

    // One HUD entity owns the music button, timer and inventory bar: hud.enable(false) hides it all.
    Crafty.e("GameHud").build(player, owl, kiln);

    // Clicking the kiln the fox is touching loads the selected unfired pot, or collects a fired one.
    kiln.bind("Click", function () {
        if (!this.intersect(player.x, player.y, player.w, player.h)) {
            return;
        }
        if (transferItem(player.inventory, this.inventory)) {
            return;
        }
        if (this.state === "ready" && !transferItem(this.inventory, player.inventory)) {
            showStatus("You can't carry the pot: your pack is full or holds clay");
        }
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
