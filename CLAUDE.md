# 帳單提取器 (Bill Extract Extension)

## 專案概述
這是一個 Chrome 瀏覽器擴展，用於自動提取台灣銀行信用卡電子帳單的資料，支援多家銀行格式並提供完整的消費明細分析。

## 支援銀行
- ✅ **玉山銀行** (esunbank.com.tw)
- ✅ **兆豐銀行** (megabank.com.tw)

## 主要功能

### 📊 帳單資訊提取
- 銀行名稱
- 帳單期間 (114年07月)
- 本期應繳金額
- 最低應繳金額
- 帳單結帳日
- 繳款截止日
- 上期未繳金額
- 幣別資訊

### 💳 消費明細分析
- 消費日期 / 入帳日期
- 商店名稱和地點
- 原幣別和金額
- 台幣金額
- 支付方式 (Google Pay等)
- 分期付款資訊
- 回饋金額識別

### 📈 統計功能
- 總消費金額計算
- 總回饋金額計算
- 交易筆數統計
- 智能分類 (消費/回饋/分期)

### 📤 資料匯出
- **JSON 格式** - 完整結構化資料
- **CSV 格式** - 包含帳單資訊和消費明細
- 自動檔名 (含帳單期間和時間戳)

## 技術架構

### Content Script
- 自動檢測銀行類型
- 智能頁面解析
- 錯誤處理和容錯
- 實時資料提取

### Popup 界面
- Vue 3 + Vite 構建
- 響應式設計
- 即時資料顯示
- 一鍵匯出功能

### 資料儲存
- Chrome Storage API
- 自動保存最新資料
- 跨會話資料持久化

## 安裝和使用

### 開發環境
```bash
npm install
npm run dev
```

### 建置擴展
```bash
npm run build
```

### 載入到 Chrome
1. 開啟 Chrome 擴展管理頁面
2. 啟用開發者模式
3. 載入 `build` 資料夾

### 使用方式
1. 開啟銀行電子帳單頁面
2. 點擊擴展圖示
3. 點擊「提取帳單」按鈕
4. 查看提取的資料
5. 選擇匯出格式下載

## 銀行特殊處理

### 玉山銀行
- 檢測關鍵字: `玉山銀行電子帳單`, `esunbank`
- 消費明細表格: `table.detail tbody.data-detailTbodyPC`
- 支援支付方式識別 (Google Pay, Apple Pay等)
- 支援多幣別交易

### 兆豐銀行
- 檢測關鍵字: `信用卡電子帳單`, `megabank`, `兆豐`
- 消費明細: `.rows.es-card1001, .rows.es-card1002`
- 自動顯示隱藏的交易明細
- 智能分期付款識別
- 回饋金額精確分類

## 資料結構

### 帳單基本資訊
```javascript
{
  bankName: "玉山銀行",
  billPeriod: "114年07月",
  totalAmount: "14,165",
  minimumAmount: "1,417",
  dueDate: "114/08/20",
  statementDate: "114/07/21",
  currency: {
    name: "台幣",
    code: "TWD"
  }
}
```

### 消費明細
```javascript
{
  consumeDate: "07/01",
  postDate: "07/04",
  description: "MCDONALD'S",
  originalCurrency: "JPY",
  originalAmount: 1260,
  twdAmount: 256,
  paymentMethod: "Google pay",
  isCredit: false,
  transactionType: "consumption"
}
```

## 錯誤處理
- 網頁元素缺失保護
- 銀行格式變更適應
- 資料解析異常處理
- 用戶友好錯誤提示

## 隱私和安全
- 純本地處理，無資料上傳
- 不儲存敏感財務資訊
- 僅在銀行官網運行
- 開源透明代碼

## 版本記錄
- **v1.0.0** - 支援玉山銀行和兆豐銀行
- 完整消費明細提取
- JSON/CSV 匯出功能
- 智能交易分類

## 開發團隊
- Claude Code Assistant
- 使用者: virgil246

## 授權
MIT License

---
*此專案僅供個人理財管理使用，請遵守各銀行服務條款*