// 2304x768: twice the width of the original 1152x768 (3:2) screen.
// Keep body width in index.html in step.
var GAME_SCREEN_WIDTH = 2304;
var GAME_SCREEN_HEIGHT = 768;

// gameAssets audio key played on the Start, Game and End scenes.
var MUSIC_TRACK = "bgMusic";
var MUSIC_VOLUME = 0.25;
// Sound starts muted while we develop. TODO: set to false (music on by default) when we launch.
var START_MUTED = true;

// Shown along the bottom of the Start scene.
var CREDITS = [
    { role: "Game Dev", name: "Steve, Crystal, Jacke, Caleri, James" },
];

//click timing
var CLAY_DIG_MS=2000;
var CLAY_RESPAWN_MS = 20000;
// Clay of a node's colour dropped on a dug node takes this share of CLAY_RESPAWN_MS off its respawn.
var CLAY_REFILL_PERCENT = 0.5;

//clay
var CLAY_TYPES = {
    // letter picks the pot pictures (clayA, clayB, clayC in assets/images/pots).
    // patch is the sprite of the clay patch drawn on the outside map while the clay can be dug, and
    // patchContent its opaque part (x, y, w, h in the 5763x2458 image pixels): the dig zone is cut from it.
    red:   { type: "clay", name: "red",   letter: "A", color: '#E06450', fireLevel: "mid",
             patch: "patchRed", patchContent: [452, 1634, 1684, 668] },
    black: { type: "clay", name: "black", letter: "B", color: '#2B2522', fireLevel: "low",
             patch: "patchBlack", patchContent: [2260, 1644, 1036, 402] },
    white: { type: "clay", name: "white", letter: "C", color: '#F5F0DC', fireLevel: "high",
             patch: "patchWhite", patchContent: [1558, 1354, 658, 286] },
};
// Firing levels, lowest first (the kiln burns 1, 2 or 3 logs for them). A pot fired at any other
// level than its clay's cracks when it cools.
var FIRE_LEVELS = ["low", "mid", "high"];

// Debug: outline the fox's and the doors' collision boxes in red.
var DEBUG_HITBOXES = false;

// Fox movement and inventory; each 1000 g of clay carried takes 20% off the base speed.
var FOX_SPEED = 250;
// The fox's touch area is its sprite box shrunk by this many px on every side (the art has empty margins).
var FOX_HITBOX_INSET = 40;
var FOX_SLOWDOWN_PER_KG = 0.2;
var FOX_INVENTORY_CAPACITY = 2;
// Dropped items: drawn DROPPED_ITEM_SCALE times their HUD size; each one the fox overlaps multiplies its
// speed by DROPPED_ITEM_SLOWDOWN. The first touch of a pot may damage it: POT_BREAK_CHANCES by cook state,
// DAMAGE_PER_BREAK per hit. A pot cracks at BREAK_DAMAGE and is destroyed at DESTROY_DAMAGE.
var DROPPED_ITEM_SCALE = 2;
var DROPPED_ITEM_Z = 20;
var DROPPED_ITEM_SLOWDOWN = 0.5;
var POT_BREAK_CHANCES = {thrown: 0.99, cooled: 0.75, glazed: 0.75, glazeCooled: 0.5, shelved: 0.5};
var DAMAGE_PER_BREAK = 1;
var BREAK_DAMAGE = 1;
var DESTROY_DAMAGE = 3;
// Stumbling: a moving fox that carries something drops a random item with this chance per second, plus
// STUMBLE_PER_SLOW times its slowdown (0 = full speed, 0.4 = 40% slower, from clay weight and dropped items).
var STUMBLE_BASE_CHANCE = 0.005;
var STUMBLE_PER_SLOW = 0.05;
// Pottery: how long the owl takes to throw a pot and to trim one.
var POT_MAKE_MS = 8000;
var POT_TRIM_MS = 5000;

// Kiln: how long it fires and cools a pot.
var KILN_FIRE_MS = 2000; // reduced from 8000 for testing
var KILN_COOL_MS = 2000; // reduced from 8000 for testing

// Outside art. The map and the full-size overlays (clay patches) share one 5763x2458 canvas drawn into
// OUTSIDE_MAP_BOX; the smaller pictures are placed by the opaque part of their image (`content`:
// x, y, w, h in image pixels), scaled so that part fills a world rectangle. OUTSIDE_ART_Z sits between the
// map (OUTSIDE_MAP_Z) and the fox (0).
var OUTSIDE_MAP_BOX = {x: -350, y: -100, w: 2500, h: 1080};
// How opaque a clay patch's picture stays while it is dug and replenishing.
var CLAY_DUG_ALPHA = 0.8;
var OUTSIDE_MAP_PX = {w: 5763, h: 2458};
var OUTSIDE_MAP_Z = -2;
var OUTSIDE_ART_Z = -1;
// The forest: the zone is cut into one slice per tree, drawn at TREE_SCALE of the 2268x2180 image and nudged
// by dx, dy (px, down is positive) so the row is staggered; the chop zone stays the slice.
var FOREST_BOX = {x: 5, y: 350, w: 525, h: 307};
var TREE_SCALE = 0.17;
var FOREST_TREES = [
    {sprite: "tree1", content: [330, 144, 674, 1732], dx: -8, dy: -20},
    {sprite: "tree2", content: [704, 370, 760, 1568], dx: 6, dy: -65},
    {sprite: "treePair", content: [330, 144, 1134, 1794], dx: 0, dy: -10},
    {sprite: "tree1", content: [330, 144, 674, 1732], dx: -6, dy: -75},
    {sprite: "tree2", content: [704, 370, 760, 1568], dx: 8, dy: -30}
];
// Kiln art (idle and lit, both 2268x1177) and the outside door art (2056x2268).
var KILN_ART_CONTENT = [376, 358, 782, 546];
var KILN_ART_BOX = {x: 1395, y: 478, w: 260, h: 181};
var DOOR_ART_CONTENT = [630, 634, 856, 1102];
var DOOR_ART_BOX = {x: 975, y: 415, w: 85, h: 110};
// The log picture in inventory slots: its opaque part of the 2268x2180 wood image.
var LOG_IMAGE = {url: "assets/images/wood.png", w: 2268, h: 2180, crop: [826, 858, 556, 374]};

// Inventory sizes of the owl (everything he holds: clay, models, pots to trim and pots to collect) and
// the kiln. The fox's is FOX_INVENTORY_CAPACITY.
var OWL_CAPACITY = 5;
var KILN_CAPACITY = 4;

// Wood: logs the kiln holds, logs per fire level (1 log low, 2 mid, 3 high), how long the fox chops one, colours.
var KILN_WOOD_CAPACITY = 3;
var KILN_FIRE_LEVELS = ["low", "mid", "high"];
var LOG_CHOP_MS = 1000;
var LOG_COLOR = "#6B4423";
var TORCH_COLOR = "#F28C28";

// How an item looks inside an inventory HUD slot (a 40x40 grey square): clay a square, pots thinner.
var ITEM_SHAPES = {
    clay: {w: 28, h: 28},
    pot: {w: 34, h: 30},
    model: {w: 26, h: 16},
    log: {w: 36, h: 24}
};
// Orders: a new customer order every ORDER_INTERVAL_MS (the first at 0:00), at most ORDER_MAX listed.
var ORDER_INTERVAL_MS = 120000;
var ORDER_MAX = 5;
var ORDER_SHAPES = ["Bowl", "Cup", "Vase"];
// Grams of clay per shape.
var ORDER_CLAY_GRAMS = { Bowl: 500, Cup: 200, Vase: 500 };
// Each glaze is the buckets dipped in order, shown as coloured squares (GLAZE_BUCKET_COLORS).
// An empty list is an unglazed order.
var ORDER_GLAZES = [[], ["Glaze A"], ["Glaze B"], ["Glaze A", "Glaze B"], ["Glaze B", "Glaze A"]];
// How long a customer waits, by speed.
var ORDER_SPEEDS = {
    Slow:   { deadlineMs: 10 * 60 * 1000 },
    Medium: { deadlineMs: 7 * 60 * 1000 },
    Fast:   { deadlineMs: 3 * 60 * 1000 }
};

// Glazing station: two buckets, orange (glaze 1) and pink (glaze 2), also on order cards.
var GLAZE_BUCKET_COLORS = { "Glaze A": "#F47B30", "Glaze B": "#EBA6DC" };
var GLAZE_NUMBERS = { "Glaze A": 1, "Glaze B": 2 };
// Pot pictures (assets/images/pots/<file>_...): each shape's file prefix and the box [x, y, w, h] around the pot
// in its 2268x2082 image, which the pictures are cropped to (the images themselves are never edited).
var POT_IMAGE_W = 2268;
var POT_IMAGE_H = 2082;
var POT_SPRITES = {
    Cup:  {file: "smallpot", crop: [830, 820, 600, 470]},
    Bowl: {file: "bowl", crop: [550, 910, 1140, 500]},
    Vase: {file: "vase", crop: [645, 400, 810, 1150]}
};

// The path a Pottery follows, in order. An optional state (none yet; glaze will be one) may be skipped.
// Every pot is fired twice: a bisque firing, then a glaze firing (glazed or not, to vitrify it).
// Drying is not a state: a thrown pot has a dryness from 0 (wet) to 1 (bone dry), see DRY_MS_PER_GRAM.
var POTTERY_STATES = [
    {name: "dug"}, {name: "weighed"}, {name: "wedged"}, {name: "thrown"},
    {name: "firing"}, {name: "cooling"}, {name: "cooled"},
    {name: "glazed", optional: true}, {name: "glazeFiring"}, {name: "glazeCooling"}, {name: "glazeCooled"},
    {name: "shelved"}
];
// Grams in one dug kilo of clay.
var DUG_CLAY_GRAMS = 1000;
// Scales: the slider's step and smallest weight, in grams.
var WEIGH_STEP_GRAMS = 50;
// Models on the bench, one per shape, and their HUD colour.
var MODEL_COLOR = "#8A8F98";
// Glaze: dips per pot, at most one per bucket.
var MAX_GLAZE_DIPS = 2;

// Workbench: how long the fox holds to wedge a weighed piece of clay.
var WEDGE_MS = 3000;
// Drying: a pot goes from wet (dryness 0) to bone dry (1) in DRY_BASE_MS plus DRY_MS_PER_GRAM per gram of
// clay on the drying shelf (a 200 g cup: leather hard after 1.2 s, bone dry after 12 s), OFF_SHELF_SLOWDOWN times slower
// anywhere else, and not at all in the kiln. It is leather hard from LEATHER_HARD_AT. Each stage has its own colour; the bar under a pot shows how far it has got.
var DRY_SLOTS = 3;
var DRY_BASE_MS = 26000 / 3; // reduced for testing
var DRY_MS_PER_GRAM = 50 / 3; // reduced for testing
var OFF_SHELF_SLOWDOWN = 3;
var LEATHER_HARD_AT = 0.1;
var DRY_STAGE_COLORS = { wet: "#8C6440", leatherHard: "#B9946A", boneDry: "#E3CDA8" };
var DRY_STAGE_LABELS = { wet: "wet", leatherHard: "LH", boneDry: "dry" };
var DRY_BAR_COLOR = "#555";
// Border of a pot's box: trimmed and not.
var TRIMMED_BORDER_COLOR = "#2E7D32";
var UNTRIMMED_BORDER_COLOR = "#E67E22";
// Completed shelf: how many finished pots end the game.
var COMPLETED_CAPACITY = 3;
// Zone square colours of the inside stations.
var WEIGHING_STATION_COLOR = "#800080";
var WORKBENCH_COLOR = "rgba(139, 90, 43, 0.45)";
// Shelf slot boxes: how far below the shelf box's top they sit.
var SHELF_SLOT_TOP = 2;
var SHELF_COLOR = "rgba(90, 120, 160, 0.35)";

// Sound names (see gameAssets.audio). GameSounds picks pot sounds by stage and, for wet pots, by clay.
var AMBIENT_VOLUME = MUSIC_VOLUME;
var WEDGE_SOUNDS = {white: "wedgeBlue", red: "wedgeRed", black: "wedgeBrown"};
var WET_POT_SOUND_SUFFIX = {white: "Blue", red: "Red", black: "Brown"};
