import { useState, useCallback } from "react";

export type Lang = "en" | "tr";

const translations = {
  // ── App-wide ──────────────────────────────────────────────────────────────
  appTitle: { en: "DrawPro", tr: "DrawPro" },
  appSubtitle: { en: "Precision Drawing", tr: "Hassas Çizim" },
  ready: { en: "Ready", tr: "Hazır" },

  // ── Stats ─────────────────────────────────────────────────────────────────
  stars: { en: "Stars", tr: "Yıldız" },
  coins: { en: "COINS", tr: "ALTIN" },
  energy: { en: "Energy", tr: "Enerji" },
  gems: { en: "Gems", tr: "Elmas" },
  rounds: { en: "Rounds", tr: "Tur" },
  xp: { en: "XP", tr: "XP" },

  // ── Premium ───────────────────────────────────────────────────────────────
  premiumActive: { en: "Premium Active", tr: "Premium Aktif" },
  premiumPack: { en: "Premium Pack", tr: "Premium Paket" },
  pro: { en: "PRO", tr: "PRO" },
  premiumDescActive: { en: "30 energy/day, no ads, exclusive cosmetics", tr: "Günde 30 enerji, reklamsız, özel kozmetikler" },
  premiumDescInactive: { en: "Upgrade for 3x energy, no ads & exclusives", tr: "3x enerji, reklamsız ve özel içerikler için yükselt" },
  cosmetics: { en: "Cosmetics", tr: "Kozmetik" },
  monthlyItem: { en: "Monthly Item", tr: "Aylık Ödül" },
  pending: { en: "Pending", tr: "Bekliyor" },
  unlockNoAds: { en: "Unlock No-Ads (Sandbox)", tr: "Reklamsız Aç (Sandbox)" },

  // ── Navigation ────────────────────────────────────────────────────────────
  home: { en: "HOME", tr: "ANA SAYFA" },
  back: { en: "BACK", tr: "GERİ" },
  reset: { en: "RESET", tr: "SIFIRLA" },
  goToLevels: { en: "Go To Levels", tr: "Seviyelere Git" },

  // ── Sections ──────────────────────────────────────────────────────────────
  currentMission: { en: "CURRENT MISSION", tr: "AKTİF GÖREV" },
  overallProgress: { en: "Overall Progress", tr: "Genel İlerleme" },
  shape: { en: "SHAPE", tr: "ŞEKİL" },
  difficulty: { en: "DIFFICULTY", tr: "ZORLUK" },
  time: { en: "TIME", tr: "SÜRE" },
  mode: { en: "MODE", tr: "MOD" },

  // ── Mastery ───────────────────────────────────────────────────────────────
  mastery: { en: "Mastery", tr: "Ustalık" },
  quests: { en: "Quests", tr: "Görevler" },
  claimable: { en: "Claimable", tr: "Alınabilir" },

  // ── Panel tabs ────────────────────────────────────────────────────────────
  overview: { en: "Overview", tr: "Özet" },
  daily: { en: "Daily", tr: "Günlük" },
  weekly: { en: "Weekly", tr: "Haftalık" },
  collection: { en: "Collection", tr: "Koleksiyon" },
  challenge: { en: "Challenge", tr: "Meydan Okuma" },

  // ── Overview panel ────────────────────────────────────────────────────────
  weeklyMiniEvent: { en: "Weekly Mini Event (7 Days / 12 Quests)", tr: "Haftalık Mini Etkinlik (7 Gün / 12 Görev)" },
  event: { en: "Event", tr: "Etkinlik" },
  questProgress: { en: "Quest Progress", tr: "Görev İlerlemesi" },
  rewardChest: { en: "Reward Chest", tr: "Ödül Sandığı" },
  claimed: { en: "Claimed", tr: "Alındı" },
  unlockedLevels: { en: "Unlocked Levels", tr: "Açılan Seviyeler" },

  // ── Daily panel ───────────────────────────────────────────────────────────
  dailyQuestBoard: { en: "Daily Quest Board", tr: "Günlük Görev Panosu" },
  claim: { en: "Claim", tr: "Al" },
  claiming: { en: "Claiming...", tr: "Alınıyor..." },
  claimStreakChest: { en: "Claim Streak Chest", tr: "Seri Sandığını Al" },

  // ── Weekly panel ──────────────────────────────────────────────────────────
  weeklyChallengeLadder: { en: "Weekly Challenge Ladder", tr: "Haftalık Merdiven" },

  // ── Collection panel ──────────────────────────────────────────────────────
  sets: { en: "Sets", tr: "Set" },
  frames: { en: "Frames", tr: "Çerçeve" },
  special: { en: "Special", tr: "Özel" },
  activeLoadout: { en: "Active Loadout", tr: "Aktif Donanım" },
  brush: { en: "Brush", tr: "Fırça" },
  trail: { en: "Trail", tr: "İz" },
  frame: { en: "Frame", tr: "Çerçeve" },
  default: { en: "Default", tr: "Varsayılan" },
  custom: { en: "Custom", tr: "Özel" },
  brushes: { en: "Brushes", tr: "Fırçalar" },
  trails: { en: "Trails", tr: "İzler" },
  noBrushesYet: { en: "No brushes unlocked yet", tr: "Henüz fırça açılmadı" },
  noTrailsYet: { en: "No trails unlocked yet", tr: "Henüz iz açılmadı" },
  noFramesYet: { en: "No frames unlocked yet", tr: "Henüz çerçeve açılmadı" },
  unlockWithPremium: { en: "Unlock with Premium subscription", tr: "Premium abonelik ile aç" },
  equipped: { en: "Equipped", tr: "Kuşanıldı" },
  equip: { en: "Equip", tr: "Kuşan" },

  // ── Challenge panel ───────────────────────────────────────────────────────
  shapeChallenge: { en: "Shape Challenge", tr: "Şekil Meydan Okuması" },
  challengeDesc: { en: "Pick a shape, draw your best, and compete globally!", tr: "Bir şekil seç, en iyisini çiz ve dünyayla yarış!" },
  play: { en: "Play", tr: "Oyna" },
  yourLatestResult: { en: "Your Latest Result", tr: "Son Sonucun" },
  accuracy: { en: "Accuracy", tr: "Doğruluk" },
  rankings: { en: "Rankings", tr: "Sıralama" },
  loading: { en: "Loading...", tr: "Yükleniyor..." },
  noEntriesYet: { en: "No entries yet", tr: "Henüz giriş yok" },
  beFirstToSubmit: { en: "Be the first to submit!", tr: "İlk gönderen sen ol!" },

  // ── Personal best ─────────────────────────────────────────────────────────
  personalBestGhost: { en: "Personal Best Ghost", tr: "Kişisel En İyi" },
  currentLevelPBAccuracy: { en: "Current Level PB Accuracy", tr: "Mevcut Seviye En İyi Doğruluk" },
  currentLevelPBTime: { en: "Current Level PB Time", tr: "Mevcut Seviye En İyi Süre" },
  mechanic: { en: "Mechanic", tr: "Mekanik" },

  // ── Play screen ───────────────────────────────────────────────────────────
  challengeLabel: { en: "CHALLENGE", tr: "MEYDAN OKUMA" },
  star: { en: "STAR", tr: "YILDIZ" },
  level: { en: "Level", tr: "Seviye" },
  targetShape: { en: "TARGET SHAPE", tr: "HEDEF ŞEKİL" },
  rankedChallenge: { en: "RANKED CHALLENGE", tr: "SIRALI MEYDAN OKUMA" },
  pressure: { en: "PRESSURE", tr: "BASINÇ" },
  drawWithPrecision: { en: "Draw with precision", tr: "Hassasiyetle çiz" },
  cosmeticLoadout: { en: "Cosmetic Loadout", tr: "Kozmetik Donanım" },
  none: { en: "none", tr: "yok" },
  speedTimer: { en: "Speed Timer", tr: "Hız Sayacı" },
  parRemaining: { en: "Par Remaining", tr: "Kalan Süre" },
  overtime: { en: "Overtime", tr: "Ek Süre" },
  stabilityCheck: { en: "Stability Check", tr: "Stabilite Kontrolü" },
  targetWobbleThreshold: { en: "Target wobble threshold", tr: "Hedef titreşim eşiği" },
  symmetryCheck: { en: "Symmetry Check", tr: "Simetri Kontrolü" },
  safeAccuracyBand: { en: "Safe accuracy band", tr: "Güvenli doğruluk aralığı" },
  memoryCheck: { en: "Memory Check", tr: "Hafıza Kontrolü" },
  targetVisibleBriefly: { en: "Target visible briefly", tr: "Hedef kısa süre görünür" },
  targetHiddenDrawFromMemory: { en: "Target hidden: draw from memory", tr: "Hedef gizli: hafızadan çiz" },
  memoryModeHidden: { en: "Memory Mode: target hidden", tr: "Hafıza Modu: hedef gizli" },
  score: { en: "Score", tr: "Puanla" },
  submitToRanking: { en: "Submit to Ranking", tr: "Sıralamaya Gönder" },
  submitting: { en: "Submitting...", tr: "Gönderiliyor..." },
  tryNewStroke: { en: "Try New Stroke", tr: "Yeni Çizim Dene" },
  speedPressureDesc: { en: "Slight delay = XP penalty, big delay = star+XP penalty.", tr: "Hafif gecikme = XP cezası, büyük gecikme = yıldız+XP cezası." },
  stabilityPressureWarn: { en: "warns", tr: "uyarır" },
  stabilityPressurePenalize: { en: "penalizes star+XP", tr: "yıldız+XP cezası verir" },
  symmetryPressureWarn: { en: "warns", tr: "uyarır" },
  symmetryPressurePenalize: { en: "penalizes star+XP", tr: "yıldız+XP cezası verir" },
  memoryPressureDesc: { en: "Target disappears quickly. Draw from memory for full performance.", tr: "Hedef hızla kaybolur. Tam performans için hafızadan çiz." },
  speedNoteHeavy: { en: "Speed: heavy penalty ({actual}ms > {limit}ms).", tr: "Hız: ağır ceza ({actual}ms > {limit}ms)." },
  speedNoteOver: { en: "Speed: par {par}ms exceeded.", tr: "Hız: {par}ms süre aşıldı." },
  stabilityNoteHeavy: { en: "Stability: heavy wobble penalty.", tr: "Stabilite: ağır titreme cezası." },
  stabilityNoteWarn: { en: "Stability: wobble warning.", tr: "Stabilite: titreme uyarısı." },
  symmetryNoteHeavy: { en: "Symmetry: heavy penalty below {pct}%.", tr: "Simetri: %{pct} altında ağır ceza." },
  symmetryNoteWarn: { en: "Symmetry: warning below {pct}%.", tr: "Simetri: %{pct} altında uyarı." },
  focus: { en: "Focus", tr: "Odak" },
  challengeDrawDesc: { en: "Draw the best {shape} and compete globally! Your best score counts.", tr: "En iyi {shape} çiz ve dünyayla yarış! En iyi skorun geçerli." },

  // ── Complete screen ───────────────────────────────────────────────────────
  challengeComplete: { en: "Challenge Complete", tr: "Meydan Okuma Tamamlandı" },
  levelComplete: { en: "Level Complete", tr: "Seviye Tamamlandı" },
  challengeCompleteDesc: { en: "Your score has been submitted to the global rankings!", tr: "Skorun dünya sıralamasına gönderildi!" },
  levelCompleteDesc: { en: "Results are shown on a dedicated completion screen.", tr: "Sonuçlar tamamlama ekranında gösterildi." },
  backToRankings: { en: "Back To Rankings", tr: "Sıralamaya Dön" },
  backToHome: { en: "Back To Home", tr: "Ana Sayfaya Dön" },

  // ── Levels screen ─────────────────────────────────────────────────────────
  levels: { en: "Levels", tr: "Seviyeler" },
  selectChapterAndMission: { en: "Select chapter and mission", tr: "Bölüm ve görev seç" },
  chapters: { en: "CHAPTERS", tr: "BÖLÜMLER" },
  startMission: { en: "Start Mission", tr: "Göreve Başla" },
  noEnergy: { en: "No Energy", tr: "Enerji Yok" },
  locked: { en: "Locked", tr: "Kilitli" },
  starsRequired: { en: "stars required for", tr: "yıldız gerekli:" },
  starsLabel: { en: "stars", tr: "yıldız" },

  // ── Tutorial ──────────────────────────────────────────────────────────────
  quickStart: { en: "Quick Start", tr: "Hızlı Başla" },
  skip: { en: "Skip", tr: "Atla" },
  nextTip: { en: "Next Tip", tr: "Sonraki İpucu" },
  startPlaying: { en: "Start Playing", tr: "Oynamaya Başla" },

  // ── Tutorial steps ────────────────────────────────────────────────────────
  tutorialStep1: { en: "Choose a level from the cards and press Start Mission.", tr: "Kartlardan bir seviye seç ve Göreve Başla'ya bas." },
  tutorialStep2: { en: "Draw the target shape from memory in one smooth stroke.", tr: "Hedef şekli hafızadan tek bir akıcı çizgiyle çiz." },
  tutorialStep3: { en: "Use Retry or Next immediately after results for fast progression.", tr: "Hızlı ilerleme için sonuçlardan sonra hemen Tekrar Dene ya da İleri'ye bas." },

  // ── RoundComparisonCard ───────────────────────────────────────────────────
  excellent: { en: "Excellent", tr: "Mükemmel" },
  target: { en: "Target", tr: "Hedef" },
  local: { en: "Local", tr: "Yerel" },
  server: { en: "Server", tr: "Sunucu" },
  points: { en: "Points", tr: "Puan" },
  deviation: { en: "Deviation", tr: "Sapma" },
  tryAgain: { en: "Try Again", tr: "Tekrar Dene" },
  premiumActiveNoAds: { en: "Premium Active: No Ads", tr: "Premium Aktif: Reklamsız" },
  watchAdExtraRetry: { en: "Watch Ad: Extra Retry", tr: "Reklam İzle: Ekstra Deneme" },
  left: { en: "left", tr: "kaldı" },
  adCooldownActive: { en: "Ad Cooldown Active", tr: "Reklam Bekleme Süresi" },
  rewardedRetryUnavailable: { en: "Rewarded Retry Unavailable", tr: "Ödüllü Deneme Mevcut Değil" },

  // ── Shape names ───────────────────────────────────────────────────────────
  circle: { en: "Circle", tr: "Daire" },
  square: { en: "Square", tr: "Kare" },
  triangle: { en: "Triangle", tr: "Üçgen" },
  diamond: { en: "Diamond", tr: "Elmas" },
  pentagon: { en: "Pentagon", tr: "Beşgen" },
  hexagon: { en: "Hexagon", tr: "Altıgen" },
  heart: { en: "Heart", tr: "Kalp" },
  starShape: { en: "Star", tr: "Yıldız" },

  // ── Difficulty ────────────────────────────────────────────────────────────
  easy: { en: "Easy", tr: "Kolay" },
  medium: { en: "Medium", tr: "Orta" },
  hard: { en: "Hard", tr: "Zor" },

  // ── Mode hint ─────────────────────────────────────────────────────────────
  free: { en: "Free", tr: "Serbest" },
  trace: { en: "Trace", tr: "Takip" },

  // ── Mechanic names ────────────────────────────────────────────────────────
  speed: { en: "Speed", tr: "Hız" },
  stability: { en: "Stability", tr: "Stabilite" },
  symmetry: { en: "Symmetry", tr: "Simetri" },
  memory: { en: "Memory", tr: "Hafıza" },
  boss: { en: "BOSS", tr: "PATRON" },

  // ── Mechanic descriptions ─────────────────────────────────────────────────
  mechanicDescSpeed: { en: "Speed: finish accurately under tighter time pressure.", tr: "Hız: daha sıkı süre baskısı altında doğru bitir." },
  mechanicDescStability: { en: "Stability: keep stroke smooth and avoid jitter.", tr: "Stabilite: çizimi düz tut ve titreşimden kaçın." },
  mechanicDescSymmetry: { en: "Symmetry: balance both sides of the target form.", tr: "Simetri: hedef formun iki tarafını dengele." },
  mechanicDescMemory: { en: "Memory: draw from memory with minimal visual guidance.", tr: "Hafıza: minimum görsel rehberlikle hafızadan çiz." },

  // ── Focus hints ───────────────────────────────────────────────────────────
  focusHintSpeed: { en: "Beat par time while keeping clean accuracy.", tr: "Temiz doğruluğu koruyarak hedef süreyi geç." },
  focusHintStability: { en: "Keep one smooth stroke and avoid wobble.", tr: "Tek düz çizgi tut ve titremeyi engelle." },
  focusHintSymmetry: { en: "Balance both sides and keep proportions centered.", tr: "İki tarafı dengele ve oranları ortala." },
  focusHintMemory: { en: "Memorize the target quickly, then draw from recall.", tr: "Hedefi hızla ezberle, sonra hafızadan çiz." },

  // ── Chapter titles ────────────────────────────────────────────────────────
  chapterFoundations: { en: "Foundations", tr: "Temeller" },
  chapterControl: { en: "Control", tr: "Kontrol" },
  chapterPatterns: { en: "Patterns", tr: "Desenler" },
  chapterPressure: { en: "Pressure", tr: "Baskı" },
  chapterMastery: { en: "Mastery", tr: "Ustalık" },

  // ── Chapter hooks ─────────────────────────────────────────────────────────
  hookFoundations: { en: "Core shape control", tr: "Temel şekil kontrolü" },
  hookControl: { en: "Stability and rhythm", tr: "Stabilite ve ritim" },
  hookPatterns: { en: "Symmetry mastery", tr: "Simetri ustalığı" },
  hookPressure: { en: "Speed under pressure", tr: "Baskı altında hız" },
  hookMastery: { en: "Mixed constraints", tr: "Karışık kısıtlamalar" },

  // ── Rarity ────────────────────────────────────────────────────────────────
  common: { en: "Common", tr: "Sıradan" },
  rare: { en: "Rare", tr: "Nadir" },
  legendary: { en: "Legendary", tr: "Efsanevi" },
  mythic: { en: "Mythic", tr: "Mitik" },

  // ── Mastery labels ────────────────────────────────────────────────────────
  circleLv: { en: "Circle Lv", tr: "Daire Sv" },
  cornerLv: { en: "Corner Lv", tr: "Köşe Sv" },
  curveLv: { en: "Curve Lv", tr: "Eğri Sv" },
  dailyAbbr: { en: "D", tr: "G" },
  weeklyAbbr: { en: "W", tr: "H" },

  // ── Next level / App.tsx labels ───────────────────────────────────────────
  packComplete: { en: "Pack Complete", tr: "Paket Tamamlandı" },
  needOneStar: { en: "Need 1 Star", tr: "1 Yıldız Gerekli" },
  nextLabel: { en: "Next", tr: "Sonraki" },
  levelLabel: { en: "Level", tr: "Seviye" },
  premiumMultiplier: { en: "x3", tr: "x3" },
  bossRound: { en: "Boss Round", tr: "Patron Turu" },

  // ── Status messages (App.tsx) ─────────────────────────────────────────────
  premiumAlreadyActive: { en: "Premium already active. Ads are disabled.", tr: "Premium zaten aktif. Reklamlar kapalı." },
  premiumUnlockedFull: { en: "Premium unlocked: 3x daily energy, no ads, cosmetic set + monthly item.", tr: "Premium açıldı: 3x günlük enerji, reklamsız, kozmetik set + aylık ödül." },
  premiumUnlockedLocal: { en: "Premium unlocked locally: 3x daily energy, no ads, cosmetic set.", tr: "Premium yerel olarak açıldı: 3x günlük enerji, reklamsız, kozmetik set." },
  challengeDraw: { en: "Challenge: Draw", tr: "Meydan Okuma: Çiz" },
  drawOnCanvasFirst: { en: "Draw on canvas first.", tr: "Önce tuvale çiz." },
  challengeAccepted: { en: "Challenge accepted!", tr: "Meydan okuma kabul edildi!" },
  challengeScoredLocally: { en: "Challenge scored locally", tr: "Meydan okuma yerel olarak puanlandı" },
  cosmeticEquipped: { en: "Cosmetic equipped", tr: "Kozmetik kuşanıldı" },
  tutorialComplete: { en: "Tutorial complete. Ready to draw.", tr: "Öğretici tamamlandı. Çizime hazır." },
  tutorialSkipped: { en: "Tutorial skipped. Start drawing.", tr: "Öğretici atlandı. Çizmeye başla." },
  energyAlreadyFull: { en: "Energy already full. Use energy before buying refill.", tr: "Enerji zaten dolu. Dolum almadan önce enerji kullan." },
  notEnoughCoins: { en: "Not enough coins. Need", tr: "Yeterli altın yok. Gereken:" },
  coinsLabel: { en: "coins", tr: "altın" },
  spentCoinsRestoredEnergy: { en: "Spent {coins} coins, restored {energy} energy.", tr: "{coins} altın harcandı, {energy} enerji yenilendi." },
  strokeCaptured: { en: "Stroke captured", tr: "Çizim yakalandı" },
  canvasReset: { en: "Canvas reset. Draw again.", tr: "Tuval sıfırlandı. Tekrar çiz." },
  selectedLevel: { en: "Selected", tr: "Seçildi" },
  allLevelsComplete: { en: "You completed all levels in v1.", tr: "V1'deki tüm seviyeleri tamamladın." },
  nextLevelLocked: { en: "Next level is locked. Earn at least 1 star on this level.", tr: "Sonraki seviye kilitli. Bu seviyede en az 1 yıldız kazan." },
  chapterLocked: { en: "Chapter locked: need", tr: "Bölüm kilitli: gerekli" },
  totalStars: { en: "total stars", tr: "toplam yıldız" },
  nextLevelLabel: { en: "Next level", tr: "Sonraki seviye" },
  noEnergyForToday: { en: "No energy left for today. Premium gives 3x daily energy.", tr: "Bugün için enerji kalmadı. Premium 3x günlük enerji verir." },
  missionStarted: { en: "Mission started", tr: "Görev başladı" },
  rewardedRetryUnavailableMsg: { en: "Rewarded retry unavailable.", tr: "Ödüllü deneme mevcut değil." },
  showingRewardedAd: { en: "Showing rewarded ad...", tr: "Ödüllü reklam gösteriliyor..." },
  rewardUnlocked: { en: "Reward unlocked. Extra retry granted.", tr: "Ödül açıldı. Ekstra deneme verildi." },
  serverUnavailable: { en: "Server unavailable. Local score applied.", tr: "Sunucu kullanılamıyor. Yerel skor uygulandı." },
  serverRejected: { en: "Server rejected", tr: "Sunucu reddetti" },
  noReward: { en: "No reward", tr: "Ödül yok" },
  claimedLabel: { en: "Claimed", tr: "Alındı" },
  claimAlreadyProcessed: { en: "Claim already processed.", tr: "Talep zaten işlendi." },
  claimFailed: { en: "Claim failed", tr: "Talep başarısız" },
  dailyStreakChestUnavailable: { en: "Daily streak chest is not available.", tr: "Günlük seri sandığı mevcut değil." },
  dailyStreakChestClaimed: { en: "Daily streak chest claimed.", tr: "Günlük seri sandığı alındı." },

  // ── Quest labels ──────────────────────────────────────────────────────────
  quest_daily_rounds_4: { en: "Complete 4 rounds", tr: "4 round tamamla" },
  quest_daily_stars_10: { en: "Earn 10 stars total", tr: "Toplam 10 yıldız kazan" },
  quest_daily_two_plus_2: { en: "Finish 2 levels with 2+ stars", tr: "2 leveli 2+ yıldızla bitir" },
  quest_daily_boss_1: { en: "Attempt 1 boss round", tr: "1 boss round dene" },
  quest_daily_xp_750: { en: "Earn 750 XP total", tr: "Toplam 750 XP kazan" },
  quest_daily_highacc_2: { en: "2 rounds with >90% accuracy", tr: "2 round >90%" },
  quest_weekly_rounds_18: { en: "Complete 18 rounds", tr: "18 round tamamla" },
  quest_weekly_stars_42: { en: "Earn 42 stars", tr: "42 yıldız kazan" },
  quest_weekly_two_plus_10: { en: "Finish 10 levels with 2+ stars", tr: "10 leveli 2+ yıldızla bitir" },
  quest_weekly_boss_5: { en: "5 boss attempts", tr: "5 boss denemesi" },
  quest_weekly_xp_4200: { en: "Earn 4200 XP", tr: "4200 XP kazan" },
  quest_weekly_highacc_8: { en: "8 rounds with >90% accuracy", tr: "8 round >90%" },
  quest_weekly_ladder_320: { en: "Reach 320 ladder points", tr: "Ladder 320 puana ulaş" },
  quest_weekly_rounds_24: { en: "Complete 24 rounds", tr: "24 round tamamla" },
  quest_weekly_catchup_rounds_8: { en: "Catch-up: Complete 8 rounds", tr: "Catch-up: 8 round tamamla" },
  quest_weekly_catchup_xp_1500: { en: "Catch-up: Earn 1500 XP", tr: "Catch-up: 1500 XP kazan" },
  quest_weekly_catchup_stars_16: { en: "Catch-up: Earn 16 stars", tr: "Catch-up: 16 yıldız kazan" },
  quest_ev_q1: { en: "Play 3 rounds", tr: "3 round oyna" },
  quest_ev_q2: { en: "Play 8 rounds", tr: "8 round oyna" },
  quest_ev_q3: { en: "Earn 15 stars", tr: "15 yıldız kazan" },
  quest_ev_q4: { en: "Earn 30 stars", tr: "30 yıldız kazan" },
  quest_ev_q5: { en: "Complete 5 rounds >90%", tr: "5 round >90% tamamla" },
  quest_ev_q6: { en: "Earn 50 stars", tr: "50 yıldız kazan" },
  quest_ev_q7: { en: "3 boss attempts", tr: "3 boss denemesi" },
  quest_ev_q8: { en: "Complete 20 rounds", tr: "20 round tamamla" },
  quest_ev_q9: { en: "Earn 3000 XP", tr: "3000 XP kazan" },
  quest_ev_q10: { en: "Earn 80 stars", tr: "80 yıldız kazan" },
  quest_ev_q11: { en: "Complete 30 rounds", tr: "30 round tamamla" },
  quest_ev_q12: { en: "Earn 100 stars total", tr: "Toplam 100 yıldız kazan" },

  // ── Cosmetic abbreviations ────────────────────────────────────────────────
  brushAbbr: { en: "B", tr: "F" },
  trailAbbr: { en: "T", tr: "İ" },
  frameAbbr: { en: "F", tr: "Ç" },

  // ── Language ──────────────────────────────────────────────────────────────
  language: { en: "EN", tr: "TR" },
} as const;

export type TranslationKey = keyof typeof translations;

let _currentLang: Lang = "en";
const _listeners: Array<() => void> = [];

export function getLang(): Lang {
  return _currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === _currentLang) return;
  _currentLang = lang;
  _listeners.forEach((fn) => fn());
}

export function t(key: TranslationKey): string {
  return translations[key][_currentLang];
}

export function useLanguage(): [Lang, (lang: Lang) => void] {
  const [lang, _setLang] = useState(_currentLang);

  const toggle = useCallback((newLang: Lang) => {
    setLang(newLang);
    _setLang(newLang);
  }, []);

  return [lang, toggle];
}

export const TUTORIAL_STEPS_I18N: Record<Lang, string[]> = {
  en: [
    translations.tutorialStep1.en,
    translations.tutorialStep2.en,
    translations.tutorialStep3.en,
  ],
  tr: [
    translations.tutorialStep1.tr,
    translations.tutorialStep2.tr,
    translations.tutorialStep3.tr,
  ],
};

export const SHAPE_NAMES: Record<string, TranslationKey> = {
  circle: "circle",
  square: "square",
  triangle: "triangle",
  diamond: "diamond",
  pentagon: "pentagon",
  hexagon: "hexagon",
  heart: "heart",
  star: "starShape",
};

export function tShape(shape: string): string {
  const key = SHAPE_NAMES[shape];
  return key ? t(key) : shape;
}

const DIFFICULTY_KEYS: Record<string, TranslationKey> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

export function tDifficulty(diff: string): string {
  const key = DIFFICULTY_KEYS[diff];
  return key ? t(key) : diff;
}

const MODE_KEYS: Record<string, TranslationKey> = {
  free: "free",
  trace: "trace",
};

export function tMode(mode: string): string {
  const key = MODE_KEYS[mode];
  return key ? t(key) : mode;
}

const MECHANIC_KEYS: Record<string, TranslationKey> = {
  speed: "speed",
  stability: "stability",
  symmetry: "symmetry",
  memory: "memory",
};

export function tMechanic(tag: string): string {
  const key = MECHANIC_KEYS[tag];
  return key ? t(key) : tag;
}

const MECHANIC_DESC_KEYS: Record<string, TranslationKey> = {
  speed: "mechanicDescSpeed",
  stability: "mechanicDescStability",
  symmetry: "mechanicDescSymmetry",
  memory: "mechanicDescMemory",
};

export function tMechanicDesc(tag: string): string {
  const key = MECHANIC_DESC_KEYS[tag];
  return key ? t(key) : tag;
}

const FOCUS_HINT_KEYS: Record<string, TranslationKey> = {
  speed: "focusHintSpeed",
  stability: "focusHintStability",
  symmetry: "focusHintSymmetry",
  memory: "focusHintMemory",
};

export function tFocusHint(mechanicTag: string): string {
  const key = FOCUS_HINT_KEYS[mechanicTag];
  return key ? t(key) : mechanicTag;
}

const CHAPTER_TITLE_KEYS: Record<string, TranslationKey> = {
  "Foundations": "chapterFoundations",
  "Control": "chapterControl",
  "Patterns": "chapterPatterns",
  "Pressure": "chapterPressure",
  "Mastery": "chapterMastery",
};

export function tChapterTitle(title: string): string {
  const key = CHAPTER_TITLE_KEYS[title];
  return key ? t(key) : title;
}

const CHAPTER_HOOK_KEYS: Record<string, TranslationKey> = {
  "Core shape control": "hookFoundations",
  "Stability and rhythm": "hookControl",
  "Symmetry mastery": "hookPatterns",
  "Speed under pressure": "hookPressure",
  "Mixed constraints": "hookMastery",
};

export function tChapterHook(hook: string): string {
  const key = CHAPTER_HOOK_KEYS[hook];
  return key ? t(key) : hook;
}

const RARITY_KEYS: Record<string, TranslationKey> = {
  common: "common",
  rare: "rare",
  legendary: "legendary",
  mythic: "mythic",
};

export function tRarity(rarity: string): string {
  const key = RARITY_KEYS[rarity];
  return key ? t(key) : rarity;
}

export function tQuest(questId: string): string {
  const key = ("quest_" + questId) as TranslationKey;
  if (key in translations) {
    return t(key);
  }
  return questId;
}
