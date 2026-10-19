// A fixed-size list of items ({type, ...}) that one holder owns: the fox, the owl, the kiln.
// Holds one item type at a time, unless a fits rule says what may go together. Optional rules let a
// holder refuse items or refuse to give them up:
// {accepts: function (item), releases: function (item), fits: function (items, item)}.
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
    if (this.rules.fits ? !this.rules.fits(this.items, item)
            : this.items.length > 0 && this.items[0].type !== item.type) {
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

// Moves an item between two inventories (and triggers "ItemMoved" with {item, from, to}, for sounds), the selected one unless index is given.
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
    Crafty.trigger("ItemMoved", {item: item, from: from, to: to});
    return true;
}

// Index of the first item matching test, or -1.
Inventory.prototype.find = function (test) {
    return this.items.findIndex(test);
};

// The picture of a pot (a path from potImage): its shape, clay and how far along it is. A glazed pot shows its
// last dip: one dip before the glaze firing is half glazed, two are fully glazed, and after it the glaze has fired.
function potSprite(item) {
    var file = POT_SPRITES[item.pot.shape].file;
    var dips = item.pot.glaze.length;
    var glaze = dips > 0 ? GLAZE_NUMBERS[item.pot.glaze[dips - 1]] : 0;
    var kind = item.before("cooled") ? "unfired" : "fired";
    if (dips > 0) {
        kind = !item.before("glazeCooled") ? "glazeFired" : dips >= MAX_GLAZE_DIPS ? "full" : "half";
    }
    return potImage(file, item.clay.letter, kind, glaze);
}

// Paints an item into its box: pots as their picture (cropped to the pot and fitted in the box, with a black
// cross over it if cracked), logs as their picture, everything else as a colour. Call with every box that shows an item (or no item,
// to clear it): HUD slots, shelf slots, the kiln's, the owl's and dropped items.
function paintItem(box, item) {
    var line = function (corner) {
        return "linear-gradient(to " + corner + ", transparent calc(50% - 1.5px), #000 calc(50% - 1.5px), " +
            "#000 calc(50% + 1.5px), transparent calc(50% + 1.5px))";
    };
    var layers = [];
    var sizes = [];
    var positions = [];
    var isPot = !!item && item.type === "pot";
    var isLog = !!item && item.type === "log";
    if (isPot && item.pot.cracked) {
        layers.push(line("top right"), line("bottom right"));
        sizes.push("100% 100%", "100% 100%");
        positions.push("0 0", "0 0");
    }
    if (isPot || isLog) {
        var crop = isPot ? POT_SPRITES[item.pot.shape].crop : LOG_IMAGE.crop;
        var scale = Math.min(box.w / crop[2], box.h / crop[3]);
        layers.push("url(" + (isPot ? potSprite(item) : LOG_IMAGE.url) + ")");
        sizes.push((isPot ? POT_IMAGE_W : LOG_IMAGE.w) * scale + "px " + (isPot ? POT_IMAGE_H : LOG_IMAGE.h) * scale + "px");
        positions.push((box.w - crop[2] * scale) / 2 - crop[0] * scale + "px " +
            ((box.h - crop[3] * scale) / 2 - crop[1] * scale) + "px");
        box.color("#FFF", 0);
    } else if (item) {
        box.color(itemColor(item));
    }
    box.css({backgroundImage: layers.length > 0 ? layers.join(", ") : "none", backgroundSize: sizes.join(", "),
        backgroundPosition: positions.join(", "), backgroundRepeat: "no-repeat"});
}

// Display colour of an item that is not a pot, for the HUD.
function itemColor(item) {
    if (item.type === "model") {
        return MODEL_COLOR;
    }
    if (item.type === "log") {
        return LOG_COLOR;
    }
    return item.clay.color;
}

// True for a pot that dries: thrown, not yet fired, not cracked.
function isDrying(item) {
    return !!item && item.type === "pot" && item.state === "thrown" && !item.pot.cracked;
}

// The border that marks an item's box: on a pot, solid green if trimmed and dashed orange if not (cracked
// or fired, too); white on wedged clay. Use markBorder to apply it to every box that shows an item.
function itemBorder(item) {
    if (item && item.type === "pot") {
        return item.pot.trimmed ? "3px solid " + TRIMMED_BORDER_COLOR : "3px dashed " + UNTRIMMED_BORDER_COLOR;
    }
    return item && item.state === "wedged" ? "2px solid #FFF" : "none";
}

function markBorder(box, item) {
    box.css({boxSizing: 'border-box', border: itemBorder(item)});
}

// A wet—leather hard—bone dry bar under a drying pot: a dark track, a fill in the pot's stage colour as
// long as its dryness, and a white tick where leather hard starts. `layer` is "DOM" or "HUD".
//   var bar = new DryBar("HUD");
//   bar.place(x, y, 40, z).show(pot);   // hidden unless the pot is drying
function DryBar(layer) {
    var parts = "2D, " + layer + ", Color";
    this.track = Crafty.e(parts).attr({h: DRY_BAR_H, visible: false}).color(DRY_BAR_COLOR);
    this.fill = Crafty.e(parts).attr({h: DRY_BAR_H, visible: false});
    this.tick = Crafty.e(parts).attr({w: 1, h: DRY_BAR_H, visible: false}).color("#FFF");
}
var DRY_BAR_H = 6;

DryBar.prototype.place = function (x, y, w, z) {
    this.track.attr({x: x, y: y, w: w, z: z});
    this.fill.attr({x: x, y: y, z: z + 1});
    this.tick.attr({x: x + Math.round(w * LEATHER_HARD_AT), y: y, z: z + 2});
    return this;
};

DryBar.prototype.show = function (item, shown) {
    var on = shown !== false && isDrying(item);
    this.track.visible = this.tick.visible = this.fill.visible = on;
    if (on) {
        this.fill.attr({w: Math.max(1, this.track.w * item.pot.dryness)}).color(DRY_STAGE_COLORS[item.dryStage()]);
    }
    return this;
};

DryBar.prototype.destroy = function () {
    this.track.destroy();
    this.fill.destroy();
    this.tick.destroy();
};
