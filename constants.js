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
