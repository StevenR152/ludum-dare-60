// The master potter. Everything he holds is in one inventory of OWL_CAPACITY things: wedged clay and
// models given to him, pots given to him to trim, and finished pots waiting for the fox. He does one
// job at a time, oldest first:
// - throw: wedged clay + a model, given together (receiveFrom) and only when the clay weighs what the
//   model needs (ORDER_CLAY_GRAMS). After POT_MAKE_MS the clay becomes a wet, untrimmed pot and the
//   model goes back to the bench ("ModelReturned").
// - trim: an untrimmed pot (receiveFrom). He judges it as he starts: leather hard comes out trimmed
//   after POT_TRIM_MS; wet collapses and bone dry cracks (pot.cracked). Either way it waits for the fox.
// Finished pots show as a box on him until the fox takes them (takePot).
Crafty.c("Potter", {
    init: function() {
        this.requires("2D, Delay");
        this.jobs = [];
        this.working = null;
        this.inventory = new Inventory(OWL_CAPACITY, {
            fits: function () { return true; },
            releases: function (item) { return this.isFinished(item); }.bind(this)
        });
        this.potBox = Crafty.e("2D, DOM, Color")
            .attr({w: 40, h: 40, visible: false})
            .color(POT_COLOR);
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.showPot();
                this.startNext();
            }
        });
    },

    // A pot waiting for the fox: not part of a job still to do or under way.
    isFinished: function(item) {
        return item.type === "pot" && !this.jobs.some(function (job) { return job.items.indexOf(item) >= 0; });
    },

    roomFor: function(count) {
        return this.inventory.items.length + count <= this.inventory.capacity;
    },

    // Gives him the fox's selected untrimmed pot to trim, or else its weighed clay and model together.
    // Returns a status to show.
    receiveFrom: function(fox) {
        var pack = fox.inventory;
        var held = pack.selectedItem();
        if (held && held.type === "pot") {
            return this.receivePot(pack, held);
        }
        var clayIndex = pack.find(function (item) { return item.state === "wedged"; });
        var modelIndex = pack.find(function (item) { return item.type === "model"; });
        if (clayIndex < 0 && modelIndex < 0) {
            return pack.items.some(function (item) { return item.type === "clay"; })
                ? "Weigh the clay at the weighing station, then wedge it at the workbench"
                : "The master needs wedged clay and a model to make pots, or a pot to trim";
        }
        if (modelIndex < 0) {
            return "Bring a model from the workbench too";
        }
        if (clayIndex < 0) {
            return "Bring wedged clay too";
        }
        var clay = pack.items[clayIndex];
        var model = pack.items[modelIndex];
        var needed = ORDER_CLAY_GRAMS[model.shape];
        if (clay.clay.weight !== needed) {
            return "That's " + clay.clay.weight + " g, a " + model.shape + " needs " + needed + " g";
        }
        if (!this.roomFor(2)) {
            return "The master's hands are full, come back when he's done";
        }
        // The job first, so the clay arriving doesn't count as a finished pot.
        this.jobs.push({kind: "throw", items: [clay, model]});
        transferItem(pack, this.inventory, modelIndex);
        transferItem(pack, this.inventory, pack.items.indexOf(clay));
        return "Gave the master " + needed + " g of " + clay.clay.name + " clay for a " + model.shape;
    },

    receivePot: function(pack, pot) {
        if (pot.pot.cracked) {
            return "This pot is cracked, the master can't trim it";
        }
        if (pot.pot.trimmed) {
            return "This pot is already trimmed";
        }
        if (!isDrying(pot)) {
            return "Only an unfired pot can be trimmed";
        }
        if (!this.roomFor(1)) {
            return "The master's hands are full, come back when he's done";
        }
        this.jobs.push({kind: "trim", items: [pot]});
        transferItem(pack, this.inventory);
        return "Gave the master the pot to trim";
    },

    // The oldest finished pot to the fox, or false.
    takePot: function(fox) {
        var index = this.inventory.find(this.isFinished.bind(this));
        return index >= 0 && transferItem(this.inventory, fox.inventory, index);
    },

    hasFinishedPot: function() {
        return this.inventory.find(this.isFinished.bind(this)) >= 0;
    },

    startNext: function() {
        if (this.working || this.jobs.length === 0) {
            return;
        }
        var job = this.working = this.jobs[0];
        Crafty.trigger("PotterWorking", job.items[0]);
        if (job.kind === "throw") {
            this.delay(function () { this.finishThrow(job); }, POT_MAKE_MS, 0);
        } else {
            // He feels the pot as he starts; the result shows when he's done.
            var stage = job.items[0].dryStage();
            this.delay(function () { this.finishTrim(job, stage); }, POT_TRIM_MS, 0);
        }
    },

    finishThrow: function(job) {
        var pottery = job.items[0];
        var model = job.items[1];
        this.inventory.pull(this.inventory.items.indexOf(model));
        this.inventory.pull(this.inventory.items.indexOf(pottery));
        pottery.advance("thrown", model);
        Crafty.trigger("ModelReturned", model);
        this.inventory.items.push(pottery);
        this.endJob(pottery);
    },

    finishTrim: function(job, stage) {
        var pot = job.items[0];
        if (stage === "leatherHard") {
            pot.pot.trimmed = true;
            showStatus("The master trimmed the pot");
        } else {
            pot.pot.cracked = true;
            Crafty.trigger("PotCracked", pot);
            showStatus(stage === "wet"
                ? "The pot was too wet: it collapsed as the master trimmed it"
                : "The pot was bone dry: it cracked as the master trimmed it");
        }
        this.endJob(pot);
    },

    // Triggers "PotterDone" with the pot he has just put down (for sounds).
    endJob: function(pot) {
        this.jobs.shift();
        this.working = null;
        Crafty.trigger("PotterDone", pot);
        this.inventory.changed();
    },

    // Low on the owl, centred; placed now because the owl's position is set after init.
    showPot: function() {
        var index = this.inventory.find(this.isFinished.bind(this));
        if (index >= 0) {
            var pot = this.inventory.items[index];
            this.potBox.attr({
                x: this.x + (this.w - this.potBox.w) / 2,
                y: this.y + this.h - this.potBox.h - 10,
                z: this.z + 1
            }).color(itemColor(pot));
            markCracked(this.potBox, pot);
            markBorder(this.potBox, pot);
        }
        this.potBox.visible = index >= 0;
    }
});
