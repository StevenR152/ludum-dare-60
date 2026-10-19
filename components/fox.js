// The player: sprite, arrow-key movement, click-to-move (enableClickToMove), and an Inventory of FOX_INVENTORY_CAPACITY items of any
// kind in any mix (2 dug clays, wedged clay and a model, 2 pots, a pot and a model...).
// Each 1000 g of clay carried slows the fox by FOX_SLOWDOWN_PER_KG of its base speed, and every dropped
// item it overlaps multiplies its speed by DROPPED_ITEM_SLOWDOWN (see DroppedItem).
// E steps through the slots; SPACE acts like a click on what the fox touches (see pressAction); BACKSPACE puts
// the selected item back at the Workbench or Clay node the fox stands at if that takes it, else drops it on the
// ground. A moving fox carrying something may also stumble and
// drop a random item on the ground; the more it is slowed, the likelier.
//   var player = Crafty.e("Fox").attr({x: 542, y: 656});
Crafty.c("Fox", {
    init: function() {
        this.requires("2D, DOM, fox, Fourway, Collision, Keyboard");
        this.attr({w: 160, h: 102});
        // Touching uses the sprite box shrunk by FOX_HITBOX_INSET, not the transparent margins of the art.
        var inset = FOX_HITBOX_INSET;
        this.collision([inset, inset, this.w - inset, inset, this.w - inset, this.h - inset, inset, this.h - inset]);
        if (DEBUG_HITBOXES) {
            this.attach(Crafty.e("2D, DebugHitbox").attr({
                x: this.x + inset, y: this.y + inset, w: this.w - 2 * inset, h: this.h - 2 * inset, z: 1000
            }));
        }
        if (DEBUG_HITBOXES) {
            this.attach(Crafty.e("2D, DebugHitbox").attr({
                x: this.x + FOX_FEET_BOX.x, y: this.y + FOX_FEET_BOX.y, w: FOX_FEET_BOX.w, h: FOX_FEET_BOX.h, z: 1000
            }));
        }
        this.fourway(FOX_SPEED);
        // Out-of-bounds: every step is checked against the collision masks (see keepInBounds).
        this.teleporting = false;
        this.inBoundsFix = false;
        this.bind("Move", this.keepInBounds);
        this.slowFraction = 0;
        this.inventory = new Inventory(FOX_INVENTORY_CAPACITY, {fits: function () { return true; }});
        this.bind("InventoryChanged", function (changed) {
            if (changed === this.inventory) {
                this.updateSpeed();
            }
        });
        this.bind("DroppedOverlapChanged", this.updateSpeed);
        this.actionId = null;
        this.bind("KeyDown", this.onKeyDown);
        this.bind("KeyUp", this.onKeyUp);
        this.bind("UpdateFrame", this.maybeStumble);
        // Click to move (see enableClickToMove): walk is null, {x, y} (a ground point) or {entity} (a station).
        this.walk = null;
        this.walkSpeed = FOX_SPEED;
        // How close the walk got last frame, and how many frames in a row it has failed to improve on that
        // (see walkStep): sliding along a wall it cannot get round has to give up some time.
        this.lastWalkDistance = Infinity;
        this.walkStalled = 0;
        this.pressHeld = false;
        this.dragging = false;
        this.armed = null;
        this.bind("UpdateFrame", this.walkStep);
        // The sprite faces right; mirror it while walking left, keep the last facing when stopped/vertical.
        this.bind("NewDirection", function (direction) {
            if (direction.x < 0) {
                this.flip("X");
            } else if (direction.x > 0) {
                this.unflip("X");
            }
        });
    },

    // True if the fox's feet, with the sprite box at (x, y), are on out-of-bounds ground.
    feetBlocked: function(x, y) {
        return collisionMap.isBoxBlocked(x + FOX_FEET_BOX.x, y + FOX_FEET_BOX.y, FOX_FEET_BOX.w, FOX_FEET_BOX.h);
    },

    // Runs after every position change (Crafty's "Move", with the old box). A step that would put the feet
    // out of bounds keeps whichever axis is still clear, so walking diagonally into a wall slides along it.
    // A fox already out of bounds (e.g. a bad spawn) may move freely, and teleportTo skips the check.
    keepInBounds: function(old) {
        if (this.teleporting || this.inBoundsFix || !this.feetBlocked(this.x, this.y) || this.feetBlocked(old._x, old._y)) {
            return;
        }
        var newX = this.x;
        var newY = this.y;
        this.inBoundsFix = true;
        if (!this.feetBlocked(newX, old._y)) {
            this.y = old._y;
        } else if (!this.feetBlocked(old._x, newY)) {
            this.x = old._x;
        } else {
            this.x = old._x;
            this.y = old._y;
        }
        this.inBoundsFix = false;
    },

    // Puts the fox at (x, y) whatever the masks say (doors; DOOR_DESTINATIONS should be clear anyway).
    teleportTo: function(x, y) {
        this.cancelWalk();
        this.teleporting = true;
        this.attr({x: x, y: y});
        this.teleporting = false;
    },

    // True if the fox's touch area overlaps the entity's box.
    touches: function(entity) {
        var inset = FOX_HITBOX_INSET;
        return entity.intersect(this.x + inset, this.y + inset, this.w - 2 * inset, this.h - 2 * inset);
    },

    // Clay weight slows additively; each overlapped dropped item multiplies on top. slowFraction is how
    // much slower than FOX_SPEED the fox now is (0 to 1), which also raises the stumble chance.
    updateSpeed: function() {
        var grams = this.inventory.items.reduce(function (sum, item) {
            return sum + (item.type === "clay" ? item.clay.weight : 0);
        }, 0);
        var speed = FOX_SPEED * (1 - FOX_SLOWDOWN_PER_KG * grams / 1000);
        Crafty("DroppedItem").each(function () {
            if (this.overlapping) {
                speed *= DROPPED_ITEM_SLOWDOWN;
            }
        });
        this.slowFraction = Math.max(0, 1 - speed / FOX_SPEED);
        console.log("Speed changed to " + speed);
        this.walkSpeed = speed;
        this.speed({x: speed, y: speed});
    },

    onKeyDown: function(e) {
        var keys = Crafty.keys;
        if ([keys.LEFT_ARROW, keys.RIGHT_ARROW, keys.UP_ARROW, keys.DOWN_ARROW, keys.A, keys.D, keys.W, keys.S].indexOf(e.key) >= 0) {
            this.cancelWalk();
        }
        if (e.key === Crafty.keys.E) {
            this.selectNext();
        } else if (e.key === Crafty.keys.SPACE) {
            this.pressAction();
        } else if (e.key === Crafty.keys.BACKSPACE) {
            this.dropSelected();
        }
    },

    onKeyUp: function(e) {
        if (e.key === Crafty.keys.SPACE) {
            this.releaseAction();
        }
    },

    // SPACE is a click on the world object the fox touches whose middle is nearest the fox's (the higher one
    // on a tie): its MouseDown now, its MouseUp when SPACE is let go, so hold actions (dig, wedge, chop) work.
    pressAction: function() {
        if (this.actionId !== null) {
            return; // key auto-repeat
        }
        var fox = this;
        var foxX = this.x + this.w / 2;
        var foxY = this.y + this.h / 2;
        var best = null;
        var bestDistance = Infinity;
        Crafty("Mouse").each(function () {
            if (this.has("HUD") || !fox.touches(this)) {
                return;
            }
            var distance = Math.pow(this.x + this.w / 2 - foxX, 2) + Math.pow(this.y + this.h / 2 - foxY, 2);
            if (distance < bestDistance || (distance === bestDistance && this.z > best.z)) {
                best = this;
                bestDistance = distance;
            }
        });
        if (best) {
            this.actionId = best[0];
            best.trigger("MouseDown");
        }
    },

    releaseAction: function() {
        if (this.actionId === null) {
            return;
        }
        // A target used up by the press (a picked-up dropped item) no longer exists.
        Crafty(this.actionId).trigger("MouseUp");
        this.actionId = null;
    },

    // A press on one of the fox's HUD slots (the phone way to choose and drop): an unselected item becomes
    // the selected one, the selected one is dropped. Empty slots do nothing.
    pressSlot: function(index) {
        if (!this.inventory.items[index]) {
            return;
        }
        if (index === this.inventory.selected) {
            this.dropSelected();
        } else {
            this.inventory.selected = index;
            this.inventory.changed();
        }
    },

    selectNext: function() {
        if (this.inventory.items.length === 0) {
            showStatus("Nothing to choose, you're carrying nothing");
            return;
        }
        this.inventory.selectNext();
    },

    // The selected item goes back to the station the fox stands at if it takes it (a model to the
    // workbench, clay to its clay node), otherwise it lands on the ground at the fox's feet.
    dropSelected: function() {
        var dropped = this.inventory.take();
        if (!dropped) {
            showStatus("Nothing to drop");
            return;
        }
        if (this.offerToStations(dropped)) {
            Crafty.trigger("ItemMoved", {item: dropped, from: this.inventory, to: null});
            return;
        }
        this.dropItem(dropped);
        showStatus(dropped.type === "clay" ? "Dropped " + dropped.clay.weight + " g of " + dropped.clay.name + " clay" : "Dropped the " + dropped.type);
    },

    // True if a Workbench or Clay node the fox overlaps took the item (their acceptDrop(item, fox)).
    // Stumbles skip this: a stumbled item always hits the ground.
    offerToStations: function(item) {
        var fox = this;
        var taken = false;
        ["Workbench", "Clay"].forEach(function (name) {
            Crafty(name).each(function () {
                if (!taken && fox.touches(this) && this.acceptDrop(item, fox)) {
                    taken = true;
                }
            });
        });
        return taken;
    },

    // Puts an item already out of the inventory on the ground.
    dropItem: function(item) {
        Crafty.trigger("ItemMoved", {item: item, from: this.inventory, to: null});
        Crafty.e("DroppedItem").dropFrom(this, item);
    },

    isMoving: function() {
        var velocity = this.velocity();
        return velocity.x !== 0 || velocity.y !== 0 || this.walk !== null;
    },

    // ---- Click to move ----
    // A press on open ground walks the fox until its feet box contains that point (while the button stays
    // down the point follows the cursor). A press on a station the fox does not touch walks it to the
    // station and stops on first touch; if the press is still held on arrival, the station's own press
    // handler runs then (dig, wedge, chop...). The walk is straight, at the fox's current speed, and ends
    // the moment a step would put the feet out of bounds.

    // Hooks the mouse up for this fox; call once after creating it in a scene.
    enableClickToMove: function() {
        var fox = this;
        var mouse = Crafty.s("Mouse");
        var onPress = function (e) { fox.handlePress(e); };
        var onMove = function (e) { fox.handleDrag(e); };
        var onRelease = function () { fox.handleRelease(); };
        // Crafty keeps its own "a button is down" state and clears it on window's mouseup, so anything that
        // stops a release propagating hides that from it too. Left stuck, its mouse system ignores every
        // later press and the game stops responding to clicks altogether. Check once the event has finished
        // propagating: a release Crafty did see has already cleared it and this does nothing, while a
        // swallowed one is repaired here. resetButtonDown replays a MouseUp, which also lets entities that
        // were mid-hold see the release they missed.
        var onCaptureRelease = function () {
            fox.handleRelease();
            window.setTimeout(function () {
                var mouseSystem = Crafty.s("Mouse");
                if (mouseSystem.isButtonDown("LEFT")) {
                    mouseSystem.resetButtonDown();
                }
            }, 0);
        };
        mouse.bind("MouseDown", onPress);
        // The release has to come from the same place as the press. Crafty's mouse system stops the events
        // it handles from bubbling (its processEvent calls preventBubbling), so a mouseup over the stage
        // never reaches window and handleRelease never ran: pressHeld latched true on the first click and
        // the fox then arrived at every station as though the button were still down.
        mouse.bind("MouseUp", onRelease);
        // Crafty is not the only thing that swallows a release. The weighing station's panel is a DOM child
        // of the stage that stops propagation on its own events (see WeighingStation.buildPanel), so a press
        // on the playfield let go over the open panel reaches neither window nor Crafty's mouse system, and
        // pressHeld would latch all over again. Listening in the capture phase runs this on the way down,
        // before the event reaches anything that could stop it, so no descendant can hide a release from us.
        // It also covers a release out in the letterbox; blur covers the window losing focus mid-press.
        // handleRelease does nothing the second time, so being called by more than one of these is harmless.
        window.addEventListener("mouseup", onCaptureRelease, true);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("blur", onRelease);
        this.bind("Remove", function () {
            mouse.unbind("MouseDown", onPress);
            mouse.unbind("MouseUp", onRelease);
            // The capture flag has to match, or this does not remove the listener.
            window.removeEventListener("mouseup", onCaptureRelease, true);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("blur", onRelease);
        });
        return this;
    },

    // True if the press landed on the HUD or a menu button: those never start a walk.
    pressedUi: function(e) {
        var target = e.target;
        if (target && ["HUD", "UIButton", "MuteButton", "OrderPanel"].some(function (name) { return target.has(name); })) {
            return true;
        }
        if (typeof e.realX !== "number") {
            return false;
        }
        var sx = e.realX + Crafty.viewport._x; // screen position: HUD pieces are fixed on screen
        var sy = e.realY + Crafty.viewport._y;
        var over = false;
        Crafty("HUD").each(function () {
            if (this.has("StatusMessage") || this.has("PlayerNotification") || this.visible === false) {
                return;
            }
            if (sx >= this._x && sx < this._x + this._w && sy >= this._y && sy < this._y + this._h) {
                over = true;
            }
        });
        return over;
    },

    handlePress: function(e) {
        this.pressHeld = true;
        this.dragging = false;
        if (this.pressedUi(e)) {
            return;
        }
        var target = e.target;
        if (target && target.has("Mouse")) {
            // A station. In reach it handles the press itself; out of reach the fox walks to it, and its
            // "I can't reach..." line waits to see whether the press was a tap or is held.
            var station = target.reachVia || target;
            if (!this.touches(station)) {
                // Aim at the spot clicked on the station, not its middle (which can sit out of bounds).
                // `target` is what was actually clicked, which can be a part of the station (a model on
                // the bench), so arrive() can act on that rather than the station as a whole.
                this.walk = {entity: station, target: target, event: e, x: e.realX, y: e.realY};
                statusGate.defer = true;
            }
            return;
        }
        // Touch screens already walk toward a held finger (TouchControls); don't also walk to the tap.
        if (typeof TouchControls !== "undefined" && TouchControls.isActive()) {
            return;
        }
        this.walk = {x: e.realX, y: e.realY};
        this.dragging = true;
    },

    // While the button is down on open ground the destination follows the cursor.
    handleDrag: function(e) {
        if (!this.dragging || (this.walk && this.walk.entity)) {
            return;
        }
        var spot = Crafty.domHelper.translate(e.clientX, e.clientY);
        this.walk = {x: spot.x, y: spot.y};
    },

    handleRelease: function() {
        this.pressHeld = false;
        this.dragging = false;
        // Let go before arriving: a tap. If the fox is still on its way to the station, drop the "I can't reach
        // that" line the press left behind, since it is about to reach it and arrive() will say what happens;
        // otherwise (the walk already ended at a wall) the line is true, so say it.
        statusGate.releaseDeferred(!(this.walk && this.walk.entity));
        if (this.armed) {
            var station = this.armed;
            this.armed = null;
            station.trigger("MouseUp", {});
        }
    },

    cancelWalk: function() {
        this.lastWalkDistance = Infinity;
        this.walkStalled = 0;
        this.walk = null;
        this.dragging = false;
    },

    // Each frame: one step toward the destination, or arrival.
    walkStep: function(frame) {
        var walk = this.walk;
        if (!walk) {
            return;
        }
        var feet = {x: this.x + FOX_FEET_BOX.x, y: this.y + FOX_FEET_BOX.y};
        var aimX;
        var aimY;
        if (walk.entity) {
            var station = walk.entity;
            if (!station.has("2D")) { // destroyed on the way (a dropped item picked up...)
                this.cancelWalk();
                return;
            }
            if (this.touches(station)) {
                this.arrive();
                return;
            }
            aimX = walk.x;
            aimY = walk.y;
        } else {
            if (walk.x >= feet.x && walk.x < feet.x + FOX_FEET_BOX.w && walk.y >= feet.y && walk.y < feet.y + FOX_FEET_BOX.h) {
                this.cancelWalk();
                return;
            }
            aimX = walk.x;
            aimY = walk.y;
        }
        var dx = aimX - (feet.x + FOX_FEET_BOX.w / 2);
        var dy = aimY - (feet.y + FOX_FEET_BOX.h / 2);
        var distance = Math.sqrt(dx * dx + dy * dy);
        var step = this.walkSpeed * frame.dt / 1000;
        if (distance > step) {
            dx = dx * step / distance;
            dy = dy * step / distance;
        }
        var newX = this.x + dx;
        var newY = this.y + dy;
        // A step into a wall slides along it, keeping whichever axis is still clear, so the fox rounds a
        // tree or a corner instead of stopping dead in front of it. This is what the arrow keys already do
        // (keepInBounds); click-to-move used to give up here instead, which is why it caught on everything.
        // A fox already out of bounds moves freely.
        if (!this.feetBlocked(this.x, this.y) && this.feetBlocked(newX, newY)) {
            if (!this.feetBlocked(newX, this.y)) {
                newY = this.y;
            } else if (!this.feetBlocked(this.x, newY)) {
                newX = this.x;
            } else {
                this.cancelWalk(); // boxed in on both axes: nothing to slide along
                return;
            }
        }
        // Sliding can run the fox along something it will never get round, so give up once it has not got
        // meaningfully closer for WALK_STUCK_FRAMES frames in a row, rather than scrape along for ever.
        if (distance < this.lastWalkDistance - WALK_PROGRESS_EPSILON) {
            this.lastWalkDistance = distance;
            this.walkStalled = 0;
        } else if (++this.walkStalled >= WALK_STUCK_FRAMES) {
            this.cancelWalk();
            return;
        }
        if (dx < -0.01) {
            this.flip("X");
        } else if (dx > 0.01) {
            this.unflip("X");
        }
        this.attr({x: newX, y: newY});
    },

    // Reached a station. A press still held now runs the station's press handler (no out-of-reach line);
    // otherwise the fox just stands there and the next press interacts.
    // Three kinds of thing can be walked to:
    // - one that `actsOnArrival` (a dropped item, a model on the bench): picking it up is a single click, so
    //   a tap from across the room is enough and the fox takes it when it gets there, held or not;
    // - one that `startsOnlyInReach` (clay, trees, the workbench): its action is a hold, which only starts
    //   from a press begun while the fox is already there, so arriving never starts a dig, chop or wedge and
    //   the fox just says how to use it;
    // - anything else (kiln, owl, shelves...) acts if the press is still held on arrival, as before.
    arrive: function() {
        var walk = this.walk;
        var station = walk.entity;
        var clicked = walk.target || station;
        this.cancelWalk();
        if (clicked.actsOnArrival) {
            statusGate.releaseDeferred(false);
            clicked.trigger("MouseDown", walk.event);
            return;
        }
        if (station.startsOnlyInReach) {
            statusGate.releaseDeferred(false);
            if (station.arrivalHint) {
                showStatus(station.arrivalHint);
            }
            return;
        }
        if (this.pressHeld) {
            statusGate.releaseDeferred(false);
            this.armed = walk.entity;
            walk.entity.trigger("MouseDown", walk.event);
        }
    },

    // Each frame a moving fox carrying something may stumble: STUMBLE_BASE_CHANCE per second, plus
    // STUMBLE_PER_SLOW times how slowed it is.
    maybeStumble: function(frame) {
        if (this.inventory.items.length === 0 || !this.isMoving()) {
            return;
        }
        var perSecond = STUMBLE_BASE_CHANCE + STUMBLE_PER_SLOW * this.slowFraction;
        if (Math.random() < perSecond * frame.dt / 1000) {
            this.stumble();
        }
    },

    // Drops a random carried item and plays the stumble sound.
    stumble: function() {
        var item = this.inventory.take(Math.floor(Math.random() * this.inventory.items.length));
        if (!item) {
            return;
        }
        this.dropItem(item);
        Crafty.trigger("Stumbled", item);
        showStatus("You stumbled and dropped something");
    },

    // Returns false (and changes nothing) when the item doesn't fit.
    pickUp: function(item) {
        if (this.inventory.add(item)) {
            return true;
        }
        this.packFull();
        return false;
    },

    // The pack-full message. The first one of a run suggests dropping something and flashes the selected
    // slot (see PlayerNotification and InventoryHud.flashSelected); later ones are the plain line.
    packFull: function() {
        if (gameState.packHintShown) {
            showStatus("Backpack full, you can't put more in");
            return;
        }
        gameState.packHintShown = true;
        showStatus({text: "My backpack is full, I could drop something that I'm holding (interact in the top left)", packHint: true});
    }
});
