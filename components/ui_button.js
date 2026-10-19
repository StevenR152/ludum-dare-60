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
        this.textAlign("center").textFont({ size: '21px', weight: '600' }).textColor(MENU_TEXT_COLOR).unselectable();
        this.css({
            cursor: 'pointer', 'line-height': '48px', 'background-color': MENU_BUTTON_COLOR,
            'border-radius': '8px', 'font-family': MENU_FONT, 'letter-spacing': '0.5px',
            'border-bottom': '2px solid rgba(0, 0, 0, 0.30)',
            'box-shadow': '0 3px 10px rgba(0, 0, 0, 0.35)',
            'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.45)',
            transition: 'background-color 120ms ease'
        });
        this.normalSprite = null;
        this.hoverSprite = null;
        // A locked button is shown but does nothing: it keeps its place in the list so the player can see
        // what is still to come (see LevelSelect).
        this.isLocked = false;
        // The sound played on click; set to "uiSelect" or "uiBack" for those buttons.
        this.clickSound = "uiConfirm";
        this.bind("MouseOver", function () { audioController.playSfx("uiHover"); this.setHover(true); });
        this.bind("Click", function () { audioController.playSfx(this.clickSound); });
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
        } else if (!this.isLocked) {
            this.css({ 'background-color': hovering ? MENU_BUTTON_HOVER_COLOR : MENU_BUTTON_COLOR });
        }
    },

    // Dims the button and stops it reacting: no hover colour, no hover sound, no pointer.
    locked: function() {
        this.isLocked = true;
        this.css({
            'background-color': MENU_BUTTON_LOCKED_COLOR, cursor: 'default',
            'box-shadow': 'none', 'border-bottom': '2px solid rgba(0, 0, 0, 0.18)'
        });
        this.textColor(MENU_DIM_TEXT_COLOR);
        this.unbind("MouseOver");
        return this;
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
