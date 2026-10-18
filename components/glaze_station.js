// Placeholder glazing station: two bucket squares, Glaze A (yellow) and Glaze B (red).
// Not interactive yet.
//   Crafty.e("GlazeStation").station(INSIDE_X + 800, 780);
Crafty.c("GlazeStation", {
    station: function(x, y) {
        var names = Object.keys(GLAZE_BUCKET_COLORS);
        for (var i = 0; i < names.length; i++) {
            Crafty.e("2D, DOM, Color")
                .attr({x: x + i * 90, y: y, w: 70, h: 70})
                .color(GLAZE_BUCKET_COLORS[names[i]]);
        }
        return this;
    }
});
