// Logs a "you can't do that" message to the console and shows it above the fox (PlayerNotification, which
// shows it every time so repeated mistakes are still explained).
//   showStatus("Backpack full, you can't put more in");
//
// statusGate holds lines back while the fox is walking to a station (fox.js sets defer = true on the press).
// If the press is released before the fox arrives it was a tap, so the held line is said
// (releaseDeferred(true)); if the fox arrives with the press still held, the line is dropped
// (releaseDeferred(false)) because the station's own press handler runs instead.
var statusGate = {
    defer: false,
    lines: [],

    // showStatus() checks this: true while lines should be held back.
    get open() {
        return this.defer;
    },

    // Ends the hold. say = true shows the most recent held line, false discards them.
    releaseDeferred: function(say) {
        var lines = this.lines;
        this.defer = false;
        this.lines = [];
        if (say && lines.length > 0) {
            Crafty.trigger("StatusText", lines[lines.length - 1]);
        }
    },

    // Clears everything; call when a scene is (re)built so a hold never leaks between scenes.
    reset: function() {
        this.defer = false;
        this.lines = [];
    }
};

function showStatus(message) {
    console.log(message.text || message);
    if (statusGate.open) {
        statusGate.lines.push(message);
        return;
    }
    Crafty.trigger("StatusText", message);
}
