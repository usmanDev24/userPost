function updatePageUI() {
    const mainLayout = document.getElementById('main-app-wrapper').innerHTML;
    history.replaceState({ savedHtml: mainLayout }, document.title);
}
window.addEventListener('pageshow', (event) => {
    // 1. Get the navigation metric
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const navigationType = navigationEntry ? navigationEntry.type : null;

    // 2. If the user hit Reload, wipe out the sticky history state completely
    if (navigationType === 'reload') {
        console.log('User reloaded the page. Resetting history state cache...');
        history.replaceState(null, document.title, window.location.href);
        return; // Stop execution and let the fresh server-rendered page stay as-is
    }

    // 3. Only restore the cached HTML if navigating via Back/Forward
    if (navigationType === 'back_forward' && history.state && history.state.savedHtml) {
        console.log('Restoring mutated DOM layout from back/forward navigation...');
        document.getElementById('main-app-wrapper').innerHTML = history.state.savedHtml;
    }
});