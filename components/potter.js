// The master potter: turns the 1 clay in his input inventory into a pot over POT_MAKE_MS,
// whenever his hands are free. The clay stays in his input until the pot is finished. The finished pot waits in his output inventory, shown as a
// light brown box on him, until the fox takes it (transferItem(owl.output, fox.inventory)).
// He takes clay one at a time, and only when idle.
Crafty.c("Potter", {
    init: function() {
        this.requires("2D, Delay");
        this.making = false;
        var owl = this;
        this.input = new Inventory(OWL_INPUT_CAPACITY, {
            accepts: function (item) { return item.state === "wedged" && owl.isIdle(); }
        });
        this.output = new Inventory(OWL_OUTPUT_CAPACITY);
        this.potBox = Crafty.e("2D, DOM, Color")
            .attr({w: 40, h: 40, visible: false})
            .color(POT_COLOR);
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.input) {
                this.startPot();
            } else if (changed === this.output) {
                this.showPot();
            }
        });
    },

    startPot: function() {
        if (this.making || this.output.items.length > 0 || this.input.items.length === 0) {
            return;
        }
        this.making = true;
        this.delay(this.finishPot, POT_MAKE_MS, 0);
    },

    finishPot: function() {
        this.making = false;
        var pottery = this.input.take(0);
        pottery.advance("thrown");
        this.output.add(pottery);
    },

    // Low on the owl, centred; placed now because the owl's position is set after init.
    // Taking the pot lets him start the next one if he has clay.
    showPot: function() {
        var hasPot = this.output.items.length > 0;
        if (hasPot) {
            this.potBox.attr({
                x: this.x + (this.w - this.potBox.w) / 2,
                y: this.y + this.h - this.potBox.h - 10,
                z: this.z + 1
            });
        }
        this.potBox.visible = hasPot;
        this.startPot();
    },

    // No clay waiting, no pot on the wheel or in his hands: the only time he takes clay.
    isIdle: function() {
        return this.input.items.length === 0 && !this.making && this.output.items.length === 0;
    }
});
