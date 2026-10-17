//inside, door, gap, door, outside

Crafty.defineScene("Game", function() {
    Crafty.background("#EEE");
    audioController.playMusic(MUSIC_TRACK);

    // HUD
    Crafty.e("MuteButton").attr({x: 20, y: 20});
    Crafty.e("GameTimer").attr({x: GAME_SCREEN_WIDTH - 100, y: 20});
    Crafty.e("PlayerNotification");

    // Placeholder game: move the red square to the green goal.
    var player = Crafty.e("2D, DOM, Color, Fourway, Collision")
        .attr({x: 100, y: 100, w: 50, h: 50})
        .color('#F00')
        .fourway(250);

    // Static landmark so movement is visible while the camera follows the player.
    var clayOne = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 350, y: 200, w: 80, h: 80})
        .color('#311909');
    
    var clayTwo = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 450, y: 150, w: 80, h: 80})
        .color('#650b0b');
        
    var clayThree = Crafty.e("2D, DOM, Color, TimeClickable")
        .attr({x: 200, y: 200, w: 80, h: 80})
        .color('#15a0a0');

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
