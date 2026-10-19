// Bottom-centre line for "you can't do that" feedback. Unlike PlayerNotification,
// it shows every time, so repeated mistakes are still explained.
//   Crafty.e("StatusMessage");          // once per Game scene
//   showStatus("Backpack full, you can't put more in");
Crafty.c("StatusMessage", {
    init: function() {
        this.requires("2D, HUD, Text, Delay, Tween");
        this.attr({x: 0, y: GAME_SCREEN_HEIGHT - 60, w: GAME_SCREEN_WIDTH, h: 30, z: 2000, alpha: 0});
        this.textAlign("center").textFont({ size: '20px', weight: 'bold' }).textColor('#FFF').unselectable();
        this.css({ textShadow: '0 0 4px #000' });
        this.bind("StatusText", this.show);
    },

    show: function(message) {
        this.cancelDelay(this.fadeOut);
        this.cancelTween("alpha");
        this.text(message);
        this.alpha = 1;
        this.delay(this.fadeOut, 2500);
    },

    fadeOut: function() {
        this.tween({alpha: 0}, 600);
    }
});

// Lines said while a mouse/touch press is being handled wait until that press has been dispatched
// (one tick). If the press started a walk to a far station (Fox.handlePress sets `defer`), they are kept
// instead, and said on release if the press was a tap, or dropped if it is still held on arrival.
var statusGate = {
    open: false,
    defer: false,
    lines: [],
    deferred: [],

    begin: function() {
        if (this.open) {
            return;
        }
        this.open = true;
        this.lines = [];
        setTimeout(this.end.bind(this), 0);
    },

    end: function() {
        var said = this.lines;
        this.open = false;
        this.lines = [];
        if (this.defer) {
            this.defer = false;
            this.deferred = said;
        } else {
            said.forEach(function (message) { Crafty.trigger("StatusText", message); });
        }
    },

    // Says the kept lines (show) or drops them.
    releaseDeferred: function(show) {
        var kept = this.deferred;
        this.deferred = [];
        if (show) {
            kept.forEach(function (message) { Crafty.trigger("StatusText", message); });
        }
    }
};
window.addEventListener("mousedown", function () { statusGate.begin(); }, true);
window.addEventListener("touchstart", function () { statusGate.begin(); }, true);

// Logs to the console and shows the message on screen.
function showStatus(message) {
    console.log(message);
    if (statusGate.open) {
        statusGate.lines.push(message);
        return;
    }
    Crafty.trigger("StatusText", message);
}
