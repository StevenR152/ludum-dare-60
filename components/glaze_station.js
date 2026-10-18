// Glazing station: one bucket square per GLAZE_BUCKET_COLORS entry (Glaze A yellow, Glaze B red).
// Clicking a bucket while the fox touches it dips the fox's selected bisque-fired pot: the bucket's
// name is added to pot.glaze, at most MAX_GLAZE_DIPS dips and one per bucket, in dipping order.
// A pot that is never dipped is unglazed; either way it goes back to the kiln for its glaze firing.
//   Crafty.e("GlazeStation").station(INSIDE_X + 800, 780, player);
Crafty.c("GlazeStation", {
    station: function(x, y, fox) {
        var names = Object.keys(GLAZE_BUCKET_COLORS);
        for (var i = 0; i < names.length; i++) {
            var bucket = Crafty.e("2D, DOM, Color, Mouse")
                .attr({x: x + i * 90, y: y, w: 70, h: 70})
                .color(GLAZE_BUCKET_COLORS[names[i]]);
            bucket.glazeName = names[i];
            bucket.bind("Click", function () {
                if (this.intersect(fox.x, fox.y, fox.w, fox.h)) {
                    dipPot(fox, this.glazeName);
                } else {
                    showStatus("Walk up to the glaze bucket first");
                }
            });
        }
        return this;
    }
});

function dipPot(fox, glazeName) {
    var pot = fox.inventory.selectedItem();
    if (!pot || pot.type !== "pot" || (pot.state !== "cooled" && pot.state !== "glazed")) {
        showStatus("Only a pot fresh from its first firing can be glazed");
        return;
    }
    if (pot.pot.glaze.indexOf(glazeName) >= 0) {
        showStatus("This pot has already been dipped in " + glazeName);
        return;
    }
    if (pot.pot.glaze.length >= MAX_GLAZE_DIPS) {
        showStatus("This pot can't take another glaze");
        return;
    }
    if (pot.state === "cooled") {
        pot.advance("glazed");
    }
    pot.pot.glaze.push(glazeName);
    fox.inventory.changed();
    showStatus("Dipped the pot in " + glazeName);
}
