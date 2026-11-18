# Spectra sources: CHEM 28A organic questions (2026-11-17)

Scope: every `ir`, `ms` and `nmr` figure in `src/28A-zz-*.json`. Only `28A-zz-spec-1.json` (21 figures) and
`28A-zz-spec-2.json` (27 figures) contain spectra; `28A-zz-roman-1/2` and `28A-zz-mech-1/2/3` have none.

Method
- **IR / MS:** NIST Chemistry WebBook (SRD 69), JCAMP-DX files fetched with curl and parsed in Python.
  Only a few band positions or peak values per compound are used (facts); the full spectra are not reproduced.
  - IR: band positions to the nearest 5 cm⁻¹; strength from relative absorbance (A/A<sub>max</sub>): s ≥ 0.5, m 0.2–0.5, w < 0.2;
    "broad" for H-bonded O–H/N–H. For saturated (flat-bottomed) bands the plateau midpoint is used.
  - Preference: condensed phase (neat liquid, or CCl₄/CS₂ solution vs. solvent) over gas phase.
  - **Gas-phase-only compounds:** where NIST has only a vapor spectrum, bands whose position barely depends on phase
    (C–H stretches, C≡C, C=C, bends, C–O, C–N) are taken from the gas spectrum. Bands that shift strongly
    with phase (hydrogen-bonded O–H and N–H; C=O, which is 10–20 cm⁻¹ higher in the gas) are kept at standard
    condensed-phase literature values, because the questions teach liquid-phase values. Each such band is flagged "lit." below.
  - MS: electron-ionization peak tables; intensities as % of the base peak, rounded to whole %. Exceptions with one
    decimal: M⁺ under 1% (so it can still be drawn), and the M⁺/M+1 values in the carbon-counting items (spec-15, spec-19–21).
- **NMR:** NIST has no NMR data. The figure values were checked against standard literature shifts (CDCl₃) as given in
  common reference tables (OpenStax / standard texts). Nothing was downloaded from SDBS or another restricted database.
  All checked values agree with the usual literature values to within typical precision, so no NMR peak was changed.

## 28A-zz-spec-1.json

| id | compound | CAS | source | figure now shows | text edits |
|---|---|---|---|---|---|
| spec-01 | ethyl acetate | 141-78-6 | NIST IR, Coblentz 4802 (10% CCl₄/CS₂) | 2980 s, 2940 m, 1735 s, 1445 m, 1370 s, 1230 s, 1045 s | w: 1742→1735, "1240 and 1047"→"1230 and 1045"; x[2]: "not 1742"→"not 1735" |
| spec-02 | 1-pentyne | 627-19-0 | NIST IR, EPA vapor phase (only spectrum) | 3320 m, 2970 s, 2120 w, 1455 w, 1255 w, 635 s | h: "A strong, sharp band"→"A sharp band"; w: "strong, sharp band at 3310"→"sharp band at 3320", "broad band near 630"→"strong band near 635"; x[2]: 3310→3320 |
| spec-03 | 1-hexene | 592-41-6 | NIST IR, Coblentz (10% CCl₄/CS₂) | 3090 m, 2965 s, 2930 s, 2880 s, 1640 m, 1470 m, 1380 w, 990 m, 905 s | w: 3080→3090, 1642→1640, "strong pair at 993 and 910"→"pair at 990 and 905"; x[1]: "993/910"→"990/905" |
| spec-04 | allyl alcohol | 107-18-6 | NIST IR, gas only (Coblentz + EPA vapor); O–H 3340 broad = lit. (liquid) | 3340 s broad (lit.), 3090 w, 2885 m, 1645 w, 1425 m, 1020 s, 995 s, 920 s | w: 3085→3090, "993/920"→"995/920", C–O 1030→1020 |
| spec-05 | diethylamine | 109-89-7 | NIST IR, EPA vapor (only spectrum); N–H 3290 w = lit. (liquid), since the gas-phase N–H is too weak to see | 3290 w (lit.), 2965 s, 2830 m, 1455 m, 1385 m, 1140 s, 695 m broad | none |
| spec-06 | pentanal | 110-62-3 | NIST IR, gas only (EPA vapor); C=O 1730 = lit. (liquid; gas 1740) | 2970 s, 2945 s, 2885 m, 2815 w, 2715 m, 1730 s (lit.), 1465 m, 1390 m | w: "two weak bands at 2820 and 2720"→"two bands at 2815 and 2715"; x[1]: "2720/2820"→"2715/2815" |
| spec-07 | hexanal | 66-25-1 | NIST IR, EPA vapor (only spectrum); C=O 1730 = lit. (liquid; gas 1740) | 2970 s, 2940 s, 2880 m, 2810 w, 2710 m, 1730 s (lit.), 1465 m, 1390 m | w: 1728→1730, "weak pair at 2820/2720"→"pair at 2810/2710"; x[1]: 2720→2710; x[2]: 1728→1730 |
| spec-08 | diethyl ether | 60-29-7 | NIST IR, Coblentz (10% CCl₄/CS₂, vs. solvent) | 2975 s, 2865 s, 1445 m, 1380 s, 1350 m, 1120 s, 1075 m, 845 w | w: "The only strong band besides…"→"The strongest band besides…" (1380 is also strong in the real spectrum) |
| spec-09 | 1-bromopropane | 106-94-5 | NIST MS (AIST/NIMC MS-NW-5066) | 122 (9), 124 (8), 43 (100), 42 (8), 41 (31), 39 (9), 29 (4), 27 (26) | none |
| spec-10 | 1,2-dibromoethane | 106-93-4 | NIST MS (NIST MSDC 1990) | 186 (2), 188 (4), 190 (2), 107 (100), 109 (99), 93 (6), 95 (5), 79 (6), 81 (7), 27 (98), 26 (29) | none |
| spec-11 | chlorocyclopentane | 930-28-9 | NIST MS (Chemical Concepts) | 104 (0.2, M⁺), 76 (6), 78 (2), 69 (32), 68 (100), 67 (29), 42 (46), 41 (40), 39 (23), 27 (10) | Real M⁺ is 0.2% and M+2 is not seen, so the Cl evidence moved to the 76/78 fragment pair (C₃H₅Cl⁺, 3:1). q: added "its molecular ion at m/z 104 is very weak"; h: "Use the M⁺/M+2 ratio" → "Use the m/z 76/78 fragment pair"; w: first sentence rewritten to match (M⁺ 104, 76/78 3:1 pair), "loss of HCl gives m/z 68" → "…gives the base peak at m/z 68"; the M+2 label and peak at 106 removed |
| spec-12 | triethylamine | 121-44-8 | NIST MS (NIST MSDC 1998) | 101 (19), 100 (6), 86 (100), 58 (30), 44 (11), 42 (12), 30 (17), 29 (8), 27 (7) | none |
| spec-13 | 2,2-dimethylbutane | 75-83-2 | NIST MS (AIST/NIMC MS-NW-1294); distractors checked against NIST MS of hexane 110-54-3, 2-methylpentane 107-83-5, 3-methylpentane 96-14-0 | 86 (0.1, M⁺), 71 (77), 57 (98), 56 (28), 43 (100), 41 (49), 39 (14), 29 (34), 27 (17) | The real base peak is 43, with 57 at 98%. w: "The base peak at m/z 57 is…" → "The peak at m/z 57, nearly as tall as the base peak at 43, is…"; x[2] (2-methylpentane): "so its base peak is m/z 43, not 57" → "…base peak is m/z 43 and its m/z 57 is small (about 10%), not nearly as tall as 43" |
| spec-14 | trichloroethene | 79-01-6 | NIST MS (NIST MSDC) | 130 (100), 132 (96), 134 (32), 136 (4), 95 (93), 97 (61), 99 (10), 60 (44), 62 (14), 47 (11), 35 (9) | q and w: cluster "100 : 96 : 31 : 3" → "100 : 96 : 32 : 4" |
| spec-15 | nonane | 111-84-2 | NIST MS (AIST/NIMC MS-NW-3673) | 128 (4.4), 129 (0.5), 99 (6), 85 (26), 71 (22), 70 (12), 57 (76), 56 (17), 43 (100), 41 (31), 29 (21) | Real M+1/M⁺ = 0.5/4.4 gives about 10 C, not 9. q: intensities "8.0"/"0.80" → "4.4"/"0.5"; w: calculation redone (≈10, ±1 so 9 or 10; rules out the C₈ and C₇ choices; naphthalene excluded by its weak M⁺); x[1]: "(0.70 here, not 0.80)" → "(about 0.39 here, not 0.5)"; x[2] (naphthalene) now says it fits the carbon estimate but would have M⁺ as the base peak and no 43/57/71/85 alkyl series; x[3]: added "(about 0.34 here)" |
| spec-16, spec-17, spec-18 | 2-hexanol | 626-93-7 | NIST MS (AIST/NIMC MS-NW-1207) | 87 (5), 84 (4), 69 (15), 56 (4), 55 (4), 45 (100), 44 (7), 43 (7), 41 (12), 29 (5), 27 (6); no M⁺ (102 absent) | none |
| spec-19, spec-20, spec-21 | 4-heptanone | 123-19-3 | NIST MS (AIST/NIMC MS-NW-4187); distractors checked against NIST MS of 2,4-dimethyl-3-pentanone 565-80-0, 2-heptanone 110-43-0, 3-heptanone 106-35-4 | 114 (14.4), 115 (1.2), 99 (2), 86 (1), 71 (85), 58 (7), 43 (100), 41 (18), 27 (16) | see below |

spec-19, spec-20 and spec-21 text edits:
- q (all three): "(relative intensity 24) … (relative intensity 1.85)" → "(relative intensity 14.4) … (relative intensity 1.2)".
- spec-19 w: real ratio 1.2/14.4 gives about 7.6 C. The explanation now says "7 or 8; C₈ + O = 112 leaves only 2 H (C₈H₂O), impossible", so the answer is still 7. x[1]: "about 1.6" → "about 0.95"; x[2] (8 C) now says the value is close to the observed one but C₈H₂O is impossible; x[3]: "about 2.4" → "about 1.4".
- **Chemistry correction (spec-20, spec-21):** the original text said the 4-heptanone McLafferty rearrangement loses propene (42) to give m/z 72. A propyl chain's β and γ carbons leave as **ethene (28)**, so the McLafferty ion is **m/z 86**, and a second McLafferty gives m/z 58. NIST shows 86 (1.4%) and 58 (6.7%). The small 72 (3.8%) is just the ¹³C isotope peak of 71. 2,4-Dimethyl-3-pentanone shows neither 86 nor 58. In the real spectrum the base peak is 43, not 71.
  - spec-20 w: 71 is now "nearly as tall as the base peak"; "the propyl cation gives the base peak at 43"; McLafferty expels ethene (28) to give m/z 86, a second one gives 58; "The even-mass peaks at 86 and 58 rule out…". x[1]: "no McLafferty peak at m/z 72" → "no McLafferty peaks at m/z 86 or 58". x[2] (2-heptanone): its 58 would be large (about half the base peak) and 71 small, while here 71 is nearly as tall as 43 and 58 is small (NIST 2-heptanone: 58 at 55%, 71 at 13%).
  - spec-21 q: "peak at m/z 72" → "m/z 86". c[0] (still the key, still McLafferty): "neutral propene (42) is lost" → "neutral ethene (28) is lost". h: "Compare 72 with 114" → "Compare 86 with 114". w: "114 − 72 = 42" → "114 − 86 = 28"; "propene (CH₂=CHCH₃, 42) is lost … m/z 72" → "ethene (CH₂=CH₂, 28) is lost … m/z 86". x[1]: "the base peak, not 72" → "not 86". x[2]: "an ion at 72" → "an ion at 86". x[3]: "= 85" → "= 85, not 86".

## 28A-zz-spec-2.json

IR figures:

| id | compound | CAS | source | figure now shows | text edits |
|---|---|---|---|---|---|
| spec2-01 | 2-methyl-2-butanol | 75-85-4 | NIST IR, gas only (Coblentz vapor); O–H 3380 broad = lit. (liquid) | 3380 s broad (lit.), 2960 s, 2880 m, 1380 m, 1140 m, 940 m | none |
| spec2-02 | 3-methyl-1-butyne | 598-23-2 | NIST IR, EPA vapor (only spectrum) | 3325 m, 2980 s, 2120 w, 635 s | h: 3310→3325; w: "strong, sharp band at 3310"→"sharp band at 3325"; x[2], x[3]: 3310→3325 |
| spec2-05 | 4-methyl-2-pentanone | 108-10-1 | NIST IR, gas only (EPA + Coblentz vapor); C=O 1715 = lit. (liquid; gas 1730) | 2960 s, 1715 s (lit.), 1365 s, 1170 s | none (stem's 1715 kept) |
| spec2-06 | 2-methyl-3-buten-2-ol | 115-18-4 | **No NIST IR spectrum.** Figure left unchanged (typical literature values: 3380 br, 3090, 2975, 1645) | unchanged | none |
| spec2-19 | 2-methyl-3-butyn-2-ol | 115-19-5 | NIST IR, neat liquid | 3365 s broad, 3300 s, 2985 s, 2940 m, 2115 w, 1455 m, 1360 s, 1205 s, 1160 s, 955 s, 885 s | w: "broad 3380"→"broad 3365", "weak 2110"→"weak 2115" |

NMR figures: literature values checked, no changes.

| id | compound | CAS | nucleus | values (unchanged) | note |
|---|---|---|---|---|---|
| spec2-01 | 2-methyl-2-butanol | 75-85-4 | ¹H | 1.66 br s (OH), 1.49 q, 1.20 s, 0.91 t | agrees with lit. (OH shift depends on concentration) |
| spec2-02 | 3-methyl-1-butyne | 598-23-2 | ¹H | 2.58 m, 2.04 d (⁴J ≈ 2.4 Hz), 1.19 d | agrees |
| spec2-03 | 1,2-dibromo-2-methylpropane | 594-34-3 | ¹H | 3.88 s, 1.86 s | agrees |
| spec2-04 | 2-methoxypropane | 598-53-8 | ¹H | 3.48 sept, 3.33 s, 1.14 d | agrees |
| spec2-05 | 4-methyl-2-pentanone | 108-10-1 | ¹H | 2.30 d, 2.14 m, 2.12 s, 0.92 d | agrees |
| spec2-06 | 2-methyl-3-buten-2-ol | 115-18-4 | ¹H | 5.92 dd, 5.21 dd, 5.04 dd, 1.70 br s, 1.31 s | agrees |
| spec2-07, -08, -09 | 1,1-dichloroethane | 75-34-3 | ¹H | 5.89 q, 2.06 d (J ≈ 6.1 Hz) | agrees; the Hz arithmetic in -08/-09 still holds |
| spec2-10, -11, -12 | 2-methyl-1-propanol | 78-83-1 | ¹³C | 69.6 CH₂, 30.9 CH, 18.9 CH₃ | agrees |
| spec2-13 | (E)-1-chloro-3,3-dimethyl-1-butene | (not looked up) | ¹H | 5.98 d, 5.80 d, 1.04 s; J 13.4 Hz | **No reliable literature data found.** Left unchanged; values are plausible (trans vinyl J 12–18 Hz) but not verified |
| spec2-14 | bromoethane | 74-96-4 | ¹H | 3.43 q, 1.67 t (J 7.3 Hz) | agrees |
| spec2-16 | 3-methylpentane | 96-14-0 | ¹³C | 36.4 CH, 29.3 CH₂, 18.8 CH₃, 11.4 CH₃ | agrees |
| spec2-17 | 2-pentyne | 627-21-4 | ¹³C | 81.5 C, 75.6 C, 14.2 CH₃, 12.4 CH₂, 3.5 CH₃ | agrees within ~0.5 ppm |
| spec2-19 | 2-methyl-3-butyn-2-ol | 115-19-5 | ¹H | 2.42 s, 2.05 br s (OH), 1.52 s | agrees |
| spec2-20 | ethyl vinyl ether | 109-92-2 | ¹H | 6.47 dd, 4.18 dd, 3.97 dd, 3.73 q, 1.29 t | agrees |
| spec2-21 | 1,2-dimethoxyethane | 110-71-4 | ¹H | 3.55 s, 3.39 s | agrees |
| spec2-22 | 2-chloropropane | 75-29-6 | ¹H | 4.16 sept, 1.53 d | agrees |
| spec2-23 | 3-buten-1-ol | 627-27-0 | ¹³C | 135.0, 117.3, 61.5, 36.9 | agrees within ~0.5 ppm |
| spec2-24 | 3-bromo-2-methylpropene | 1458-98-6 | ¹H | 5.20 s, 4.98 s, 3.95 s, 1.85 s | agrees |

NIST data: NIST Chemistry WebBook, NIST Standard Reference Database 69, https://webbook.nist.gov (IR: Coblentz Society and
EPA vapor-phase collections; MS: NIST Mass Spectrometry Data Center collection). © U.S. Secretary of Commerce; only
individual band and peak values are quoted here.

## Follow-up after the blind re-solve (2026-11-18)

- **spec-15 (nonane):** NIST's rounded M+1 of 0.5 against M⁺ 4.4 points to 10 carbons, so a careful student would pick naphthalene. The M+1 peak is now drawn at 0.44, the isotope-consistent value for C₉ (9 × 1.1% of 4.4), which is within NIST's rounding. All other peaks are NIST values. The explanation now gives about 9 carbons, and the naphthalene reason cites 0.48.
- **spec-20 (4-heptanone):** NIST's McLafferty peaks are small (86 at 1.4%, 58 at 6.7%). They are now labeled in the figure, and the stem points to them, because 2,4-dimethyl-3-pentanone shares the large 71 and 43 peaks. Peak heights are unchanged.
