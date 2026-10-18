// The master potter: copies the model in his model inventory from the weighed clay in his input,
// over POT_MAKE_MS, whenever his hands are free. He only takes the two together (receiveFrom), and
// only when the clay weighs what the model needs (ORDER_CLAY_GRAMS). The clay stays in his input
// until the pot is finished; then the model goes back to the bench ("ModelReturned") and the pot
// waits in his output inventory, shown as a box on him, until the fox takes it
// (transferItem(owl.output, fox.inventory)).
Crafty.c("Potter", {
    init: function() {
        this.requires("2D, Delay");
        this.making = false;
        var owl = this;
        this.input = new Inventory(OWL_INPUT_CAPACITY, {
            accepts: function (item) { return item.state === "weighed" && owl.isIdle(); }
        });
        this.modelIn = new Inventory(OWL_MODEL_CAPACITY, {
            accepts: function (item) { return item.type === "model" && owl.isIdle(); }
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

    // Takes the fox's weighed clay and model together, or nothing. Returns a status to show.
    receiveFrom: function(fox) {
        var pack = fox.inventory;
        var clayIndex = pack.find(function (item) { return item.state === "weighed"; });
        var modelIndex = pack.find(function (item) { return item.type === "model"; });
        if (!this.isIdle()) {
            return "The master is busy, come back when he's done";
        }
        if (clayIndex < 0 && modelIndex < 0) {
            return pack.items.some(function (item) { return item.type === "clay"; })
                ? "Wedge and weigh the clay on the workbench first"
                : "The master needs weighed clay and a model to make pots";
        }
        if (modelIndex < 0) {
            return "Bring a model from the workbench too";
        }
        if (clayIndex < 0) {
            return "Bring weighed clay from the scales too";
        }
        var clay = pack.items[clayIndex];
        var model = pack.items[modelIndex];
        var needed = ORDER_CLAY_GRAMS[model.shape][model.size];
        if (clay.clay.weight !== needed) {
            return "That's " + clay.clay.weight + " g, a " + model.size + " " + model.shape + " needs " + needed + " g";
        }
        // Model first: the clay arriving starts the pot.
        transferItem(pack, this.modelIn, modelIndex);
        transferItem(pack, this.input, pack.items.indexOf(clay));
        return "Gave the master " + needed + " g of " + clay.clay.name + " clay for a " + model.size + " " + model.shape;
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
        var model = this.modelIn.take(0);
        pottery.advance("thrown", model);
        Crafty.trigger("ModelReturned", model);
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
