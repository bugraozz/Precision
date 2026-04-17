# Scoring V2 Benchmark

Date: 2026-03-05T17:33:50.077Z
Scope: v1 vs v2 accuracy comparison on transformed template-like strokes

| Case | Shape | v1 Accuracy | v2 Accuracy | Improvement |
| --- | --- | --- | --- | --- |
| circle-noisy | circle | 98.60 | 98.60 | 0.00 |
| circle-reversed | circle | 55.63 | 98.29 | 42.66 |
| square-rotated-45deg | square | 70.93 | 87.97 | 17.04 |
| triangle-rotated-120deg-reversed | triangle | 59.52 | 80.72 | 21.20 |
| square-rotated-translated | square | 78.41 | 88.90 | 10.49 |

Average improvement: 18.28
Max improvement: 42.66

Notes:
- v2 adds rotation tolerance and draw-direction tolerance.
- Translation/scale are still normalized as in v1.
