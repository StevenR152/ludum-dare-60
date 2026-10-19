// Everything that must start fresh on each run lives here,
// so Start and Play Again both go through resetGameState().
var gameState;

function resetGameState() {
    gameState = {
        seconds: 0,
        orders: [], // customer orders, see components/orders.js
        score: 0, // delivered orders add, missed orders subtract; may go negative
    };
}

resetGameState();
