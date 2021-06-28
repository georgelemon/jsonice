// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse();
    return true;
});