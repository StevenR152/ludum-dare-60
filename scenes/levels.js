// The stages of the one game: the "Game" scene is built from buildWorld (scenes/game.js) for the current stage, with
// only the stations that stage needs. Delivering all of a stage's fixed orders (no random ones, no deadlines)
// shows "Level N complete!", then the scene is rebuilt for the next stage with new stations (the door, the house,
// the glaze station and more clay appear); the last stage goes to End. The fox keeps its place and the time keeps
// counting, but the pack, kiln and ground items start empty. Restart rebuilds the current stage.
//   Crafty.scene("Game")                      // a new game: stage 1
//   Crafty.scene("Game", {stage: 1})          // stage 2
//
// Per stage: name, a one-line description and checklist steps for the Goal panel (static, never ticked), the
// fixed orders as [shape, clay key, glaze], and `world`, the buildWorld config. A stage's world only holds what its
// goal needs.
var STAGE_PAUSE_MS = 1500;

var LEVELS = [
    {
        name: "Kiln Creations",
        description: "Fire three pots twice each, the right way, to fill the orders.",
        steps: ["Chop logs at the forest", "Set the fire level with logs", "Fire the pots (bisque)", "Fire them again"],
        card: [
            {color: CLAY_TYPES.black.color, text: "Black clay: low fire, 1 log"},
            {color: CLAY_TYPES.red.color, text: "Red clay: mid fire, 2 logs"},
            {color: CLAY_TYPES.white.color, text: "White clay: high fire, 3 logs"}
        ],
        orders: [["Cup", "white", []], ["Bowl", "red", []], ["Vase", "black", []]],
        world: {
            inside: false,
            glaze: false,
            clays: [],
            models: [],
            maxGlazeDips: MAX_GLAZE_DIPS,
            potsBreakOnGround: false,
            prePlaced: [
                {clay: "white", shape: "Cup", x: 1440, y: 740},
                {clay: "red", shape: "Bowl", x: 1520, y: 740},
                {clay: "black", shape: "Vase", x: 1600, y: 740}
            ],
            kilnDelivers: true,
            kilnHint: true
        }
    },
    {
        name: "Pottery Craft",
        description: "Make one cup from digging the clay to the completed shelf.",
        steps: ["Dig 1 kilo of black clay", "Weigh off 200 g", "Wedge it", "Give clay and the Cup model to the owl",
            "Dry the pot", "Fire it (black clay: 1 log)", "Fire it again", "Put it on the completed shelf"],
        card: [],
        orders: [["Cup", "black", []]],
        world: {
            inside: true,
            glaze: false,
            clays: ["black"],
            models: ["Cup"],
            maxGlazeDips: MAX_GLAZE_DIPS,
            potsBreakOnGround: false,
            prePlaced: [],
            kilnDelivers: false,
            kilnHint: true
        }
    },
    {
        name: "First Orders",
        description: "Four cups, each with one glaze. A pot takes only one dip.",
        steps: ["Dig, weigh, wedge and give it to the owl", "Dry the pot", "Bisque fire (1 log black, 2 red, 3 white)",
            "Dip it in a glaze", "Glaze fire", "Put it on the completed shelf"],
        card: [],
        orders: [["Cup", "white", ["Glaze A"]], ["Cup", "red", ["Glaze B"]], ["Cup", "black", ["Glaze B"]],
            ["Cup", "red", ["Glaze A"]]],
        world: {
            inside: true,
            glaze: true,
            clays: ["black", "red", "white"],
            models: ["Cup"],
            maxGlazeDips: 1,
            potsBreakOnGround: false,
            prePlaced: [],
            kilnDelivers: false,
            kilnHint: true
        }
    }
];

// The Goal box (HUD, under the inventory panel): title, description, the level's fire card if it has one, and
// the unticked step checkboxes.
function showGoalPanel(level) {
    var lines = ["<b>Goal</b>", level.description];
    level.card.forEach(function (row) {
        lines.push("<span style='display:inline-block;width:12px;height:12px;border:1px solid #222;background:" +
            row.color + "'></span> " + row.text);
    });
    level.steps.forEach(function (step) { lines.push("☐ " + step); });
    var h = 16 + lines.length * 22;
    Crafty.e("2D, HUD, Color")
        .attr({x: 10, y: 225, w: 430, h: h, z: 999})
        .color("rgba(255, 255, 255, 0.8)")
        .css({borderRadius: "8px"});
    Crafty.e("2D, HUD, Text")
        .attr({x: 20, y: 233, w: 410, h: h - 8, z: 1000})
        .text(lines.join("<br>"))
        .textFont({size: "15px"}).textColor("#222").unselectable()
        .css({lineHeight: "22px"});
}

// Restart beside the inventory panel rebuilds this stage. A cracked pot makes the player start over, so it pulses.
function showRestartButton(stage) {
    var restart = Crafty.e("HudButton, Delay")
        .label("Restart")
        .attr({x: 450, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene("Game", {stage: stage, seconds: gameState.seconds}); });
    restart.bind("PotCracked", function () {
        showStatus("Cracked: restart the level");
        var alarm = false;
        this.cancelDelay(this.pulse);
        this.delay(this.pulse = function () {
            alarm = !alarm;
            this.css({backgroundColor: alarm ? "#C0392B" : "#444"});
        }, 400, -1);
    });
}

// options: {stage: index into LEVELS (default 0), seconds: time already played, at: {x, y} where the fox is}.
Crafty.defineScene("Game", function(options) {
    options = options || {};
    var index = options.stage || 0;
    var level = LEVELS[index];
    resetGameState();
    gameState.seconds = options.seconds || 0;
    var orders = level.orders.map(function (spec) { return fixedOrder(spec[0], spec[1], spec[2]); });
    var world = buildWorld(Object.assign({}, level.world, {orders: orders, start: options.at}));
    showGoalPanel(level);
    showRestartButton(index);

    // Done once every order is delivered; a pause to see it, then the next stage where the fox stands, or End.
    var finished = false;
    world.player.bind("OrderDelivered", function () {
        if (finished || !gameState.orders.every(function (order) { return order.delivered; })) {
            return;
        }
        finished = true;
        track("level_complete", {level: index + 1, seconds: gameState.seconds});
        showStatus("Level " + (index + 1) + " complete!");
        var player = this;
        Crafty.e("Delay").delay(function () {
            if (index < LEVELS.length - 1) {
                Crafty.scene("Game", {stage: index + 1, seconds: gameState.seconds, at: {x: player.x, y: player.y}});
            } else {
                Crafty.scene("End");
            }
        }, STAGE_PAUSE_MS, 0);
    });
});
