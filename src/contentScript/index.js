console.info('contentScript is running')
// grab full page when click ext
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    if (message.action === 'captureVisibleTab') {
        const pageContent = document.documentElement.outerHTML;
        console.log(pageContent)
        sendResponse({ content: pageContent });
    }
    return true;
});

