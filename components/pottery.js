// Clay on its way from the dig to the completed shelf. It has clay (name and colour copied from the
// clay type, weight in grams), a pot (null until the owl throws it) and a state that only moves along
// `states` (POTTERY_STATES by default): advance(to) works for the next state, or when every state
// skipped is optional.
//   var pottery = new Pottery(CLAY_TYPES.black);   // state "dug", 1000 g
//   var piece = pottery.weighOut(200);              // a new "weighed" 200 g Pottery off a "dug" pile; the pile keeps the rest
//   piece.advance("wedged");                        // true; piece.advance("firing") would be false
// A thrown pot also has a dryness (0 wet .. 1 bone dry, see dryStage and dry) and a trimmed flag.
// `type` is "clay" until there is a pot, then "pot", so Inventory's one-type rule works as before.
function Pottery(clayType, states) {
    this.states = states || POTTERY_STATES;
    this.clay = {name: clayType.name, letter: clayType.letter, color: clayType.color, fireLevel: clayType.fireLevel, wedged: false, weight: DUG_CLAY_GRAMS};
    this.pot = null;
    this.state = this.states[0].name;
}

// A ready-made unfired pot, thrown from a CLAY_TYPES key and an ORDER_SHAPES name, trimmed and bone dry (for
// levels that start with pots lying around).
function makePot(clayKey, shape) {
    var pottery = new Pottery(CLAY_TYPES[clayKey]);
    pottery.clay.weight = ORDER_CLAY_GRAMS[shape];
    pottery.advance("weighed");
    pottery.advance("wedged");
    pottery.advance("thrown", {shape: shape});
    pottery.pot.dryness = 1;
    pottery.pot.trimmed = true;
    return pottery;
}

Pottery.prototype = {
    get type() {
        return this.pot ? "pot" : "clay";
    },

    indexOf: function (name) {
        return this.states.findIndex(function (state) { return state.name === name; });
    },

    // True while the pottery has not yet reached the named state.
    before: function (name) {
        return this.indexOf(this.state) < this.indexOf(name);
    },

    // Throwing needs the model to copy.
    canAdvance: function (to, model) {
        if (to === "thrown" && !model) {
            return false;
        }
        var from = this.indexOf(this.state);
        var target = this.indexOf(to);
        if (target <= from) {
            return false;
        }
        for (var i = from + 1; i < target; i++) {
            if (!this.states[i].optional) {
                return false;
            }
        }
        return true;
    },

    // Takes `grams` off this dug pile as a new weighed Pottery of the same clay, or returns null.
    weighOut: function (grams) {
        if (this.state !== "dug" || grams <= 0 || grams > this.clay.weight) {
            return null;
        }
        var piece = new Pottery(this.clay, this.states);
        piece.clay.weight = grams;
        piece.advance("weighed");
        this.clay.weight -= grams;
        return piece;
    },
    
    // "wet", "leatherHard" or "boneDry" (DRY_STAGE_COLORS' keys).
    dryStage: function () {
        if (this.pot.dryness >= 1) {
            return "boneDry";
        }
        return this.pot.dryness >= LEATHER_HARD_AT ? "leatherHard" : "wet";
    },

    // Dries an unfired, uncracked pot for `ms`, `slowdown` times slower than on the drying shelf.
    // Returns true if its dryness changed.
    dry: function (ms, slowdown) {
        if (this.state !== "thrown" || this.pot.cracked || this.pot.dryness >= 1) {
            return false;
        }
        this.pot.dryness = Math.min(1, this.pot.dryness + ms / ((DRY_BASE_MS + this.pot.weight * DRY_MS_PER_GRAM) * slowdown));
        return true;
    },

    // The kiln calls this with a FIRE_LEVELS name before advance("firing"). Returns false, warns and
    // changes nothing for an unknown level or unless the pot is thrown and not yet in the kiln.
    setFireLevel: function (level) {
        if (FIRE_LEVELS.indexOf(level) < 0 || this.state !== "thrown") {
            console.warn("Pottery can't be fired at " + level + " while " + this.state, this);
            return false;
        }
        this.pot.fireLevel = level;
        return true;
    },

    // Returns false, warns and changes nothing unless `to` may follow the current state.
    // Throwing also needs the `model` to copy.
    advance: function (to, model) {
        if (!this.canAdvance(to, model)) {
            console.warn("potterystate: rejected " + this.state + " -> " + to, this);
            return false;
        }
        console.log("potterystate: advanced " + this.state + " -> " + to);
        this.state = to;
        if (to === "wedged") {
            this.clay.wedged = true;
        } else if (to === "thrown") {
            this.pot = {shape: model.shape, weight: this.clay.weight, glaze: [],
                dryness: 0, trimmed: false, fired: false, completed: false, fireLevel: null, cracked: false, damage: 0};
        } else if (to === "cooled") {
            this.pot.fired = true;
            // No level set counts as a mismatch. Pots don't dry in the kiln, so this is the dryness it went in
            // with; anything short of bone dry cracks. A pot cracked before firing stays cracked.
            var wasCracked = this.pot.cracked;
            this.pot.cracked = wasCracked || this.pot.fireLevel !== this.clay.fireLevel || this.pot.dryness < 1;
            if (this.pot.cracked && !wasCracked) {
                var reasons = [];
                if (this.pot.fireLevel !== this.clay.fireLevel) {
                    reasons.push("fired at " + (this.pot.fireLevel || "no level") + ", " + this.clay.name + " clay needs " + this.clay.fireLevel);
                }
                if (this.pot.dryness < 1) {
                    reasons.push("not bone dry (dryness " + Math.round(this.pot.dryness * 100) + "%)");
                }
                console.log("potterystate: " + this.clay.name + " " + this.pot.shape + " cracked in the kiln: " + reasons.join("; "));
                Crafty.trigger("PotCracked", this);
            }
        } else if (to === "shelved") {
            this.pot.completed = true;
        }
        return true;
    }
};
