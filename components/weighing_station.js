// The weighing station: a zone square inside the house, used while the fox touches it.
// - Click it with dug clay selected to put that kilo on the station piles (an Inventory with one dug
//   Pottery per clay). Kilos of the same clay add up; different clays sit side by side, one box each.
// - Click it with anything else to open a clay chooser and a slider (HTML controls over the game, below
//   the HUD) from WEIGH_STEP_GRAMS to the grams in that clay's pile, and a Weigh button that weighs that
//   much off the pile into the fox's pack. Each weighed piece is one clay. The weighed piece is then
//   wedged at the Workbench.
// The panel closes when the fox walks off or every pile runs out.
//   Crafty.e("WeighingStation").place(-2730, 467, 280, 70);
Crafty.c("WeighingStation", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision, DebugHitbox");
        this.color(WEIGHING_STATION_COLOR);
        this.pile = new Inventory(Object.keys(CLAY_TYPES).length, {fits: function () { return true; }});
        this.parts = [];
        this.panel = null;
        this.bind("MouseDown", this.use);
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.pile) {
                this.drawPile();
                if (this.panel) {
                    this.refresh();
                }
            }
        });
        this.bind("Remove", function () {
            this.close();
            this.parts.forEach(function (part) { part.destroy(); });
        });
    },

    // The pile boxes are laid out from the station's position, so they are made here rather than in init.
    place: function(x, y, w, h) {
        this.attr({x: x, y: y, w: w, h: h});
        var gap = 4;
        var boxW = (w - gap * (Object.keys(CLAY_TYPES).length + 1)) / Object.keys(CLAY_TYPES).length;
        this.pileBoxes = {};
        Object.keys(CLAY_TYPES).forEach(function (name, col) {
            var box = Crafty.e("2D, DOM, Color, Text")
                .attr({x: x + gap + col * (boxW + gap), y: y + gap, w: boxW, h: h - gap * 2, z: this.z + 1})
                .textFont({size: "12px", weight: "bold"}).textColor("#FFF").unselectable()
                .css({lineHeight: (h - gap * 2) + "px", textAlign: "center", textShadow: "0 0 3px #000"});
            this.pileBoxes[name] = box;
            this.parts.push(box);
        }, this);
        this.drawPile();
        return this;
    },

    drawPile: function() {
        Object.keys(this.pileBoxes).forEach(function (name) {
            var clay = this.pileClay(name);
            paintItem(this.pileBoxes[name], clay);
            if (!clay) {
                this.pileBoxes[name].color("rgba(255, 255, 255, 0.25)");
            }
            this.pileBoxes[name].text(clay ? name + " " + clay.clay.weight + " g" : "");
        }, this);
    },

    // The dug Pottery of that clay on the station, or null.
    pileClay: function(name) {
        return this.pile.items.find(function (item) { return item.clay.name === name; }) || null;
    },

    touchingFox: function() {
        var hits = this.hit("Fox");
        return hits ? hits[0].obj : null;
    },

    use: function() {
        var fox = this.touchingFox();
        if (!fox) {
            showStatus("Walk up to the weighing station first");
            return;
        }
        var held = fox.inventory.selectedItem();
        if (held && held.type === "clay" && held.state === "dug") {
            this.deposit(fox);
        } else {
            this.open();
        }
    },

    // Puts the fox's selected dug kilo on the pile of its clay.
    deposit: function(fox) {
        var clay = fox.inventory.take();
        var pile = this.pileClay(clay.clay.name);
        if (pile) {
            pile.clay.weight += clay.clay.weight;
            this.pile.changed();
        } else {
            this.pile.add(clay);
        }
        showStatus("Put " + clay.clay.weight + " g of " + clay.clay.name + " clay on the scales (" + this.pileClay(clay.clay.name).clay.weight + " g)");
    },

    open: function() {
        if (this.pile.items.length === 0) {
            showStatus("Put some dug clay on the scales first");
            return;
        }
        if (!this.panel) {
            this.panel = this.makePanel();
            this.delay(this.closeIfAway, 200, -1);
        }
        this.refresh();
    },

    // Plain DOM, so the range input works as a browser control. Events stop here so Crafty's
    // mouse handling on the stage doesn't treat them as clicks in the game.
    makePanel: function() {
        var station = this;
        var panel = document.createElement("div");
        panel.style.cssText = "position:absolute; left:20px; top:220px; z-index:3000; padding:8px 12px;" +
            "background:rgba(255,255,255,0.9); border-radius:8px; font:bold 16px sans-serif; color:#222;";
        panel.innerHTML = '<select></select> <span class="grams"></span> g <input type="range" style="vertical-align:middle; width:220px">' +
            ' <button>Weigh</button>';
        ["mousedown", "mouseup", "click", "touchstart", "touchend", "touchmove"].forEach(function (type) {
            panel.addEventListener(type, function (e) { e.stopPropagation(); });
        });
        this.chooser = panel.querySelector("select");
        this.chooser.addEventListener("change", function () { station.refresh(); });
        this.slider = panel.querySelector("input");
        this.gramsLabel = panel.querySelector(".grams");
        this.slider.min = WEIGH_STEP_GRAMS;
        this.slider.step = WEIGH_STEP_GRAMS;
        this.slider.addEventListener("input", function () { station.gramsLabel.textContent = station.slider.value; });
        panel.querySelector("button").addEventListener("click", function () {
            if (station.weigh(station.chooser.value, Number(station.slider.value))) {
                station.refresh();
            }
        });
        Crafty.stage.elem.appendChild(panel);
        return panel;
    },

    // The chooser lists the clays on the station; the slider range follows the chosen pile. Closes when
    // every pile is gone.
    refresh: function() {
        var piles = this.pile.items;
        if (piles.length === 0) {
            this.close();
            return;
        }
        var chosen = this.chooser.value;
        this.chooser.innerHTML = "";
        piles.forEach(function (item) {
            var option = document.createElement("option");
            option.value = option.textContent = item.clay.name;
            this.chooser.appendChild(option);
        }, this);
        this.chooser.value = chosen;
        if (!this.pileClay(this.chooser.value)) {
            this.chooser.value = piles[0].clay.name;
        }
        var pile = this.pileClay(this.chooser.value);
        this.slider.max = pile.clay.weight;
        this.slider.value = Math.min(Number(this.slider.value) || WEIGH_STEP_GRAMS, pile.clay.weight);
        this.gramsLabel.textContent = this.slider.value;
    },

    closeIfAway: function() {
        if (!this.touchingFox()) {
            this.close();
        }
    },

    close: function() {
        this.cancelDelay(this.closeIfAway);
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
    },

    // Gives the fox `grams` of the named clay's pile as weighed clay. Returns false (and changes nothing) if it can't.
    weigh: function(name, grams) {
        var fox = this.touchingFox();
        var pile = this.pileClay(name);
        if (!fox || !pile) {
            return false;
        }
        var piece = pile.weighOut(grams);
        if (!piece) {
            showStatus("There are only " + pile.clay.weight + " g on the scales");
            return false;
        }
        if (!fox.pickUp(piece)) {
            pile.clay.weight += grams;
            return false;
        }
        if (pile.clay.weight === 0) {
            this.pile.take(this.pile.items.indexOf(pile));
        } else {
            this.pile.changed();
        }
        showStatus("Weighed out " + grams + " g of " + piece.clay.name + " clay, wedge it at the workbench");
        return true;
    }
});
