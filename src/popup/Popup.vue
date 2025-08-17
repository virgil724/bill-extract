<script setup lang="js">
import { ref, onMounted } from 'vue'

const billData = ref(null)
const isLoading = ref(false)
const error = ref('')
const showAllTransactions = ref(false)

const extractBill = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractBill' })
    
    if (response.success && response.data) {
      billData.value = response.data
      // 同時儲存到 storage
      await chrome.storage.local.set({ 
        latestBillData: response.data,
        lastExtractTime: Date.now()
      })
    } else {
      error.value = '未檢測到帳單頁面或無法提取資料'
    }
  } catch (err) {
    error.value = '提取失敗：' + err.message
  } finally {
    isLoading.value = false
  }
}

const exportData = () => {
  if (!billData.value) return
  
  const dataStr = JSON.stringify(billData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `bill_${billData.value.billPeriod || 'data'}_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const exportCSV = () => {
  if (!billData.value) return
  
  let csvContent = [
    ['項目', '內容'],
    ['銀行', billData.value.bankName || ''],
    ['帳單期間', billData.value.billPeriod || ''],
    ['應繳金額', billData.value.totalAmount || ''],
    ['最低應繳金額', billData.value.minimumAmount || ''],
    ['繳款截止日', billData.value.dueDate || ''],
    ['上期未繳金額', billData.value.previousUnpaid || ''],
    ['幣別', billData.value.currency ? `${billData.value.currency.name} (${billData.value.currency.code})` : ''],
    ['提取時間', new Date(billData.value.extractTime).toLocaleString('zh-TW')],
    [''], // 空行
    ['消費明細'],
    ['消費日', '入帳日', '消費明細', '原幣別', '原金額', '台幣金額', '支付方式']
  ]
  
  if (billData.value.transactions && billData.value.transactions.length > 0) {
    billData.value.transactions.forEach(tx => {
      csvContent.push([
        tx.consumeDate,
        tx.postDate,
        tx.description,
        tx.originalCurrency,
        tx.originalAmount,
        tx.twdAmount,
        tx.paymentMethod
      ])
    })
  }
  
  const csvString = csvContent.map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `bill_${billData.value.billPeriod || 'data'}_${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const clearData = () => {
  billData.value = null
  showAllTransactions.value = false
  chrome.storage.local.remove(['latestBillData', 'lastExtractTime'])
}

const calculateTotalSpending = () => {
  if (!billData.value?.transactions) return 0
  return billData.value.transactions
    .filter(tx => !tx.isCredit && tx.twdAmount > 0)
    .reduce((sum, tx) => sum + tx.twdAmount, 0)
    .toLocaleString()
}

const calculateTotalRewards = () => {
  if (!billData.value?.transactions) return 0
  return billData.value.transactions
    .filter(tx => tx.isCredit)
    .reduce((sum, tx) => sum + tx.twdAmount, 0)
    .toLocaleString()
}

onMounted(async () => {
  // 載入上次提取的資料
  const result = await chrome.storage.local.get(['latestBillData'])
  if (result.latestBillData) {
    billData.value = result.latestBillData
  }
})
</script>

<template>
  <main>
    <h3>帳單提取器</h3>

    <div class="actions">
      <button @click="extractBill" :disabled="isLoading" class="extract-btn">
        {{ isLoading ? '提取中...' : '提取帳單' }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="billData" class="bill-data">
      <h4>📄 帳單資訊</h4>
      <div class="data-grid">
        <div class="data-item">
          <span class="label">銀行:</span>
          <span class="value">{{ billData.bankName }}</span>
        </div>
        <div class="data-item" v-if="billData.billPeriod">
          <span class="label">帳單期間:</span>
          <span class="value">{{ billData.billPeriod }}</span>
        </div>
        <div class="data-item" v-if="billData.totalAmount">
          <span class="label">應繳金額:</span>
          <span class="value amount">{{ billData.totalAmount }} 元</span>
        </div>
        <div class="data-item" v-if="billData.minimumAmount">
          <span class="label">最低應繳:</span>
          <span class="value">{{ billData.minimumAmount }} 元</span>
        </div>
        <div class="data-item" v-if="billData.dueDate">
          <span class="label">繳款截止:</span>
          <span class="value due-date">{{ billData.dueDate }}</span>
        </div>
        <div class="data-item" v-if="billData.previousUnpaid">
          <span class="label">上期未繳:</span>
          <span class="value">{{ billData.previousUnpaid }} 元</span>
        </div>
        <div class="data-item" v-if="billData.currency">
          <span class="label">幣別:</span>
          <span class="value">{{ billData.currency.name }} ({{ billData.currency.code }})</span>
        </div>
      </div>

      <div class="export-actions">
        <button @click="exportData" class="export-btn">匯出 JSON</button>
        <button @click="exportCSV" class="export-btn">匯出 CSV</button>
        <button @click="clearData" class="clear-btn">清除資料</button>
      </div>

      <div class="extract-time">
        提取時間: {{ new Date(billData.extractTime).toLocaleString('zh-TW') }}
      </div>

      <!-- 消費明細 -->
      <div v-if="billData.transactions && billData.transactions.length > 0" class="transactions">
        <h4>💳 消費明細 ({{ billData.transactions.length }} 筆)</h4>
        <div class="transaction-summary">
          <span>總消費: {{ calculateTotalSpending() }} 元</span>
          <span>總回饋: {{ calculateTotalRewards() }} 元</span>
        </div>
        
        <div class="transaction-list">
          <div v-for="(tx, index) in billData.transactions.slice(0, showAllTransactions ? billData.transactions.length : 5)" 
               :key="index" 
               class="transaction-item">
            <div class="transaction-date">{{ tx.consumeDate }}</div>
            <div class="transaction-detail">
              <div class="transaction-desc">{{ tx.description }}</div>
              <div class="transaction-amount" :class="{ 'credit': tx.isCredit }">
                {{ tx.twdAmount ? tx.twdAmount.toLocaleString() : tx.rawTwdAmount }} 元
                <span v-if="tx.originalCurrency && tx.originalCurrency !== 'TWD'" class="original-amount">
                  ({{ tx.originalCurrency }} {{ tx.originalAmount }})
                </span>
              </div>
              <div v-if="tx.paymentMethod" class="payment-method">{{ tx.paymentMethod }}</div>
            </div>
          </div>
        </div>
        
        <button v-if="billData.transactions.length > 5" 
                @click="showAllTransactions = !showAllTransactions"
                class="toggle-btn">
          {{ showAllTransactions ? '收起' : `顯示全部 ${billData.transactions.length} 筆` }}
        </button>
      </div>
    </div>

    <div v-else-if="!isLoading" class="no-data">
      請在帳單頁面點擊「提取帳單」按鈕
    </div>
  </main>
</template>

<style>
:root {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
}

body {
  min-width: 320px;
  background: #f5f5f5;
  color: #333;
  margin: 0;
}

main {
  padding: 16px;
  margin: 0 auto;
  max-width: 400px;
}

h3 {
  color: #2c5aa0;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-align: center;
}

h4 {
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  margin: 16px 0 8px 0;
}

.actions {
  margin-bottom: 16px;
}

.extract-btn {
  width: 100%;
  padding: 12px;
  background: #2c5aa0;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.extract-btn:hover:not(:disabled) {
  background: #1e3d6f;
}

.extract-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  background: #fee;
  color: #c33;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 16px;
  border-left: 3px solid #c33;
}

.no-data {
  text-align: center;
  color: #666;
  font-size: 14px;
  padding: 24px 16px;
}

.bill-data {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.data-grid {
  margin-bottom: 16px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.data-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.value.amount {
  color: #2c5aa0;
  font-weight: 600;
}

.value.due-date {
  color: #d73502;
  font-weight: 600;
}

.export-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.export-btn {
  flex: 1;
  padding: 8px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #369870;
}

.clear-btn {
  flex: 1;
  padding: 8px 12px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #e53e3e;
}

.extract-time {
  font-size: 11px;
  color: #999;
  text-align: center;
  margin-top: 8px;
}

.transactions {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.transaction-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
}

.transaction-list {
  max-height: 300px;
  overflow-y: auto;
}

.transaction-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-date {
  font-size: 11px;
  color: #666;
  width: 40px;
  flex-shrink: 0;
  margin-right: 8px;
}

.transaction-detail {
  flex: 1;
}

.transaction-desc {
  font-size: 12px;
  color: #333;
  margin-bottom: 2px;
  line-height: 1.3;
}

.transaction-amount {
  font-size: 13px;
  font-weight: 600;
  color: #d73502;
  margin-bottom: 2px;
}

.transaction-amount.credit {
  color: #42b983;
}

.original-amount {
  font-size: 10px;
  color: #999;
  font-weight: normal;
}

.payment-method {
  font-size: 10px;
  color: #42b983;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.toggle-btn {
  width: 100%;
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #e9ecef;
}
</style>
