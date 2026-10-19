// A small bar that fills above whoever is doing a timed action: a dark track with a fill that grows from
// empty to full over the time it is given, hidden whenever nothing is running. One per thing that can be
// busy, made in buildWorld (scenes/game.js) and wired to its own events by the on* helpers below.
//   Crafty.e("TimerBar").follow(player, TIMER_BAR_OFFSET_Y).onHold();
//   bar.run(LOG_CHOP_MS);   // fills over 2s; calling it again restarts the fill
//   bar.stop();             // hides it at once
Crafty.c("TimerBar", {
    init: function() {
        this.requires("2D, DOM, Color");
        this.attr({w: TIMER_BAR_W, h: TIMER_BAR_H, z: TIMER_BAR_Z, visible: false})
            .color(TIMER_BAR_TRACK_COLOR)
            .css({borderRadius: "3px"});
        // The fill is its own entity so it can be narrower than the track; both follow the same owner.
        this.fill = Crafty.e("2D, DOM, Color")
            .attr({w: 0, h: TIMER_BAR_H, z: TIMER_BAR_Z + 1, visible: false})
            .color(TIMER_BAR_FILL_COLOR)
            .css({borderRadius: "3px"});
        this.startedAt = null;
        this.runMs = 0;
        this.bind("UpdateFrame", this.grow);
        this.bind("Remove", function () { this.fill.destroy(); });
    },

    // Centres the bar above the entity's box and moves with it from then on.
    follow: function(entity, offsetY) {
        var x = entity.x + (entity.w - this.w) / 2;
        var y = entity.y + offsetY;
        this.attr({x: x, y: y});
        this.fill.attr({x: x, y: y});
        // Both are attached to the owner rather than to each other, so neither drags the other about.
        entity.attach(this);
        entity.attach(this.fill);
        return this;
    },

    run: function(ms) {
        this.startedAt = Date.now();
        this.runMs = ms;
        this.visible = this.fill.visible = true;
        this.fill.attr({w: 0});
        return this;
    },

    stop: function() {
        this.startedAt = null;
        this.visible = this.fill.visible = false;
        return this;
    },

    grow: function() {
        if (this.startedAt === null) {
            return;
        }
        var done = Math.min(1, (Date.now() - this.startedAt) / this.runMs);
        this.fill.attr({w: Math.max(1, this.w * done)});
    },

    // The fox's bar: any held action (dig, chop, wedge) announces itself with these two events.
    onHold: function() {
        this.bind("HoldStarted", function (hold) { this.run(hold.ms); });
        this.bind("HoldEnded", this.stop);
        return this;
    },

    // The owl's bar: he is busy from "PotterWorking" until "PotterDone", for as long as that job takes.
    onPotter: function(owl) {
        this.bind("PotterWorking", function () {
            this.run(owl.working && owl.working.kind === "trim" ? POT_TRIM_MS : POT_MAKE_MS);
        });
        this.bind("PotterDone", this.stop);
        return this;
    },

    // The kiln's bar: one unbroken fill across the firing and the cooling, because the player is waiting
    // for one thing, the pots. Two separate fills would look like the bar starting over. The fill changes
    // colour when the fire goes out, so which phase it is in still reads.
    onKiln: function() {
        this.bind("KilnStateChanged", function (kiln) {
            var whole = KILN_FIRE_MS + KILN_COOL_MS;
            if (kiln.state === "firing") {
                this.run(whole).fill.color(TIMER_BAR_FILL_COLOR);
            } else if (kiln.state === "cooling") {
                // Carry on rather than restart, and pin the bar to the boundary so what is left is exactly
                // KILN_COOL_MS however late the state change lands. grow() repaints it before the next frame.
                this.run(whole);
                this.startedAt = Date.now() - KILN_FIRE_MS;
                this.fill.color(TIMER_BAR_COOL_COLOR);
                this.grow();
            } else {
                this.stop();
            }
        });
        return this;
    }
});
