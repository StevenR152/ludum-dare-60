// The master potter. Everything he holds is in one inventory of OWL_CAPACITY things: wedged clay and
// models given to him, pots given to him to trim, and finished pots waiting for the fox. He does one
// job at a time, oldest first:
// - throw: wedged clay + a model, given together (receiveFrom) and only when the clay weighs what the
//   model needs (ORDER_CLAY_GRAMS). After POT_MAKE_MS the clay becomes a wet, untrimmed pot and the
//   model goes back to the bench ("ModelReturned").
// - trim: an untrimmed pot (receiveFrom). He judges it as he starts: leather hard comes out trimmed
//   after POT_TRIM_MS; wet collapses and bone dry cracks (pot.cracked). Either way it waits for the fox.
// The clay or pot he is working on shows on his wheel (POTTER_WHEEL). The oldest finished pot shows on his table
// (POTTER_TABLE) until the fox takes it (takePot).
Crafty.c("Potter", {
    init: function() {
        this.requires("2D, Delay, DebugHitbox");
        this.jobs = [];
        this.working = null;
        this.formedPot = null;   // while a throw is nearly done: the pot the clay has become, shown on the wheel
        this.inventory = new Inventory(OWL_CAPACITY, {
            fits: function () { return true; },
            releases: function (item) { return this.isFinished(item); }.bind(this)
        });
        // The oldest finished pot, on the table (POTTER_TABLE).
        this.potBox = Crafty.e("2D, DOM, Color")
            .attr({w: POTTER_TABLE.w, h: POTTER_TABLE.h, visible: false});
        // The clay or pot he is working on sits on his wheel (POTTER_WHEEL).
        this.wheel = Crafty.e("2D, DOM, Color")
            .attr({visible: false});
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                // startNext first, so the wheel shows the job that has just begun.
                this.startNext();
                this.showPot();
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

    // Why he can't trim this pot, or null if he can.
    potProblem: function(pot) {
        if (pot.pot.cracked) {
            return "Hmm, this pot is cracked, the master can't trim it";
        }
        if (pot.pot.trimmed) {
            return "Hmm, this pot is already trimmed";
        }
        if (!isDrying(pot)) {
            return "Hmm, only an unfired pot can be trimmed";
        }
        return null;
    },

    // Takes from the fox what he can work on: a pot to trim (the selected one if he can trim it, else any other in the
    // pack), or else its wedged clay and model together. Returns {gave, status}: whether anything moved, and the
    // line to show (in the fox's voice).
    receiveFrom: function(fox) {
        var pack = fox.inventory;
        var held = pack.selectedItem();
        var pots = pack.items.filter(function (item) { return item.type === "pot"; });
        if (held && held.type === "pot") {
            pots.splice(pots.indexOf(held), 1);
            pots.unshift(held);
        }
        var trimmable = pots.find(function (pot) { return !this.potProblem(pot); }, this);
        if (trimmable) {
            return this.receivePot(pack, trimmable);
        }
        if (held && held.type === "pot") {
            return {gave: false, status: this.potProblem(held)};
        }
        var clayIndex = pack.find(function (item) { return item.state === "wedged"; });
        var modelIndex = pack.find(function (item) { return item.type === "model"; });
        if (clayIndex < 0 && modelIndex < 0) {
            return {gave: false, status: pots.length > 0 ? this.potProblem(pots[0])
                : pack.items.some(function (item) { return item.type === "clay"; })
                    ? "Hmm, I should weigh the clay at the weighing station, then wedge it at the workbench"
                    : "Hmm, I need wedged clay and a model for the master to make pots, or a dried pot to trim"};
        }
        if (modelIndex < 0) {
            return {gave: false, status: "Hmm, I need to bring a model from the workbench too"};
        }
        if (clayIndex < 0) {
            return {gave: false, status: "Hmm, I need to bring wedged clay too"};
        }
        var clay = pack.items[clayIndex];
        var model = pack.items[modelIndex];
        var needed = ORDER_CLAY_GRAMS[model.shape];
        if (clay.clay.weight !== needed) {
            return {gave: false, status: "Hmm, this is " + clay.clay.weight + " g, but I need to give " + needed + " g"};
        }
        if (!this.roomFor(2)) {
            return {gave: false, status: "Hmm, the master's hands are full, I'll come back when he's done"};
        }
        // The job first, so the clay arriving doesn't count as a finished pot.
        this.jobs.push({kind: "throw", items: [clay, model]});
        transferItem(pack, this.inventory, modelIndex);
        transferItem(pack, this.inventory, pack.items.indexOf(clay));
        return {gave: true, status: "I gave the master " + needed + " g of " + clay.clay.name + " clay for a " + model.shape};
    },

    // Hands him this pot (one he can trim) to trim.
    receivePot: function(pack, pot) {
        if (!this.roomFor(1)) {
            return {gave: false, status: "Hmm, the master's hands are full, I'll come back when he's done"};
        }
        this.jobs.push({kind: "trim", items: [pot]});
        transferItem(pack, this.inventory, pack.items.indexOf(pot));
        return {gave: true, status: "I gave the master the pot to trim"};
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
            // The clay is a lump on the wheel for most of the job, then shows as the pot it has become.
            this.delay(function () { this.formPot(job); }, POT_MAKE_MS * (1 - POT_REVEAL_SHARE), 0);
            this.delay(function () { this.finishThrow(job); }, POT_MAKE_MS, 0);
        } else {
            // He feels the pot as he starts; the result shows when he's done.
            var stage = job.items[0].dryStage();
            this.delay(function () { this.finishTrim(job, stage); }, POT_TRIM_MS, 0);
        }
    },

    // The last stretch of a throw: the wheel shows the pot of the model's shape, drawn as the unfired pot it will be.
    formPot: function(job) {
        var clay = job.items[0];
        this.formedPot = Object.create(clay, {
            type: {value: "pot"},
            pot: {value: {shape: job.items[1].shape, glaze: [], cracked: false}}
        });
        this.showPot();
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
        this.formedPot = null;
        Crafty.trigger("PotterDone", pot);
        this.inventory.changed();
    },

    // What is on the wheel: the clay or pot of the job under way (never a model), else null.
    wheelItem: function() {
        return this.working ? this.working.items[0] : null;
    },

    // The wheel shows wheelItem(); the oldest finished pot shows on the table. Both are drawn over the interior's
    // front layer.
    showPot: function() {
        var onWheel = this.formedPot || this.wheelItem();
        this.wheel.attr({x: POTTER_WHEEL.cx - POTTER_WHEEL.w / 2, y: POTTER_WHEEL.cy - POTTER_WHEEL.h / 2,
            w: POTTER_WHEEL.w, h: POTTER_WHEEL.h, z: INTERIOR_FRONT_Z + 1, visible: !!onWheel});
        if (onWheel) {
            paintItem(this.wheel, onWheel);
        }
        var index = this.inventory.find(this.isFinished.bind(this));
        var pot = index >= 0 ? this.inventory.items[index] : null;
        if (pot) {
            this.potBox.attr({
                x: POTTER_TABLE.cx - POTTER_TABLE.w / 2,
                y: POTTER_TABLE.cy - POTTER_TABLE.h / 2,
                z: INTERIOR_FRONT_Z + 1
            });
            paintItem(this.potBox, pot);
        }
        this.potBox.visible = !!pot;
    }
});
