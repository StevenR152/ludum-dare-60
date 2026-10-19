// Customer orders. OrderPanel creates one at 0:00 and then every ORDER_INTERVAL_MS,
// keeps them in gameState.orders (max ORDER_MAX open ones), and lists each in the HUD with a
// picture of the pot, words and a bar that drains toward its deadline. A "Total Score" bar sits above them.
// An order ends delivered (green, +ORDER_POINTS_*) or expired (red, -ORDER_PENALTIES); its points are in
// order.points. Cards list delivered orders, then open ones, then expired ones.
// Triggers "OrderAdded", "OrderDelivered" and "OrderExpired" with the order.
//   Crafty.e("OrderPanel").attr({x: GAME_SCREEN_WIDTH - 300, y: 60}).start();
var ORDER_CARD_W = 280;
var ORDER_CARD_H = 60;
var ORDER_CARD_GAP = 8;
var ORDER_SCORE_H = 26;
// Cards that fit under the score bar; finished cards beyond this are dropped, oldest first.
var ORDER_MAX_CARDS = 9;

function isOpen(order) {
    return !order.delivered && !order.expired;
}

// The oldest open order this finished pot fills (same shape, clay and glaze order), or null.
function findOpenOrder(pot) {
    return gameState.orders.find(function (order) {
        return isOpen(order) && pot.pot.shape === order.shape && pot.clay.name === order.clay.name &&
            pot.pot.glaze.join() === order.glaze.join();
    }) || null;
}

// Delivers an open order: early (first half of its time) or late points.
function deliverOrder(order) {
    order.delivered = true;
    order.points = order.madeMs < order.deadlineMs / 2 ? ORDER_POINTS_EARLY : ORDER_POINTS_LATE;
    Crafty.trigger("OrderDelivered", order);
}

function pointsText(order) {
    return (order.points < 0 ? "\u2212" : "+") + Math.abs(order.points) + " points";
}

function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// A stand-in Pottery of the order's finished pot, so it is drawn like any other pot.
function orderPot(order) {
    var piece = new Pottery(order.clay);
    piece.pot = {shape: order.shape, glaze: order.glaze, cracked: false};
    piece.state = "glazeCooled";
    return piece;
}

function makeOrder() {
    var shape = randomFrom(ORDER_SHAPES);
    var clayKey = randomFrom(Object.keys(CLAY_TYPES));
    var speed = randomFrom(Object.keys(ORDER_SPEEDS));
    return {
        shape: shape,
        grams: ORDER_CLAY_GRAMS[shape],
        clay: CLAY_TYPES[clayKey],
        glaze: randomFrom(ORDER_GLAZES),
        speed: speed,
        deadlineMs: ORDER_SPEEDS[speed].deadlineMs,
        madeMs: 0 // game time elapsed since it arrived; advanced by OrderPanel
    };
}

Crafty.c("OrderPanel", {
    init: function() {
        this.requires("2D, Delay");
        this.cards = [];
        this.bind("OrderDelivered", this.scored);
    },

    scored: function(order) {
        gameState.score += order.points;
        this.refresh();
    },

    // Call after positioning the panel: the first order arrives at once.
    start: function() {
        this.scoreBack = Crafty.e("2D, HUD, Color")
            .attr({x: this.x, y: this.y, w: ORDER_CARD_W, h: ORDER_SCORE_H, z: 1000})
            .color("rgba(34, 34, 34, 0.85)");
        this.scoreText = Crafty.e("2D, HUD, Text")
            .attr({x: this.x, y: this.y + 4, w: ORDER_CARD_W, h: ORDER_SCORE_H - 4, z: 1001})
            .textFont({size: "15px", weight: "bold"}).textColor("#FFF").unselectable()
            .css({textAlign: "center"});
        this.addOrder();
        this.delay(this.addOrder, ORDER_INTERVAL_MS, -1);
        this.delay(this.updateBars, 500, -1);
        return this;
    },

    addOrder: function() {
        if (gameState.orders.filter(isOpen).length >= ORDER_MAX) {
            return;
        }
        var order = makeOrder();
        gameState.orders.push(order);
        this.refresh();
        Crafty.trigger("OrderAdded", order);
    },

    // Redraws the score and every card: delivered, open, then expired, dropping the oldest finished ones that do not fit.
    refresh: function() {
        this.scoreText.text("Total Score  " + gameState.score);
        this.cards.forEach(function (card) { card.parts.forEach(function (part) { part.destroy(); }); });
        var open = gameState.orders.filter(isOpen);
        var finished = gameState.orders.filter(function (order) { return !isOpen(order); });
        finished = finished.slice(Math.max(0, finished.length - Math.max(0, ORDER_MAX_CARDS - open.length)));
        var shown = finished.filter(function (order) { return order.delivered; }).concat(open,
            finished.filter(function (order) { return order.expired; }));
        this.cards = shown.map(this.makeCard, this);
    },

    makeCard: function(order, index) {
        var x = this.x;
        var y = this.y + ORDER_SCORE_H + 4 + index * (ORDER_CARD_H + ORDER_CARD_GAP);
        var card = {order: order};
        card.back = Crafty.e("2D, HUD, Color")
            .attr({x: x, y: y, w: ORDER_CARD_W, h: ORDER_CARD_H, z: 1000})
            .color(order.delivered ? ORDER_DELIVERED_COLOR : order.expired ? ORDER_EXPIRED_COLOR : ORDER_OPEN_COLOR);
        // The finished pot: its shape and clay, glazed (after the glaze firing, the last dip shows) or fired bare.
        card.swatch = Crafty.e("2D, HUD, Color")
            .attr({x: x + 4, y: y + 8, w: 38, h: 34, z: 1001});
        paintItem(card.swatch, orderPot(order));
        card.label = Crafty.e("2D, HUD, Text")
            .attr({x: x + 48, y: y + 6, w: ORDER_CARD_W - 56, h: 36, z: 1001})
            .text(order.clay.name.charAt(0).toUpperCase() + order.clay.name.slice(1) + " " + order.shape + " (" + order.grams + "g)")
            .textFont({size: "13px", weight: "bold"}).textColor("#222").unselectable();
        // Second row: the glaze colours in words, then one square per bucket, in dipping order (or "Unglazed"), then the speed.
        var unglazed = order.glaze.length === 0;
        var glazeWords = unglazed ? "Unglazed" : order.glaze.map(function (name) { return GLAZE_BUCKET_NAMES[name]; }).join(", ");
        var squaresX = x + 48 + glazeWords.length * 7.5 + 6;
        card.glazeWord = Crafty.e("2D, HUD, Text")
            .attr({x: x + 48, y: y + 24, w: glazeWords.length * 7.5 + 6, h: 16, z: 1001})
            .text(glazeWords)
            .textFont({size: "13px", weight: "bold"}).textColor("#222").unselectable();
        card.glazeSquares = [];
        for (var i = 0; i < order.glaze.length; i++) {
            card.glazeSquares.push(Crafty.e("2D, HUD, Color")
                .attr({x: squaresX + i * 20, y: y + 25, w: 16, h: 16, z: 1001})
                .color(GLAZE_BUCKET_COLORS[order.glaze[i]]));
        }
        card.speedLabel = Crafty.e("2D, HUD, Text")
            .attr({x: squaresX + order.glaze.length * 20 + 8, y: y + 24, w: 90, h: 16, z: 1001})
            .text("· " + order.speed)
            .textFont({size: "13px", weight: "bold"}).textColor("#222").unselectable();
        if (isOpen(order)) {
            card.barBack = Crafty.e("2D, HUD, Color")
                .attr({x: x + 8, y: y + 46, w: ORDER_CARD_W - 16, h: 8, z: 1001})
                .color("#999");
            card.bar = Crafty.e("2D, HUD, Color")
                .attr({x: x + 8, y: y + 46, w: ORDER_CARD_W - 16, h: 8, z: 1002});
            this.paintBar(card);
        } else {
            card.points = Crafty.e("2D, HUD, Text")
                .attr({x: x + 8, y: y + 42, w: ORDER_CARD_W - 16, h: 16, z: 1001})
                .text(pointsText(order))
                .textFont({size: "14px", weight: "bold"}).textColor("#222").unselectable();
        }
        card.parts = [card.back, card.swatch, card.label, card.glazeWord, card.speedLabel, card.barBack, card.bar, card.points]
            .concat(card.glazeSquares).filter(Boolean);
        return card;
    },

    paintBar: function(card) {
        var left = Math.max(0, 1 - card.order.madeMs / card.order.deadlineMs);
        card.bar.w = (ORDER_CARD_W - 16) * left;
        card.bar.color(left > 0.5 ? "#3A9E4F" : left > 0.2 ? "#E0A020" : "#C0392B");
    },

    // An open order's time counts only while the game runs (Delay pauses with Crafty.pause()). One that
    // runs out is missed: it costs its shape's penalty, once.
    updateBars: function() {
        var missed = [];
        gameState.orders.filter(isOpen).forEach(function (order) {
            order.madeMs += 500;
            if (order.madeMs >= order.deadlineMs) {
                order.expired = true;
                order.points = -ORDER_PENALTIES[order.shape];
                gameState.score += order.points;
                missed.push(order);
            }
        });
        if (missed.length > 0) {
            this.refresh();
            missed.forEach(function (order) { Crafty.trigger("OrderExpired", order); });
            return;
        }
        this.cards.forEach(function (card) {
            if (card.bar) {
                this.paintBar(card);
            }
        }, this);
    }
});
