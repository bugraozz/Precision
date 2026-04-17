# Energy + Premium Monetization Spec

Tarih: 2026-03-06
Durum: Uygulamaya alindi (v1)

## 1. Hedef
- Free kullaniciya gunluk oynama hakki siniri koymak.
- Premium kullanicida bu hakki 3x'e cikarmak.
- Premium paketine no-ads + cosmetic set + aylik ozel item degeri eklemek.
- Pay-to-win yaratmadan retention ve revenue dengelemek.

## 2. Urun Kurallari

### 2.1 Gunluk hak (Energy)
- Free daily cap: 10
- Premium daily cap: 30 (3x)
- Reset: UTC gun degisiminde full refill
- Oyun hakki tuketimi: yeni mission baslatildiginda 1 energy
- Energy yoksa mission baslatma engellenir

### 2.2 Premium paket icerigi
- No Ads (rewarded/interstitial kapali)
- 3x daily energy cap
- Premium cosmetic set (sabit paket)
- Aylik ozel item (her ay 1 item)

### 2.3 Cosmetic kurallari
- Cosmeticler skor/oyun sonucunu etkilemez.
- Sadece gorunumsel deger saglar.
- Premium itemler progression state icinde tutulur.

## 3. Veri Modeli

Dosya: `app/src/progression.ts`

### 3.1 EnergyState
- `dailyKey`: enerji reset key (`YYYY-MM-DD`)
- `dailyCapBase`: taban cap (`10`)
- `dailyMultiplier`: free `1`, premium `3`
- `current`: kalan hak
- `consumedToday`: gunluk tuketim sayaci

### 3.2 PremiumState
- `isActive`
- `adsDisabled`
- `premiumCosmeticSetId`
- `monthlySpecialItemId`
- `monthlySpecialItemMonthKey` (`YYYY-MM`)
- `unlockedCosmeticItems[]`
- `activatedAt`

## 4. Is Kurallari ve Fonksiyonlar

### 4.1 Normalize/refresh
- `ensureDayWeekResets(...)` gun/hafta resetlerine ek olarak:
  - energy daily refill
  - premium aylik item dagitimi

### 4.2 Premium aktivasyonu
- `activatePremiumBenefits(state)`:
  - premium aktif eder
  - ads kapatir
  - energy multiplier'i 3 yapar
  - premium cosmetic set itemlerini ekler
  - o ayin monthly itemini verir
  - `seasonPass.premiumUnlocked = true` yapar

### 4.3 Energy tuketimi
- `consumeEnergyForPlay(state)`:
  - energy > 0 ise 1 azaltir
  - action kabul/red sonucu dondurur

### 4.4 Snapshot
- `getEnergySnapshot(state)`:
  - UI icin `current/cap/multiplier/isPremium`

## 5. UI Entegrasyonu

Dosya: `app/App.tsx`

- Ana panelde energy ve premium karti gosterilir.
- Premium kartinda:
  - status
  - no-ads durumu
  - premium cosmetic item sayisi
  - aylik item id
- Levels ekraninda mission ozetinde energy gorunur.
- `Start Mission` butonu:
  - energy <= 0 iken disabled
  - basarili baslangicta energy tuketir
- Complete ekranindan retry/next akislari da energy tuketerek `play` ekranina girer.

## 6. Gecis/Migration
- Eski save'ler `sanitizeProgression` ile yeni modele maplenir.
- Eski `premium_no_ads` storage degeri varsa boot asamasinda progression premium'a migrate edilir.

## 7. Telemetry Onerisi (v1.1)
- `energy_consumed`
- `energy_empty_blocked`
- `premium_upsell_shown`
- `premium_activated`
- `monthly_item_granted`

## 8. Sonraki Teknik Adimlar
1. Premium satin alma dogrulamasini backend'e tasima (`purchase_verify`).
2. Entitlement state'ini server-authoritative hale getirme.
3. Cosmetic itemlerin UI'da secilebilir envanter ekranina baglanmasi.
4. A/B test ile free cap ve premium multiplier optimizasyonu.
