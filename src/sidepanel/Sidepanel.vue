<script setup lang="js">
import { ref, onMounted, computed } from 'vue'

const billHistory = ref({})
const selectedMonths = ref([])
const showChart = ref(false)
const loading = ref(false)

// 載入歷史帳單資料
const loadBillHistory = async () => {
  loading.value = true
  try {
    const result = await chrome.storage.local.get(['billHistory', 'latestBillData'])
    
    // 如果有歷史資料就載入
    if (result.billHistory) {
      billHistory.value = result.billHistory
    }
    
    // 如果有最新資料但不在歷史中，自動加入
    if (result.latestBillData && result.latestBillData.billPeriod && result.latestBillData.bankName) {
      const billKey = formatBillKey(result.latestBillData.billPeriod, result.latestBillData.bankName)
      if (billKey && !billHistory.value[billKey]) {
        billHistory.value[billKey] = result.latestBillData
        await saveBillHistory()
      }
    }
  } catch (error) {
    console.error('載入歷史資料失敗:', error)
  } finally {
    loading.value = false
  }
}

// 儲存歷史帳單資料
const saveBillHistory = async () => {
  await chrome.storage.local.set({ billHistory: billHistory.value })
}

// 格式化帳單鍵值 (例: "114年07月" + "玉山銀行" -> "202407_esun")
const formatBillKey = (billPeriod, bankName) => {
  if (!billPeriod || !bankName) return null
  const match = billPeriod.match(/(\d{3})年(\d{2})月/)
  if (match) {
    const year = parseInt(match[1]) + 1911 // 民國年轉西元年
    const month = match[2].padStart(2, '0')
    const bankCode = getBankCode(bankName)
    return `${year}${month}_${bankCode}`
  }
  return null
}

// 取得銀行代碼
const getBankCode = (bankName) => {
  if (bankName.includes('玉山')) return 'esun'
  if (bankName.includes('兆豐')) return 'mega'
  if (bankName.includes('中國信託')) return 'ctbc'
  if (bankName.includes('台新')) return 'taishin'
  if (bankName.includes('國泰')) return 'cathay'
  return bankName.substring(0, 2).toLowerCase()
}

// 計算歷史帳單列表 (按時間倒序，同月份按銀行排序)
const historyList = computed(() => {
  return Object.entries(billHistory.value)
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => {
      // 先按年月排序（倒序），再按銀行排序
      const [dateA, bankA] = a.key.split('_')
      const [dateB, bankB] = b.key.split('_')
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA)
      }
      return bankA.localeCompare(bankB)
    })
})

// 計算選中月份的統計
const selectedStats = computed(() => {
  if (selectedMonths.value.length === 0) return null
  
  let totalSpending = 0
  let totalRewards = 0
  let totalTransactions = 0
  let bankCounts = {}
  let monthlySummary = []
  
  selectedMonths.value.forEach(monthKey => {
    const bill = billHistory.value[monthKey]
    if (!bill || !bill.transactions) return
    
    // 銀行統計
    bankCounts[bill.bankName] = (bankCounts[bill.bankName] || 0) + 1
    
    // 月份統計
    const monthSpending = bill.transactions
      .filter(tx => !tx.isCredit && tx.twdAmount > 0)
      .reduce((sum, tx) => sum + tx.twdAmount, 0)
    
    const monthRewards = bill.transactions
      .filter(tx => tx.isCredit)
      .reduce((sum, tx) => sum + tx.twdAmount, 0)
    
    totalSpending += monthSpending
    totalRewards += monthRewards
    totalTransactions += bill.transactions.length
    
    monthlySummary.push({
      period: bill.billPeriod,
      bank: bill.bankName,
      spending: monthSpending,
      rewards: monthRewards,
      transactions: bill.transactions.length
    })
  })
  
  return {
    totalSpending,
    totalRewards,
    totalTransactions,
    bankCounts,
    monthlySummary: monthlySummary.sort((a, b) => b.period.localeCompare(a.period)),
    averageSpending: selectedMonths.value.length > 0 ? totalSpending / selectedMonths.value.length : 0
  }
})

// 切換帳單選擇
const toggleMonth = (billKey) => {
  const index = selectedMonths.value.indexOf(billKey)
  if (index > -1) {
    selectedMonths.value.splice(index, 1)
  } else {
    selectedMonths.value.push(billKey)
  }
}

// 全選/全不選
const toggleAll = () => {
  if (selectedMonths.value.length === historyList.value.length) {
    selectedMonths.value = []
  } else {
    selectedMonths.value = historyList.value.map(item => item.key)
  }
}

// 清除指定帳單資料
const deleteBill = async (billKey) => {
  const bill = billHistory.value[billKey]
  if (confirm(`確定要刪除 ${bill.billPeriod} ${bill.bankName} 的帳單資料嗎？`)) {
    delete billHistory.value[billKey]
    selectedMonths.value = selectedMonths.value.filter(key => key !== billKey)
    await saveBillHistory()
  }
}

// 匯出選中的資料
const exportSelected = () => {
  if (selectedMonths.value.length === 0) return
  
  const exportData = {
    exportTime: new Date().toISOString(),
    selectedPeriods: selectedMonths.value.map(key => billHistory.value[key].billPeriod),
    summary: selectedStats.value,
    bills: selectedMonths.value.map(key => billHistory.value[key])
  }
  
  const dataStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `bills_analysis_${selectedMonths.value.length}months_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 監聽新帳單資料
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'billExtracted' && message.data) {
    const billKey = formatBillKey(message.data.billPeriod, message.data.bankName)
    if (billKey) {
      billHistory.value[billKey] = message.data
      saveBillHistory()
    }
  }
})

onMounted(() => {
  loadBillHistory()
})
</script>

<template>
  <div class="sidepanel">
    <header class="header">
      <h2>📊 帳單分析</h2>
      <p class="subtitle">多月份歷史統計</p>
    </header>

    <div v-if="loading" class="loading">
      載入中...
    </div>

    <div v-else-if="historyList.length === 0" class="no-data">
      <p>尚無歷史帳單資料</p>
      <p class="hint">請先在銀行頁面提取帳單資料</p>
    </div>

    <div v-else class="content">
      <!-- 歷史帳單列表 -->
      <section class="bill-list">
        <div class="section-header">
          <h3>📋 歷史帳單 ({{ historyList.length }} 筆)</h3>
          <button @click="toggleAll" class="toggle-all-btn">
            {{ selectedMonths.length === historyList.length ? '全不選' : '全選' }}
          </button>
        </div>

        <div class="bill-items">
          <div v-for="bill in historyList" 
               :key="bill.key" 
               class="bill-item"
               :class="{ selected: selectedMonths.includes(bill.key) }"
               @click="toggleMonth(bill.key)">
            <div class="bill-info">
              <div class="bill-period">{{ bill.billPeriod }}</div>
              <div class="bill-bank">{{ bill.bankName }}</div>
              <div class="bill-amount">{{ bill.totalAmount }} 元</div>
              <div class="bill-transactions">{{ bill.transactions?.length || 0 }} 筆交易</div>
            </div>
            <button @click.stop="deleteBill(bill.key)" class="delete-btn">
              🗑️
            </button>
          </div>
        </div>
      </section>

      <!-- 統計分析 -->
      <section v-if="selectedStats" class="statistics">
        <div class="section-header">
          <h3>📈 統計分析 (已選 {{ selectedMonths.length }} 筆)</h3>
          <button @click="exportSelected" class="export-btn">
            匯出分析
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">總消費</div>
            <div class="stat-value spending">{{ selectedStats.totalSpending.toLocaleString() }} 元</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">總回饋</div>
            <div class="stat-value rewards">{{ selectedStats.totalRewards.toLocaleString() }} 元</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">平均月消費</div>
            <div class="stat-value">{{ Math.round(selectedStats.averageSpending).toLocaleString() }} 元</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">總交易數</div>
            <div class="stat-value">{{ selectedStats.totalTransactions }} 筆</div>
          </div>
        </div>

        <!-- 銀行分布 -->
        <div class="bank-distribution">
          <h4>🏦 銀行分布</h4>
          <div class="bank-items">
            <div v-for="(count, bank) in selectedStats.bankCounts" 
                 :key="bank" 
                 class="bank-item">
              <span class="bank-name">{{ bank }}</span>
              <span class="bank-count">{{ count }} 筆</span>
            </div>
          </div>
        </div>

        <!-- 月份明細 -->
        <div class="monthly-details">
          <h4>📅 月份明細</h4>
          <div class="monthly-items">
            <div v-for="month in selectedStats.monthlySummary" 
                 :key="month.period" 
                 class="monthly-item">
              <div class="monthly-period">{{ month.period }}</div>
              <div class="monthly-bank">{{ month.bank }}</div>
              <div class="monthly-spending">{{ month.spending.toLocaleString() }} 元</div>
              <div class="monthly-transactions">{{ month.transactions }} 筆</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sidepanel {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fa;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.header h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.loading, .no-data {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.hint {
  font-size: 0.9rem;
  color: #999;
}

.content {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3, .section-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.toggle-all-btn, .export-btn {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.export-btn {
  background: #28a745;
}

.toggle-all-btn:hover, .export-btn:hover {
  opacity: 0.9;
}

.bill-list {
  margin-bottom: 30px;
}

.bill-items {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-item:hover {
  background: #f8f9fa;
}

.bill-item.selected {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.bill-info {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  align-items: center;
}

.bill-period {
  font-weight: 600;
  color: #333;
}

.bill-bank {
  color: #666;
  font-size: 0.9rem;
}

.bill-amount {
  color: #d73502;
  font-weight: 600;
}

.bill-transactions {
  color: #999;
  font-size: 0.85rem;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.statistics {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.stat-value {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.stat-value.spending {
  color: #d73502;
}

.stat-value.rewards {
  color: #28a745;
}

.bank-distribution, .monthly-details {
  margin-top: 24px;
}

.bank-distribution h4, .monthly-details h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1rem;
}

.bank-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bank-item {
  background: #e9ecef;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
}

.bank-name {
  color: #333;
  font-weight: 500;
}

.bank-count {
  color: #666;
  margin-left: 4px;
}

.monthly-items {
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
}

.monthly-item {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  align-items: center;
}

.monthly-item:last-child {
  border-bottom: none;
}

.monthly-period {
  font-weight: 500;
  color: #333;
}

.monthly-bank {
  color: #666;
  font-size: 0.9rem;
}

.monthly-spending {
  color: #d73502;
  font-weight: 500;
  text-align: right;
}

.monthly-transactions {
  color: #999;
  font-size: 0.85rem;
  text-align: right;
}
</style>