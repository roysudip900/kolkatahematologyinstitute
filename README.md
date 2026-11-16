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

An empty file shows the "script goes here" placeholder, and that page is hidden from Google until it has words in it.

## How a chapter gets its look

You only type plain text. The site dresses it by itself:

| What you type | What the reader sees |
| --- | --- |
| The lines before the first `# ` heading | The opening story, in the story typeface. If the first line is short, it becomes the big headline line, and it is also the teaser on the chapter's card on the home page |
| A heading that says `Go to a hospital ...` (Bengali: `... হাসপাতালে যান`) | The red warning box |
| A heading with `questions` and `doctor` in it (Bengali: `প্রশ্ন` or `জিজ্ঞেস`) | The green checklist to take to the doctor |
| The heading `Common questions` (Bengali: `অনেকে যা জানতে চান`), with each question on a `## ` line | Questions that open when tapped |
| The heading `The main points` (Bengali: `মূল কথাগুলো`) | A pale yellow box |

A chapter with no words yet is listed on the home page under "Coming soon" and is not a link.

## Adding a new chapter

1. Add a line to `chapters/list.json` with the chapter's `id` (short, lowercase, no spaces), its Bengali and English names, and a short description in each language (`desc_bn`, `desc_en`, about 150 characters, shown in Google results).
2. Add `chapters/<id>.bn.txt` and `chapters/<id>.en.txt`.

## Other files

- `index.html`: the design of the whole site (colours, typefaces, the moving red cells). The chapter cards and the "Coming soon" list on it are filled in automatically, so do not edit between the `grid:start` and `grid:end` lines or the `soon:start` and `soon:end` lines.
- `tools/build.mjs`: makes the chapter pages, `sitemap.xml` and `robots.txt` from the text files. It runs by itself on GitHub (`.github/workflows/build.yml`).
- The `anaemia/`, `en/` and other chapter folders are made by the build. Do not edit them; edit the `.txt` files.
- `CNAME`: tells GitHub Pages the site's domain. Do not delete it.
