// Glazing station: one bucket square per GLAZE_BUCKET_COLORS entry (Glaze A orange, Glaze B pink).
// Clicking a bucket while the fox touches it dips the fox's selected bisque-fired pot: the bucket's
// name is added to pot.glaze, at most worldRules.maxGlazeDips dips and one per bucket, in dipping order.
// A pot that is never dipped is unglazed; either way it goes back to the kiln for its glaze firing.
// Buckets are placed one position each, in GLAZE_BUCKET_COLORS order:
//   Crafty.e("GlazeStation").station([{x: -1525, y: 572}, {x: -1430, y: 617}], player);
Crafty.c("GlazeStation", {
    station: function(positions, fox) {
        var names = Object.keys(GLAZE_BUCKET_COLORS);
        for (var i = 0; i < names.length; i++) {
            // The art is a full inside-map canvas with the bucket already in place; the hitbox sits over it.
            Crafty.e("2D, DOM, " + GLAZE_BUCKET_SPRITES[names[i]])
                .attr(INSIDE_MAP_BOX).attr({z: -1});   // same layer as the mid interior, made after it so it draws over it, but under the fox (z 0)
            var bucket = Crafty.e("2D, DOM, Mouse, DebugHitbox")
                .attr({x: positions[i].x, y: positions[i].y, w: 80, h: 50});
            bucket.glazeName = names[i];
            bucket.bind("MouseDown", function () {
                if (fox.touches(this)) {
                    dipPot(fox, this.glazeName);
                } else {
                    showStatus("I can't reach the glaze bucket from here");
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
    if (pot.pot.glaze.length >= worldRules.maxGlazeDips) {
        showStatus("This pot can't take another glaze");
        return;
    }
    if (pot.state === "cooled") {
        pot.advance("glazed");
    }
    pot.pot.glaze.push(glazeName);
    Crafty.trigger("PotGlazed", pot);
    fox.inventory.changed();
    showStatus("Dipped the pot in " + glazeName);
}
