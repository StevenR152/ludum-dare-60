// Level 1, all Outside: a pot is already bisque-fired and waiting in the kiln. Chop wood, load it,
// light the kiln with the torch, take the pot out when it has cooled and put it on the completed shelf.

// A bone dry, correctly bisque-fired (cooled) pot, so the kiln's next firing is its glaze firing.
function makeFiredPot() {
    var clay = CLAY_TYPES.brown;
    var pottery = new Pottery(clay);
    pottery.clay.weight = ORDER_CLAY_GRAMS.Cup.Small;
    pottery.advance("wedged");
    pottery.advance("weighed");
    pottery.advance("thrown", {shape: "Cup", size: "Small"});
    pottery.pot.dryness = 1;
    pottery.pot.trimmed = true;
    pottery.setFireLevel(clay.fireLevel);
    ["firing", "cooling", "cooled"].forEach(function (state) { pottery.advance(state); });
    return pottery;
}

Crafty.defineScene("Level1", function() {
    Crafty.background("#EEE");
    audioController.playMusic(MUSIC_TRACK);

    Crafty.e("PlayerNotification");
    Crafty.e("StatusMessage");
    Crafty.e("InventorySlot").attr({x: 20, y: 60});

    Crafty.e("2D, DOM, backgroundOutside")
        .attr({x: 0, y: 0, w: 2000, h: 1080, z: -1});

    var player = Crafty.e("Fox").attr({x: 920, y: 820});

    // The kiln already holds the pot, waiting to be lit. Its square stops short of the torch (1850, 615).
    var kiln = Crafty.e("Kiln, Mouse")
        .attr({x: 1605, y: 527, w: 240, h: 232});
    kiln.inventory.items.push(makeFiredPot());
    kiln.inventory.changed();

    var torch = Crafty.e("2D, DOM, Color, Mouse")
        .attr({x: 1850, y: 615, w: 40, h: 60})
        .color(TORCH_COLOR);
    torch.bind("Click", function () {
        if (this.intersect(player.x, player.y, player.w, player.h)) {
            kiln.light();
        }
    });

    // Hold on the forest to chop logs.
    Crafty.e("Forest").attr({x: 5, y: 350, w: 525, h: 307});

    Crafty.e("GameHud").build(player, null, kiln);

    // Clicking the kiln the fox is touching loads the selected logs, or collects the fired pot.
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
        } else if (this.state === "ready" && !transferItem(this.inventory, player.inventory)) {
            showStatus("You can't carry the pot: your pack is full");
        } else if (this.state === "firing" || this.state === "cooling") {
            showStatus("The kiln is busy");
        }
    });

    // The final station: one pot completes the level.
    var completedShelf = Crafty.e("CompletedShelf").goal(1).place(1150, 800, 300, 160);
    completedShelf.bind("Click", function () {
        if (this.intersect(player.x, player.y, player.w, player.h)) {
            this.useWith(player);
        }
    });
    completedShelf.bind("OrdersComplete", function () {
        this.delay(function () { player.trigger("LevelComplete"); }, 1500, 0);
    });

    makeCameraTrackEntity(player, 0);
    TouchControls.follow(player);

    player.bind("LevelComplete", function () {
        track("level_complete", {level: 1, seconds: gameState.seconds});
        Crafty.scene("Level2");
    });
});
