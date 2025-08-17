console.info('contentScript is running')

// 帳單提取功能
function extractBillData() {
    const billData = {};
    
    // 檢測銀行類型和頁面
    const title = document.title;
    const url = window.location.href;
    
    // 玉山銀行
    if (title.includes('玉山銀行電子帳單') || title.includes('玉山') || url.includes('esunbank')) {
        return extractEsunBillData();
    }
    
    // 兆豐銀行
    if (title.includes('信用卡電子帳單') || url.includes('megabank') || title.includes('兆豐')) {
        return extractMegaBillData();
    }
    
    return null;
}

// 玉山銀行帳單提取
function extractEsunBillData() {
    const billData = {};
    const title = document.title;
    
    // 提取基本帳單資訊
    billData.bankName = '玉山銀行';
    billData.extractTime = new Date().toISOString();
    billData.pageTitle = title;
    
    // 提取帳單月份
    const yearMonthElement = document.querySelector('.data-yearmonth');
    if (yearMonthElement) {
        billData.billPeriod = yearMonthElement.textContent.trim();
    }
    
    // 提取繳款截止日
    const expDateElement = document.querySelector('.data-expd');
    if (expDateElement) {
        billData.dueDate = expDateElement.textContent.trim();
    }
    
    // 提取應繳金額
    const needPayElements = document.querySelectorAll('.data-needPay');
    if (needPayElements.length > 0) {
        billData.totalAmount = needPayElements[0].textContent.trim();
    }
    
    // 提取最低應繳金額
    const lowPayElement = document.querySelector('.data-lowPay');
    if (lowPayElement) {
        billData.minimumAmount = lowPayElement.textContent.trim();
    }
    
    // 提取上期未繳金額
    const prevNotPayElement = document.querySelector('.data-prevNotPay');
    if (prevNotPayElement) {
        billData.previousUnpaid = prevNotPayElement.textContent.trim();
    }
    
    // 提取幣別
    const currencyNameElement = document.querySelector('.data-cName');
    const currencyCodeElement = document.querySelector('.data-cCode');
    if (currencyNameElement && currencyCodeElement) {
        billData.currency = {
            name: currencyNameElement.textContent.trim(),
            code: currencyCodeElement.textContent.trim()
        };
    }
    
    // 提取帳單結帳日 - 使用更可靠的方法
    const allTds = document.querySelectorAll('td');
    for (let td of allTds) {
        if (td.textContent.includes('帳單結帳日')) {
            const nextTd = td.nextElementSibling;
            if (nextTd) {
                billData.statementDate = nextTd.textContent.trim();
                break;
            }
        }
    }
    
    // 提取消費明細
    billData.transactions = extractEsunTransactions();
    
    return billData;
}

// 兆豐銀行帳單提取
function extractMegaBillData() {
    const billData = {};
    const title = document.title;
    
    // 提取基本帳單資訊
    billData.bankName = '兆豐銀行';
    billData.extractTime = new Date().toISOString();
    billData.pageTitle = title;
    
    // 提取帳單期間 (從 title 中提取)
    const periodMatch = title.match(/(\d{3})年\s*(\d{2})月/);
    if (periodMatch) {
        billData.billPeriod = `${periodMatch[1]}年${periodMatch[2]}月`;
    }
    
    // 提取本期應繳金額
    const amountElement = document.querySelector('#currency1 .col-12 span:nth-of-type(2)');
    if (amountElement) {
        billData.totalAmount = amountElement.textContent.trim();
    }
    
    // 提取帳單結帳日
    const billDateElement = document.querySelector('#currency1 .col-6:nth-child(2) span:nth-of-type(2)');
    if (billDateElement) {
        billData.statementDate = billDateElement.textContent.trim();
    }
    
    // 提取繳款截止日
    const dueDateElement = document.querySelector('#currency1 .col-6:nth-child(3) span:nth-of-type(2)');
    if (dueDateElement) {
        billData.dueDate = dueDateElement.textContent.trim();
    }
    
    // 提取幣別 (預設台幣)
    billData.currency = {
        name: '台幣',
        code: 'TWD'
    };
    
    // 提取消費明細
    billData.transactions = extractMegaTransactions();
    
    return billData;
}

// 玉山銀行消費明細提取
function extractEsunTransactions() {
    const transactions = [];
    
    // 尋找消費明細表格
    const detailTable = document.querySelector('table.detail tbody.data-detailTbodyPC');
    if (!detailTable) {
        return transactions;
    }
    
    const rows = detailTable.querySelectorAll('tr');
    let currentCard = '';
    
    for (let row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 9) continue;
        
        const consumeDate = cells[0].textContent.trim();
        const postDate = cells[1].textContent.trim();
        const description = cells[2].textContent.trim();
        const originalCurrency = cells[4].textContent.trim();
        const originalAmount = cells[5].textContent.trim();
        const twdCurrency = cells[6].textContent.trim();
        const twdAmount = cells[7].textContent.trim();
        const paymentMethod = cells[8].textContent.trim();
        
        // 跳過空行或標題行
        if (!consumeDate && !postDate && !description) continue;
        
        // 識別卡號信息
        if (description.includes('卡號：')) {
            currentCard = description;
            continue;
        }
        
        // 跳過非交易行（如標題、小計等）
        if (description.includes('上期應繳金額') || 
            description.includes('本期費用明細') || 
            description.includes('本期消費明細') ||
            description.includes('感謝您辦理')) {
            continue;
        }
        
        // 只處理有實際消費或費用的行
        if (consumeDate || description.includes('國外交易服務費') || description.includes('回饋')) {
            const transaction = {
                consumeDate: consumeDate || '',
                postDate: postDate || '',
                description: description || '',
                originalCurrency: originalCurrency || '',
                originalAmount: originalAmount ? parseFloat(originalAmount.replace(/[,\s]/g, '')) || 0 : 0,
                twdCurrency: twdCurrency || '',
                twdAmount: twdAmount ? parseFloat(twdAmount.replace(/[,\s-]/g, '')) || 0 : 0,
                paymentMethod: paymentMethod || '',
                cardInfo: currentCard,
                isCredit: twdAmount.includes('-'), // 負數表示回饋
                rawTwdAmount: twdAmount || ''
            };
            
            transactions.push(transaction);
        }
    }
    
    return transactions;
}

// 兆豐銀行消費明細提取
function extractMegaTransactions() {
    const transactions = [];
    
    // 先嘗試顯示隱藏的消費明細
    const hiddenRows = document.querySelectorAll('.rows[style*="display:none"]');
    hiddenRows.forEach(row => {
        if (row.style) {
            row.style.display = 'block';
        }
    });
    
    // 尋找消費明細
    const transactionRows = document.querySelectorAll('.rows.es-card1001, .rows.es-card1002');
    
    for (let row of transactionRows) {
        try {
            // 檢查是否有必要的元素
            const descElement = row.querySelector('[data-label="說明"]');
            if (!descElement) continue;
            
            // 跳過小計行
            if (descElement.textContent.includes('小  計')) {
                continue;
            }
            
            // 安全地提取元素內容
            const consumeDateEl = row.querySelector('[data-label="消費日"]');
            const postDateEl = row.querySelector('[data-label="入帳起息日"]');
            const descriptionEl = row.querySelector('[data-label="說明"]');
            const regionEl = row.querySelector('[data-label="地區"]');
            const exchangeDateEl = row.querySelector('[data-label="兌換日"]');
            const originalAmountEl = row.querySelector('[data-label="原幣金額"]');
            const twdAmountEl = row.querySelector('[data-label="台幣金額"]');
            
            const consumeDate = consumeDateEl ? consumeDateEl.textContent.trim() : '';
            const postDate = postDateEl ? postDateEl.textContent.trim() : '';
            const description = descriptionEl ? descriptionEl.textContent.trim() : '';
            const region = regionEl ? regionEl.textContent.trim() : '';
            const exchangeDate = exchangeDateEl ? exchangeDateEl.textContent.trim() : '';
            const originalAmount = originalAmountEl ? originalAmountEl.textContent.trim() : '';
            const twdAmount = twdAmountEl ? twdAmountEl.textContent.trim() : '';
        
            // 跳過空行
            if (!consumeDate && !description) continue;
            
            // 解析幣別和金額
            let originalCurrency = '';
            let originalAmountValue = 0;
            let twdAmountValue = 0;
            
            if (originalAmount) {
                const currencyMatch = originalAmount.match(/([A-Z]{3})\s+([\d,.-]+)/);
                if (currencyMatch) {
                    originalCurrency = currencyMatch[1];
                    originalAmountValue = parseFloat(currencyMatch[2].replace(/[,\s]/g, '')) || 0;
                }
            }
            
            if (twdAmount) {
                twdAmountValue = parseFloat(twdAmount.replace(/[,\s]/g, '')) || 0;
            }
            
            // 分析交易類型
            const isNegativeAmount = twdAmountValue < 0 || twdAmount.includes('-');
            const isInstallmentRelated = description.includes('分期') || description.includes('單筆簽單');
            const isRealReward = description.includes('回饋') || description.includes('紅利') || 
                               description.includes('退費') || description.includes('退款');
            
            // 兆豐銀行交易分類：
            // 1. 分期轉換：負數且包含原消費商店名稱，但不含"分期"字樣 -> 不算真實消費也不算回饋
            // 2. 真正回饋：負數且明確包含"回饋"等字樣
            // 3. 一般消費：正數
            // 4. 分期付款：正數且包含"分期"字樣
            
            const isInstallmentDeduction = isNegativeAmount && !isRealReward && 
                                         (description.includes('JD*JINGDONG') || description.includes('JINGDONG'));
            
            const transaction = {
                consumeDate: consumeDate || '',
                postDate: postDate || '',
                description: description || '',
                region: region || '',
                exchangeDate: exchangeDate || '',
                originalCurrency: originalCurrency || 'TWD',
                originalAmount: originalAmountValue,
                twdCurrency: 'TWD',
                twdAmount: Math.abs(twdAmountValue),
                rawTwdAmount: twdAmount || '',
                isCredit: isRealReward, // 只有真正的回饋才標記為回饋
                isInstallmentDeduction: isInstallmentDeduction, // 標記分期轉換扣除
                transactionType: isRealReward ? 'reward' : 
                               isInstallmentDeduction ? 'installment_deduction' :
                               isInstallmentRelated ? 'installment_payment' : 'consumption',
                paymentMethod: ''
            };
            
            transactions.push(transaction);
        } catch (error) {
            console.log('提取兆豐銀行交易明細時發生錯誤:', error);
            continue;
        }
    }
    
    return transactions;
}

// 格式化月份為鍵值 (例: "114年07月" + "玉山銀行" -> "202407_esun")
function formatBillKey(billPeriod, bankName) {
    if (!billPeriod || !bankName) return null;
    const match = billPeriod.match(/(\d{3})年(\d{2})月/);
    if (match) {
        const year = parseInt(match[1]) + 1911; // 民國年轉西元年
        const month = match[2].padStart(2, '0');
        const bankCode = getBankCode(bankName);
        return `${year}${month}_${bankCode}`;
    }
    return null;
}

// 取得銀行代碼
function getBankCode(bankName) {
    if (bankName.includes('玉山')) return 'esun';
    if (bankName.includes('兆豐')) return 'mega';
    if (bankName.includes('中國信託')) return 'ctbc';
    if (bankName.includes('台新')) return 'taishin';
    if (bankName.includes('國泰')) return 'cathay';
    // 預設使用銀行名稱的前兩個字元
    return bankName.substring(0, 2).toLowerCase();
}

// 自動檢測並提取帳單資料
async function autoExtractBill() {
    const billData = extractBillData();
    if (billData) {
        // 儲存為最新資料 (給 popup 使用)
        await chrome.storage.local.set({ 
            latestBillData: billData,
            lastExtractTime: Date.now()
        });
        
        // 同時儲存到歷史記錄 (給 sidepanel 使用)
        const billKey = formatBillKey(billData.billPeriod, billData.bankName);
        if (billKey) {
            const result = await chrome.storage.local.get(['billHistory']);
            const billHistory = result.billHistory || {};
            billHistory[billKey] = billData;
            await chrome.storage.local.set({ billHistory });
        }
        
        // 發送消息給 popup 和 sidepanel
        chrome.runtime.sendMessage({
            action: 'billExtracted',
            data: billData
        });
        
        console.log('帳單資料已提取:', billData);
    }
}

// 頁面載入完成後自動檢測
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoExtractBill);
} else {
    autoExtractBill();
}

// 監聽來自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message)
    
    if (message.action === 'captureVisibleTab') {
        const pageContent = document.documentElement.outerHTML;
        console.log(pageContent)
        sendResponse({ content: pageContent });
    }
    
    if (message.action === 'extractBill') {
        const billData = extractBillData();
        if (billData) {
            // 同時更新歷史記錄
            const billKey = formatBillKey(billData.billPeriod, billData.bankName);
            if (billKey) {
                chrome.storage.local.get(['billHistory']).then(result => {
                    const billHistory = result.billHistory || {};
                    billHistory[billKey] = billData;
                    chrome.storage.local.set({ billHistory });
                });
            }
        }
        sendResponse({ 
            success: !!billData,
            data: billData 
        });
    }
    
    return true;
});

