// Preloaded by the Loading scene via Crafty.load.
// Sprite map keys become component names, e.g. Crafty.e("2D, DOM, fox").
// Each image is a single full-size tile; entities scale it via w/h.
var gameAssets = {
    "audio": {
        // "bgAudio" : ["assets/sounds/music.mp3"],
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
