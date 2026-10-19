// The Game scene's HUD as one thing: a faint panel holding the music button, the timer and the
// Fox / Master / Kiln inventory rows. It owns them all, so one call shows or hides the lot.
//   var hud = Crafty.e("GameHud").build(player, owl, kiln);   // owl may be null: no Master row
//   hud.enable(false);   // hide and disable the whole HUD; hud.enable(true) brings it back
// hud.bottom is the panel's lower edge, for stacking the Goal panel under it.
// The timer keeps counting while the HUD is hidden.
Crafty.c("GameHud", {
    init: function() {
        this.requires("2D");
        this.parts = [];
        this.rows = [];
    },

    // Call once the fox, owl and kiln exist.
    build: function(fox, owl, kiln) {
        var panel = Crafty.e("2D, HUD, Color")
            .attr({x: HUD_PANEL_X, y: 10, w: HUD_PANEL_W, h: 0, z: 999})
            .color(HUD_PANEL_COLOR)
            .css(HUD_PANEL_STYLE);
        this.parts.push(panel);
        this.parts.push(Crafty.e("MuteButton").attr({x: 20, y: 20}));
        this.parts.push(Crafty.e("GameTimer").attr({x: 125, y: 20}));
        // The fox's selected slot is always outlined; the kiln's only where a click would take an item out.
        this.addRow("Fox", [fox.inventory], 60, {hintFlash: true, outlined: function (inventory, index) { return index === inventory.selected; }}).onSlotPress(function (inventory, index) {
            fox.pressSlot(index);
        });
        // Rows stack 10px apart; a row with wrapped slots is taller.
        var y = 60 + this.rows[0].h + 10;
        if (owl) {
            y += this.addRow("Master", [owl.inventory], y).h + 10;
        }
        var kilnRow = this.addRow("Kiln", [kiln.inventory, kiln.woodInventory], y, {
            watch: [fox.inventory],
            outlined: function (inventory, index) {
                var target = kiln.takeTarget(fox);
                return !!target && target.inventory === inventory && target.index === index;
            }
        });
        panel.h = y + kilnRow.h + 10 - panel.y;
        this.bottom = panel.y + panel.h;
        this.bind("Remove", function () {
            this.parts.concat(this.rows).forEach(function (part) { part.destroy(); });
        });
        return this;
    },

    addRow: function(label, inventories, y, options) {
        var row = Crafty.e("InventoryHud").attr({x: 20, y: y}).show(label, inventories, options);
        this.rows.push(row);
        return row;
    },

    enable: function(on) {
        this.parts.forEach(function (part) { part.visible = on; });
        this.rows.forEach(function (row) { row.enable(on); });
        return this;
    }
});
