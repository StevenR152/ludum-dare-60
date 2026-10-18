// Clay on its way from the dig to the completed shelf. It has clay (name and colour copied from the
// clay type, weight in grams), a pot (null until the owl throws it) and a state that only moves along
// `states` (POTTERY_STATES by default): advance(to) works for the next state, or when every state
// skipped is optional.
//   var pottery = new Pottery(CLAY_TYPES.brown);   // state "dug", 1000 g
//   pottery.advance("wedged");                      // true; pottery.advance("firing") would be false
//   var piece = pile.weighOut(200);                 // a new "weighed" 200 g Pottery; the pile keeps the rest
// `type` is "clay" until there is a pot, then "pot", so Inventory's one-type rule works as before.
function Pottery(clayType, states) {
    this.states = states || POTTERY_STATES;
    this.clay = {name: clayType.name, color: clayType.color, wedged: false, weight: DUG_CLAY_GRAMS};
    this.pot = null;
    this.state = this.states[0].name;
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

    // Takes `grams` off this wedged pile as a new weighed Pottery of the same clay, or returns null.
    weighOut: function (grams) {
        if (this.state !== "wedged" || grams <= 0 || grams > this.clay.weight) {
            return null;
        }
        var piece = new Pottery(this.clay, this.states);
        piece.clay.weight = grams;
        piece.advance("wedged");
        piece.advance("weighed");
        this.clay.weight -= grams;
        return piece;
    // The kiln calls this with a FIRE_LEVELS name before advance("firing"). Returns false, warns and
    // changes nothing for an unknown level or unless the pottery is dried and not yet in the kiln.
    setFireLevel: function (level) {
        if (FIRE_LEVELS.indexOf(level) < 0 || this.state !== "dried") {
            console.warn("Pottery can't be fired at " + level + " while " + this.state, this);
            return false;
        }
        this.pot.fireLevel = level;
        return true;
    },

    // Returns false, warns and changes nothing unless `to` may follow the current state.
    advance: function (to) {
        if (!this.canAdvance(to)) {
            console.warn("potterystate: rejected " + this.state + " -> " + to, this);
            return false;
        }
        console.log("potterystate: advanced " + this.state + " -> " + to);
        this.state = to;
        if (to === "wedged") {
            this.clay.wedged = true;
        } else if (to === "thrown") {
            this.pot = {shape: model.shape, size: model.size, weight: this.clay.weight, glaze: [],
                dried: false, fired: false, completed: false, fireLevel: null, cracked: false};
        } else if (to === "dried") {
            this.pot.dried = true;
        } else if (to === "cooled") {
            this.pot.fired = true;
            // No level set counts as a mismatch.
            this.pot.cracked = this.pot.fireLevel !== this.clay.fireLevel;
        } else if (to === "shelved") {
            this.pot.completed = true;
        }
        return true;
    }
};
