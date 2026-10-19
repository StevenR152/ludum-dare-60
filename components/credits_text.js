// Odds and ends the menu scenes share. Only CreditsText and menuRule live here; the look they follow is
// the MENU_* palette in constants.js.
Crafty.c("CreditsText", {
    init: function() {
        this.requires('2D, DOM, Text');
        this.attr({w: 250, h: 20, z: 1000, alpha: 0.9});
        this.textAlign("center");
        this.textColor(MENU_DIM_TEXT_COLOR);
        this.unselectable();
        this.textFont({ size: '13px' });
        this.css({fontFamily: MENU_FONT, letterSpacing: "0.5px"});
    }
});

// A hairline of warm light, to sit under a title.
function menuRule(y, width) {
    return Crafty.e("2D, DOM, Color")
        .attr({x: GAME_SCREEN_WIDTH / 2 - width / 2, y: y, w: width, h: 1, z: 2})
        .color("rgba(227, 205, 168, 0.28)");
}

// The mute button reads dark-on-white on the in-game HUD panel, so the dark menus set their own colour.
function menuMuteButton() {
    return Crafty.e("MuteButton").attr({x: 20, y: 20})
        .textColor(MENU_DIM_TEXT_COLOR)
        .css({fontFamily: MENU_FONT});
}

// Spreads CREDITS evenly across the screen at height y.
function showCredits(credits, y) {
    var slotWidth = GAME_SCREEN_WIDTH / credits.length;
    credits.forEach(function (credit, i) {
        Crafty.e("CreditsText")
            .text(credit.role + " by " + credit.name)
            .attr({x: slotWidth * i + (slotWidth - 250) / 2, y: y});
    });
}
