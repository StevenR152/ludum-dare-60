(function () {
    "use strict";

    var module = QUnit.module;
    var test = QUnit.test;
    var keys = Crafty.keys;
    var keyboard;

    Crafty.init(400, 300, document.getElementById("game"));
    Crafty.defineScene("Game", function () {});
    Crafty.defineScene("Menu", function () {});
    keyboard = Crafty.s("Keyboard");

    // Fake pointer events land on the body, at stage coordinates (sx, sy).
    function pointer(type, id, sx, sy) {
        var rect = Crafty.stage.elem.getBoundingClientRect();
        document.body.dispatchEvent(new PointerEvent(type, {
            pointerId: id, pointerType: "touch", isPrimary: id === 1, bubbles: true,
            clientX: rect.left + sx, clientY: rect.top + sy
        }));
    }

    function tap(id, sx, sy) {
        pointer("pointerdown", id, sx, sy);
        pointer("pointerup", id, sx, sy);
    }

    function swipe(id, sx, sy, dx, dy) {
        pointer("pointerdown", id, sx, sy);
        pointer("pointermove", id, sx + dx, sy + dy);
        pointer("pointerup", id, sx + dx, sy + dy);
    }

    // Counts KeyDown and KeyUp events per key code.
    function keyLog() {
        var log = {down: {}, up: {}};
        log.onDown = function (e) { log.down[e.key] = (log.down[e.key] || 0) + 1; };
        log.onUp = function (e) { log.up[e.key] = (log.up[e.key] || 0) + 1; };
        Crafty.bind("KeyDown", log.onDown);
        Crafty.bind("KeyUp", log.onUp);
        log.stop = function () {
            Crafty.unbind("KeyDown", log.onDown);
            Crafty.unbind("KeyUp", log.onUp);
        };
        return log;
    }

    function setup(options) {
        options.fitPage = false;
        TouchControls.init(options);
        Crafty.s("TouchControls").activate();
        Crafty.enterScene("Game");
    }

    module("TouchControls", {
        beforeEach: function () {
            Crafty.viewport.reload();
        },
        afterEach: function () {
            Crafty.s("TouchControls").releaseAll();
            keyboard.resetKeyDown();
        }
    });

    test("tap presses and releases the tap key once", function (assert) {
        setup({tap: "SPACE"});
        var log = keyLog();
        tap(1, 100, 100);
        assert.ok(keyboard.isKeyDown(keys.SPACE), "down straight after the tap");
        Crafty.timer.simulateFrames(2);
        assert.notOk(keyboard.isKeyDown(keys.SPACE), "released after a frame");
        assert.strictEqual(log.down[keys.SPACE], 1, "one KeyDown");
        assert.strictEqual(log.up[keys.SPACE], 1, "one KeyUp");
        log.stop();
    });

    test("a touch that moves is not a tap", function (assert) {
        setup({tap: "SPACE"});
        var log = keyLog();
        pointer("pointerdown", 1, 100, 100);
        pointer("pointermove", 1, 115, 100);
        pointer("pointerup", 1, 115, 100);
        assert.notOk(log.down[keys.SPACE], "no KeyDown");
        log.stop();
    });

    test("a long press is not a tap", function (assert) {
        setup({tap: "SPACE"});
        var log = keyLog();
        var done = assert.async();
        pointer("pointerdown", 1, 100, 100);
        setTimeout(function () {
            pointer("pointerup", 1, 100, 100);
            assert.notOk(log.down[keys.SPACE], "no KeyDown");
            log.stop();
            done();
        }, 300);
    });

    test("swipes press the matching key once, sloppy diagonals included", function (assert) {
        setup({swipe: {up: "UP_ARROW", down: "DOWN_ARROW", left: "LEFT_ARROW", right: "RIGHT_ARROW"}});
        // 30 degrees off axis: tan(30) * 40 = 23.
        var cases = [
            ["right", 40, 0, keys.RIGHT_ARROW], ["left", -40, 0, keys.LEFT_ARROW],
            ["down", 0, 40, keys.DOWN_ARROW], ["up", 0, -40, keys.UP_ARROW],
            ["right, 30 degrees off", 40, 23, keys.RIGHT_ARROW], ["up, 30 degrees off", -23, -40, keys.UP_ARROW]
        ];
        cases.forEach(function (c) {
            var log = keyLog();
            swipe(1, 200, 150, c[1], c[2]);
            Crafty.timer.simulateFrames(2);
            assert.strictEqual(log.down[c[3]], 1, c[0] + ": one KeyDown");
            assert.strictEqual(log.up[c[3]], 1, c[0] + ": one KeyUp");
            assert.strictEqual(Object.keys(log.down).length, 1, c[0] + ": no other key");
            log.stop();
        });
    });

    test("a slow drag is not a swipe", function (assert) {
        setup({swipe: {right: "RIGHT_ARROW"}});
        var log = keyLog();
        var done = assert.async();
        pointer("pointerdown", 1, 100, 100);
        setTimeout(function () {
            pointer("pointermove", 1, 160, 100);
            pointer("pointerup", 1, 160, 100);
            assert.notOk(log.down[keys.RIGHT_ARROW], "no KeyDown");
            log.stop();
            done();
        }, 350);
    });

    test("holding a side holds its key until the finger lifts", function (assert) {
        setup({holdSides: {left: "LEFT_ARROW", right: "RIGHT_ARROW"}});
        var rect = Crafty.stage.elem.getBoundingClientRect();
        var leftX = window.innerWidth / 4 - rect.left;
        var rightX = window.innerWidth * 3 / 4 - rect.left;
        pointer("pointerdown", 1, leftX, 100);
        Crafty.timer.simulateFrames(5);
        assert.ok(keyboard.isKeyDown(keys.LEFT_ARROW), "left held");
        pointer("pointermove", 1, rightX, 100);
        assert.ok(keyboard.isKeyDown(keys.RIGHT_ARROW), "sliding across holds right");
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "and lets go of left");
        pointer("pointerup", 1, rightX, 100);
        assert.notOk(keyboard.isKeyDown(keys.RIGHT_ARROW), "released on lift");
    });

    test("hold toward presses the arrows from the entity to the finger", function (assert) {
        setup({holdToward: {}});
        var player = Crafty.e("2D").attr({x: 180, y: 130, w: 40, h: 40});
        TouchControls.follow(player);
        pointer("pointerdown", 1, 350, 150);
        assert.ok(keyboard.isKeyDown(keys.RIGHT_ARROW), "right of the player: right");
        assert.notOk(keyboard.isKeyDown(keys.UP_ARROW) || keyboard.isKeyDown(keys.DOWN_ARROW), "no vertical");
        pointer("pointermove", 1, 300, 270);
        assert.ok(keyboard.isKeyDown(keys.RIGHT_ARROW) && keyboard.isKeyDown(keys.DOWN_ARROW), "diagonal holds two arrows");
        pointer("pointermove", 1, 50, 140);
        assert.ok(keyboard.isKeyDown(keys.LEFT_ARROW), "left");
        assert.notOk(keyboard.isKeyDown(keys.RIGHT_ARROW) || keyboard.isKeyDown(keys.DOWN_ARROW), "old keys released");
        pointer("pointermove", 1, 203, 152);
        Crafty.timer.simulateFrames(1);
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "nothing inside the dead zone");
        pointer("pointermove", 1, 50, 140);
        pointer("pointerup", 1, 50, 140);
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "released on lift");
        player.destroy();
    });

    test("hold toward takes custom keys and follows a new entity", function (assert) {
        // Entities made before a scene change are destroyed by it, so make them after.
        setup({holdToward: {keys: {up: "W", left: "A", down: "S", right: "D"}}});
        var first = Crafty.e("2D").attr({x: 0, y: 0, w: 10, h: 10});
        TouchControls.follow(first);
        var second = Crafty.e("2D").attr({x: 300, y: 0, w: 10, h: 10});
        TouchControls.follow(second);
        pointer("pointerdown", 1, 100, 5);
        assert.ok(keyboard.isKeyDown(keys.A), "steers from the followed entity with A");
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "not the arrow key");
        second.destroy();
        assert.notOk(keyboard.isKeyDown(keys.A), "released when the entity is destroyed");
        first.destroy();
    });

    test("two fingers: hold to move and tap both register", function (assert) {
        setup({holdToward: {}, tap: "SPACE"});
        var player = Crafty.e("2D").attr({x: 180, y: 130, w: 40, h: 40});
        TouchControls.follow(player);
        var log = keyLog();
        pointer("pointerdown", 1, 350, 150);
        tap(2, 20, 20);
        assert.ok(keyboard.isKeyDown(keys.RIGHT_ARROW), "still moving right");
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW) || keyboard.isKeyDown(keys.UP_ARROW), "second finger doesn't steer");
        assert.strictEqual(log.down[keys.SPACE], 1, "tap registered");
        pointer("pointerup", 1, 350, 150);
        log.stop();
        player.destroy();
    });

    test("cancel, hidden page, blur and scene change release every key", function (assert) {
        setup({holdSides: {left: "LEFT_ARROW", right: "LEFT_ARROW"}});

        pointer("pointerdown", 1, 100, 100);
        pointer("pointercancel", 1, 100, 100);
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "pointercancel");

        pointer("pointerdown", 1, 100, 100);
        Object.defineProperty(document, "hidden", {value: true, configurable: true});
        document.dispatchEvent(new Event("visibilitychange"));
        delete document.hidden;
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "visibilitychange to hidden");
        pointer("pointerup", 1, 100, 100);

        pointer("pointerdown", 1, 100, 100);
        window.dispatchEvent(new Event("blur"));
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "window blur");
        pointer("pointerup", 1, 100, 100);

        pointer("pointerdown", 1, 100, 100);
        assert.ok(keyboard.isKeyDown(keys.LEFT_ARROW), "held before the scene change");
        Crafty.enterScene("Menu");
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "scene change");
        pointer("pointermove", 1, 110, 100);
        assert.notOk(keyboard.isKeyDown(keys.LEFT_ARROW), "a finger from before the change stays ignored");
        pointer("pointerup", 1, 110, 100);
    });

    test("gestures only run on the listed scenes, with enable/disable overrides", function (assert) {
        setup({tap: "SPACE"});
        var log = keyLog();
        Crafty.enterScene("Menu");
        tap(1, 100, 100);
        assert.notOk(log.down[keys.SPACE], "off in Menu");
        TouchControls.enable();
        tap(1, 100, 100);
        assert.strictEqual(log.down[keys.SPACE], 1, "enable() turns it on in Menu");
        Crafty.enterScene("Game");
        TouchControls.disable();
        tap(1, 100, 100);
        assert.strictEqual(log.down[keys.SPACE], 1, "disable() turns it off in Game");
        log.stop();
    });

    test("touches on Mouse entities are left to Crafty", function (assert) {
        setup({tap: "SPACE"});
        var clicked = 0;
        var button = Crafty.e("2D, DOM, Mouse").attr({x: 10, y: 10, w: 80, h: 40}).bind("Click", function () { clicked++; });
        var log = keyLog();
        tap(1, 50, 30);
        assert.notOk(log.down[keys.SPACE], "no tap key on the button");
        tap(1, 300, 200);
        assert.strictEqual(log.down[keys.SPACE], 1, "tap key elsewhere");
        log.stop();
        button.destroy();
        assert.strictEqual(clicked, 0, "pointer events alone don't click (Crafty's own touch handling does)");
    });

    test("TouchTap and TouchSwipe events", function (assert) {
        setup({});
        var taps = [], swipes = [];
        var onTap = function (e) { taps.push(e); };
        var onSwipe = function (e) { swipes.push(e.direction); };
        Crafty.bind("TouchTap", onTap);
        Crafty.bind("TouchSwipe", onSwipe);
        tap(1, 100, 100);
        swipe(1, 100, 100, 0, -50);
        swipe(1, 100, 100, -50, 10);
        assert.strictEqual(taps.length, 1, "one TouchTap");
        assert.deepEqual(swipes, ["up", "left"], "TouchSwipe directions");
        Crafty.unbind("TouchTap", onTap);
        Crafty.unbind("TouchSwipe", onSwipe);
    });

    test("unknown key names fail loudly", function (assert) {
        assert.throws(function () { TouchControls.init({tap: "SPACEBAR", fitPage: false}); }, /unknown key/);
    });

    test("rings appear under fingers and go when they lift", function (assert) {
        setup({tap: "SPACE"});
        pointer("pointerdown", 1, 100, 100);
        pointer("pointerdown", 2, 200, 100);
        assert.strictEqual(document.querySelectorAll(".touch-controls-ring").length, 2, "one ring per finger");
        pointer("pointerup", 1, 100, 100);
        pointer("pointerup", 2, 200, 100);
        assert.strictEqual(document.querySelectorAll(".touch-controls-ring").length, 0, "removed on lift");
    });
})();
