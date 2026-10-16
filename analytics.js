// Sends a GA4 event when the gtag snippet in index.html is enabled;
// does nothing locally or when analytics is blocked.
function track(eventName, params) {
    if (typeof gtag === "function") {
        gtag("event", eventName, params || {});
    }
}
