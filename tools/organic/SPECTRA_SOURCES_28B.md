# Spectra sources: CHEM 28B organic questions (2026-11-17)

Scope: every `f` figure of type `ir`, `ms` or `nmr` in `src/28B-zz-spec-1.json`, `src/28B-zz-spec-2.json`,
`src/28B-zz-roman-1.json`, `src/28B-zz-roman-2.json` and `src/28B-zz-mech-*.json`.
roman-1 and mech-1/2/3 contain no spectrum figures. In total there are 93 spectrum figures: spec-1 has 62, spec-2 has 28 and roman-2 has 3.

## Method

- **IR / MS:** NIST Chemistry WebBook (https://webbook.nist.gov), JCAMP-DX downloads (`?JCAMP=C<cas>&Index=n&Type=IR|Mass`).
  The files were parsed in Python. Band positions are rounded to the nearest 5 cm<sup>−1</sup>. Strength comes from the relative
  transmittance depth below the baseline: s ≥ 0.75, m 0.35–0.75, w < 0.35. A band is marked broad when its FWHM is over about 150 cm<sup>−1</sup>.
  MS peaks are relative intensity rounded to the nearest whole percent. Only a handful of peak values per compound are used, not the spectrum.
- **Phase rule.** A condensed-phase NIST spectrum (liquid, CCl<sub>4</sub>/CS<sub>2</sub> solution, mull) was used whenever NIST has one.
  For some compounds NIST has only a gas-phase spectrum. There the C–H and fingerprint bands come from the gas spectrum. The C=O stretch
  (and the conjugated enone C=C), O–H and N–H stretches move a lot between gas and liquid: a gas-phase C=O is
  about 15–30 cm<sup>−1</sup> higher, and a gas-phase O–H is a sharp "free" band near 3580–3650 cm<sup>−1</sup>. For those bands the figure keeps the condensed-phase
  literature value already in the item, and the gas value is recorded below as "gas:".
- **NMR:** NIST has no NMR. Established literature values were used (CDCl<sub>3</sub>, standard reference tables / OpenStax-level texts):
  δ to 0.01 ppm for <sup>1</sup>H and 0.1 ppm for <sup>13</sup>C. Unless noted, the existing figure already matched the literature within
  ±0.02 ppm (<sup>1</sup>H) / ±0.2 ppm (<sup>13</sup>C), with correct multiplicity and integration, and was left unchanged. No SDBS bulk download was used.
- Older Coblentz "LIQUID" prism spectra were checked against solution spectra of the same compound. Ethyl benzoate (no. 3717) and
  4-methoxyacetophenone read 15–25 cm<sup>−1</sup> low across the board, so a calibration offset is likely. The CCl<sub>4</sub>/CS<sub>2</sub> solution spectrum was used for those positions.

## Per figure

Format: question id: figure: compound (CAS): source: change. "Text:" lists every text edit.

### Ethyl (E)-cinnamate, CAS 103-36-6 (NIST IR gas only; NMR literature)
- zzspec1-01, -02, -03, -04: IR. NIST gas spectrum: 3070 w, 2990 w, 1640 m, 1310 m, 1165 s, 975 w. C=O kept at 1712 (condensed literature; gas: 1740).
  Text: zzspec1-01 w "IR 1638" → "IR 1640"; zzspec1-02 c[2] "1638" → "1640", c[3] "1170" → "1165" (meaning unchanged).
- zzspec1-01..04: <sup>1</sup>H (7.68 d, 7.52 m, 7.38 m, 6.44 d J 16.0, 4.27 q, 1.34 t) and <sup>13</sup>C (167.0 … 14.3): literature; unchanged.

### 4-Methylpentan-2-one (MIBK), CAS 108-10-1 (NIST IR gas only, NIST EI-MS)
- zzspec1-05, -06, -07: IR. NIST gas: 2970 s, 2890 m, 1365 m, 1170 m. C=O kept at 1716 (condensed literature; gas: 1730).
- zzspec1-05, -06, -07: MS. NIST EI (MS no. 118841): 43 (100), 58 (33), 41 (25), 57 (24), 85 (14), 100 M<sup>+</sup> (12), 29 (12). Was 43/58 35/57 18/85 12/100 8.
- <sup>1</sup>H (2.30 d 2H, 2.17 m 1H, 2.12 s 3H, 0.92 d 6H): literature; unchanged.

### Methyl propanoate, CAS 554-12-1 (NIST IR gas only)
- zzspec1-08: IR. NIST gas: 2995 m, 2960 m, 1195 s. C=O kept at 1740 (condensed literature; gas: 1770). <sup>1</sup>H: literature; unchanged.

### Methyl phenylacetate, CAS 101-41-7 (NMR only)
- zzspec1-09: <sup>1</sup>H, <sup>13</sup>C: literature; unchanged.

### Ethyl benzoate, CAS 93-89-0 (NIST IR, 10% CCl<sub>4</sub>/CS<sub>2</sub> solution, Coblentz)
- zzspec1-10: IR. 3065 w, 2990 m, 1725 s, 1610 m, 1270 s, 1105 s (was 3065/2982/1720/1600/1275/1110). Text: w "C=O at 1720" → "1725".
- zzs2-22: IR. Same values plus 710 s. Text: w "to 1720 … at 1275 and 1110" → "to 1725 … at 1270 and 1105".
- zzspec1-10, zzs2-22, r2-23: <sup>1</sup>H (8.05 d, 7.54/7.55 t, 7.43/7.44 t, 4.38 q, 1.39 t): literature; unchanged.
  (r2-23 stem quotes 1720 cm<sup>−1</sup> in text, with no IR figure. That is within the neat-liquid literature range and was left unchanged.)

### 3-Phenylpropanal, CAS 104-53-0 (NIST IR gas only)
- zzspec1-11: IR. NIST gas: 3035 m, 2940 m, 2810 m, 2710 m (aldehyde C–H pair), 1495 w, 1450 w. C=O kept at 1725 (condensed literature; gas: 1745).
  Text: w "pair of weak bands at 2820 and 2720" → "pair of bands at 2810 and 2710"; x[1] "no 2720/2820" → "no 2710/2810".
- zzs2-23: IR. 3035 m, 2940 m, 2810 m, 2710 m, 1725 s (literature), 700 m. Text: w "2820/2725" → "2810/2710".
- zzspec1-11, zzs2-23: <sup>1</sup>H: literature; unchanged.

### 2-Methylpropanoic acid, CAS 79-31-2 (NIST IR liquid + 2% CCl<sub>4</sub> solution)
- zzspec1-12: IR. Broad O–H envelope 3300–2500 (liquid, centered near 3000, kept at 3000 broad s), 2975 m, 1710 s, 1235 m (solution).
  Text: w "C=O at 1708" → "1710". <sup>1</sup>H and <sup>13</sup>C (184.0, 34.0, 18.8): literature; unchanged.

### N-Methylbenzamide, CAS 613-93-4 (NIST IR Nujol mull + CCl<sub>4</sub> solution)
- zzspec1-13: IR. 3335 s (N–H), 3070 m, 1635 s (amide I), 1550 s (amide II), 1310 s (mull; 3070 from solution).
  Text: w "C=O at 1640" → "1635", "N–H stretch at 3330" → "3335". <sup>1</sup>H: literature; unchanged.

### 4-Methoxybenzonitrile, CAS 874-90-8: **no NIST IR**
- zzspec1-14: IR left unchanged (2220 C≡N, 1605, 1510, 1258, 835). These agree with standard literature values for anisonitrile.
  <sup>1</sup>H, <sup>13</sup>C (162.8, 134.0, 119.2, 114.7, 103.9, 55.5): literature; unchanged.

### N,N-Dimethylbenzylamine, CAS 103-83-3 (NIST IR neat liquid, Coblentz)
- zzspec1-15: IR. 3065 m, 3030 m, 2945 s, 2820 s, 2775 s (Bohlmann N–CH bands), 1490 m, 1450 s.
- zzs2-25: IR. 3030 m, 2945 s, 2820 s, 2775 s, 1490 m, 1025 s, 730 s, 695 s. Text: w "near 2815/2765" → "near 2820/2775".
- <sup>1</sup>H (7.3 m 5H, 3.42 s 2H, 2.24 s 6H): literature; unchanged.

### 1-Ethoxy-4-methylbenzene, CAS 622-60-6 (NIST IR gas + neat liquid)
- zzspec1-16: IR. 3035 w, 2990 m, 2940 m, 1515 s (gas; the neat spectrum is saturated there), 1615 w, 1245 s, 1050 m, 810 m (neat liquid positions).
  <sup>1</sup>H: literature; unchanged.

### Methyl salicylate, CAS 119-36-8 (NIST IR 10% CCl<sub>4</sub>/CS<sub>2</sub> solution)
- zzspec1-17: IR. 3200 m broad (H-bonded O–H), 3065 m, 2960 m, 1685 s, 1615 s, 1305 s, 1210 s, 760 s.
  Text: w "a band near 3190" → "near 3200", "lower the C=O to 1680" → "1685". <sup>1</sup>H, <sup>13</sup>C: literature; unchanged.

### (E)-Pent-3-en-2-one, CAS 3102-33-8 / 625-33-2: **no NIST IR**
- zzspec1-18: IR left unchanged (1675, 1635, 970). These agree with literature for the conjugated enone. <sup>1</sup>H: literature; unchanged.

### 2-Phenylpropanoic acid, CAS 492-37-5 (NIST IR gas only)
- zzspec1-19: IR. NIST gas: 2990 w, 1500 w, 700 m. Kept at condensed literature: broad O–H 3030 s (gas: sharp 3575), C=O 1705 (gas: 1775), C–O 1230 m.
  <sup>1</sup>H: literature; unchanged.

### Ethyl chloroacetate, CAS 105-39-5 (NIST EI-MS)
- zzspec1-20: MS. 29 (100), 77 (27), 27 (19), 49 (13), 79 (9), 51 (4), 94 (3), 96 (1), 122 M<sup>+</sup> (0.7), 124 M+2 (0.2).
  The two molecular-ion peaks are given to one decimal so M<sup>+</sup> stays drawn (they round to 1 and 0). Was 29/49 40/77 55/122 9 ….
  Text: w "M⁺ at 122 and M+2 at 124 in a 3:1 ratio show one Cl" → "The weak M⁺ at 122 with M+2 at 124 (about 3:1), like the 3:1 pairs at m/z 77/79 and 49/51, shows one Cl".
  <sup>1</sup>H: literature; unchanged.

### Methyl 4-oxopentanoate (methyl levulinate), CAS 624-45-3 (NIST IR gas only)
- zzspec1-21: IR. NIST gas: 2965 m, 1365 m, 1160 s. The two C=O bands are kept at 1738 (ester) and 1717 (ketone), the condensed literature values.
  The gas spectrum shows one merged C=O near 1755. <sup>1</sup>H, <sup>13</sup>C: literature; unchanged.

### 4-Methoxyaniline, CAS 104-94-9 (NIST IR split mull, Coblentz)
- zzspec1-22: IR. 3445 s, 3370 m (NH<sub>2</sub>), 3015 m, 2950 m, 2845 w, 1520 s, 1250 s, 1035 s, 835 s.
  Text: w "N–H bands at 3425 and 3345" → "3445 and 3370", "strong 1235" → "strong 1250". <sup>1</sup>H: literature; unchanged.

### Cyclohex-2-en-1-one, CAS 930-68-7 (NIST IR gas only)
- zzspec1-23: IR. NIST gas: 3050 w, 2945 m, 1245 w. C=O 1680 and C=C 1620 kept at condensed literature (gas: 1710 and 1630 w).
- zzs2-06: IR. 3050 w, 2945 m, 2890 w, 1680 s, 1620 m (literature), 1245 w, 880 w.
- zzspec1-23: <sup>1</sup>H, <sup>13</sup>C (199.9, 151.0, 129.9, 38.2, 25.8, 22.8): literature; unchanged.

### Pentan-3-one, CAS 96-22-0 (NMR only)
- zzspec1-24: <sup>1</sup>H, <sup>13</sup>C; r2-24: <sup>13</sup>C (211.8, 35.5, 7.9): literature; unchanged.

### 4-Methylphenyl acetate, CAS 140-39-6: **no NIST IR**
- zzspec1-25: IR left unchanged (1765 aryl-ester C=O, 1370, 1205, 1190, 815). These agree with literature. <sup>1</sup>H: literature; unchanged.

### Methyl (E)-cinnamate, CAS 1754-62-7 (NMR only)
- zzs2-07: <sup>1</sup>H: literature; unchanged.

### Ethyl propanoate, CAS 105-37-3 (NMR only)
- zzs2-08: <sup>1</sup>H. The OCH<sub>2</sub> quartet moved from δ 4.10 to the literature δ 4.12 (J ≈ 7.1–7.2 Hz). The table's line positions moved to
  1658.8/1651.6/1644.4/1637.2 Hz (center 1648.0 Hz = 4.12 ppm at 400 MHz, J = 7.2 Hz kept).
  Text: c[0]–c[2] "δ 4.10" → "δ 4.12"; c[3] "δ 2.73" → "δ 2.75" (1648.0/600, still the wrong-frequency trap); w arithmetic
  "(1650.0 + 1628.4)/2 = 1639.2 Hz; … = 4.098 ≈ 4.10 ppm" → "(1658.8 + 1637.2)/2 = 1648.0 Hz; … = 4.12 ppm"; "(4.10 × 600 = 2460 Hz)" →
  "(4.12 × 600 = 2472 Hz)"; "Answer: δ 4.10" → "δ 4.12"; x[3] "1639.2 Hz" → "1648.0 Hz", "δ = 4.10 ppm" → "δ = 4.12 ppm".

### Benzoyl chloride, CAS 98-88-4 (NIST IR 2% CCl<sub>4</sub>/CS<sub>2</sub> solution)
- zzs2-09: IR. 3070 w, 1775 s, 1595 m, 1450 m, 1205 s, 870 s, 670 s. The spectrum also shows the known Fermi-resonance satellite of C=O near 1730 (m).
  It was left out of the drawing because it is not diagnostic and would look like an ester band.

### 1-Phenylpropan-2-one, CAS 103-79-7 (NIST IR gas only)
- zzs2-11: IR. NIST gas: 3040 m, 2930 w, 1500 m, 1360 m, 700 m. C=O kept at 1716 (condensed literature; gas: 1730). <sup>1</sup>H: literature; unchanged.

### Pentanal, CAS 110-62-3 (NIST IR gas/vapor only)
- zzs2-12: IR. NIST gas (index 0): 2970 s, 2885 m, 2810 m, 2715 m, 1465 w. C=O kept at 1728 (condensed literature; gas: 1740).
  Text: h "two weak bands … near 2820 and 2720" → "two bands … near 2810 and 2715"; w "pair of weak bands at 2820 and 2720" →
  "pair of bands at 2810 and 2715"; x[1] "2820/2720" → "2810/2715".

### Butanoic acid, CAS 107-92-6 (NIST IR 10% CCl<sub>4</sub>/CS<sub>2</sub> solution)
- zzs2-13: IR. Broad O–H 3000 s (envelope 3300–2500), 2965 m, 1715 s, 1285 s, 935 s broad (O–H out-of-plane). Text: w "C=O at 1712" → "1715".
  <sup>1</sup>H: literature; unchanged.

### 4-Methoxyacetophenone, CAS 100-06-1 (NIST IR 10% CCl<sub>4</sub>/CS<sub>2</sub> solution; strengths from the Coblentz liquid spectrum)
- zzs2-14: IR. 3015 w, 2840 w, 1685 s, 1610 s, 1270 s, 1035 m, 845 m. Text: w "C=O at 1676" → "1685". <sup>1</sup>H: literature; unchanged.

### Hexan-3-one, CAS 589-38-8 (NIST EI-MS)
- zzs2-16: MS. 43 (100), 57 (83), 71 (51), 29 (51), 27 (37), 41 (26), 100 M<sup>+</sup> (24), 72 (5). Was 57 as base peak, 72 at 22.
  Text: w "(m/z 57, base peak)" → "(m/z 57)", and a sentence was added: "The base peak, m/z 43, is the propyl cation C₃H₇⁺."; x[2] (hexan-2-one)
  "(m/z 43) as base peak and C₄H₉CO⁺ (m/z 85);" → "(m/z 43) and C₄H₉CO⁺ (m/z 85, absent here);". Key unchanged: only hexan-3-one gives 57, 71 and 72.

### (E)-(2-Bromovinyl)benzene, CAS 588-72-7 (NMR only)
- zzs2-17: <sup>1</sup>H (7.11 d, 6.78 d, J 14 Hz): literature; unchanged.

### 4-Chlorotoluene, CAS 106-43-4 (NMR only)
- zzs2-18: <sup>13</sup>C (136.2, 131.2, 130.2, 128.4, 20.8): literature; unchanged.

### Methylenecyclohexane, CAS 1192-37-6 (NIST IR gas only)
- zzs2-19: IR. NIST gas: 3070 w, 2935 s, 2865 m, 1650 w, 1450 w, 890 m. Text: w "=C–H at 3075 … and the strong 890" → "=C–H at 3070 … and the 890".
  <sup>1</sup>H: literature; unchanged.

### 1,4-Dioxaspiro[4.5]decane, CAS 177-10-6 (NIST IR gas only)
- zzs2-20: IR. NIST gas: 2950 s, 2880 m, 1455 w, 1165 m, 1110 s. No C=O or O–H bands, so there are no phase-sensitive bands.
  Text: w "only strong C–O stretches at 1160 and 1100" → "only C–O stretches at 1165 and 1110". <sup>1</sup>H: literature; unchanged.

### δ-Valerolactone (oxan-2-one), CAS 542-28-9 (NIST IR 10% CCl<sub>4</sub>/CS<sub>2</sub> solution)
- zzs2-21: IR. 2960 s, 1745 s, 1235 s, 1080 s. Text: w "C=O at 1735 … C–O at 1245" → "C=O at 1745 … C–O at 1235";
  x[3] (2-hydroxycyclopentanone) dropped "a ketone C=O near 1750 cm⁻¹" because that is now too close to the observed 1745. That choice is still ruled out
  by the missing O–H band and the NMR. <sup>1</sup>H: literature; unchanged.

### 2-Phenylpropan-2-ol, CAS 617-94-7 (NIST IR gas only)
- zzs2-24: IR. NIST gas: 3070 m, 2985 s, 1495 w, 1170 m, 700 s. O–H kept as broad 3400 s (condensed literature; gas: sharp free O–H 3640).
  <sup>1</sup>H: literature; unchanged.

### Bromobenzene, CAS 108-86-1 (NIST EI-MS)
- r2-25: MS. 77 (100), 156 M<sup>+</sup> (67), 158 (64), 51 (35), 50 (30), 74 (13). Was 156 as base peak, 158 97, 77 88. Text unchanged:
  156/158 are still nearly equal, and 77 is still C₆H₅⁺.

## Summary

- 93 figures checked: 35 IR, 6 MS, 52 NMR.
- 39 figures got new values: 32 IR, all 6 MS, and 1 <sup>1</sup>H NMR plus its line-position table (zzs2-08). The other 51 NMR figures
  already matched literature and were left unchanged.
- No NIST IR exists for 3 compounds (4-methoxybenzonitrile, (E)-pent-3-en-2-one, 4-methylphenyl acetate). Those 3 IR figures were left at
  literature-consistent values.
- 12 compounds (19 IR figures) have only a gas-phase NIST IR spectrum. Those figures use gas positions for non-sensitive bands and
  condensed-phase literature values for the C=O/enone C=C and O–H bands.

## Follow-up after the blind re-solve (2026-11-18)

- **zzs2-16 (hexan-3-one):** its McLafferty peak at m/z 72 (NIST, 5%) is the only feature that separates it from 2-methylpentan-3-one, which gives the same α-cleavage ions. The peak is now labeled in the figure and the stem points to it. Peak heights are unchanged.
