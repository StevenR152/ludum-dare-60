// The player: sprite, arrow-key movement, and a backpack of up to BACKPACK_CAPACITY clays.
// Each kg carried slows the fox by FOX_SLOWDOWN_PER_KG of its base speed.
// E steps through the backpack slots; SPACE drops the selected clay.
//   var player = Crafty.e("Fox").attr({x: 920, y: 820});
Crafty.c("Fox", {
    init: function() {
        this.requires("2D, DOM, fox, Fourway, Collision, Keyboard");
        this.attr({w: 160, h: 102});
        this.fourway(FOX_SPEED);
        this.backpack = [];
        this.selected = 0;
        this.backpackSquares = [];
        this.bind("BackpackChanged", this.updateSpeed);
        this.bind("BackpackChanged", this.drawBackpack);
        this.bind("KeyDown", this.onKeyDown);
    },

    // Kept separate from addClay so anything that changes the backpack
    // only has to trigger "BackpackChanged".
    updateSpeed: function() {
        var speed = FOX_SPEED * (1 - FOX_SLOWDOWN_PER_KG * this.backpack.length);
        console.log("Speed changed to " + speed);
        this.speed({x: speed, y: speed});
    },

    // Rebuilt from scratch, since dropping from the middle shifts the rest left.
    // Top-left, under the mute button: stays visible even in a short window.
    drawBackpack: function() {
        this.backpackSquares.forEach(function (square) { square.destroy(); });
        this.backpackSquares = this.backpack.map(function (type, slot) {
            return Crafty.e("BackpackDisplay")
                .attr({x: 20 + slot * 50, y: 60, w: 40, h: 40})
                .clay(type)
                .selected(slot === this.selected);
        }, this);
        console.log("Backpack: " + (this.backpack.map(function (t) { return t.name; }).join(", ") || "empty"));
    },

    onKeyDown: function(e) {
        if (e.key === Crafty.keys.E) {
            this.selectNext();
        } else if (e.key === Crafty.keys.SPACE) {
            this.dropSelected();
        }
    },

    selectNext: function() {
        if (this.backpack.length === 0) {
            showStatus("Backpack is empty, nothing to choose");
            return;
        }
        this.selected = (this.selected + 1) % this.backpack.length;
        this.trigger("BackpackChanged", this.backpack);
    },

    dropSelected: function() {
        if (this.backpack.length === 0) {
            showStatus("Backpack is empty, nothing to drop");
            return;
        }
        var dropped = this.backpack.splice(this.selected, 1)[0];
        this.selected = Math.min(this.selected, Math.max(this.backpack.length - 1, 0));
        showStatus("Dropped one kilo of " + dropped.name + " clay");
        this.trigger("BackpackChanged", this.backpack);
    },

    // Returns false (and changes nothing) when the backpack is full.
    addClay: function(type) {
        if (this.backpack.length >= BACKPACK_CAPACITY) {
            showStatus("Backpack full, you can't put more in");
            return false;
        }
        this.backpack.push(type);
        console.log("One kilo of " + type.name + " clay harvested");
        this.trigger("BackpackChanged", this.backpack);
        return true;
    }
});
