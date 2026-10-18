// The scales on the workbench. Clicking them while the fox touches the bench opens a clay chooser and a
// slider (HTML controls over the game, below the HUD) from WEIGH_STEP_GRAMS to the grams in that clay's
// bench pile, and a Weigh button that weighs that much off the pile into the fox's pack (bench.weigh).
// The panel closes when the fox walks off the bench or every pile runs out.
//   Crafty.e("Scales").attr({x: 10, y: 30, w: 140, h: 140}).forBench(bench);
Crafty.c("Scales", {
    init: function() {
        this.requires("2D, DOM, Color, Text, Mouse, Delay");
        this.color("#C9CED6");
        this.text("Scales").textFont({size: "16px", weight: "bold"}).textColor("#333").unselectable()
            .css({lineHeight: "140px", textAlign: "center"});
        this.panel = null;
        this.bind("Click", this.open);
        this.bind("InventoryChanged", function (changed) {
            if (this.panel && changed === this.bench.pile) {
                this.refresh();
            }
        });
        this.bind("Remove", this.close);
    },

    forBench: function(bench) {
        this.bench = bench;
        return this;
    },

    open: function() {
        if (!this.bench.touchingFox()) {
            showStatus("Walk up to the workbench first");
            return;
        }
        if (this.bench.pile.items.length === 0) {
            showStatus("Wedge some clay on the bench first");
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
        var scales = this;
        var panel = document.createElement("div");
        panel.style.cssText = "position:absolute; left:20px; top:220px; z-index:3000; padding:8px 12px;" +
            "background:rgba(255,255,255,0.9); border-radius:8px; font:bold 16px sans-serif; color:#222;";
        panel.innerHTML = '<select></select> <span class="grams"></span> g <input type="range" style="vertical-align:middle; width:220px">' +
            ' <button>Weigh</button>';
        ["mousedown", "mouseup", "click", "touchstart", "touchend", "touchmove"].forEach(function (type) {
            panel.addEventListener(type, function (e) { e.stopPropagation(); });
        });
        this.chooser = panel.querySelector("select");
        this.chooser.addEventListener("change", function () { scales.refresh(); });
        this.slider = panel.querySelector("input");
        this.gramsLabel = panel.querySelector(".grams");
        this.slider.min = WEIGH_STEP_GRAMS;
        this.slider.step = WEIGH_STEP_GRAMS;
        this.slider.addEventListener("input", function () { scales.gramsLabel.textContent = scales.slider.value; });
        panel.querySelector("button").addEventListener("click", function () {
            if (scales.bench.weigh(scales.chooser.value, Number(scales.slider.value))) {
                scales.refresh();
            }
        });
        Crafty.stage.elem.appendChild(panel);
        return panel;
    },

    // The chooser lists the clays on the bench; the slider range follows the chosen pile. Closes when
    // every pile is gone.
    refresh: function() {
        var piles = this.bench.pile.items;
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
        if (!this.bench.pileClay(this.chooser.value)) {
            this.chooser.value = piles[0].clay.name;
        }
        var pile = this.bench.pileClay(this.chooser.value);
        this.slider.max = pile.clay.weight;
        this.slider.value = Math.min(Number(this.slider.value) || WEIGH_STEP_GRAMS, pile.clay.weight);
        this.gramsLabel.textContent = this.slider.value;
    },

    closeIfAway: function() {
        if (!this.bench.touchingFox()) {
            this.close();
        }
    },

    close: function() {
        this.cancelDelay(this.closeIfAway);
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
    }
});
