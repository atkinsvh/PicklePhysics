# T — New Letter Template

Use this template when writing a new letter in the uncle's voice.

## Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Letter Title]</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Special+Elite&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --ink: #1a1209;
      --paper: #f5f0e8;
      --paper-dark: #ede6d3;
      --red: #8b1a1a;
      --fade: #7a6e5f;
      --rule: #c4b89a;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: #2c2416;
      background-image: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);
      min-height: 100vh;
      padding: 3rem 1rem;
      font-family: 'Libre Baskerville', Georgia, serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .envelope-label { font-family:'Special Elite',monospace; color:#a89060; font-size:0.75rem; letter-spacing:0.25em; text-transform:uppercase; margin-bottom:1.5rem; text-align:center; }
    .page { background-color:var(--paper); background-image:repeating-linear-gradient(transparent,transparent 31px,var(--rule) 31px,var(--rule) 32px); max-width:720px; width:100%; padding:5rem 5rem 6rem; position:relative; box-shadow:0 4px 6px rgba(0,0,0,0.4),0 20px 60px rgba(0,0,0,0.5),inset 0 0 80px rgba(180,160,100,0.15); }
    .page::before { content:''; position:absolute; left:80px; top:0; bottom:0; width:1px; background:rgba(180,100,100,0.3); }
    .masthead { text-align:center; margin-bottom:3rem; padding-bottom:1.5rem; border-bottom:2px solid var(--ink); position:relative; }
    .series-title { font-family:'Special Elite',monospace; font-size:0.7rem; letter-spacing:0.3em; color:var(--fade); text-transform:uppercase; margin-bottom:0.75rem; }
    .main-title { font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:900; line-height:1.1; color:var(--ink); margin-bottom:0.5rem; }
    .main-title em { font-style:italic; color:var(--red); }
    .subtitle { font-family:'Playfair Display',serif; font-style:italic; font-size:1.05rem; color:var(--fade); margin-top:0.5rem; }
    .letter-meta { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2.5rem; font-family:'Special Elite',monospace; font-size:0.75rem; color:var(--fade); }
    .salutation { font-family:'Playfair Display',serif; font-style:italic; font-size:1.3rem; color:var(--ink); margin-bottom:2rem; }
    p { font-size:1rem; line-height:2rem; color:var(--ink); margin-bottom:2rem; text-align:justify; text-indent:2.5rem; }
    p:first-of-type { text-indent:0; }
    .drop-cap::first-letter { font-family:'Playfair Display',serif; font-size:4.5rem; font-weight:900; float:left; line-height:0.75; margin-right:0.1em; margin-top:0.1em; color:var(--red); }
    .emphasis { font-style:italic; font-weight:700; }
    .shout { font-family:'Playfair Display',serif; font-weight:900; font-size:1.05rem; letter-spacing:0.05em; }
    .aside { margin:2.5rem 0; padding:1.25rem 1.5rem; border-left:3px solid var(--red); background:var(--paper-dark); font-family:'Special Elite',monospace; font-size:0.85rem; line-height:1.7; color:var(--ink); }
    .aside p { font-family:'Special Elite',monospace; font-size:0.85rem; text-indent:0; margin-bottom:0; }
    .section-break { text-align:center; color:var(--fade); font-size:1.2rem; margin:2.5rem 0; letter-spacing:0.5em; }
    .closing { margin-top:3rem; text-indent:0 !important; }
    .signature-block { margin-top:1.5rem; font-family:'Playfair Display',serif; font-style:italic; }
    .signature { font-size:2rem; color:var(--ink); display:block; margin-bottom:0.25rem; }
    .signature-name { font-family:'Special Elite',monospace; font-size:0.75rem; letter-spacing:0.15em; color:var(--fade); text-transform:uppercase; font-style:normal; }
    .postscript { margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid var(--rule); font-family:'Special Elite',monospace; font-size:0.82rem; line-height:1.75; color:var(--fade); }
    .postscript strong { color:var(--red); font-style:normal; }
    .letter-number { position:absolute; top:2rem; right:3rem; font-family:'Special Elite',monospace; font-size:0.7rem; color:var(--rule); letter-spacing:0.15em; }
    .watermark { position:absolute; bottom:3rem; right:3rem; font-family:'Playfair Display',serif; font-size:5rem; font-weight:900; color:rgba(180,160,100,0.08); font-style:italic; pointer-events:none; line-height:1; }
    @media (max-width:600px) { .page { padding:3rem 2rem 4rem; } .main-title { font-size:2rem; } .page::before { left:40px; } }
  </style>
</head>
<body>
  <div class="envelope-label">[Series] · [Date hint]</div>
  <div class="page">
    <div class="letter-date">[Month Day, Year]</div>
    <span class="letter-number">No. [Roman numeral]</span>
    <div class="watermark">[Symbol]</div>
    <div class="masthead">
      <div class="series-title">Letters from a man who has had enough</div>
      <h1 class="main-title">[Title] <em>[Emphasis]</em></h1>
      <div class="subtitle">[Subtitle]</div>
    </div>
    <div class="letter-meta">
      <span>To: Astrid</span>
      <span>From: [Author subtitle]</span>
    </div>

    <p class="salutation">My dear Astrid,</p>

    <p class="drop-cap">[Opening paragraph with drop cap. Physics or personal anchor.]</p>

    [Body paragraphs]

    <p class="closing">[Closing]</p>
    <div class="signature-block">
      <span class="signature">U.</span>
      <span class="signature-name">[Personal subtitle, location, mood]</span>
    </div>

    <div class="postscript"><strong>P.S.</strong> [Substantive restatement]</div>
    <div class="postscript"><strong>P.P.S.</strong> [Personal/affective — Bertrand, Margaret, fern, Phoenix]</div>
    <div class="postscript"><strong>P.P.P.S.</strong> [Aside, often about the parking lot or weather]</div>
    <div class="postscript"><strong>P.P.P.P.S.</strong> [Grand statement, ending with "Beyblades."]</div>
  </div>
</body>
</html>
```

## Writing checklist

Before submitting a new letter, check:

- [ ] Drop cap on first paragraph
- [ ] Title in Playfair Display with italic emphasis
- [ ] Asides in Special Elite with red left border
- [ ] Section breaks (— ✦ —) where appropriate
- [ ] At least 3 postscripts
- [ ] Last postscript ends with "Beyblades."
- [ ] At least one of: Bertrand, the fern, the parking lot, Phoenix heat, Gerald, Margaret
- [ ] Body in Libre Baskerville with 2rem line-height
- [ ] Date in Special Elite, all caps
- [ ] Letter number in Roman numerals
- [ ] Salutation: "My dear Astrid,"
- [ ] Closing: "With love, ..." or "Your uncle, ..."
- [ ] Signature: "U." in large Playfair
- [ ] Physics point made clearly
- [ ] Personal truth landed

## Voice test

Read the letter out loud. Does it sound like the uncle? Does the voice carry the same weight as the original 43 letters? If not, rewrite. The voice is the work.

## Topics to consider

When writing a new letter, consider:
- A new physics point (a refinement, a correction, a new prediction)
- A new personal anchor (a memory, a season, a moment)
- A new framework connection (to existing letters, to the catalog, to the experiments)
- A new piece of honesty (a doubt, a failure, a hope)

The letters are the cathedral. The cathedral is being built. Each letter is a stone. Each stone matters.
