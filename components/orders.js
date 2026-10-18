// Customer orders. OrderPanel creates one at 0:00 and then every ORDER_INTERVAL_MS,
// keeps them in gameState.orders (max ORDER_MAX), and lists each in the HUD with a
// clay colour square, words and a bar that drains toward its deadline.
// Triggers "OrderAdded" with the order.
//   Crafty.e("OrderPanel").attr({x: GAME_SCREEN_WIDTH - 300, y: 60}).start();
var ORDER_CARD_W = 280;
var ORDER_CARD_H = 60;
var ORDER_CARD_GAP = 8;

function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function makeOrder() {
    var shape = randomFrom(ORDER_SHAPES);
    var size = randomFrom(ORDER_SIZES);
    var clayKey = randomFrom(Object.keys(CLAY_TYPES));
    var speed = randomFrom(Object.keys(ORDER_SPEEDS));
    return {
        shape: shape,
        size: size,
        grams: ORDER_CLAY_GRAMS[shape][size],
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
    },

    // Call after positioning the panel: the first order arrives at once.
    start: function() {
        this.addOrder();
        this.delay(this.addOrder, ORDER_INTERVAL_MS, -1);
        this.delay(this.updateBars, 500, -1);
        return this;
    },

    addOrder: function() {
        if (gameState.orders.length >= ORDER_MAX) {
            return;
        }
        var order = makeOrder();
        gameState.orders.push(order);
        this.cards.push(this.makeCard(order, this.cards.length));
        Crafty.trigger("OrderAdded", order);
    },

    makeCard: function(order, index) {
        var x = this.x;
        var y = this.y + 30 + index * (ORDER_CARD_H + ORDER_CARD_GAP);
        var card = {order: order};
        card.back = Crafty.e("2D, HUD, Color")
            .attr({x: x, y: y, w: ORDER_CARD_W, h: ORDER_CARD_H, z: 1000})
            .color("rgba(255, 255, 255, 0.85)");
        card.swatch = Crafty.e("2D, HUD, Color")
            .attr({x: x + 8, y: y + 8, w: 26, h: 26, z: 1001})
            .color(order.clay.color);
        card.label = Crafty.e("2D, HUD, Text")
            .attr({x: x + 42, y: y + 6, w: ORDER_CARD_W - 50, h: 36, z: 1001})
            .text(order.size + " " + order.shape + " (" + order.grams + "g)<br>" +
                  order.glaze + " · " + order.speed)
            .textFont({size: "13px", weight: "bold"}).textColor("#222").unselectable();
        card.barBack = Crafty.e("2D, HUD, Color")
            .attr({x: x + 8, y: y + 46, w: ORDER_CARD_W - 16, h: 8, z: 1001})
            .color("#999");
        card.bar = Crafty.e("2D, HUD, Color")
            .attr({x: x + 8, y: y + 46, w: ORDER_CARD_W - 16, h: 8, z: 1002})
            .color("#3A9E4F");
        return card;
    },

    // Each order's time counts only while the game runs (Delay pauses with Crafty.pause()).
    updateBars: function() {
        for (var i = 0; i < this.cards.length; i++) {
            var card = this.cards[i];
            card.order.madeMs += 500;
            var left = Math.max(0, 1 - card.order.madeMs / card.order.deadlineMs);
            card.bar.w = (ORDER_CARD_W - 16) * left;
            card.bar.color(left > 0.5 ? "#3A9E4F" : left > 0.2 ? "#E0A020" : "#C0392B");
        }
    }
});
