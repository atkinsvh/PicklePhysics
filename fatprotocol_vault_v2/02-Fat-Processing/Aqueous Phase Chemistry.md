---
tags: [protocol, fat-processing, chemistry, aqueous]
---

# Aqueous Phase Chemistry — Steps 1–8

> *The complete aqueous cleaning sequence. All aqueous chemistry grouped before the single dry step.*

## The Principle
Water-based chemistry addresses three distinct contaminant classes through three distinct mechanisms:
1. **Physical removal** (filtration, washing) — particulates, soap, ionic residues
2. **Chemical conversion** (saponification) — FFAs → soap → aqueous phase
3. **Complexation** (chelation) — metal ions → metal acetates → aqueous phase

## Reagents and Their Logic

### Baking Soda (NaHCO₃)
**Mechanism:** Weak base, pH ceiling 8.3. FFAs react: RCOOH + NaHCO₃ → RCOONa (soap) + H₂O + CO₂

**Why not NaOH:** Lye (NaOH) reaches pH 12–14 and can over-saponify triglycerides themselves, destroying product. Baking soda's pH ceiling is below the threshold for triglyceride saponification — self-limiting. More forgiving, no precise stoichiometry required.

**The diagnostic:** CO₂ effervescence is proportional to FFA content. Vigorous sustained bubbling = high FFA (>2%). Mild brief = moderate. None = low FFA. This is a free, built-in quality indicator.

**Phospholipid removal (degumming):** Alkaline conditions hydrolyze phospholipids. Phospholipids are amphiphilic — they migrate to the aqueous phase after hydrolysis. This is the same degumming step performed in industrial oil refining.

### Vinegar (Acetic Acid at ~1%)
**Mechanism 1 — Metal chelation:** CH₃COO⁻ forms soluble complexes with Fe²⁺ and Cu²⁺. Iron and copper are the primary pro-oxidant metal catalysts driving lipid peroxidation (Fenton chemistry: Fe²⁺ + H₂O₂ → Fe³⁺ + OH• + OH⁻). Their removal from the fat phase reduces the ongoing oxidation rate. Metal reduction: ~54%.

**Mechanism 2 — Soap breaking:** Any residual sodium soap from Step 2 is neutralized. RCOONa + CH₃COOH → RCOOH + CH₃COONa. The free fatty acid returns to the fat phase (undesirable) but the sodium acetate goes to aqueous phase. This is why the ethanol wash at Step 6 is needed to catch residual FFAs.

**Mechanism 3 — Bentonite pre-activation:** Acid treatment of clay surfaces increases their adsorption capacity. Commercial bleaching clay is acid-activated with H₂SO₄. Residual acetic acid from Step 4 provides mild activation for the bentonite in Step 10.

### Ethanol (40% Vodka)
**Mechanism:** FFAs (logP ~4–6 as free acids, reduced due to carboxyl group polarity) dissolve preferentially in ethanol-water mixtures over triglycerides. At 40% ethanol, FFAs partition preferentially into the ethanol phase while triglycerides largely remain in the fat phase.

**Critical placement:** Must be before acetone fractionation (Step 9). If FFAs remain when acetone fractionation occurs, they partially co-crystallize with the stearin fraction. Saturated FFAs (stearic mp 70°C, palmitic mp 63°C) are near crystallization temperatures at 4–7°C. Their polarity (higher than triglycerides) makes them somewhat acetone-soluble but not fully excluded. Post-ethanol FFA level (~0.16%) is below the co-crystallization threshold.

## Solvent Recovery
Ethanol (bp 78.4°C) is recoverable by distillation from the aqueous discard phase. See [[Solvent Phase Chemistry]] for recovery apparatus. The 22°C boiling point gap between acetone (56°C) and ethanol (78.4°C) allows clean separation in the same recovery still by running sequentially.

## Material Compatibility for Aqueous Phase
- HDPE containers: excellent for all aqueous steps
- Stainless steel: excellent
- Glass: excellent
- Avoid: aluminum (reacts with alkaline solution in Step 2)
- → Full compatibility table: [[Quick Reference]]

## Connections
- [[11-Step Protocol]] — full sequence context
- [[Solvent Phase Chemistry]] — Phase B
- [[Quality Control]] — endpoints
- [[Lipid Oxidation Chemistry]] — why metals matter (Fenton)
