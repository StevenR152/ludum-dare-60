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
    brown: { name: "brown", color: '#311909' },
    red:   { name: "red",   color: '#650b0b' },
    blue:  { name: "blue",  color: '#15a0a0' },
};
var CLAY_DUG_COLOR = '#BBB';

// Fox movement and backpack; each kg of clay carried takes 20% off the base speed.
var FOX_SPEED = 250;
var FOX_SLOWDOWN_PER_KG = 0.2;
var BACKPACK_CAPACITY = 2;
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

// Orders: a new customer order every ORDER_INTERVAL_MS (the first at 0:00), at most ORDER_MAX listed.
var ORDER_INTERVAL_MS = 120000;
var ORDER_MAX = 5;
var ORDER_SHAPES = ["Bowl", "Cup", "Vase"];
var ORDER_SIZES = ["Small", "Medium", "Large"];
// Grams of clay per shape and size.
var ORDER_CLAY_GRAMS = {
    Bowl: { Small: 200, Medium: 500, Large: 1000 },
    Cup:  { Small: 150, Medium: 200, Large: 500 },
    Vase: { Small: 300, Medium: 500, Large: 1500 }
};
// Each glaze is the buckets dipped in order, shown as coloured squares (GLAZE_BUCKET_COLORS).
var ORDER_GLAZES = [["Glaze A"], ["Glaze B"], ["Glaze A", "Glaze B"], ["Glaze B", "Glaze A"]];
// How long a customer waits, by speed.
var ORDER_SPEEDS = {
    Slow:   { deadlineMs: 10 * 60 * 1000 },
    Medium: { deadlineMs: 7 * 60 * 1000 },
    Fast:   { deadlineMs: 3 * 60 * 1000 }
};

// Glazing station: two buckets, placeholder colours.
var GLAZE_BUCKET_COLORS = { "Glaze A": "#F2C230", "Glaze B": "#D62828" };
