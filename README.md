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
| ITP | `itp.bn.txt` | `itp.en.txt` |
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

To move a picture, move its line. To remove it, delete the line.

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
