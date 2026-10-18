// 1152x768: a standard 3:2 resolution, 28% larger than LD46-48's 900x600.
// Keep body width in index.html in step.
var GAME_SCREEN_WIDTH = 1152;
var GAME_SCREEN_HEIGHT = 768;

// gameAssets audio key played on the Start, Game and End scenes.
var MUSIC_TRACK = "bgMusic";
var MUSIC_VOLUME = 0.25;

// Shown along the bottom of the Start scene.
var CREDITS = [
    { role: "Game Dev", name: "Steven Rutherford" },
];

//click timing
var CLAY_DIG_MS=2000;
var CLAY_RESPAWN_MS = 20000;

//clay
var CLAY_TYPES = {
    brown: { type: "clay", name: "brown", color: '#311909' },
    red:   { type: "clay", name: "red",   color: '#650b0b' },
    blue:  { type: "clay", name: "blue",  color: '#15a0a0' },
};
var CLAY_DUG_COLOR = '#BBB';

// Fox movement and inventory; each kg of clay carried takes 20% off the base speed.
var FOX_SPEED = 250;
var FOX_SLOWDOWN_PER_KG = 0.2;
var FOX_INVENTORY_CAPACITY = 2;
// Pottery: how long the owl takes to throw a pot, and the placeholder pot colour.
var POT_MAKE_MS = 8000;
var POT_COLOR = "#C8A27A";

// Kiln: how long it fires and cools a pot, the fired pot colour, and the zone square's colour per state.
var KILN_FIRE_MS = 10000;
var KILN_COOL_MS = 10000;
var FIRED_POT_COLOR = "#A0522D";
var KILN_STATE_COLORS = {
    empty: "rgba(255, 255, 255, 0.25)",
    firing: "rgba(230, 80, 30, 0.5)",
    cooling: "rgba(110, 140, 180, 0.5)",
    ready: "rgba(255, 255, 255, 0.25)"
};

// Inventory sizes of the owl (clay in, pots out) and the kiln. The fox's is FOX_INVENTORY_CAPACITY.
var OWL_INPUT_CAPACITY = 1;
var OWL_OUTPUT_CAPACITY = 1;
var KILN_CAPACITY = 1;
