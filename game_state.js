// Everything that must start fresh on each run lives here,
// so Start and Play Again both go through resetGameState().
var gameState;

function resetGameState() {
    gameState = {
        seconds: 0,
        heldItem: null, // what the fox carries, e.g. {type: "pot"}
    };
}

resetGameState();
