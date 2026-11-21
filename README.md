# Kolkata Hematology Institute

The website for kolkatahematologyinstitute.com: blood diseases explained for patients, in Bengali and English.

Every chapter has its own page, in each language, so Google can find it:

- Bengali: `kolkatahematologyinstitute.com/thalassemia/`
- English: `kolkatahematologyinstitute.com/en/thalassemia/`

## How to write or correct a chapter

Each chapter has two plain text files in the `chapters` folder, one per language:

| Chapter | Bengali file | English file |
| --- | --- | --- |
| Anaemia | `anaemia.bn.txt` | `anaemia.en.txt` |
| Thalassemia | `thalassemia.bn.txt` | `thalassemia.en.txt` |
| Low platelets and ITP | `low-platelets.bn.txt` | `low-platelets.en.txt` |
| CML | `cml.bn.txt` | `cml.en.txt` |
| Multiple myeloma | `myeloma.bn.txt` | `myeloma.en.txt` |
| The bone marrow test | `marrow.bn.txt` | `marrow.en.txt` |

1. Open the file on GitHub and tap the pencil icon.
2. Type the text:
   - Leave an empty line between paragraphs.
   - Start a line with `# ` for a heading, or `## ` for a smaller heading.
   - Start a line with `- ` for a bullet point.
3. Tap "Commit changes". The chapter page rebuilds by itself and the live site updates in a few minutes.

A chapter or part whose files are both empty is not shown anywhere on the site: no card, no page, no link. It appears by itself as soon as it has words.

## The short answer at the top, and the sources at the end

Two things every chapter now has (Dr. Roy, 2026-11-21, from the SEO audit), so Google and AI tools can quote the page and see where its facts come from:

- **In short.** At the very top of the file, lines that start with `> ` hold a two-sentence plain answer. It shows in a small green box above the story, headed "In short" / "সংক্ষেপে". The story still starts the chapter with its big headline line.
- **Sources.** The last section, headed `# Sources` (Bengali `# তথ্যসূত্র`), lists 3 to 6 sources, one per line, as `- Title | https://link`. They show as links at the end of the page. This is the only place in a chapter where links appear.

```
> A child on regular transfusions needs the iron medicine every day, even when feeling well. If it is hard to take, tell the hematologist instead of stopping it.

The medicine strips were hidden behind her school certificates, still full.
...

# Sources

- NHS: Thalassaemia | https://www.nhs.uk/conditions/thalassaemia/
```

## How a chapter gets its look

You only type plain text. The site dresses it by itself:

| What you type | What the reader sees |
| --- | --- |
| The lines before the first `# ` heading | The opening story, in the story typeface. If the first line is short, it becomes the big headline line |
| `card_bn` and `card_en` in `chapters/list.json` | The line on the chapter's card on the home page, in the reader's own words ("Breathless on the stairs? Tired all day?"). Edit it there to change the card |
| A heading that says `Go to a hospital ...` (Bengali: `... হাসপাতালে যান`) | The red warning box |
| A heading with `questions` and `doctor` in it (Bengali: `প্রশ্ন` or `জিজ্ঞেস`) | The green checklist to take to the doctor |
| The heading `Common questions` (Bengali: `অনেকে যা জানতে চান`), with each question on a `## ` line | Questions that open when tapped |
| The heading `The main points` (Bengali: `মূল কথাগুলো`) | A pale yellow box |

A chapter with no words yet is not shown on the home page.

## Moving pictures in a chapter

A line on its own such as `[figure: inheritance]` puts a moving illustration, with its caption, at that point in the chapter. It appears in the language of the page. The drawings are in `tools/figures.mjs`:

| Name | Shows | Used in |
| --- | --- | --- |
| `oxygen` | Red cells carrying oxygen from the lungs to the body, many in a normal person, few in anaemia | Anaemia |
| `copies` | Two copies of the instructions: both fine, one faulty (carrier, healthy), both faulty (thalassemia major) | Thalassemia |
| `inheritance` | Two carrier parents and their four possible children, with the 1 in 4, 2 in 4, 1 in 4 chances | How it runs in families |
| `hbe-beta` | HbE trait from one parent and beta thalassemia trait from the other, and the child with both | How it runs in families |
| `transfusion-timing` | Hemoglobin over time: with transfusions on time it stays in the band the doctor wants; when they keep getting late it falls into the zone where the marrow overworks | Blood transfusion |
| `quiet-iron` | Iron in the heart over the years, no numbers: kept low with the daily medicine and yearly check-ups (a small rise caught at a check-up), climbing while the child still feels fine when doses are skipped | Why regular care matters |
| `iron-jar` | Two jars: blood bags drip iron into both; the daily medicine (a tap) lets it out of one so its level stays low, while with the tap closed the other keeps rising | The iron medicine |
| `growing-up` | A child walks a road past school, play, work and marriage, each lighting up in turn, while a red line of regular care keeps pace underneath | Thalassemia: everyday life |
| `platelet-plug` | A cut in a vessel wall: with enough platelets they gather and seal it; with too few, two arrive and the gap stays open longer | Low platelets and ITP |

| `heart-pace` | Touch: a slider lowers the hemoglobin; red cells thin out and the heart beats faster, with one line of plain words at each step | Anaemia: heart and nerves |
| `signs-check` | Touch: the reader taps the signs they have noticed, gets sent to a blood count and the doctor, and can send the list on WhatsApp. A danger sign shows the hospital line. Nothing is saved | Anaemia: heart and nerves |
| `habit-or-sign` | Touch: four cards ("eats mud", "flares up at small things") that turn over to show what low iron can do | Anaemia: children |
| `iron-gap` | Touch: a chart with no numbers, iron stored at birth falling while a growing child's need stays high, with buttons for "mostly milk" and "milk and family food" | Anaemia: children |
| `baby-chance` | Touch: each tap of "Next baby" is one pregnancy of two carrier parents; one copy comes from each parent by chance, and a tally of the children so far builds up. A second button shows only the mother as a carrier, where no child gets thalassemia major | How it runs in families |
| `three-reasons` | Touch: the same low hemoglobin report, and the three people from the chapter. Tapping one shows why theirs is low, what the doctor does, and what an iron tonic alone would do | Anaemia |
| `trait-or-major` | Touch: eight lines from the chapter, one at a time ("Needs no treatment for it", "Takes a medicine every day to remove iron"); the reader taps Carrier or Thalassemia major, sees why, and gets a score at the end | Thalassemia |
| `keep-the-date` | Touch: the reader makes the father's choices from the story (exams, then a wedding: keep the transfusion date or push it back); the factory inside the bone works harder and the blood level falls with each delay, and keeping a date lets it rest again | Blood transfusion |
| `checkup-day` | Touch: the five stops of a check-up day (heart scan, liver, height and growth, hormone tests, iron level); tapping one shows what it looks for and why it matters when the child feels fine | Why regular care matters |
| `what-gets-in-the-way` | Touch: five reasons a dose gets missed (forgetting, taste or stomach, friends seeing, a small child refusing, feels fine); tapping one shows what helps and what to ask the doctor | The iron medicine |
| `myth-or-fact` | Touch: four flip cards of things families are told (no cricket, no fish, it spreads, no children), each turned over to show what is true | Thalassemia: everyday life |
| `platelet-signs` | Touch: tick the skin and bleeding signs noticed, plus what the doctor will ask; red-flag signs show "go to a hospital today"; the list can be sent to the doctor | Low platelets and ITP |

The ones marked "Touch" respond to the reader's finger. Each one plays a short demonstration once when the reader reaches it, and stays still on phones set to reduce motion.

To move a picture, move its line. To remove it, delete the line.

## Your own videos in a chapter

A line on its own such as `[video: thalassemia-carrier]` puts one of your videos at that point in a chapter. It starts by itself, without sound, when the reader scrolls to it, and pauses when they scroll away. A speaker button turns the sound on; tapping the video pauses it. There is no download menu. Nothing loads until the reader reaches the video, and it does not start by itself on phones set to save data or to reduce motion.

| Name | Video | Used in |
| --- | --- | --- |
| `thalassemia-carrier` | "Are you a thalassemia carrier?" 30 seconds, Bengali and English on screen | How it runs in families, after the opening story |

To add a new video, send it in the chat. It is shrunk for phones (the 4.5 MB original became under 1 MB), stored in `assets/video/`, and listed in `tools/figures.mjs`.

## Chapters and their parts

The home page shows only the main chapters. A big subject such as Thalassemia is one chapter with several parts:

- The chapter's own page (`/thalassemia/`) is "the basics". Near the top it lists every part that has been written.
- Each part has its own page under the chapter (`/thalassemia/inheritance/`), a link back to the chapter, the same list, and a "Next" card at the end.
- A part is a line in `chapters/list.json` with `"parent": "thalassemia"`. Its text files are named as before (`chapters/thalassemia-inheritance.en.txt`). The order of the lines in the list is the order of the parts.

## Adding a new chapter

1. Add a line to `chapters/list.json` with the chapter's `id` (short, lowercase, no spaces), its Bengali and English names, a short description in each language (`desc_bn`, `desc_en`, about 150 characters, shown in Google results), and the card line in each language (`card_bn`, `card_en`).
2. Add `chapters/<id>.bn.txt` and `chapters/<id>.en.txt`.

## Other files

- `index.html`: the design of the whole site (colours, typefaces, the moving red cells). The chapter cards on it are filled in automatically, so do not edit between the `grid:start` and `grid:end` lines or the `soon:start` and `soon:end` lines.
- `tools/build.mjs`: makes the chapter pages, `sitemap.xml` and `robots.txt` from the text files. It runs by itself on GitHub (`.github/workflows/build.yml`).
- The `anaemia/`, `en/` and other chapter folders are made by the build. Do not edit them; edit the `.txt` files.
- `CNAME`: tells GitHub Pages the site's domain. Do not delete it.
