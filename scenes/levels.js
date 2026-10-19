// The levels, played two ways by the one "Game" scene, built from buildWorld (scenes/game.js) with only what the
// level needs. Delivering all of a level's fixed orders (no random ones, no deadlines) shows "Level N complete!"
// for a moment, then:
//   "progressive" (Play):  the scene is rebuilt for the next level where the fox stands, with new stations (the
//                          door, the house, the glaze station and more clay appear); the last one goes to End.
//                          The time keeps counting, but the pack, kiln and ground items start empty.
//   "single" (Levels):     LevelComplete shows the time and unlocks the next level; each level starts alone.
// Restart rebuilds the current level in the same mode. Progress (the highest level completed) is kept in
// localStorage, which can be missing or blocked, so every access is guarded; either mode records it.
// UNLOCK_ALL_LEVELS (constants.js) opens every level on the level select regardless.
//   Crafty.scene("Game")                                  // Play: level 1 onwards
//   Crafty.scene("Game", {stage: 1, mode: "single"})      // level 2 alone
//
// Per level: name, a one-line description and checklist steps for the Goal panel (each ticks the first time its
// game event happens, see step()), the fixed orders as [shape, clay key, glaze], and `world`, the buildWorld config. A level's world only holds what its
// goal needs.
var STAGE_PAUSE_MS = 1500;

// A Goal step: ticks the first time the global Crafty event `on` fires (and `when(payload)`, if given, is true).
function step(text, on, when) {
    return {text: text, on: on, when: when};
}

// Ticks when a pot reaches `state` ("PotAdvanced", see Pottery.advance).
function potReaches(text, state) {
    return step(text, "PotAdvanced", function (e) { return e.to === state; });
}

// Ticks when a pot comes out of a firing uncracked: a cracked pot doesn't count as fired.
function potFired(text, state) {
    return step(text, "PotAdvanced", function (e) { return e.to === state && !e.pot.pot.cracked; });
}

var LEVELS = [
    {
        name: "Kiln Creations",
        description: "Fire three pots twice each, the right way, to fill the orders.",
        steps: [step("Chop logs at the forest", "LogChopped"), step("Set the fire level with logs", "KilnLit"),
            potFired("Fire the pots (bisque)", "cooled"), potFired("Fire them again", "glazeCooled")],
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
        steps: [step("Dig 1 kilo of black clay", "ClayDug"), potReaches("Weigh off 200 g", "weighed"),
            potReaches("Wedge it", "wedged"), step("Give clay and the Cup model to the owl", "PotterWorking"),
            step("Dry the pot", "PotDry"), potFired("Fire it (black clay: 1 log)", "cooled"),
            potFired("Fire it again", "glazeCooled"), step("Put it on the completed shelf", "OrderDelivered")],
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
        steps: [step("Dig, weigh, wedge and give it to the owl", "PotterWorking"), step("Dry the pot", "PotDry"),
            potFired("Bisque fire (1 log black, 2 red, 3 white)", "cooled"), step("Dip it in a glaze", "PotGlazed"),
            potFired("Glaze fire", "glazeCooled"), step("Put it on the completed shelf", "OrderDelivered")],
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
// the step checkboxes, which tick as the player does each step. The text entity listens for the steps' events, so
// its bindings go with the scene.
function showGoalPanel(level) {
    var head = ["<b>Goal</b>", level.description];
    level.card.forEach(function (row) {
        head.push("<span style='display:inline-block;width:12px;height:12px;border:1px solid #222;background:" +
            row.color + "'></span> " + row.text);
    });
    var h = 16 + (head.length + level.steps.length) * 22;
    Crafty.e("2D, HUD, Color")
        .attr({x: 10, y: 225, w: 430, h: h, z: 999})
        .color("rgba(255, 255, 255, 0.8)")
        .css({borderRadius: "8px"});
    var text = Crafty.e("2D, HUD, Text")
        .attr({x: 20, y: 233, w: 410, h: h - 8, z: 1000})
        .textFont({size: "15px"}).textColor("#222").unselectable()
        .css({lineHeight: "22px"});
    var ticked = level.steps.map(function () { return false; });
    var draw = function () {
        var lines = head.concat(level.steps.map(function (s, i) { return (ticked[i] ? "☑ " : "☐ ") + s.text; }));
        text.text(lines.join("<br>"));
    };
    level.steps.forEach(function (s, i) {
        text.bind(s.on, function (payload) {
            if (!ticked[i] && (!s.when || s.when(payload))) {
                ticked[i] = true;
                draw();
            }
        });
    });
    draw();
}

// Restart and Menu beside the inventory panel. Restart rebuilds this level in the same mode; Menu leaves for the
// level select (single) or Start (progressive). A cracked pot makes the player start over, so Restart pulses.
function showLevelButtons(index, mode) {
    var restart = Crafty.e("HudButton, Delay")
        .label("Restart")
        .attr({x: 450, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene("Game", {stage: index, mode: mode, seconds: gameState.seconds}); });
    Crafty.e("HudButton")
        .label("Menu")
        .attr({x: 560, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene(mode === "single" ? "LevelSelect" : "Start"); });
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

// options: {stage: index into LEVELS (default 0), mode: "progressive" (default) or "single", seconds: time already
// played, at: {x, y} where the fox is}.
Crafty.defineScene("Game", function(options) {
    options = options || {};
    var index = options.stage || 0;
    var mode = options.mode || "progressive";
    var level = LEVELS[index];
    resetGameState();
    gameState.seconds = options.seconds || 0;
    var orders = level.orders.map(function (spec) { return fixedOrder(spec[0], spec[1], spec[2]); });
    var world = buildWorld(Object.assign({}, level.world, {orders: orders, start: options.at}));
    showGoalPanel(level);
    showLevelButtons(index, mode);

    // Done once every order is delivered; a pause to see it, then on to what the mode does next.
    var finished = false;
    world.player.bind("OrderDelivered", function () {
        if (finished || !gameState.orders.every(function (order) { return order.delivered; })) {
            return;
        }
        finished = true;
        markLevelDone(index);
        track("level_complete", {level: index + 1, mode: mode, seconds: gameState.seconds});
        showStatus("Level " + (index + 1) + " complete!");
        var player = this;
        Crafty.e("Delay").delay(function () {
            if (mode === "single") {
                Crafty.scene("LevelComplete", index);
            } else if (index < LEVELS.length - 1) {
                Crafty.scene("Game", {stage: index + 1, seconds: gameState.seconds, at: {x: player.x, y: player.y}});
            } else {
                Crafty.scene("End");
            }
        }, STAGE_PAUSE_MS, 0);
    });
});
