console.log('background is running')

// 處理 sidepanel 開啟
chrome.action.onClicked.addListener(async (tab) => {
  // 檢查是否在銀行頁面
  const isBankPage = tab.url?.includes('esunbank.com.tw') || 
                     tab.url?.includes('megabank.com.tw');
  
  if (isBankPage) {
    // 在銀行頁面時開啟 sidepanel 進行多月分析
    await chrome.sidePanel.open({ tabId: tab.id });
  }
  // 其他頁面預設使用 popup (由 manifest.js 的 default_popup 處理)
});

// 監聽安裝事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('帳單提取器擴展已安裝');
});

// 監聽來自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
  
  if (request.action === 'billExtracted') {
    console.log('新帳單資料已提取:', request.data);
    // 這裡可以添加其他處理邏輯，如通知等
  }
})
