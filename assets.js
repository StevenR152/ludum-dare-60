// Preloaded by the Loading scene via Crafty.load.
// Sprite map keys become component names, e.g. Crafty.e("2D, DOM, fox").
// Each image is a single full-size tile; entities scale it via w/h.
// Path of a pot picture: `kind` is "unfired", "fired", "half" (one dip), "full" (two dips) or "glazeFired";
// `glaze` (1 or 2, the last dip) only matters for the last three, and `letter` (A, B, C) for the first three
// and "half". The one place that knows the file names.
function potImage(file, letter, kind, glaze) {
    var name = {
        unfired: file + "_clay" + letter,
        fired: file + "_clay" + letter + "-fired",
        half: file + "_clay" + letter + "-fired-halfglazed" + glaze,
        full: file + "_fullyglazed" + glaze,
        glazeFired: file + "_2nd-fire_glaze" + glaze
    }[kind];
    return "assets/images/pots/" + name + ".png";
}

// Path of the grey model picture of a pot shape (same size and crop as the pot pictures).
function modelImage(shape) {
    return "assets/images/grey_" + POT_SPRITES[shape].file + ".png";
}

// Every pot picture, for preloading.
function potImagePaths() {
    var paths = [];
    Object.keys(POT_SPRITES).forEach(function (shape) {
        var file = POT_SPRITES[shape].file;
        paths.push(modelImage(shape));
        ["A", "B", "C"].forEach(function (letter) {
            paths.push(potImage(file, letter, "unfired"), potImage(file, letter, "fired"));
            [1, 2].forEach(function (glaze) { paths.push(potImage(file, letter, "half", glaze)); });
        });
        [1, 2].forEach(function (glaze) {
            paths.push(potImage(file, "A", "full", glaze), potImage(file, "A", "glazeFired", glaze));
        });
    });
    return paths;
}

var gameAssets = {
    // Sound effects and ambient loops, played by name through audioController (see GameSounds).
    "audio": {
        "workshopLoop": ["assets/sounds/Sounds/Workshop LOOP.m4a"],
        "forestLoop": ["assets/sounds/Sounds/Forest LOOP.m4a"],
        "wedgeBlue": ["assets/sounds/Sounds/wedging clay 2.m4a"],
        "wedgeRed": ["assets/sounds/Sounds/wedging clay 3.m4a"],
        "wedgeBrown": ["assets/sounds/Sounds/wedging clay 4.m4a"],
        "putdownWetBlue": ["assets/sounds/Sounds/putdown wet clay 2.m4a"],
        "putdownWetRed": ["assets/sounds/Sounds/putdown wet clay 3.m4a"],
        "putdownWetBrown": ["assets/sounds/Sounds/putdown wet clay 4.m4a"],
        "pickupWetBlue": ["assets/sounds/Sounds/pickup wet clay 2.m4a"],
        "pickupWetRed": ["assets/sounds/Sounds/pickup wet clay 3.m4a"],
        "pickupWetBrown": ["assets/sounds/Sounds/pickup wet clay 4.m4a"],
        "pickupBoneDry": ["assets/sounds/Sounds/pickup pot 1.m4a"],
        "pickupBisque": ["assets/sounds/Sounds/pickup pot 2.m4a"],
        "pickupGlazed": ["assets/sounds/Sounds/pickup pot 3.m4a"],
        "putdownBoneDry": ["assets/sounds/Sounds/putdown pot 1.m4a"],
        "putdownBisque": ["assets/sounds/Sounds/putdown pot 3.m4a"],
        "putdownGlazed": ["assets/sounds/Sounds/putdown pot 2.m4a"],
        "kilnLit": ["assets/sounds/Sounds/fire 4.m4a"],
        "glazeDipFirst": ["assets/sounds/Sounds/glaze dipping 3.m4a"],
        "glazeDipNext": ["assets/sounds/Sounds/glaze dipping 4.m4a"],
        "kickWheel": ["assets/sounds/Sounds/pottery kick wheel LOOP.m4a"],
        "orderDelivered": ["assets/sounds/Sounds/order succes.m4a"],
        "orderFailed": ["assets/sounds/Sounds/order succes 3.m4a"],
        "digClay": ["assets/sounds/Sounds/dig 1.m4a"],
        "door": ["assets/sounds/Sounds/door 1.m4a"],
        "owlSpeak": ["assets/sounds/Sounds/owl 1.m4a"],
        "weighScale": ["assets/sounds/Sounds/weigh scale 1.m4a"],
        "chopLog": ["assets/sounds/Sounds/harvest wood 1.m4a"],
        "dropLog": ["assets/sounds/Sounds/drop wood 1.m4a"],
        "fireLoop": ["assets/sounds/Sounds/fire LOOP.m4a"],
        "uiHover": ["assets/sounds/Sounds/UI/hover.m4a"],
        "uiConfirm": ["assets/sounds/Sounds/UI/confirm.m4a"],
        "uiSelect": ["assets/sounds/Sounds/UI/select.m4a"],
        "uiBack": ["assets/sounds/Sounds/UI/back.m4a"],
        "bgMusic": ["assets/sounds/Sounds/music/theme test 1 ld60 LOOP.ogg"],
        "potCrack": ["assets/sounds/Sounds/pots crack big 2.m4a"],
        "potCrackSmall": ["assets/sounds/Sounds/pots crack small 1.m4a"],
        // The fox's yelp when it trips (two takes, picked at random). The old stumble sound pointed at the same
        // file as putdownBoneDry, which Crafty refuses to load twice, so tripping was silent.
        "foxYelp1": ["assets/sounds/Sounds/fox 1.m4a"],
        "foxYelp2": ["assets/sounds/Sounds/fox 2.m4a"],
        // No sound was recorded for finishing a level; this is an unused take of the order-success jingle.
        "levelComplete": ["assets/sounds/Sounds/order succes 2.m4a"]
    },
    // The collision masks are preloaded here and read by collisionMap.load() (components/collision_map.js).
    "images": potImagePaths().concat(LOG_IMAGE.url, Object.keys(CLAY_IMAGES).map(function (letter) { return CLAY_IMAGES[letter].url; }),
        Object.keys(WEDGED_CLAY_IMAGES).map(function (letter) { return WEDGED_CLAY_IMAGES[letter].url; }), COLLISION_AREAS.map(function (area) { return area.mask; }),
        Object.keys(FIRE_BADGES).map(function (n) { return FIRE_BADGES[n].url; })),
    "sprites": {
        "assets/images/background_outside_map.png": {
            "tile": 5763,
            "tileh": 2458,
            "map": {"backgroundOutside": [0, 0]}
        },
        // Interior layers, back to front, all on the inside map's canvas (see INSIDE_MAP_BOX).
        "assets/images/background_interior-bg.png": {"tile": 8364, "tileh": 2246, "map": {"backgroundInterior": [0, 0]}},
        "assets/images/background_interior-mid.png": {"tile": 8364, "tileh": 2246, "map": {"midInterior": [0, 0]}},
        "assets/images/background_interior-shelf.png": {"tile": 8364, "tileh": 2246, "map": {"shelfInterior": [0, 0]}},
        "assets/images/background_interior-front.png": {"tile": 8364, "tileh": 2246, "map": {"frontInterior": [0, 0]}},
        // Glaze buckets: each drawn in place on a canvas the size of the inside map (see INSIDE_MAP_BOX).
        "assets/images/glazeA_bucket.png": {"tile": 8364, "tileh": 2246, "map": {"glazeABucket": [0, 0]}},
        "assets/images/glazeB_bucket.png": {"tile": 8364, "tileh": 2246, "map": {"glazeBBucket": [0, 0]}},
        "assets/images/fox.png": {
            "tile": 845,
            "tileh": 540,
            "map": {"fox": [0, 0]}
        },
        // Full-size clay patches share the map's canvas (see OUTSIDE_MAP_BOX).
        "assets/images/patch_ClayA_red.png": {"tile": 5763, "tileh": 2458, "map": {"patchRed": [0, 0]}},
        "assets/images/patch_ClayB_black.png": {"tile": 5763, "tileh": 2458, "map": {"patchBlack": [0, 0]}},
        "assets/images/patch_ClayC_white.png": {"tile": 5763, "tileh": 2458, "map": {"patchWhite": [0, 0]}},
        "assets/images/trees_1_square.png": {"tile": 2268, "tileh": 2180, "map": {"tree1": [0, 0]}},
        "assets/images/trees_2_square.png": {"tile": 2268, "tileh": 2180, "map": {"tree2": [0, 0]}},
        "assets/images/trees_square.png": {"tile": 2268, "tileh": 2180, "map": {"treePair": [0, 0]}},
        "assets/images/kiln_base.png": {"tile": 2268, "tileh": 1177, "map": {"kilnBase": [0, 0]}},
        "assets/images/kiln_firing.png": {"tile": 2268, "tileh": 1177, "map": {"kilnFiring": [0, 0]}},
        "assets/images/door_outside.png": {"tile": 2056, "tileh": 2268, "map": {"doorOutside": [0, 0]}},
        "assets/images/owl.png": {
            "tile": 1602,
            "tileh": 1519,
            "map": {"owl": [0, 0]}
        }
    }
};
