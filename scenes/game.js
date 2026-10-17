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

    // Placeholder game: move the fox to the green goal. Starts on the ground, bottom-middle of the map.
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

    // Static for now; will become the master of the pottery wheel (beside it on the map).
    Crafty.e("2D, DOM, owl")
        .attr({x: 1250, y: 820, w: 160, h: 152});

    var clayOne = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 195, y: 775, w: 80, h: 80})
        .color('#311909');
    
    var clayTwo = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 440, y: 640, w: 80, h: 80})
        .color('#650b0b');
        
    var clayThree = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 865, y: 765, w: 80, h: 80})
        .color('#15a0a0');

    // House door: taller and thinner than the 80x80 clay squares.
    Crafty.e("2D, DOM, Color")
        .attr({x: 1120, y: 527, w: 60, h: 110})
        .color('#8B5A2B');

    Crafty.e("2D, DOM, Color, Goal")
        .attr({x: 1500, y: 900, w: 60, h: 60})
        .color('#0A0');

    player.onHit("Goal", function () {
        Crafty.trigger("GameOver");
    });

    makeCameraTrackEntity(player, 0);
    Crafty.trigger("InstructionText", "Arrow keys to move");

    // Bound on an entity so the handler is removed with the scene.
    player.bind("GameOver", function () {
        track("game_complete", {seconds: gameState.seconds});
        Crafty.scene("End");
    });
});
