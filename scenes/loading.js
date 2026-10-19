// The Loading scene: the first thing anyone sees, and it is up for a while, since every sprite and sound
// is fetched before the Start menu. None of that art exists yet while this is on screen, so everything here
// is drawn from the game's own palette (constants.js) rather than from an asset.
//
// The pot in the middle dries as the assets arrive, wet -> leather hard -> bone dry (DRY_STAGE_COLORS), the
// same three stages a real pot goes through on the drying shelf, and the bar under it is Crafty's actual
// load progress rather than a decoration.
var LOADING_BACKGROUND = "radial-gradient(ellipse at 50% 64%, #5A3A1E 0%, #2B2522 52%, #17130F 100%)";
var LOADING_TEXT_COLOR = "#E3CDA8";
var LOADING_BAR_W = 420;
var LOADING_BAR_H = 10;

// A pot, drawn by hand: a narrow neck flaring into a round belly, with a darker ellipse for the opening.
// `color` fills the body, so the whole pot can change as it dries.
function loadingPotImage(color) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">' +
        '<path d="M46,28 C46,34 44,37 42,41 C28,53 22,70 22,88 C22,113 39,129 60,129' +
        ' C81,129 98,113 98,88 C98,70 92,53 78,41 C76,37 74,34 74,28 Z" fill="' + color + '"/>' +
        '<ellipse cx="60" cy="28" rx="14" ry="5" fill="rgba(0,0,0,0.33)"/>' +
        '</svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
}

// Which drying stage a fraction of the load corresponds to, so the pot pales as the bar fills.
function loadingPotColor(fraction) {
    if (fraction < 0.34) {
        return DRY_STAGE_COLORS.wet;
    }
    return fraction < 0.7 ? DRY_STAGE_COLORS.leatherHard : DRY_STAGE_COLORS.boneDry;
}

Crafty.defineScene("Loading", function() {
    Crafty.background(LOADING_BACKGROUND);
    var middle = GAME_SCREEN_WIDTH / 2;

    // The wheel the pot stands on: a squashed disc, lit from the kiln side.
    Crafty.e("2D, DOM, Color")
        .attr({x: middle - 130, y: 392, w: 260, h: 44, z: 1})
        .color("#3D2E22")
        .css({borderRadius: "50%", boxShadow: "0 10px 26px rgba(0,0,0,0.45)"});

    var pot = Crafty.e("2D, DOM")
        .attr({x: middle - 90, y: 214, w: 180, h: 210, z: 2})
        .css({backgroundImage: loadingPotImage(DRY_STAGE_COLORS.wet),
              backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center"});

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

    var stage = null;
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
        var next = loadingPotColor(fraction);
        if (next !== stage) {
            stage = next;
            pot.css({backgroundImage: loadingPotImage(next)});
        }
    }, function (e) {
        console.warn("An asset failed to load", e && e.src);
    });
});
