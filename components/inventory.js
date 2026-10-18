// A fixed-size list of items ({type, ...}) that one holder owns: the fox, the owl, the kiln.
// Holds one item type at a time. Optional rules let a holder refuse items or refuse to give
// them up: {accepts: function (item), releases: function (item)}.
// Every change triggers Crafty.trigger("InventoryChanged", inventory); holders compare identity.
//   var pack = new Inventory(2);
//   pack.add({type: "pot"});
//   transferItem(pack, kiln.inventory);   // moves the selected item, or returns false and changes nothing
function Inventory(capacity, rules) {
    this.capacity = capacity;
    this.rules = rules || {};
    this.items = [];
    this.selected = 0;
}

Inventory.prototype.canAdd = function (item) {
    if (this.items.length >= this.capacity) {
        return false;
    }
    if (this.items.length > 0 && this.items[0].type !== item.type) {
        return false;
    }
    return !this.rules.accepts || this.rules.accepts(item);
};

Inventory.prototype.canTake = function (index) {
    var item = this.items[index];
    return !!item && (!this.rules.releases || this.rules.releases(item));
};

Inventory.prototype.selectedItem = function () {
    return this.items[this.selected] || null;
};

Inventory.prototype.selectNext = function () {
    if (this.items.length > 0) {
        this.selected = (this.selected + 1) % this.items.length;
        this.changed();
    }
};

// Returns false and changes nothing if the item can't go in.
Inventory.prototype.add = function (item) {
    if (!this.canAdd(item)) {
        return false;
    }
    this.items.push(item);
    this.changed();
    return true;
};

// Removes and returns the item at index (default: the selected one), or null if it can't be taken.
Inventory.prototype.take = function (index) {
    index = index === undefined ? this.selected : index;
    if (!this.canTake(index)) {
        return null;
    }
    var item = this.pull(index);
    this.changed();
    return item;
};

// Removal without the event, so transferItem can fire both events once both sides have changed.
Inventory.prototype.pull = function (index) {
    var item = this.items.splice(index, 1)[0];
    this.selected = Math.min(this.selected, Math.max(this.items.length - 1, 0));
    return item;
};

Inventory.prototype.changed = function () {
    Crafty.trigger("InventoryChanged", this);
};

// Moves an item between two inventories, the selected one unless index is given.
// Returns false and changes nothing if it can't leave `from` or can't enter `to`.
function transferItem(from, to, index) {
    index = index === undefined ? from.selected : index;
    var item = from.items[index];
    if (!item || !from.canTake(index) || !to.canAdd(item)) {
        return false;
    }
    from.pull(index);
    to.items.push(item);
    from.changed();
    to.changed();
    return true;
}

// Display colour of an item, for the HUD.
function itemColor(item) {
    if (item.type === "log") {
        return LOG_COLOR;
    }
    if (item.type === "clay") {
        return item.clay.color;
    }
    if (!item.before("cooled")) {
        return FIRED_POT_COLOR;
    }
    return item.before("dried") ? POT_COLOR : DRIED_POT_COLOR;
}
