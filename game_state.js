// Everything that must start fresh on each run lives here,
// so Start and Play Again both go through resetGameState().
var gameState;
// Per-world rules, set by buildWorld: dips a pot takes, and whether pots dropped on the ground can be damaged.
var worldRules = {maxGlazeDips: MAX_GLAZE_DIPS, potsBreakOnGround: true};

function resetGameState() {
    gameState = {
        seconds: 0,
        orders: [], // customer orders, see components/orders.js
        score: 0, // delivered orders add, missed orders subtract; may go negative
        packHintShown: false, // the first "pack full" message of a run suggests dropping something (fox.js packFull)
    };
}

resetGameState();
