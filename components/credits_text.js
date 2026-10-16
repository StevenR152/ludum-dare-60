Crafty.c("CreditsText", {
    init: function() {
        this.requires('2D, DOM, Text');
        this.attr({w: 250, h: 20, z: 1000, alpha: 0.9});
        this.textAlign("center");
        this.textColor('#555');
        this.unselectable();
        this.textFont({ size: '12px', weight: "bold" });
    }
});

// Spreads CREDITS evenly across the screen at height y.
function showCredits(credits, y) {
    var slotWidth = GAME_SCREEN_WIDTH / credits.length;
    credits.forEach(function (credit, i) {
        Crafty.e("CreditsText")
            .text(credit.role + " by " + credit.name)
            .attr({x: slotWidth * i + (slotWidth - 250) / 2, y: y});
    });
}
