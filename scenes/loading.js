// The Loading scene: the first thing anyone sees. It shares the menu look with Start and Missions
// (MENU_* in constants.js).
//
// The pot in the middle is the game's own vase art, not a drawing of one: it is fetched directly by the
// browser rather than through Crafty.load, so it does not have to wait for the manifest it is standing in
// front of. It goes through the three stages a pot really goes through, raw clay to bisque to glaze-fired,
// as the assets arrive.
//
// The bar is Crafty's real load progress, but paced so it never runs ahead of LOADING_MIN_MS. On a cold
// cache the assets are the slow part and the pacing does nothing; on a warm one the load is over in a blink
// and without it the pot would flash through all three firings before anyone saw them.
var LOADING_MIN_MS = 3000;
var LOADING_SETTLE_MS = 700;
var LOADING_BAR_W = 420;
var LOADING_BAR_H = 10;
// The pot on show: shape (POT_SPRITES), clay letter for its raw and bisque pictures, and which glaze it
// comes out of the second firing wearing. Red clay, because black is a silhouette against the firelight.
var LOADING_POT_SHAPE = "Vase";
var LOADING_POT_CLAY = "A";
var LOADING_POT_GLAZE = 1;
var LOADING_POT_H = 260;

// The pot pictures are a small pot on a big transparent canvas, so show only the part POT_SPRITES crops to,
// scaled to `height`.
function loadingPotCss(url, height, filter) {
    var crop = POT_SPRITES[LOADING_POT_SHAPE].crop;
    var scale = height / crop[3];
    return {
        backgroundImage: 'url("' + url + '")',
        backgroundSize: (POT_IMAGE_W * scale) + "px " + (POT_IMAGE_H * scale) + "px",
        backgroundPosition: (-crop[0] * scale) + "px " + (-crop[1] * scale) + "px",
        backgroundRepeat: "no-repeat",
        filter: filter || "none"
    };
}

// The three stages, in the order the pot earns them. potImage (assets.js) owns the file names.
function loadingPotStages() {
    var file = POT_SPRITES[LOADING_POT_SHAPE].file;
    return [
        {url: potImage(file, LOADING_POT_CLAY, "unfired"), filter: UNFIRED_POT_FILTER[LOADING_POT_CLAY]},
        {url: potImage(file, LOADING_POT_CLAY, "fired"), filter: "none"},
        {url: potImage(file, "A", "glazeFired", LOADING_POT_GLAZE), filter: "none"}
    ];
}

Crafty.defineScene("Loading", function() {
    Crafty.background(MENU_BACKGROUND);
    var middle = GAME_SCREEN_WIDTH / 2;
    var stages = loadingPotStages();
    // Fetch all three up front (about 35 kB between them) so the pot changes the instant it should,
    // instead of blinking out while the next picture arrives.
    stages.forEach(function (stage) { new Image().src = stage.url; });

    // The wheel the pot stands on: a squashed disc, lit from the kiln side.
    Crafty.e("2D, DOM, Color")
        .attr({x: middle - 130, y: 392, w: 260, h: 44, z: 1})
        .color("#3D2E22")
        .css({borderRadius: "50%", boxShadow: "0 10px 26px rgba(0,0,0,0.45)"});

    var crop = POT_SPRITES[LOADING_POT_SHAPE].crop;
    var potW = LOADING_POT_H * crop[2] / crop[3];
    var pot = Crafty.e("2D, DOM")
        .attr({x: middle - potW / 2, y: 412 - LOADING_POT_H, w: potW, h: LOADING_POT_H, z: 2})
        .css(loadingPotCss(stages[0].url, LOADING_POT_H, stages[0].filter));

    Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: 478, w: GAME_SCREEN_WIDTH, h: 40, z: 2})
        .text("Warming the kiln…")
        .textAlign("center")
        // Italic is textFont's `type`: Crafty rebuilds the `font` shorthand on every draw and ignores `style`.
        .textFont({size: "26px", type: "italic"})
        .textColor(MENU_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, textShadow: "0 2px 6px rgba(0,0,0,0.6)"});

    // The bar: a sunken track with a warm fill, the colour of the torch that lights the kiln.
    Crafty.e("2D, DOM, Color")
        .attr({x: middle - LOADING_BAR_W / 2, y: 540, w: LOADING_BAR_W, h: LOADING_BAR_H, z: 2})
        .color("rgba(0,0,0,0.38)")
        .css({borderRadius: "5px", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)"});
    var fill = Crafty.e("2D, DOM, Color")
        .attr({x: middle - LOADING_BAR_W / 2, y: 540, w: 0, h: LOADING_BAR_H, z: 3})
        .color(TORCH_COLOR)
        .css({borderRadius: "5px", boxShadow: "0 0 12px rgba(242,140,40,0.55)"});

    var counter = Crafty.e("2D, DOM, Text")
        .attr({x: 0, y: 562, w: GAME_SCREEN_WIDTH, h: 28, z: 2})
        .text("0%")
        .textAlign("center")
        .textFont({size: "14px"})
        .textColor(MENU_DIM_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: MENU_FONT, letterSpacing: "1px"});

    var startedAt = Date.now();
    var realFraction = 0;
    var assetsDone = false;
    var leaving = false;
    var shownStage = 0;

    function draw(fraction) {
        fill.attr({w: Math.max(2, LOADING_BAR_W * fraction)});
        counter.text(Math.round(fraction * 100) + "%");
        var stage = fraction < 0.34 ? 0 : fraction < 0.7 ? 1 : 2;
        if (stage !== shownStage) {
            shownStage = stage;
            pot.css(loadingPotCss(stages[stage].url, LOADING_POT_H, stages[stage].filter));
        }
    }

    // Driven by a timer rather than Crafty's frame loop, because this runs before the game proper and only
    // has to move a bar. The entity exists so the scene ending stops the timer with it.
    var ticker = Crafty.e("2D");
    var tick = setInterval(function () {
        var elapsed = Date.now() - startedAt;
        var paced = Math.min(realFraction, elapsed / LOADING_MIN_MS);
        draw(paced);
        if (assetsDone && !leaving && paced >= 1) {
            leaving = true;
            clearInterval(tick);
            counter.text("Ready");
            setTimeout(function () { Crafty.scene("Start"); }, LOADING_SETTLE_MS);
        }
    }, 40);
    ticker.bind("Remove", function () { clearInterval(tick); });

    // gameAssets is defined in assets.js. The callbacks are, in order: done, each asset, each failure.
    // Audio is loaded after, not with, the pictures. Crafty counts a sound as loaded on its canplaythrough event,
    // which iOS Safari never fires before the player has tapped, so waiting on sounds left the bar stuck on
    // iPhones. Sounds not yet loaded are simply skipped (audioController.isLoaded), and they are tiny now.
    var visualAssets = {};
    Object.keys(gameAssets).forEach(function (type) {
        if (type !== "audio") { visualAssets[type] = gameAssets[type]; }
    });
    Crafty.load(visualAssets, function () {
        Crafty.load({audio: gameAssets.audio}, function () {}, function () {}, function () {});
        realFraction = 1;
        assetsDone = true;
    }, function (progress) {
        realFraction = Math.min(1, progress.loaded / progress.total);
    }, function (e) {
        console.warn("An asset failed to load", e && e.src);
    });
});
