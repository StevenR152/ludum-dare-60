// The weighing station: a zone square inside the house, used while the fox touches it.
// - Click it with dug clay selected to put that kilo on the station piles (an Inventory with one dug
//   Pottery per clay). Kilos of the same clay add up; different clays sit side by side, one box each.
// - Click it with anything else to open a clay chooser and a slider (HTML controls over the game, below
//   the HUD) from WEIGH_STEP_GRAMS to the grams in that clay's pile, and a Weigh button that weighs that
//   much off the pile into the fox's pack. Each weighed piece is one clay. The weighed piece is then
//   wedged at the Workbench.
// The panel closes when the fox walks off or every pile runs out.
//   Crafty.e("WeighingStation").place(-2730, 467, 280, 70);

// The weighing panel's stylesheet, in the HUD's look: a parchment card, a clay chooser with the clay's colour
// down its edge, the grams in large type, a slider whose filled part and handle are clay brown, and a Weigh
// button like the menu buttons. Built from the MENU_* and HUD_* constants so it follows them.
function weighPanelCss() {
    var thumb = "width: 20px; height: 20px; border-radius: 50%; background: " + MENU_BUTTON_COLOR + ";" +
        " border: 3px solid #FAF2E2; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4); cursor: pointer;";
    var arrow = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"><path d="M0 0 L5 6 L10 0 Z" fill="#3B2A1D"/></svg>') + "\")";
    return [
        ".weigh-panel { display: flex; align-items: center; gap: 12px; padding: 10px 14px;" +
            " background: " + HUD_PANEL_COLOR + "; border: 1px solid rgba(122, 74, 43, 0.28); border-radius: 10px;" +
            " box-shadow: 0 3px 12px rgba(40, 26, 16, 0.28); font-family: " + MENU_FONT + "; color: " + HUD_TEXT_COLOR + "; }",
        ".weigh-panel select { -webkit-appearance: none; appearance: none; font: 600 16px " + MENU_FONT + ";" +
            " color: " + HUD_TEXT_COLOR + "; text-transform: capitalize; cursor: pointer; padding: 5px 26px 5px 9px;" +
            " background: #EADBBE " + arrow + " no-repeat right 9px center; border: 1px solid rgba(122, 74, 43, 0.45);" +
            " border-left-width: 6px; border-radius: 6px; }",
        ".weigh-panel .weigh-amount { font: 700 20px " + MENU_FONT + "; min-width: 4.4em; text-align: right;" +
            " font-variant-numeric: tabular-nums; white-space: nowrap; }",
        ".weigh-panel input[type=range] { -webkit-appearance: none; appearance: none; width: 220px; height: 8px;" +
            " margin: 0; border-radius: 4px; outline: none; cursor: pointer; background: linear-gradient(to right, " +
            MENU_BUTTON_COLOR + " 0 var(--fill, 0%), rgba(122, 74, 43, 0.22) var(--fill, 0%) 100%); }",
        ".weigh-panel input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; " + thumb + " }",
        ".weigh-panel input[type=range]::-moz-range-thumb { " + thumb + " }",
        ".weigh-panel input[type=range]::-moz-range-track { background: transparent; }",
        ".weigh-panel button { font: 600 17px " + MENU_FONT + "; color: " + MENU_TEXT_COLOR + "; cursor: pointer;" +
            " background: " + MENU_BUTTON_COLOR + "; border: none; border-bottom: 2px solid rgba(0, 0, 0, 0.3);" +
            " border-radius: 8px; padding: 6px 18px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);" +
            " text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45); }",
        ".weigh-panel button:hover { background: " + MENU_BUTTON_HOVER_COLOR + "; }",
        ".weigh-panel button:active { transform: translateY(1px); }"
    ].join("\n");
}

Crafty.c("WeighingStation", {
    init: function() {
        this.requires("2D, DOM, Color, Mouse, Delay, Collision, DebugHitbox");
        this.color(WEIGHING_STATION_COLOR);
        this.css({borderRadius: "8px", border: "2px solid rgba(40, 26, 16, 0.55)", boxSizing: "border-box",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)"});
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
                .textFont({size: "13px", weight: "700"}).textColor(MENU_TEXT_COLOR).unselectable()
                .css({fontFamily: MENU_FONT, lineHeight: (h - gap * 2) + "px", textAlign: "center",
                    textShadow: "0 1px 3px rgba(0, 0, 0, 0.85)", textTransform: "capitalize", borderRadius: "6px",
                    boxSizing: "border-box"});
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
            this.pileBoxes[name].css({border: clay ? "none" : "1px dashed rgba(250, 242, 226, 0.35)"});
            if (!clay) {
                this.pileBoxes[name].color(WEIGHING_EMPTY_PILE_COLOR);
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
            showStatus("I can't reach the weighing station from here");
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
    // mouse handling on the stage doesn't treat them as clicks in the game. Its look is the HUD's (parchment,
    // Alegreya, clay buttons): see weighPanelCss, injected once.
    makePanel: function() {
        var station = this;
        if (!document.getElementById("weighPanelStyle")) {
            var style = document.createElement("style");
            style.id = "weighPanelStyle";
            style.textContent = weighPanelCss();
            document.head.appendChild(style);
        }
        var panel = document.createElement("div");
        panel.className = "weigh-panel";
        // Beside the HUD's inventory panel and under Restart/Menu (WEIGH_PANEL_X, WEIGH_PANEL_Y), where it covers
        // nothing; it used to sit on top of the inventory panel's lower rows.
        panel.style.cssText = "position:absolute; left:calc(" + WEIGH_PANEL_X + "px * var(--game-scale, 1));" +
            " top:calc(" + WEIGH_PANEL_Y + "px * var(--game-scale, 1)); z-index:3000;" +
            "transform:scale(var(--game-scale, 1)); transform-origin:0 0;";
        panel.innerHTML = '<select></select><span class="weigh-amount"><span class="grams"></span> g</span>' +
            '<input type="range"><button>Weigh</button>';
        ["mousedown", "mouseup", "click", "touchstart", "touchend", "touchmove"].forEach(function (type) {
            panel.addEventListener(type, function (e) { e.stopPropagation(); });
        });
        this.chooser = panel.querySelector("select");
        this.chooser.addEventListener("change", function () { station.refresh(); });
        this.slider = panel.querySelector("input");
        this.gramsLabel = panel.querySelector(".grams");
        this.slider.min = WEIGH_STEP_GRAMS;
        this.slider.step = WEIGH_STEP_GRAMS;
        this.slider.addEventListener("input", function () {
            station.gramsLabel.textContent = station.slider.value;
            station.paintSlider();
        });
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
        // The chooser wears the chosen clay's colour down its left edge.
        this.chooser.style.borderLeftColor = CLAY_TYPES[this.chooser.value].color;
        this.paintSlider();
    },

    // A native range input can't colour the part left of its thumb, so the track is a gradient filled up to
    // the slider's value (the --fill variable the panel css reads).
    paintSlider: function() {
        var min = Number(this.slider.min);
        var max = Number(this.slider.max);
        var share = max > min ? (Number(this.slider.value) - min) / (max - min) : 1;
        this.slider.style.setProperty("--fill", Math.round(share * 100) + "%");
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
        Crafty.trigger("ClayWeighed");
        showStatus("Weighed out " + grams + " g of " + piece.clay.name + " clay, wedge it at the workbench");
        return true;
    }
});
