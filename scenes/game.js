//inside, door, gap, door, outside

Crafty.defineScene("Game", function() {
    Crafty.background("#EEE");
    audioController.playMusic(MUSIC_TRACK);

    // HUD
    Crafty.e("MuteButton").attr({x: 20, y: 20});
    Crafty.e("GameTimer").attr({x: GAME_SCREEN_WIDTH - 100, y: 20});
    Crafty.e("PlayerNotification");

    // Outside map, drawn at half its 4000x2160 source size; z keeps it behind everything.
    Crafty.e("2D, DOM, backgroundOutside")
        .attr({x: 0, y: 0, w: 2000, h: 1080, z: -1});

    // Inside sits left of Outside. The gap is wider than the screen, so the camera never shows both.
    var INSIDE_X = -2000 - 1200;

    // Placeholder house interior until the inside art lands.
    Crafty.e("2D, DOM, Color")
        .attr({x: INSIDE_X, y: 0, w: 2000, h: 1080, z: -1})
        .color('#F5EDE3');

    // The fox starts on the ground, bottom-middle of the map.
    var player = Crafty.e("2D, DOM, fox, Fourway, Collision")
        .attr({x: 920, y: 820, w: 160, h: 102})
        .fourway(250);

    // Debug aid for laying out the scene: log world coordinates of any click.
    player.logClickPosition = function (e) {
        console.log("Player at x: " + Math.round(this.x) + ", y: " + Math.round(this.y));
    }.bind(player);
    Crafty.s("Mouse").bind("MouseDown", player.logClickPosition);
    // The mouse system outlives the scene, so drop the handler with the player.
    player.bind("Remove", function () {
        Crafty.s("Mouse").unbind("MouseDown", player.logClickPosition);
    });

    // Static for now; will become the master of the pottery wheel, which is inside the house.
    Crafty.e("2D, DOM, owl")
        .attr({x: INSIDE_X + 1250, y: 820, w: 160, h: 152});

    var clayOne = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 195, y: 775, w: 80, h: 80})
        .color('#311909');
    
    var clayTwo = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 440, y: 640, w: 80, h: 80})
        .color('#650b0b');
        
    var clayThree = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 865, y: 765, w: 80, h: 80})
        .color('#15a0a0');

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
