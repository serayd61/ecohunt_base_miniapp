# EcoHunt Base Mini App Setup Guide

## 🎯 Overview
Bu rehber EcoHunt projesini Base Mini App olarak deploy etmek için gerekli tüm adımları içerir.

## ✅ Yapılan Değişiklikler

### 1. 📦 Frontend Dependencies
```json
{
  "@farcaster/miniapp-sdk": "^0.1.10",
  "@coinbase/wallet-sdk": "^4.0.3"
}
```

### 2. 📁 Farcaster Manifest
- `frontend/public/.well-known/farcaster.json` oluşturuldu
- Base Mini App için gerekli metadata yapılandırıldı

### 3. 🎨 Meta Tags
- `layout.tsx` dosyasına Base mini app meta tags eklendi
- Open Graph ve Twitter kartları güncellendi
- `fc:miniapp` metadata eklendi

### 4. 🚀 SDK Entegrasyonu
- Ana sayfaya Farcaster SDK entegrasyonu eklendi
- `sdk.actions.ready()` çağrısı implementasyonu
- Error handling ve success notifications

### 5. 🔧 Environment Variables
- Base Mini App konfigürasyonu eklendi
- Chain ID ve network ayarları

## 🚀 Deployment Adımları

### 1. Dependencies Kurulumu
```bash
cd frontend
npm install
```

### 2. Environment Variables Ayarlama
```bash
# .env.local dosyası oluştur
cp .env.example .env.local

# Gerekli değerleri doldur:
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend.com
NEXT_PUBLIC_GREEN_TOKEN_ADDRESS=your_token_address
```

### 3. Vercel Deployment
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deployment
vercel --prod
```

### 4. Vercel Environment Variables
Vercel dashboard'da şu environment variables'ları ekle:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_GREEN_TOKEN_ADDRESS`
- `NEXT_PUBLIC_FARCASTER_APP_ID`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_NETWORK_NAME`

### 5. Smart Contracts Deployment
```bash
cd deployment
npm install
npm run deploy:base-mainnet
```

### 6. Backend Setup
```bash
cd backend
npm install
npm start
```

## 🔍 Base Mini App Gereksinimleri ✅

- [x] Farcaster Manifest dosyası (`/.well-known/farcaster.json`)
- [x] `@farcaster/miniapp-sdk` kurulumu
- [x] `sdk.actions.ready()` çağrısı
- [x] `fc:miniapp` meta tag
- [x] Base network konfigürasyonu
- [x] Environment variables setup

## 📱 Test Etme

1. **Local Test:**
   ```bash
   npm run dev
   ```

2. **Production Test:**
   - Vercel URL'ini ziyaret et
   - Farcaster SDK'nın düzgün yüklendiğini kontrol et

3. **Base Integration Test:**
   - Base Build Preview tool kullan
   - Mini app functionality'sini test et

## ⚠️ Önemli Notlar

1. **Images:** Manifest'te belirtilen tüm image URL'leri mevcut olmalı
2. **URLs:** Deployment sonrası URL'leri güncelle
3. **API Keys:** Gerekli API key'leri environment variables'a ekle
4. **Contract Addresses:** Smart contract deployment sonrası adresleri güncelle

## 🛠️ Troubleshooting

### Manifest 404 Hatası
```bash
# .well-known klasörünün public içinde olduğundan emin ol
frontend/public/.well-known/farcaster.json
```

### SDK Import Hatası
```bash
# Package'in doğru kurulduğundan emin ol
npm install @farcaster/miniapp-sdk
```

### Environment Variables Hatası
```bash
# NEXT_PUBLIC_ prefix'inin olduğundan emin ol
NEXT_PUBLIC_APP_URL=https://...
```

## 📞 Support

Herhangi bir sorun yaşarsan:
1. Console error'larını kontrol et
2. Environment variables'ları doğrula  
3. Manifest dosyasının erişilebilir olduğunu kontrol et

## 🎉 Deployment Sonrası

1. Base app directory'sine submit et
2. User feedback topla
3. Analytics'i monitor et
4. Feature geliştirmelerini planla