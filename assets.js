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

// Every pot picture, for preloading.
function potImagePaths() {
    var paths = [];
    Object.keys(POT_SPRITES).forEach(function (shape) {
        var file = POT_SPRITES[shape].file;
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
        "workshopLoop": ["assets/sounds/Sounds/Workshop LOOP.wav"],
        "forestLoop": ["assets/sounds/Sounds/Forest LOOP.wav"],
        "wedgeBlue": ["assets/sounds/Sounds/wedging clay 2.wav"],
        "wedgeRed": ["assets/sounds/Sounds/wedging clay 3.wav"],
        "wedgeBrown": ["assets/sounds/Sounds/wedging clay 4.wav"],
        "putdownWetBlue": ["assets/sounds/Sounds/putdown wet clay 2.wav"],
        "putdownWetRed": ["assets/sounds/Sounds/putdown wet clay 3.wav"],
        "putdownWetBrown": ["assets/sounds/Sounds/putdown wet clay 4.wav"],
        "pickupWetBlue": ["assets/sounds/Sounds/pickup wet clay 2.wav"],
        "pickupWetRed": ["assets/sounds/Sounds/pickup wet clay 3.wav"],
        "pickupWetBrown": ["assets/sounds/Sounds/pickup wet clay 4.wav"],
        "pickupBoneDry": ["assets/sounds/Sounds/pickup pot 1.wav"],
        "pickupBisque": ["assets/sounds/Sounds/pickup pot 2.wav"],
        "pickupGlazed": ["assets/sounds/Sounds/pickup pot 3.wav"],
        "putdownBoneDry": ["assets/sounds/Sounds/putdown pot 1.wav"],
        "putdownBisque": ["assets/sounds/Sounds/putdown pot 3.wav"],
        "putdownGlazed": ["assets/sounds/Sounds/putdown pot 2.wav"],
        "kilnLoad": ["assets/sounds/Sounds/fire 4.wav"],
        "glazeDipFirst": ["assets/sounds/Sounds/glaze dipping 3.wav"],
        "glazeDipNext": ["assets/sounds/Sounds/glaze dipping 4.wav"],
        "kickWheel": ["assets/sounds/Sounds/pottery kick wheel LOOP.wav"],
        "potCrack": ["assets/sounds/Sounds/pots crack big 2.wav"],
        // Placeholder until a stumble sound is recorded.
        "stumble": ["assets/sounds/Sounds/putdown pot 1.wav"]
    },
    "images": potImagePaths().concat(LOG_IMAGE.url),
    "sprites": {
        "assets/images/background_outside_map.png": {
            "tile": 5763,
            "tileh": 2458,
            "map": {"backgroundOutside": [0, 0]}
        },
        "assets/images/background_inside.png": {
            "tile": 8364,
            "tileh": 2246,
            "map": {"backgroundInside": [0, 0]}
        },
        "assets/images/interior-overlay-glazing.png": {
            "tile": 8364,
            "tileh": 2246,
            "map": {"overlayInside": [0, 0]}
        },
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
