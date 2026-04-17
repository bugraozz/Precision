# Scoring Calibration Report

Date: 2026-03-06T01:37:08.965Z
Scoring version: v2

| Shape | Scenario | Accuracy | Mean Dev | Stars | XP | Expected Band | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| circle | perfect | 96.12 | 0.0466 | 3 | 96 | 90-100 | PASS |
| circle | good | 96.41 | 0.0431 | 3 | 121 | 70-98 | PASS |
| circle | rough | 92.35 | 0.0922 | 2 | 115 | 25-90 | TUNE |
| circle | wrong-shape | 59.31 | 0.5059 | 0 | 95 | 0-65 | PASS |
| circle | open-stroke | 0.00 | 1.6718 | 0 | 0 | 0-60 | PASS |
| square | perfect | 95.60 | 0.0529 | 3 | 96 | 90-100 | PASS |
| square | good | 51.36 | 0.6101 | 0 | 64 | 70-98 | TUNE |
| square | rough | 25.10 | 0.9759 | 0 | 31 | 25-90 | PASS |
| square | wrong-shape | 47.50 | 0.6616 | 0 | 76 | 0-65 | PASS |
| square | open-stroke | 0.00 | 1.8133 | 0 | 0 | 0-60 | PASS |
| triangle | perfect | 97.41 | 0.0312 | 3 | 97 | 90-100 | PASS |
| triangle | good | 68.70 | 0.3854 | 0 | 86 | 70-98 | TUNE |
| triangle | rough | 59.20 | 0.5072 | 0 | 74 | 25-90 | PASS |
| triangle | wrong-shape | 11.48 | 1.1884 | 0 | 18 | 0-65 | PASS |
| triangle | open-stroke | 0.00 | 1.7098 | 0 | 0 | 0-60 | PASS |
| diamond | perfect | 96.37 | 0.0436 | 3 | 96 | 90-100 | PASS |
| diamond | good | 89.94 | 0.1216 | 2 | 112 | 70-98 | PASS |
| diamond | rough | 72.80 | 0.3336 | 1 | 91 | 25-90 | PASS |
| diamond | wrong-shape | 40.96 | 0.7504 | 0 | 66 | 0-65 | PASS |
| diamond | open-stroke | 0.00 | 1.5427 | 0 | 0 | 0-60 | PASS |
| pentagon | perfect | 92.84 | 0.0863 | 2 | 93 | 90-100 | PASS |
| pentagon | good | 84.90 | 0.1832 | 1 | 106 | 70-98 | PASS |
| pentagon | rough | 90.06 | 0.1201 | 2 | 113 | 25-90 | TUNE |
| pentagon | wrong-shape | 66.21 | 0.4171 | 0 | 106 | 0-65 | TUNE |
| pentagon | open-stroke | 0.00 | 1.4929 | 0 | 0 | 0-60 | PASS |
| hexagon | perfect | 90.91 | 0.1097 | 2 | 91 | 90-100 | PASS |
| hexagon | good | 80.45 | 0.2381 | 1 | 101 | 70-98 | PASS |
| hexagon | rough | 92.58 | 0.0895 | 2 | 116 | 25-90 | TUNE |
| hexagon | wrong-shape | 34.17 | 0.8450 | 0 | 55 | 0-65 | PASS |
| hexagon | open-stroke | 0.00 | 1.7464 | 0 | 0 | 0-60 | PASS |
| star | perfect | 91.34 | 0.1045 | 2 | 91 | 90-100 | PASS |
| star | good | 86.32 | 0.1657 | 2 | 108 | 70-98 | PASS |
| star | rough | 90.97 | 0.1089 | 2 | 114 | 25-90 | TUNE |
| star | wrong-shape | 24.69 | 0.9820 | 0 | 40 | 0-65 | PASS |
| star | open-stroke | 0.00 | 1.4648 | 0 | 0 | 0-60 | PASS |
| heart | perfect | 97.23 | 0.0333 | 3 | 97 | 90-100 | PASS |
| heart | good | 86.77 | 0.1602 | 2 | 108 | 70-98 | PASS |
| heart | rough | 46.66 | 0.6730 | 0 | 58 | 25-90 | PASS |
| heart | wrong-shape | 61.97 | 0.4715 | 0 | 99 | 0-65 | PASS |
| heart | open-stroke | 11.31 | 1.1912 | 0 | 18 | 0-60 | PASS |

Total cases: 40
Out-of-band cases: 7

Calibration notes:
- perfect should stay near 100.
- good should score high but below near-perfect.
- rough/open-stroke should not receive premium-like scores.
- wrong-shape should remain clearly low.
