// The master potter: turns 1 clay into a pot over POT_MAKE_MS, whenever his hands are free.
// Holds at most one pot, shown as a light brown box on him, until takePot() collects it.
// Clay arrives with owl.trigger("ClayDelivered", amount).
Crafty.c("Potter", {
    init: function() {
        this.requires("2D, Delay");
        this.clay = 1;
        this.hasPot = false;
        this.making = false;
        this.potBox = Crafty.e("2D, DOM, Color")
            .attr({w: 40, h: 40, visible: false})
            .color(POT_COLOR);
        this.bind("ClayDelivered", function (amount) {
            this.clay += amount;
            this.startPot();
        });
        this.startPot();
    },

    startPot: function() {
        if (this.hasPot || this.making || this.clay < 1) {
            return;
        }
        this.clay -= 1;
        this.making = true;
        // Placeholder until the fox delivers clay: refill whatever was just used.
        this.trigger("ClayDelivered", 1);
        this.delay(this.finishPot, POT_MAKE_MS, 0);
    },

    finishPot: function() {
        this.making = false;
        this.hasPot = true;
        // Low on the owl, centred; placed now because the owl's position is set after init.
        this.potBox.attr({
            x: this.x + (this.w - this.potBox.w) / 2,
            y: this.y + this.h - this.potBox.h - 10,
            z: this.z + 1,
            visible: true
        });
    },

    // Returns the finished pot, or null if there isn't one, and starts the next.
    takePot: function() {
        if (!this.hasPot) {
            return null;
        }
        this.hasPot = false;
        this.potBox.visible = false;
        this.startPot();
        return {type: "pot"};
    }
});
