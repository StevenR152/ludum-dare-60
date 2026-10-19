// Out-of-bounds map: answers "can this box stand here?" from one painted mask per area (COLLISION_AREAS in
// constants.js). Opaque mask pixels (alpha >= COLLISION_ALPHA) are blocked, transparent ones walkable, and
// anything outside every area is blocked. Used by the Fox's feet (Fox.keepInBounds) and by dropped items.
//   collisionMap.load();                                  // once per Game scene, after the masks are preloaded
//   collisionMap.isBoxBlocked(x, y, w, h);                // true if any sampled point is blocked
//   collisionMap.nearestFree(x, y, w, h);                 // {x, y} of the closest clear spot, or null
var collisionMap = {
    areas: [],

    // Reads each preloaded mask into a grid of blocked flags the size of its world box (one cell per world px),
    // so masks can be painted at any resolution with that aspect ratio.
    load: function() {
        this.areas = COLLISION_AREAS.map(function (area) {
            var cols = Math.round(area.w);
            var rows = Math.round(area.h);
            var image = Crafty.asset(area.mask);
            var blocked = null;
            if (image) {
                var canvas = document.createElement("canvas");
                canvas.width = cols;
                canvas.height = rows;
                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, cols, rows);
                var rgba = context.getImageData(0, 0, cols, rows).data;
                blocked = new Uint8Array(cols * rows);
                for (var i = 0; i < blocked.length; i++) {
                    blocked[i] = rgba[i * 4 + 3] >= COLLISION_ALPHA ? 1 : 0;
                }
            } else {
                console.error("Collision mask not loaded: " + area.mask + " (area " + area.name + " is walkable everywhere)");
            }
            return {name: area.name, x: area.x, y: area.y, w: area.w, h: area.h, cols: cols, rows: rows, blocked: blocked};
        });
    },

    isBlockedAt: function(x, y) {
        if (this.areas.length === 0) {
            return false;
        }
        for (var i = 0; i < this.areas.length; i++) {
            var a = this.areas[i];
            if (x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h) {
                if (!a.blocked) {
                    return false;
                }
                var col = Math.min(a.cols - 1, Math.floor((x - a.x) * a.cols / a.w));
                var row = Math.min(a.rows - 1, Math.floor((y - a.y) * a.rows / a.h));
                return a.blocked[row * a.cols + col] === 1;
            }
        }
        return true;
    },

    // Samples the box's edges and inside every COLLISION_SAMPLE_STEP px.
    isBoxBlocked: function(x, y, w, h) {
        var nx = Math.max(1, Math.ceil(w / COLLISION_SAMPLE_STEP));
        var ny = Math.max(1, Math.ceil(h / COLLISION_SAMPLE_STEP));
        for (var j = 0; j <= ny; j++) {
            var py = y + Math.min(h - 0.01, h * j / ny);
            for (var i = 0; i <= nx; i++) {
                if (this.isBlockedAt(x + Math.min(w - 0.01, w * i / nx), py)) {
                    return true;
                }
            }
        }
        return false;
    },

    // The box's own spot if it is clear, else the closest clear spot in widening rings around it (up to
    // COLLISION_SNAP_RADIUS); null if there is none.
    nearestFree: function(x, y, w, h) {
        if (!this.isBoxBlocked(x, y, w, h)) {
            return {x: x, y: y};
        }
        for (var r = COLLISION_SNAP_STEP; r <= COLLISION_SNAP_RADIUS; r += COLLISION_SNAP_STEP) {
            var points = Math.ceil(2 * Math.PI * r / COLLISION_SNAP_STEP);
            for (var k = 0; k < points; k++) {
                var angle = 2 * Math.PI * k / points;
                var cx = x + r * Math.cos(angle);
                var cy = y + r * Math.sin(angle);
                if (!this.isBoxBlocked(cx, cy, w, h)) {
                    return {x: cx, y: cy};
                }
            }
        }
        return null;
    },

    // Debug: paint every blocked pixel solid red and show it over its area at exactly DEBUG_MASK_ALPHA (the
    // layers are made in main.js), so the overlay shows what the game really blocks, whatever the PNGs' opacity.
    showDebug: function() {
        this.areas.forEach(function (area) {
            if (!area.blocked) {
                return;
            }
            var canvas = document.createElement("canvas");
            canvas.width = area.cols;
            canvas.height = area.rows;
            var context = canvas.getContext("2d");
            var picture = context.createImageData(area.cols, area.rows);
            for (var i = 0; i < area.blocked.length; i++) {
                if (area.blocked[i] === 1) {
                    picture.data[i * 4] = 255;
                    picture.data[i * 4 + 3] = 255;
                }
            }
            context.putImageData(picture, 0, 0);
            Crafty.e("2D, DOM, DebugMaskLayer")
                .attr({x: area.x, y: area.y, w: area.w, h: area.h, z: 1, alpha: DEBUG_MASK_ALPHA})
                .css({backgroundImage: 'url("' + canvas.toDataURL("image/png") + '")', backgroundSize: "100% 100%", pointerEvents: "none"});
        });
    }
};
