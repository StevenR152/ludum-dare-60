// Logs a "you can't do that" message to the console and shows it above the fox (PlayerNotification, which
// shows it every time so repeated mistakes are still explained).
//   showStatus("Backpack full, you can't put more in");
function showStatus(message) {
    console.log(message);
    if (statusGate.open) {
        statusGate.lines.push(message);
        return;
    }
    Crafty.trigger("StatusText", message);
}
