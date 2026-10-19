// The missions: Level1 to Level3 are scenes made from one world builder (buildWorld, scenes/game.js) with
// parts switched off and fixed orders (no random ones, no deadlines). Each one teaches one new idea.
// A level ends when all its orders are delivered: LevelComplete shows the time and unlocks the next one.
// Progress (the highest completed level) is kept in localStorage, which can be missing or blocked, so every
// access is guarded. UNLOCK_ALL_LEVELS (constants.js) opens every level regardless.
//   levelUnlocked(1)        // is level 2 open?
//   Crafty.scene("Level1")  // restart / start level 1
//
// Per level: scene name, name, a one-line description and checklist steps for the Goal panel (static, never
// ticked), pauseMs before LevelComplete, the fixed orders as [shape, clay key, glaze], and `world`, the buildWorld
// config. A level's world only holds what its goal needs.
var LEVELS = [
    {
        scene: "Level1",
        name: "Kiln Creations",
        description: "Fire three pots twice each, the right way, to fill the orders.",
        steps: ["Chop logs at the forest", "Set the fire level with logs", "Fire the pots (bisque)", "Fire them again"],
        card: [
            {color: CLAY_TYPES.black.color, text: "Black clay: low fire, 1 log"},
            {color: CLAY_TYPES.red.color, text: "Red clay: mid fire, 2 logs"},
            {color: CLAY_TYPES.white.color, text: "White clay: high fire, 3 logs"}
        ],
        pauseMs: 0,
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
        scene: "Level2",
        name: "Pottery Craft",
        description: "Make one cup from digging the clay to the completed shelf.",
        steps: ["Dig 1 kilo of black clay", "Weigh off 200 g", "Wedge it", "Give clay and the Cup model to the owl",
            "Dry the pot", "Fire it (1 log)", "Fire it again", "Put it on the completed shelf"],
        card: [],
        pauseMs: 1500,
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
            kilnHint: false
        }
    },
    {
        scene: "Level3",
        name: "First Orders",
        description: "Four cups, each with one glaze. A pot takes only one dip.",
        steps: ["Dig, weigh, wedge and give it to the owl", "Dry the pot", "Bisque fire (logs set the level)",
            "Dip it in a glaze", "Glaze fire", "Put it on the completed shelf"],
        card: [],
        pauseMs: 1500,
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
            kilnHint: false
        }
    }
];

var LEVELS_DONE_KEY = "kilnLevelsDone";

// How many levels have been completed in order (0 if none, or if storage is unavailable).
function levelsDone() {
    try {
        return parseInt(window.localStorage.getItem(LEVELS_DONE_KEY), 10) || 0;
    } catch (e) {
        return 0;
    }
}

function markLevelDone(index) {
    try {
        window.localStorage.setItem(LEVELS_DONE_KEY, String(Math.max(levelsDone(), index + 1)));
    } catch (e) {
        console.warn("Progress can't be saved: " + e);
    }
}

// Level 1 (index 0) is always open; each other one opens when the one before it is completed.
function levelUnlocked(index) {
    return UNLOCK_ALL_LEVELS || index <= levelsDone();
}

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

// Restart and Menu beside the inventory panel. A cracked pot makes the player start over, so Restart pulses.
function showLevelButtons(level) {
    var restart = Crafty.e("HudButton, Delay")
        .label("Restart")
        .attr({x: 450, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene(level.scene); });
    Crafty.e("HudButton")
        .label("Menu")
        .attr({x: 560, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene("LevelSelect"); });
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

LEVELS.forEach(function (level, index) {
    Crafty.defineScene(level.scene, function () {
        resetGameState();
        var orders = level.orders.map(function (spec) { return fixedOrder(spec[0], spec[1], spec[2]); });
        var world = buildWorld(Object.assign({}, level.world, {orders: orders}));
        showGoalPanel(level);
        showLevelButtons(level);

        // Done once every order is delivered; a pause to see it first, unless the level has none.
        var finished = false;
        world.player.bind("OrderDelivered", function () {
            if (finished || !gameState.orders.every(function (order) { return order.delivered; })) {
                return;
            }
            finished = true;
            markLevelDone(index);
            track("level_complete", {level: index + 1, seconds: gameState.seconds});
            var done = function () { Crafty.scene("LevelComplete", index); };
            if (level.pauseMs > 0) {
                Crafty.e("Delay").delay(done, level.pauseMs, 0);
            } else {
                done();
            }
        });
    });
});
