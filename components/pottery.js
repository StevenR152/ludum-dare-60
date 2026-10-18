// One kilo of pottery from the dig to the completed shelf. It has clay (copied from the clay type when
// dug), a pot (null until the owl throws it) and a state that only moves along `states`
// (POTTERY_STATES by default): advance(to) works for the next state, or when every state skipped is optional.
//   var pottery = new Pottery(CLAY_TYPES.brown);   // state "dug"
//   pottery.advance("wedged");                      // true; pottery.advance("firing") would be false
// `type` is "clay" until there is a pot, then "pot", so Inventory's one-type rule works as before.
function Pottery(clayType, states) {
    this.states = states || POTTERY_STATES;
    this.clay = {name: clayType.name, color: clayType.color, wedged: false, weight: null};
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

    canAdvance: function (to) {
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
            this.clay.weight = WEDGED_CLAY_GRAMS;
        } else if (to === "thrown") {
            this.pot = {shape: PLACEHOLDER_POT.shape, size: PLACEHOLDER_POT.size, dried: false, fired: false, completed: false};
        } else if (to === "dried") {
            this.pot.dried = true;
        } else if (to === "cooled") {
            this.pot.fired = true;
        } else if (to === "shelved") {
            this.pot.completed = true;
        }
        return true;
    }
};
