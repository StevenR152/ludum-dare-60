// Preloaded by the Loading scene via Crafty.load.
// Sprite map keys become component names, e.g. Crafty.e("2D, DOM, fox").
// Each image is a single full-size tile; entities scale it via w/h.
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
    "images": [],
    "sprites": {
        "assets/images/background_outside_map.png": {
            "tile": 4000,
            "tileh": 2160,
            "map": {"backgroundOutside": [0, 0]}
        },
        "assets/images/fox.png": {
            "tile": 845,
            "tileh": 540,
            "map": {"fox": [0, 0]}
        },
        "assets/images/owl.png": {
            "tile": 1602,
            "tileh": 1519,
            "map": {"owl": [0, 0]}
        }
    }
};
