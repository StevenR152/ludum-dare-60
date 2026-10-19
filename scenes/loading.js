// The Loading scene: the first thing anyone sees, and it is up for a while, since every sprite and sound is
// fetched before the Start menu.
//
// The pot in the middle is the game's own vase art, not a drawing of one: it is fetched directly by the
// browser rather than through Crafty.load, so it does not have to wait for the manifest it is standing in
// front of. It goes through the three stages a pot really goes through, raw clay to bisque to glaze-fired,
// as the assets arrive, and the bar under it is Crafty's actual load progress.
var LOADING_BACKGROUND = "radial-gradient(ellipse at 50% 64%, #5A3A1E 0%, #2B2522 52%, #17130F 100%)";
var LOADING_TEXT_COLOR = "#E3CDA8";
var LOADING_BAR_W = 420;
var LOADING_BAR_H = 10;
// The pot on show: shape (POT_SPRITES), clay letter for its raw and bisque pictures, and which glaze it
// comes out of the second firing wearing.
var LOADING_POT_SHAPE = "Vase";
var LOADING_POT_CLAY = "A";
var LOADING_POT_GLAZE = 1;
var LOADING_POT_H = 260;

// The pot pictures are a small pot on a big transparent canvas, so show only the part POT_SPRITES crops to,
// scaled to `height`. Returns the css to put that crop in a box of the returned width.
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
    Crafty.background(LOADING_BACKGROUND);
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
        .textFont({size: "26px"})
        .textColor(LOADING_TEXT_COLOR)
        .unselectable()
        .css({fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic",
              textShadow: "0 2px 6px rgba(0,0,0,0.6)"});

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
        .text("")
        .textAlign("center")
        .textFont({size: "14px"})
        .textColor("rgba(227,205,168,0.65)")
        .unselectable()
        .css({fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "1px"});

    var shown = 0;
    // gameAssets is defined in assets.js. The callbacks are, in order: done, each asset, each failure.
    Crafty.load(gameAssets, function () {
        fill.attr({w: LOADING_BAR_W});
        counter.text("Ready");
        setTimeout(function () {
            Crafty.scene("Start");
        }, 1000);
    }, function (progress) {
        var fraction = Math.min(1, progress.loaded / progress.total);
        fill.attr({w: Math.max(2, LOADING_BAR_W * fraction)});
        counter.text(Math.round(fraction * 100) + "%");
        var stage = fraction < 0.34 ? 0 : fraction < 0.7 ? 1 : 2;
        if (stage !== shown) {
            shown = stage;
            pot.css(loadingPotCss(stages[stage].url, LOADING_POT_H, stages[stage].filter));
        }
    }, function (e) {
        console.warn("An asset failed to load", e && e.src);
    });
});
