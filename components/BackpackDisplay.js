// One slot of the backpack strip in the HUD. Fox.drawBackpack creates these.
//   Crafty.e("BackpackDisplay").attr({x: 20, y: 60, w: 40, h: 40}).clay(CLAY_TYPES.brown).selected(true);
Crafty.c("BackpackDisplay", {
    init: function() {
        this.requires("2D, HUD, Color");
    },

    clay: function(type) {
        this.clayType = type;
        return this.color(type.color);
    },

    // The slot SPACE will drop gets a white outline.
    selected: function(isSelected) {
        this.css({ boxSizing: 'border-box', border: isSelected ? '3px solid #FFF' : 'none' });
        return this;
    }
});
