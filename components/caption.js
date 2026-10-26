// A small centred text label for a station inside the house, destroyed with the entity it names.
//   Crafty.e("Caption").caption("Wedging", x, y, w, z, workbench);
Crafty.c("Caption", {
    init: function() {
        this.requires("2D, DOM, Text");
        this.textFont({size: '12px', weight: '700'}).textColor(CAPTION_COLOR).unselectable()
            .css({fontFamily: MENU_FONT, textAlign: 'center'});
    },

    caption: function(text, x, y, w, z, owner) {
        this.attr({x: x, y: y, w: w, h: 20, z: z}).text(text);
        owner.bind("Remove", function () { this.destroy(); }.bind(this));
        return this;
    }
});
