/*!
 * TouchControls for Crafty 0.9
 * Turns taps, swipes and touch-and-hold into Crafty key presses,
 * so keyboard games play on phones without changing their input code.
 *
 * MIT License, Copyright (c) 2026 Steven Rutherford
 */
(function (Crafty, window, document) {
    "use strict";

    // Starting values; tune on real phones.
    var TAP_MAX_MS = 250;
    var TAP_MAX_MOVE = 10;
    var SWIPE_MIN_MOVE = 30;
    var SWIPE_MAX_MS = 300;
    var HOLD_TOWARD_DEAD_ZONE = 10;
    // A finger within 22.5 degrees of an axis presses one arrow, otherwise two.
    var DIAGONAL = Math.tan(Math.PI / 8);
    var ARROW_KEYS = {up: "UP_ARROW", down: "DOWN_ARROW", left: "LEFT_ARROW", right: "RIGHT_ARROW"};
    var SWIPE_ARROW_DEGREES = {right: 0, down: 90, left: 180, up: 270};

    function keyCode(name) {
        if (name === undefined || name === null) {
            return null;
        }
        if (typeof name === "number") {
            return name;
        }
        if (Crafty.keys[name] === undefined) {
            throw new Error("TouchControls: unknown key \"" + name + "\", use a Crafty.keys name");
        }
        return Crafty.keys[name];
    }

    function keyCodes(names, keys) {
        var codes = {};
        for (var i = 0; i < keys.length; i++) {
            codes[keys[i]] = names ? keyCode(names[keys[i]]) : null;
        }
        return codes;
    }

    function now() {
        return Date.now();
    }

    /**@
     * #TouchControls
     * @category Input
     * @kind System
     *
     * Gesture controls for touch screens. Each gesture presses Crafty keys through
     * `Crafty.s('Keyboard').triggerKey`, so `Fourway`, `Twoway`, `Multiway`, `isKeyDown`
     * and `KeyDown` bindings all respond as if a keyboard was used.
     *
     * Use it through the `TouchControls` alias:
     * ~~~
     * Crafty.init(1152, 768);
     * TouchControls.init({
     *     holdToward: {},          // walk toward the finger
     *     tap: "SPACE"             // tap anywhere for an action
     * });
     * // In the scene that creates the player:
     * TouchControls.follow(player);
     * ~~~
     *
     * Options for `init`:
     * - `tap`: key pressed and released once per tap.
     * - `swipe`: `{up, down, left, right}` keys pressed and released once per swipe.
     * - `holdSides`: `{left, right}` keys held while a finger is down on that half of the screen.
     * - `holdToward`: `{entity, keys, deadZone}`. Holds the keys (arrow keys by default) pointing from
     *   the entity's centre to the first finger down, in 8 directions, until it lifts or the entity arrives.
     * - `scenes`: scene names gestures run on, default `["Game"]`; `null` for every scene.
     * - `fitPage`: fit the page to the phone (viewport width, no scrolling, hide `.touch-hide`), default `true`.
     *
     * Keys are `Crafty.keys` names. Touches that start on a `Mouse` entity are left to Crafty.
     *
     * @trigger TouchTap - a tap was recognised - { clientX, clientY }
     * @trigger TouchSwipe - a swipe was recognised - { direction: "up"|"down"|"left"|"right", clientX, clientY }
     */
    Crafty.s("TouchControls", {
        init: function () {
            this._options = null;
            this._listening = false;
            this._active = false;
            this._sceneOn = false;
            this._override = null;
            this._target = null;
            this._fingers = {};
            this._leader = null;
            this._held = {};
            this._pulses = [];
            this._frame = 0;
        },

        events: {
            "UpdateFrame": "_onFrame",
            "SceneChange": "_onSceneChange",
            "Pause": "releaseAll"
        },

        /**@
         * #.setup
         * @comp TouchControls
         * @kind Method
         * @sign public this .setup(Object options)
         * Sets which gestures run (see `TouchControls`). Called by `TouchControls.init`.
         */
        setup: function (options) {
            options = options || {};
            var toward = options.holdToward;
            this.releaseAll();
            this._options = {
                tap: keyCode(options.tap),
                swipe: options.swipe ? keyCodes(options.swipe, ["up", "down", "left", "right"]) : null,
                holdSides: options.holdSides ? keyCodes(options.holdSides, ["left", "right"]) : null,
                holdToward: toward ? {
                    keys: keyCodes(toward.keys || ARROW_KEYS, ["up", "down", "left", "right"]),
                    deadZone: toward.deadZone === undefined ? HOLD_TOWARD_DEAD_ZONE : toward.deadZone
                } : null,
                scenes: options.scenes === undefined ? ["Game"] : options.scenes,
                fitPage: options.fitPage !== false
            };
            if (toward && toward.entity) {
                this.follow(toward.entity);
            }
            this._sceneOn = this._sceneAllowed(Crafty._current);
            this._override = null;

            if (!this._listening) {
                this._listening = true;
                Crafty.addEvent(this, document, "pointerdown", this._onDown);
                Crafty.addEvent(this, document, "pointermove", this._onMove);
                Crafty.addEvent(this, document, "pointerup", this._onUp);
                Crafty.addEvent(this, document, "pointercancel", this._onCancel);
                Crafty.addEvent(this, document, "visibilitychange", this._onVisibility);
                Crafty.addEvent(this, window, "blur", this.releaseAll);
            }
            if (this._touchScreen()) {
                this.activate();
            }
            return this;
        },

        /**@
         * #.activate
         * @comp TouchControls
         * @kind Method
         * @sign public this .activate()
         * Turns the touch layer on. Happens by itself on touch screens, on the first touch,
         * or with `?touch=1` in the page URL.
         */
        activate: function () {
            if (this._active) {
                return this;
            }
            this._active = true;
            if (this._options && this._options.fitPage) {
                document.documentElement.classList.add("touch-controls");
                // iOS Safari can still scroll the page despite touch-action, so block it here too.
                // Not through Crafty.addEvent because it can't pass {passive: false}.
                document.addEventListener("touchmove", function (e) { e.preventDefault(); }, {passive: false});
                Crafty.addEvent(this, window, "resize", this._fitPage);
                Crafty.addEvent(this, window, "orientationchange", this._fitPage);
                this._fitPage();
            }
            return this;
        },

        /**@
         * #.isActive
         * @comp TouchControls
         * @kind Method
         * @sign public Boolean .isActive()
         * Whether the touch layer is on, e.g. to show "Touch and hold to move" instead of "Arrow keys to move".
         */
        isActive: function () {
            return this._active;
        },

        /**@
         * #.follow
         * @comp TouchControls
         * @kind Method
         * @sign public this .follow(Entity entity)
         * Points hold-toward at `entity`. Call it whenever a scene creates a new player.
         */
        follow: function (entity) {
            this._target = entity;
            var self = this;
            entity.one("Remove", function () {
                if (self._target === entity) {
                    self._target = null;
                    self.releaseAll();
                }
            });
            return this;
        },

        /**@
         * #.enable
         * @comp TouchControls
         * @kind Method
         * @sign public this .enable()
         * Runs gestures in the current scene even if it isn't in `scenes`. Lasts until the scene changes.
         */
        enable: function () {
            this._override = true;
            return this;
        },

        /**@
         * #.disable
         * @comp TouchControls
         * @kind Method
         * @sign public this .disable()
         * Stops gestures in the current scene and releases their keys. Lasts until the scene changes.
         */
        disable: function () {
            this._override = false;
            return this.releaseAll();
        },

        /**@
         * #.releaseAll
         * @comp TouchControls
         * @kind Method
         * @sign public this .releaseAll()
         * Forgets every finger and releases every key they hold. Fingers still down are ignored until lifted.
         */
        releaseAll: function () {
            for (var id in this._fingers) {
                this._removeRing(this._fingers[id]);
            }
            this._fingers = {};
            this._leader = null;
            this._pulses = [];
            this._sync();
            return this;
        },

        _touchScreen: function () {
            return /[?&]touch=1(&|$)/.test(window.location.search) ||
                !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
        },

        _sceneAllowed: function (scene) {
            var scenes = this._options && this._options.scenes;
            return !scenes || scenes.indexOf(scene) !== -1;
        },

        _gesturesOn: function () {
            return this._override !== null ? this._override : this._sceneOn;
        },

        // Touches on links, form fields and clickable Crafty entities (Mute, menus) stay with them.
        _onUi: function (e) {
            if (e.target && e.target.closest && e.target.closest("a, button, input, select, textarea, label")) {
                return true;
            }
            if (!Crafty.stage) {
                return false;
            }
            // A CANVAS-named target makes Crafty search entities by position on every layer,
            // which works for DOM entities too and skips its lookup by element id.
            return !!Crafty.findPointerEventTargetByComponent("Mouse",
                {target: {nodeName: "CANVAS"}, clientX: e.clientX, clientY: e.clientY});
        },

        _onDown: function (e) {
            if (!this._active) {
                if (e.pointerType !== "touch" || !this._options) {
                    return;
                }
                this.activate();
            }
            if (!this._gesturesOn() || this._onUi(e)) {
                return;
            }
            var finger = {
                x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY,
                t0: now(), moved: 0, swiped: false, keys: {}, ring: null
            };
            this._fingers[e.pointerId] = finger;
            if (this._leader === null) {
                this._leader = e.pointerId;
            }
            this._addRing(finger);
            this._updateHolds();
        },

        _onMove: function (e) {
            var finger = this._fingers[e.pointerId];
            if (!finger) {
                return;
            }
            finger.x = e.clientX;
            finger.y = e.clientY;
            finger.moved = Math.max(finger.moved, Math.abs(finger.x - finger.x0), Math.abs(finger.y - finger.y0));
            this._moveRing(finger);
            this._checkSwipe(finger);
            this._updateHolds();
        },

        _onUp: function (e) {
            var finger = this._fingers[e.pointerId];
            if (!finger) {
                return;
            }
            this._onMove(e);
            this._removeFinger(e.pointerId);
            if (!finger.swiped && now() - finger.t0 < TAP_MAX_MS && finger.moved < TAP_MAX_MOVE) {
                if (this._options.tap !== null) {
                    this._pulse(this._options.tap);
                }
                Crafty.trigger("TouchTap", {clientX: finger.x, clientY: finger.y});
            }
            this._updateHolds();
        },

        _onCancel: function (e) {
            if (this._fingers[e.pointerId]) {
                this._removeFinger(e.pointerId);
                this._updateHolds();
            }
        },

        _onVisibility: function () {
            if (document.hidden) {
                this.releaseAll();
            }
        },

        _onSceneChange: function (data) {
            this._sceneOn = this._sceneAllowed(data.newScene);
            this._override = null;
            this.releaseAll();
        },

        _onFrame: function (data) {
            this._frame = data.frame;
            // Keep pulsed keys down for one whole frame, so games that poll isKeyDown see them.
            var frame = this._frame;
            this._pulses = this._pulses.filter(function (pulse) {
                return frame <= pulse.frame + 1;
            });
            this._updateHolds();
        },

        _removeFinger: function (id) {
            this._removeRing(this._fingers[id]);
            delete this._fingers[id];
            if (this._leader === id) {
                this._leader = null;
                var oldest = Infinity;
                for (var other in this._fingers) {
                    if (this._fingers[other].t0 < oldest) {
                        oldest = this._fingers[other].t0;
                        this._leader = +other;
                    }
                }
            }
        },

        _checkSwipe: function (finger) {
            if (finger.swiped || now() - finger.t0 > SWIPE_MAX_MS) {
                return;
            }
            var dx = finger.x - finger.x0, dy = finger.y - finger.y0;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_MOVE) {
                return;
            }
            finger.swiped = true;
            var direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
            var swipe = this._options.swipe;
            if (swipe && swipe[direction] !== null) {
                this._pulse(swipe[direction]);
            }
            this._flashArrow(finger, direction);
            Crafty.trigger("TouchSwipe", {direction: direction, clientX: finger.x0, clientY: finger.y0});
        },

        _pulse: function (key) {
            this._pulses.push({key: key, frame: this._frame});
        },

        // Works out every key the fingers should hold, then presses and releases the difference.
        _updateHolds: function () {
            var options = this._options;
            if (!options) {
                return;
            }
            for (var id in this._fingers) {
                var finger = this._fingers[id];
                finger.keys = {};
                // With swipes on, a finger that swiped stops holding.
                if (finger.swiped && options.swipe) {
                    continue;
                }
                if (options.holdSides) {
                    var key = options.holdSides[finger.x < window.innerWidth / 2 ? "left" : "right"];
                    if (key !== null) {
                        finger.keys[key] = true;
                    }
                }
                // Only the first finger down steers, so a second thumb can tap without turning.
                if (options.holdToward && this._target && +id === this._leader) {
                    this._steer(finger, options.holdToward);
                }
            }
            this._sync();
        },

        _steer: function (finger, toward) {
            var entity = this._target;
            var point = Crafty.domHelper.translate(finger.x, finger.y, entity._drawLayer);
            var dx = point.x - (entity._x + entity._w / 2);
            var dy = point.y - (entity._y + entity._h / 2);
            if (dx * dx + dy * dy <= toward.deadZone * toward.deadZone) {
                return;
            }
            var ax = Math.abs(dx), ay = Math.abs(dy), key;
            if (ax > ay * DIAGONAL) {
                key = toward.keys[dx < 0 ? "left" : "right"];
                if (key !== null) {
                    finger.keys[key] = true;
                }
            }
            if (ay > ax * DIAGONAL) {
                key = toward.keys[dy < 0 ? "up" : "down"];
                if (key !== null) {
                    finger.keys[key] = true;
                }
            }
        },

        _sync: function () {
            var wanted = {}, id, key, i;
            for (id in this._fingers) {
                for (key in this._fingers[id].keys) {
                    wanted[key] = true;
                }
            }
            for (i = 0; i < this._pulses.length; i++) {
                wanted[this._pulses[i].key] = true;
            }
            var keyboard = Crafty.s("Keyboard");
            for (key in this._held) {
                if (!wanted[key]) {
                    keyboard.triggerKey("KeyUp", {key: +key, which: +key, originalEvent: null});
                }
            }
            for (key in wanted) {
                if (!this._held[key]) {
                    keyboard.triggerKey("KeyDown", {key: +key, which: +key, originalEvent: null});
                }
            }
            this._held = wanted;
        },

        _addRing: function (finger) {
            finger.ring = document.createElement("div");
            finger.ring.className = "touch-controls-ring";
            document.body.appendChild(finger.ring);
            this._moveRing(finger);
        },

        _moveRing: function (finger) {
            if (finger.ring) {
                finger.ring.style.left = finger.x + "px";
                finger.ring.style.top = finger.y + "px";
            }
        },

        _removeRing: function (finger) {
            if (finger.ring && finger.ring.parentNode) {
                finger.ring.parentNode.removeChild(finger.ring);
            }
            finger.ring = null;
        },

        _flashArrow: function (finger, direction) {
            var arrow = document.createElement("div");
            arrow.className = "touch-controls-swipe";
            arrow.style.left = finger.x0 + "px";
            arrow.style.top = finger.y0 + "px";
            arrow.style.setProperty("--touch-controls-angle", SWIPE_ARROW_DEGREES[direction] + "deg");
            document.body.appendChild(arrow);
            setTimeout(function () {
                if (arrow.parentNode) {
                    arrow.parentNode.removeChild(arrow);
                }
            }, 400);
        },

        // Fits the game to the screen with the browser's own page zoom: CSS transforms would
        // put taps in the wrong place, because Crafty doesn't account for them.
        _fitPage: function () {
            if (!Crafty.stage) {
                return;
            }
            var stage = Crafty.stage.elem;
            var aspect = window.innerWidth / window.innerHeight;
            // Landscape fills the height, portrait the width; the formula covers both.
            var width = Math.ceil(Math.max(stage.offsetWidth, stage.offsetHeight * aspect));
            var meta = document.querySelector("meta[name=viewport]");
            if (!meta) {
                meta = document.createElement("meta");
                meta.name = "viewport";
                document.head.appendChild(meta);
            }
            meta.content = "width=" + width + ", user-scalable=no";
            // About 58pt on a phone in either orientation, bigger than the 44pt minimum touch size.
            var ring = Math.round(0.15 * Math.min(window.innerWidth, window.innerHeight));
            document.documentElement.style.setProperty("--touch-controls-ring", ring + "px");
            // Hidden page chrome moves the stage, and Crafty maps taps from the stage's position.
            Crafty.viewport.reload();
        }
    }, {}, false);

    /**@
     * #TouchControls (alias)
     * @category Input
     * @kind Object
     * Short alias for `Crafty.s("TouchControls")`: `init(options)`, `isActive()`, `follow(entity)`,
     * `enable()`, `disable()`.
     */
    var system = Crafty.s("TouchControls");
    window.TouchControls = {
        init: function (options) { system.setup(options); return this; },
        isActive: function () { return system.isActive(); },
        follow: function (entity) { system.follow(entity); return this; },
        enable: function () { system.enable(); return this; },
        disable: function () { system.disable(); return this; }
    };
})(Crafty, window, document);
