---
tags: [biochemistry, epigenetics, SAM, methylation, substrate]
aliases: [SAM cycle, methionine cycle, methylation]
---

# One Carbon Metabolism

> *The biochemical system providing the universal methyl donor for all epigenetic methylation reactions. Substrate starvation of this cycle is the primary epigenetic failure mode in this clinical context.*

## The Cycle

```
Dietary folate → 5,10-methyleneTHF  [MTHFR, requires B2, zinc]
                       ↓
                 5-MTHF (methylfolate)
                       ↓ + homocysteine
                 Methionine             [methionine synthase, requires B12]
                       ↓ + ATP
                   SAM                 [MAT enzyme, requires Mg²⁺]
                       ↓ (methyl group donated to DNA, histones, RNA, lipids)
                   SAH
                       ↓
                 Homocysteine          [must clear efficiently]
                    ↙    ↘
         Remethylation   Transsulfuration
        (back to Met)    Cystathionine [B6]
                              ↓        [B6]
                           Cysteine
                              ↓
                         Glutathione
```

## SAM — The Universal Methyl Donor

Every methylation reaction in the body uses SAM:
- **DNA methyltransferases (DNMT1, DNMT3A, DNMT3B):** CpG methylation
- **Histone methyltransferases (EZH2, G9a, SUV39H1):** histone methylation marks
- **RNA methyltransferases:** mRNA cap methylation
- **Phosphatidylcholine synthesis:** membrane composition
- **Neurotransmitter methylation:** epinephrine, melatonin synthesis
- **Creatine synthesis:** muscle energy

If SAM is depleted, all of these fail simultaneously. The clinical presentation of SAM deficiency is therefore heterogeneous — affects every system that uses methylation.

## Rate-Limiting Nutrients

| Nutrient | Role | Common status in this context |
|---|---|---|
| 5-MTHF (methylfolate) | One-carbon unit donor to homocysteine | Depleted by gut dysbiosis (microbial B9 production reduced); MTHFR polymorphisms (40–60% of relevant population reduce MTHFR efficiency 30–70%) |
| Methylcobalamin (B12) | Methionine synthase cofactor | Depleted by gut dysbiosis; metformin; PPIs |
| Riboflavin (B2) | MTHFR enzyme function | Commonly low; MTHFR polymorphisms worsen |
| Zinc | MTHFR cofactor, methionine synthase | Depleted by chronic inflammation |
| Magnesium | ATP-Mg²⁺ for MAT enzymes | Broadly deficient in modern diets |
| Methionine | Substrate | From protein — meat, eggs, fish |
| Betaine/TMG | Alternative methyl donor via BHMT | From beets, spinach, wheat germ |
| Choline | Betaine precursor | From egg yolk, liver |

## MTHFR Polymorphisms

MTHFR C677T and A1298C are common variants that reduce enzyme efficiency:
- Homozygous C677T: ~70% reduction in MTHFR activity
- Compound heterozygous: ~50–60% reduction
- Prevalence: ~40–60% of people have at least one copy of C677T

The clinical implication: these individuals cannot efficiently convert dietary folate to 5-MTHF, making supplemental methylfolate (5-MTHF) rather than folic acid essential for maintaining the SAM cycle.

Elevated homocysteine is the diagnostic indicator that the cycle is impaired. Target homocysteine: <7 μmol/L for optimal methylation function.

## The Alternative Pathway — BHMT

Betaine:homocysteine methyltransferase (BHMT) operates in the liver independently of MTHFR:
```
Betaine + Homocysteine → Methionine + Dimethylglycine
```

This alternative pathway:
- Bypasses the MTHFR step entirely
- Is specific to liver (not active in other tissues)
- Requires betaine (from beets, spinach, wheat germ, or TMG supplement)
- Provides a meaningful bypass for MTHFR-impaired individuals

## The Transsulfuration Output — Glutathione

The transsulfuration pathway converts homocysteine → cystathionine → cysteine → glutathione. This means:
1. The methylation cycle and the antioxidant defense system share a common substrate (homocysteine)
2. High methylation demand can compete with glutathione synthesis for homocysteine
3. High oxidative stress depletes glutathione → homocysteine accumulates → homocysteine-mediated vascular and epigenetic damage
4. NAC supplementation provides cysteine downstream of the homocysteine branch point — it feeds glutathione synthesis without competing with the methylation cycle for homocysteine

This is the mechanistic reason why NAC + betaine/TMG together address both the antioxidant and epigenetic substrate deficits more effectively than either alone.

## Connections
- [[Epigenetic Transmission]] — what this cycle enables
- [[Phase 0 - Source Control and Redox]] — glutathione connection
- [[Phase 3 - Epigenetic Reprogramming]] — where these substrates are used
- [[NAD Pool]] — parallel epigenetic substrate system
- [[TET Enzymes]] — what active demethylation requires
- [[Quorum Sensing]] — bacterial SAM cycle produces AI-2
