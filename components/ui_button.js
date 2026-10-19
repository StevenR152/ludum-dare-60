// Named UIButton because Crafty 0.9 has its own built-in "Button" component. HudButton is the same button
// on the HUD layer, fixed on screen while the camera moves (in a game scene).
// Text button until art exists:
//   Crafty.e("UIButton").label("Play").attr({x: 100, y: 100}).onClick(fn);
// Then swap in sprites from assets.js (hover sprite optional):
//   .sprites("play_button", "play_button_hover")
Crafty.c("UIButton", {
    init: function() {
        this.requires("DOM, ButtonBase");
    }
});

Crafty.c("HudButton", {
    init: function() {
        this.requires("HUD, ButtonBase");
    }
});

Crafty.c("ButtonBase", {
    init: function() {
        this.requires("2D, Mouse, Text");
        this.attr({w: 160, h: 48, z: 1000});
        this.textAlign("center").textFont({ size: '20px', weight: 'bold' }).textColor('#EEE').unselectable();
        this.css({ cursor: 'pointer', 'line-height': '48px', 'background-color': '#444', 'border-radius': '6px' });
        this.normalSprite = null;
        this.hoverSprite = null;
        this.bind("MouseOver", function () { this.setHover(true); });
        this.bind("MouseOut", function () { this.setHover(false); });
    },

    label: function(text) {
        return this.text(text);
    },

    onClick: function(callback) {
        this.bind("Click", callback);
        return this;
    },

    sprites: function(normalSprite, hoverSprite) {
        this.normalSprite = normalSprite;
        this.hoverSprite = hoverSprite || null;
        this.text("");
        this.css({ 'background-color': 'transparent' });
        return this.showSprite(normalSprite, hoverSprite);
    },

    setHover: function(hovering) {
        if (this.normalSprite) {
            if (this.hoverSprite) {
                this.showSprite(hovering ? this.hoverSprite : this.normalSprite,
                                hovering ? this.normalSprite : this.hoverSprite);
            }
        } else {
            this.css({ 'background-color': hovering ? '#666' : '#444' });
        }
    },

    // Swapping sprite components resets size, so keep the button's size.
    showSprite: function(show, hide) {
        var size = {w: this.w, h: this.h};
        if (hide) {
            this.removeComponent(hide);
        }
        this.addComponent(show);
        return this.attr(size);
    }
});
