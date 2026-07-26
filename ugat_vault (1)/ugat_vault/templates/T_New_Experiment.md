# T — New Experiment Template

Use this template when proposing a new experiment to test the framework.

## Structure

```markdown
# Experiment [N]: [Title]

## The question
[What physics question does this experiment answer? What framework prediction does it test?]

## The framework basis
[How the experiment derives from the substrate picture. What mechanism is being tested.]

## The specific prediction
- **Signal**: [What is the expected signal? Magnitude, frequency, duration]
- **Background**: [What is the expected background?]
- **Discrimination**: [How is the signal distinguished from the background?]
- **Statistical significance**: [What sigma would confirm? What sigma would refute?]

## The apparatus
- **Major equipment**: [What is needed? Custom or commercial?]
- **Cost**: [Order of magnitude]
- **Time to build**: [Months]
- **Expertise required**: [Physics, chemistry, engineering, etc.]

## The procedure
1. [Step 1]
2. [Step 2]
3. [Step 3]
[etc.]

## The expected signal
- **Primary**: [Main signal]
- **Secondary**: [Confirmation signals]
- **Null result**: [What does a null result mean?]

## The cost
- [Itemized list]
- **Total**: [Bottom line]
- **Timeline**: [Design, build, run, analyze, write]

## Failure modes
- [What can go wrong]
- [How to mitigate]
- [Fallback approaches]

## The framework connection
[How this experiment fits with the existing Five Inventions. What part of the cathedral it belongs to.]

## Tier honesty
- **Decisiveness**: [How decisive is this test? Low / Medium / High / Very high]
- **Cost**: [Low / Medium / High / Very high]
- **Time**: [Short / Medium / Long]
- **Publishability**: [Low / Medium / High / Very high]
- **Risk of null result**: [What does a null result cost?]
```

## Example: Experiment 6 — Substrate Frame Drift Test

## The question
Does the matter/radiation frame distinction in the substrate drift over time? If the substrate is real, the frame distinction should be stable. If the frame distinction drifts, the substrate is dynamic.

## The framework basis
The CatWISE/radio dipole anomaly (~3× the kinematic prediction) is interpreted in the framework as a matter/radiation frame distinction. The distinction is currently ~370 km/s. The framework says this should be stable (or slowly changing due to the substrate's evolution).

## The specific prediction
- **Signal**: Time variation in the dipole amplitude over a 10-year period
- **Magnitude**: <1% per year (the substrate's evolution is slow)
- **Background**: Statistical fluctuations, systematic effects
- **Discrimination**: Compare CatWISE, radio, future surveys
- **Statistical significance**: 5σ confirmation requires multiple independent surveys

## The apparatus
- **Existing surveys**: CatWISE2020, NVSS, RACS, LoTSS
- **Future surveys**: Euclid (launched 2023), Roman (launch 2027), SKA (under construction)
- **Data analysis**: Standard large-scale structure analysis, cross-correlation with CMB
- **Time horizon**: 10-20 years

## The procedure
1. Re-analyze CatWISE2020 with improved masks
2. Combine with new radio surveys (LoTSS Deep, SKA)
3. Compare with future surveys (Euclid, Roman)
4. Track dipole amplitude over time
5. Test for drift >1% per year

## The expected signal
- **Primary**: Stable dipole amplitude
- **Secondary**: Stable dipole direction
- **Null result**: No drift, consistent with stable substrate

## The cost
- **Data**: Existing + future surveys (free or shared)
- **Analysis**: ~$500K in postdoc time over 10 years
- **Timeline**: 10-20 years

## Failure modes
- **Insufficient statistics**: Need deeper surveys, longer integration
- **Systematic effects**: Need careful foreground modeling
- **Selection effects**: Need volume-limited samples

## The framework connection
- T5.3 (CatWISE Dipole Anomaly) — the current evidence
- T6.6 (Next Experiments) — the 5-year program
- The cathedral's cosmological wing

## Tier honesty
- **Decisiveness**: Medium (drift would be decisive; stability is less informative)
- **Cost**: High (in time, not money)
- **Time**: Very long (10-20 years)
- **Publishability**: Medium (depending on result)
- **Risk of null result**: Low (the null result is also informative)

## New experiment checklist

Before proposing a new experiment, check:

- [ ] Does the experiment test a specific framework prediction?
- [ ] Is the predicted signal quantitatively specified?
- [ ] Is the experiment feasible with current or near-term technology?
- [ ] Is the cost reasonable (under $1M for a single experiment)?
- [ ] Is the timeline reasonable (under 5 years for a single experiment)?
- [ ] Does the experiment have a clear success criterion?
- [ ] Does the experiment have a clear null result interpretation?
- [ ] Is the experiment publishable in a top journal if successful?
- [ ] Is the experiment independent of the Five Inventions (or complementary)?
- [ ] Does the experiment fit the 5-year program or extend it?

If 8 of 10 are yes, propose the experiment. If fewer, revise or skip.

## The honest summary

The Five Inventions are the framework's most direct experimental tests. New experiments should be added with the same rigor: specific, quantitative, falsifiable, achievable. The cathedral needs the experiments. The cathedral needs you.
