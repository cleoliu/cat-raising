# PWA 圖標準備指南

## 🎨 需要準備的圖標尺寸

將一個 512x512 的高品質 Cat-Raising logo 圖標縮放為以下尺寸，並放置在 `public/icons/` 目錄中：

### 必要圖標
```
public/icons/
├── icon-72x72.png      # 72x72 像素
├── icon-96x96.png      # 96x96 像素
├── icon-128x128.png    # 128x128 像素
├── icon-144x144.png    # 144x144 像素
├── icon-152x152.png    # 152x152 像素 (iOS)
├── icon-192x192.png    # 192x192 像素
├── icon-384x384.png    # 384x384 像素
└── icon-512x512.png    # 512x512 像素
```

### 快捷方式圖標（可選）
```
public/icons/
├── calculator-icon.png # 96x96 像素（計算機圖標）
└── cat-icon.png       # 96x96 像素（貓咪圖標）
```

## 🖼️ 設計建議

### 主要圖標設計
- **主色調**：使用應用程式的主要藍色 (#3b82f6)
- **背景**：純色背景或漸層
- **圖案**：簡潔的貓咪輪廓 + 計算機元素
- **文字**：可加入 "CR" 字樣（Cat-Raising 縮寫）
- **風格**：現代扁平化設計

### 圖標內容建議
```
┌─────────────────┐
│   🐱 + 📊      │  主要圖標：貓咪 + 圖表元素
│      CR         │  可選：加入文字
└─────────────────┘
```

## 🛠️ 快速製作方法

### 方法一：使用線上工具
1. 訪問 [PWA Builder Icon Generator](https://www.pwabuilder.com/imageGenerator)
2. 上傳 512x512 的原始圖標
3. 自動生成所有尺寸
4. 下載並解壓到 `public/icons/`

### 方法二：使用 Figma/Canva
1. 創建 512x512 畫布
2. 設計圖標
3. 匯出為 PNG
4. 使用圖片編輯軟體批量縮放

### 方法三：使用 ImageMagick（命令列）
```bash
# 假設你有 original-icon.png (512x512)
cd public/icons/

# 生成所有需要的尺寸
magick original-icon.png -resize 72x72 icon-72x72.png
magick original-icon.png -resize 96x96 icon-96x96.png
magick original-icon.png -resize 128x128 icon-128x128.png
magick original-icon.png -resize 144x144 icon-144x144.png
magick original-icon.png -resize 152x152 icon-152x152.png
magick original-icon.png -resize 192x192 icon-192x192.png
magick original-icon.png -resize 384x384 icon-384x384.png
magick original-icon.png -resize 512x512 icon-512x512.png
```

## 📱 測試 PWA 功能

### 桌面瀏覽器測試
1. 開啟 Chrome DevTools
2. 切換到 "Application" 標籤
3. 檢查 "Manifest" 和 "Service Workers"
4. 確認圖標和資訊正確顯示

### 手機測試
1. **Android Chrome**：
   - 訪問網站
   - 點擊選單中的 "安裝應用程式"
   - 或看到底部彈出的安裝提示

2. **iOS Safari**：
   - 訪問網站
   - 點擊分享按鈕
   - 選擇 "加入主畫面"

### 驗證安裝成功
- [ ] ✅ 主畫面顯示應用程式圖標
- [ ] ✅ 點擊圖標開啟獨立應用程式視窗
- [ ] ✅ 狀態列顯示應用程式名稱
- [ ] ✅ 啟動畫面顯示正確

## 🎯 最佳實踐

1. **圖標品質**：使用向量圖或高解析度點陣圖
2. **一致性**：所有尺寸保持設計一致
3. **可辨識性**：在小尺寸下仍能清楚辨識
4. **品牌識別**：符合應用程式的視覺風格
5. **測試**：在不同設備和瀏覽器上測試

完成圖標準備後，PWA 功能就可以完全運作了！