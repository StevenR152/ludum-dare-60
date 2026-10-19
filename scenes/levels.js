// The levels, each played alone by the one "Game" scene, built from buildWorld (scenes/game.js) with only what the
// level needs. Delivering all of a level's fixed orders (no random ones, no deadlines) shows "Level N complete!"
// for a moment, then LevelComplete shows the time and unlocks the next level.
// Restart rebuilds the current level with the timer back at 0. Progress (the highest level completed) is kept in
// localStorage, which can be missing or blocked, so every access is guarded.
// UNLOCK_ALL_LEVELS (constants.js) opens every level on the level select regardless.
//   Crafty.scene("Game")                                  // level 1
//   Crafty.scene("Game", {stage: 1})                      // level 2
//   Crafty.scene("Game", {mode: "sandbox"})               // the dev sandbox (SANDBOX_LEVEL below)
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
        name: "The First Firing",
        description: "Fire three pots twice each, the right way, to fill the orders.",
        story: "Morning light spills through the cabin window. The last apprentice helped Master Owl create a cup, " +
            "a bowl and a vase before leaving, but none has been fired. Help the Master fill these three orders.",
        tip: "\u201cFire it twice, apprentice. The first fire hardens the clay. The second melts it together into " +
            "something strong enough to last. Each clay has its own temper:\u201d",
        finish: "\u201cWell fired! Three orders ready, and the customers will be pleased.\u201d",
        steps: [step("Chop logs in the forest", "LogChopped"), step("Build the fire to the right heat", "KilnLit"),
            potFired("Fire the pots once to harden them", "cooled"), potFired("Fire them again", "glazeCooled")],
        card: [
            {color: CLAY_TYPES.black.color, text: "Black clay: a gentle fire, 1 log"},
            {color: CLAY_TYPES.red.color, text: "Red clay: a steady fire, 2 logs"},
            {color: CLAY_TYPES.white.color, text: "White clay: a roaring fire, 3 logs"}
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
        name: "A Cup for Barnaby",
        description: "Make one cup from digging the clay to the completed shelf.",
        story: "Master Owl is grateful for your help with the first three pieces. Now Barnaby Badger has asked for " +
            "a cup, because he's tired of drinking his tea out of his boot. Make it from scratch, starting with the clay.",
        tip: "\u201cTake it one careful step at a time, apprentice. I'll tell you why as we go.\u201d",
        finish: "\u201cBarnaby will never drink from a boot again. Well made, apprentice.\u201d",
        // The Master explains a step the first time the fox does it (hooting as he speaks): see showMasterTip.
        masterTips: [
            {on: "PotAdvanced", when: function (e) { return e.to === "weighed"; },
                text: "Weighed true. A cup this size needs 200 grams of clay, no more and no less."},
            {on: "PotAdvanced", when: function (e) { return e.to === "wedged"; },
                text: "Pressing out the air. Bubbles in clay can burst in the kiln."},
            // Said when a pot is put on the drying shelf.
            {on: "ItemMoved", text: "Resting in the dry air. Wet clay cracks in a hot kiln, so it must dry slowly.",
                when: function (move) {
                    var shelf = Crafty("DryingShelf").get(0);
                    return move.item.type === "pot" && shelf && move.to === shelf.inventory;
                }}
        ],
        steps: [step("Dig 1 kilo of black clay", "ClayDug"), step("Weigh off 200 g", "PotAdvanced", function (e) { return e.to === "weighed" && e.pot.clay.weight === 200; }),
            potReaches("Wedge it", "wedged"), step("Give clay and the Cup model to the owl", "PotterWorking"),
            step("Dry the pot", "PotDry"), potFired("First firing: harden the pot (black clay: 1 log)", "cooled"),
            potFired("Second firing: make it strong", "glazeCooled"),
            step("Put the cup on the completed shelf for Barnaby", "OrderDelivered")],
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

// The dev sandbox (DEV_MODE, Start menu): the whole game at once, played as the "sandbox" mode of the Game scene. It is
// not in LEVELS, so it never appears on the level select, never unlocks anything and never ends. Orders are null: the
// random timed customers of the full game, over every shape, clay and glaze.
//   Crafty.scene("Game", {mode: "sandbox"})
var SANDBOX_LEVEL = {
    name: "Sandbox",
    orders: null,
    world: {
        inside: true,
        glaze: true,
        clays: Object.keys(CLAY_TYPES),
        models: ORDER_SHAPES,
        maxGlazeDips: MAX_GLAZE_DIPS,
        potsBreakOnGround: true,
        prePlaced: [],
        // One pot per stage on a table under the kiln, for testing.
        testTable: [
            {clay: "black", shape: "Bowl", stage: "wet"},
            {clay: "red", shape: "Cup", stage: "boneDry"},
            {clay: "white", shape: "Vase", stage: "cooled"},
            {clay: "black", shape: "Cup", stage: "glazed"},
            {clay: "red", shape: "Bowl", stage: "glazeCooled"}
        ],
        testLogs: 5,
        kilnDelivers: false,
        kilnHint: true
    }
};

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
    // A level with a story shows it (and the Master's tip) in place of the one-line description; the long lines wrap.
    var head = level.story ? ["<b>" + level.name + "</b>", level.story, "<i>" + level.tip + "</i>"] :
        ["<b>Goal</b>", level.description];
    var wrapped = head.reduce(function (n, line) { return n + Math.ceil(line.length / 55); }, 0);
    level.card.forEach(function (row) {
        head.push("<span style='display:inline-block;width:12px;height:12px;border:1px solid #222;background:" +
            row.color + "'></span> " + row.text);
    });
    var h = 16 + (wrapped + level.card.length + level.steps.length) * 22;
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

// The Master's tip above the fox, with his hoot (the "owlSpeak" sound). It waits MASTER_TIP_DELAY_MS so the action's
// own status line can be read first, then stays up MASTER_TIP_EXTRA_MS longer than a normal status line.
var MASTER_TIP_DELAY_MS = 2000;
var MASTER_TIP_EXTRA_MS = 3000;
function showMasterTip(text) {
    Crafty.e("Delay").delay(function () {
        audioController.playSfx("owlSpeak");
        console.log(text);
        Crafty.trigger("StatusText", {text: text, extraMs: MASTER_TIP_EXTRA_MS});
    }, MASTER_TIP_DELAY_MS, 0);
}

// Restart and Menu beside the inventory panel. Restart rebuilds this level; Menu leaves for the level select (the
// sandbox, which isn't on it, goes to Start). A cracked pot makes the player start over, so Restart pulses.
function showLevelButtons(index, mode) {
    var restart = Crafty.e("HudButton, Delay")
        .label("Restart")
        .attr({x: 450, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene("Game", {stage: index, mode: mode}); });
    Crafty.e("HudButton")
        .label("Menu")
        .attr({x: 560, y: 10, w: 100, h: 36})
        .css({lineHeight: "36px"})
        .onClick(function () { Crafty.scene(mode === "sandbox" ? "Start" : "LevelSelect"); });
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

// options: {stage: index into LEVELS (default 0), mode: "single" (default) or "sandbox" (which plays SANDBOX_LEVEL
// and ignores stage)}.
Crafty.defineScene("Game", function(options) {
    options = options || {};
    var index = options.stage || 0;
    var mode = options.mode || "single";
    var level = mode === "sandbox" ? SANDBOX_LEVEL : LEVELS[index];
    resetGameState();
    var orders = level.orders && level.orders.map(function (spec) { return fixedOrder(spec[0], spec[1], spec[2]); });
    var world = buildWorld(Object.assign({}, level.world, {orders: orders}));
    if (mode !== "sandbox") {
        showGoalPanel(level);
    }
    showLevelButtons(index, mode);
    // Each of the level's Master tips is said once, the first time its event happens.
    (level.masterTips || []).forEach(function (tip) {
        var said = false;
        world.player.bind(tip.on, function (payload) {
            if (!said && (!tip.when || tip.when(payload))) {
                said = true;
                showMasterTip(tip.text);
            }
        });
    });

    // The sandbox has no end.
    if (mode === "sandbox") {
        return;
    }

    // Done once every order is delivered; a pause to see it, then the level complete screen.
    var finished = false;
    world.player.bind("OrderDelivered", function () {
        if (finished || !gameState.orders.every(function (order) { return order.delivered; })) {
            return;
        }
        finished = true;
        markLevelDone(index);
        track("level_complete", {level: index + 1, seconds: gameState.seconds});
        showStatus(level.finish || "Level " + (index + 1) + " complete!");
        Crafty.e("Delay").delay(function () { Crafty.scene("LevelComplete", index); }, STAGE_PAUSE_MS, 0);
    });
});
