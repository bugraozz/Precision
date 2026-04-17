# Precision Arena Teknik Uygulama Raporu

Tarih: 2026-03-06
Kapsam: Uygulama (Expo React Native) + Backend (Firebase Functions) + Retention/Progression + Premium UI/UX + Test/Doğrulama

## 1. Amaç ve Kapsam
Bu dokuman, bugune kadar projede gerceklestirilen teknik gelistirmeleri tek yerde toplar. Ozellikle su alanlari kapsar:
- Cekirdek oyun dongusu ve skor altyapisi
- Seviyeleme, chapter/boss, star-gate ilerleme modeli
- Retention sistemleri (daily/weekly/season/event/mastery/collection)
- Backend tarafinda server-authoritative claim ve progression guncellemeleri
- Analitik, reklam, premium entitlement
- Home/Levels/Play/Complete ekranlarinda premium tasarim ve mikro-etkilesimler
- Test, kalite kapilari, bilinen riskler

## 2. Yuksek Seviye Mimari

### 2.1 Monorepo yapisi
- `src/`: paylasilan core (scoring, geometry, anti-cheat, analytics tipleri)
- `app/`: Expo React Native istemci
- `functions/`: Firebase Cloud Functions backend endpointleri
- `docs/`: teknik notlar, test raporlari, runbook ve compliance dokumanlari

### 2.2 Veri akis ozeti
1. Kullanici level secer ve cizim yapar.
2. Cizim noktalarinin on-islemesi yapilir (`preprocessStroke`).
3. Lokal skor hesaplanabilir (`scoreRound`) veya backend'e gonderilebilir (`round_submit`).
4. Sonuc ekraninda accuracy/stars/xp/deviation gosterilir.
5. Progression state app tarafinda guncellenir ve persist edilir.
6. Quest/season claim islemleri backend endpointleri ile dogrulanir ve oduller uygulanir.

### 2.3 Otorite modeli
- Oyun hissi ve anlik UI: istemci agirlikli.
- Odul claim ve kritik progression sayaçlari: backend transaction tabanli dogrulama.
- Bu model, hizli UX ile ekonomi guvenligi arasinda denge saglar.

## 3. Cekirdek Oyun ve Skorlama

### 3.1 Core moduller
- `src/core/scoring.ts`: accuracy, stars, xp hesaplari ve skor versiyonlama.
- `src/core/geometry.ts`: normalize/preprocess islemleri.
- `src/core/antiCheat.ts`: minimum point/sure/koordinat guvenlik kontrolleri.
- `src/core/shapeTemplates.ts`: hedef sekil setleri.

### 3.2 Teknik notlar
- Cizim stream'i skor oncesi yumusatiliyor ve decimate ediliyor.
- Server/client skor tutarliligi icin preprocessing parametreleri hizalandi.
- Skor versiyonlama ENV uzerinden yonetilebilir durumda.

## 4. Progression ve Retention Sistemi

### 4.1 Campaign/Level tasarimi
- `app/src/levels.ts`
- Yapilanma: 5 chapter x 10 level
- Her chapter sonu boss level
- Chapter acilislari star-gate ile kilitli (`requiredStars`)
- Level metadata:
  - `chapterId`
  - `isBoss`
  - `rewardMultiplier`
  - `modeHint`
  - `mechanicTag`

### 4.2 Progression state modeli
- `app/src/progression.ts`
- Baslica alanlar:
  - `coins`, `gems`
  - `unlockedLevels`, `bestStarsByLevel`, `cumulativeXp`
  - `masteryXpByTrack` ve unlock listeleri
  - `dailyBoard`
  - `weeklyLadder` + `catchUpQuest`
  - `weeklyEvent`
  - `seasonPass`
  - `collectionAlbum`
  - `personalBestByLevel`
- Backward compatibility: sanitize/merge yaklasimi ile eski save'ler bozulmadan okunur.

### 4.3 Retention katmanlari
- Mastery tracks: beceri bazli uzun vadeli ilerleme
- Daily quests: gunluk geri donus tetikleyici
- Weekly ladder: haftalik hedef ve surekli rekabet hissi
- Weekly mini event: limitli sureli yan hedefler
- Season pass (28 gun): orta vadeli meta hedef
- Collection album: tamamlayicilik motivasyonu
- Personal best ghost: bireysel performans takibi

## 5. Backend Fonksiyonlar ve API Kontratlari

### 5.1 Endpointler
- `functions/src/index.js`:
  - `round_submit`
  - `quest_claim`
  - `season_claim`

### 5.2 `round_submit`
- Payload dogrulamasi: zorunlu alanlar, noktalar, sure
- Anti-cheat kontrolleri
- Skorlama ve progression sayaçlarina yansitma
- Boss level tespiti chapter duzenine gore guncel

### 5.3 `quest_claim` / `season_claim`
- Server tarafinda claim uygunluk kontrolu
- Transaction tabanli odul uygulamasi
- Cift claim / uygunsuz claim engeli
- App'te durum mesaji olarak reason/accepted bilgisi kullaniliyor

### 5.4 Uygulama API katmani
- `app/src/api.ts`
- `submitRound`, `claimQuestReward`, `claimSeasonReward`
- Round payload'unda `levelId` dahil edilerek server progression baglami guclendirildi

## 6. Mobil Uygulama Ekranlari ve UX

### 6.1 Ekran bilgi mimarisi
- `main`: retention hub (daily/weekly/season/collection/premium)
- `home`: level odakli secim ekrani
- `play`: cizim ve skor aksiyonlari
- `complete`: sonuc karti ve sonraki aksiyonlar

### 6.2 Premium UI donusumu
- Koyu premium palet + glass hissi
- Kart hiyerarsisi (stat/mission/event/meta) standartlasti
- CTA butonlari premium gradient ve glow etkileriyle guclendirildi
- Mobilde okunabilirlik icin spacing ve max-width dengelendi

### 6.3 Mikro-etkilesimler
- Panel gecis animasyonlari (fade + translate)
- CTA sheen animasyonu
- Play ekraninda pulse vurgusu
- Butonlarda global press-state sistemi
- Primary/secondary buton press siddeti ayrimi
- Level kartinda press-scale
- Result metriklerinde stagger reveal
- Claim basarisinda coin karti pop animasyonu

## 7. Bilesen Bazli Teknik Durum

### 7.1 `app/src/components/LevelSelector.tsx`
- Chapter icindeki level kartlarini listeler
- Lock/selected/boss/mechanic gorunumu
- Premium kart stili + press feedback

### 7.2 `app/src/components/DrawingCanvas.tsx`
- PanResponder ile stroke capture
- On-isleme ile smoothed path
- Premium dark-glass canvas yuzeyi

### 7.3 `app/src/components/RoundComparisonCard.tsx`
- Accuracy ring + path preview + metrik kutulari
- Birincil/ikincil/reward aksiyon butonlari
- Metriklerde stagger animasyon + premium kart katmani

## 8. Analitik, Monetization, Instrumentation

### 8.1 Analytics
- Event ureticiler core'dan geliyor
- Ingestion backend tarafinda schema ve required alan dogruluyor
- Session/perf/crash ve round eventleri baglandi

### 8.2 Rewarded Ads
- Feature flag + cooldown + session limit guardrail
- Placement kontrollu (retry reward odakli)

### 8.3 Premium No-Ads
- Entitlement lokal persist edilir
- Premium aktifse rewarded ad akisi kapatilir

### 8.4 Crash/Perf
- Startup perf marker
- Crash raporu event akisi
- Crashlytics entegrasyon notlari dokumante

## 9. Test ve Dogrulama Durumu

### 9.1 Calistirilan kalite kapilari
- Root build: `npm run build` (basarili)
- App TS check: `npx tsc --noEmit -p app/tsconfig.json` (basarili)
- Functions testleri (basarili):
  - `test:round-submit`
  - `test:analytics-ingest`
  - `test:score-consistency`
  - `test:claims`

### 9.2 Raporlanan teknik ciktilar
- Score consistency drift kontrolu raporlandi
- Calibration benchmark raporu mevcut
- Claims contract testleri mevcut

## 10. Bilinen Riskler ve Acik Konular

1. Runtime Android launch
- Son terminal gecmisinde `npm run android --prefix app` cikisi `1` (ortam/port/device bagimli issue).
- Kod kalitesi testleri gecerli olsa da cihaz uzerinde E2E run periyodik teyit edilmeli.

2. Scoring calibration
- Benchmark raporunda hala ince ayar gerektiren out-of-band senaryolar bulunuyor.

3. LiveOps operasyonu
- Season/event parametrelerinin remote config ile daha dinamik yonetimi bir sonraki adimda guclendirilmeli.

## 11. Dosya Bazli Ozet (En Cok Degisenler)
- `app/App.tsx`: ekran mimarisi, premium tasarim, claim action baglantilari, mikro-animasyonlar
- `app/src/progression.ts`: retention state modeli ve claim/progression turevleri
- `app/src/levels.ts`: chapter/boss/star-gate odakli campaign tanimi
- `app/src/api.ts`: submit + claim API kontratlari
- `app/src/components/LevelSelector.tsx`: premium level listesi
- `app/src/components/DrawingCanvas.tsx`: premium canvas ve stroke gorunumu
- `app/src/components/RoundComparisonCard.tsx`: premium result card + animasyon
- `functions/src/index.js`: round/claim endpointleri ve server progression mantigi
- `functions/tests/*.test.js`: round/analytics/consistency/claims regresyonlari

## 12. Sonuc
Projede hem urun hem teknik altyapi katmaninda kapsamli bir donusum tamamlandi:
- Retention odakli oyun ekonomisi ve ilerleme sistemi kuruldu
- Claim guvenligi backend transaction modeline baglandi
- UI/UX premium, tutarli ve animasyon destekli hale getirildi
- Kritik test kapilariyla kalite korunuyor

Bu dokuman mevcut state'i referans alir; yeni feature ve test eklentilerinde bu dosyanin tarih ve ilgili bolumleri guncellenmelidir.

## 13. 2026-03-06 Delta (Monetization Step-2)

1. Purchase provider abstraction
- `functions/src/purchaseProviders.js` eklendi.
- Android/iOS icin provider secimi env ile yapilabilir:
  - `mock` (sandbox-friendly)
  - `webhook` (harici verifier endpoint)
- `purchase_verify` endpointi artik provider sonucuna gore entitlement yazar.

2. Entitlement sync
- `entitlement_sync` endpointi normalized entitlement snapshot dondurur.
- App boot sirasinda entitlement sync sonucu progression modeline merge edilir.

3. Cosmetic uygulama (brush/trail/frame)
- `DrawingCanvas` secili cosmetic id alir.
- Kozmetik iteme gore:
  - stroke color/width (brush)
  - ghost trail layer (trail)
  - canvas frame color (frame)
- Play ekraninda aktif cosmetic bilgisi gosterilir.
