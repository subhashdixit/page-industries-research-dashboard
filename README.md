# Page Industries Historical Research Lab

## 1. Project overview

Historical financial research dashboard with source-ratio audits and clearly separated hypothetical scenarios.

[Live demo](https://subhashdixit.github.io/page-industries-research-dashboard/) · [Source repository](https://github.com/subhashdixit/page-industries-research-dashboard)

![Page Industries Historical Research Lab application screen](docs/images/application.png)

## 2. Motivation and problem statement

### Objective

Inspect historical Page Industries figures and audit ratios against the source assignment.

### Problem statement

Historical observations, assignment projections and hypothetical scenarios can be mistaken for each other.

### Motivation

Keeping those cases distinct makes ratio discrepancies and assumptions easier to review.

## 3. Solution and scope

**Inputs** — Original research assignment and user scenario inputs. **Outputs** — Historical charts, ratio audit and hypothetical EPS/P-E output.

### GitHub Pages release pipeline

```mermaid
flowchart LR
 A[Feature branch and pull request] --> B[Format + lint + source checks + JS tests]
 B --> C[Review and merge to main]
 C --> D[Repeat checks on main]
 D --> E[Upload site folder as Pages artifact]
 E --> F[Deploy to GitHub Pages]
 F --> G[Check live filters and downloads]
```

The repository workflow `.github/workflows/pages.yml` tests PRs but only publishes from `main`. Set **Settings → Pages → Source → GitHub Actions**. In Actions, verify `Build and test` and `Deploy to GitHub Pages`. The deployment creates the public HTTPS website from the exact static artifact.

**CI** runs checks automatically when code changes. It catches data corruption, arithmetic regressions and syntax mistakes before release; it does not prove the historical source is correct. **CD** publishes the checked artifact. Least-privilege workflow permissions distinguish reading source, uploading an artifact and deploying Pages. Action dependencies are pinned to reviewed commit hashes.

GitHub is the source-code host; Pages is the static website host. A deployment changes the version visitors receive. There is no Docker requirement here: a browser already supplies the runtime. Adding a Python container would require a separate server host and adds no benefit to this app's calculation.

**Versioning and rollback:** each Git commit versions data and code together. Tag a known-good revision. Revert a bad change in a PR and let the same workflow publish the restored content. A repository rename changes the project Pages URL, so update README/homepage links afterwards. Pages and client caches may take a short time to refresh. Keep source and data notices in the deployed artifact.

The app is historical and has no live ingestion schedule. To update it, explicitly review new source coverage, change the data preparation/transcription, run the checks, and publish a new version. No paid service or secret is required for this public static deployment. Read [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) for current service limits.

## 4. Quick start and usage

### Start here

1. Read the historical sales, operating profit, EPS and source-price charts.
2. Choose a historical period and inspect the source table.
3. Enable **assignment projections** only if you want to see the report's old future assumptions. They are not relabelled as actual 2021–2023 outcomes.
4. Inspect the ratio audit to compare reported ratios with ratios recomputed from the displayed numerators and denominators.
5. Set hypothetical EPS growth, a horizon and a P/E multiple to learn how a scenario works. This is a sensitivity calculation from the historical 2020 base, not a current target price.
6. Export the table for your own review and follow the original PDF source links.

## 5. High-level architecture

```mermaid
flowchart LR
    A["User input"] --> B["Interface"] --> C["Browser engine"] --> D["Result"]
```

## 6. End-to-end request workflow

```mermaid
sequenceDiagram
    actor User
    participant UI as Project interface
    participant Engine as Browser engine
    User->>UI: Provide Original research assignment and user scenario inputs
    UI->>Engine: Process validated input
    Engine->>Engine: Load historical figures, recompute ratios and apply scenario arithmetic
    Engine-->>UI: Historical charts, ratio audit and hypothetical EPS/P-E output
    UI-->>User: Present result or input feedback
```

## 7. Data sources, inputs, and outputs

| Input | Processing | Output |
| --- | --- | --- |
| Original research assignment and user scenario inputs | Load historical figures, recompute ratios and apply scenario arithmetic | Historical charts, ratio audit and hypothetical EPS/P-E output |

### Source and boundaries

Selected figures were manually transcribed and visually checked against **pages 12–13 of Part-2/Part-2.pdf**. Its SHA-256 is recorded in `site/data.json` and checked by `scripts/check_data.py`. The original document remains unchanged.

| Period | Status in this app | Interpretation |
|---|---|---|
| 2015–2020 | Historical values reported in the assignment | Not independently reconciled to audited filings. |
| 2021–2023 | Assignment projections | Historical forecasts made in that report, not actual outcomes. |
| New scenario | Hypothetical user assumptions | Arithmetic illustration, not a fitted predictive model. |

The source table does not clearly establish the sales/profit unit scale, so the app does not invent a crore/million label. Ratios divide matching source units. EPS and price are handled in their matching source per-share units. Price observation dates/adjustments are not established; the table cannot support a total-return backtest.

```mermaid
flowchart LR
 A[Original report PDF] --> B[Visually verified transcription]
 B --> C[Separate historical and projected rows]
 C --> D[Source hash and statement checks]
 D --> E[Recompute ratios]
 E --> F[Historical dashboard and audit]
 C --> G[2020 EPS base]
 G --> H[User growth and P/E assumptions]
 H --> I[Explicit hypothetical scenario]
```

## 8. Data flow and ETL pipeline

```mermaid
flowchart LR
    A["Original research assignment and user scenario inputs"] --> B["Load historical figures, recompute ratios and apply scenario arithmetic"] --> C["Historical charts, ratio audit and hypothetical EPS/P-E output"]
```

## 9. Low-level design and interfaces

Implementation entry points are [`site/index.html`](<site/index.html>), [`site/app.js`](<site/app.js>), [`site/lib.js`](<site/lib.js>), [`site/charts.js`](<site/charts.js>).

## 10. Concepts and algorithms

### Financial concepts and calculations

**Operating profit** is sales minus operating expenses in the source table. **Operating margin** asks how much operating profit is left for each unit of sales: `100 × operating profit / sales`. It helps compare operating efficiency, but accounting choices, business mix and one-off items can affect comparisons.

**EPS**, or earnings per share, expresses earnings against the source's share count. Increasing EPS may reflect improved earnings or changes in shares; it is not automatically improved cash generation. **P/E** is price divided by EPS. A higher multiple can reflect growth expectations or overvaluation; a lower multiple can reflect risk or a bargain. Neither determines value by itself.

**CAGR** over `n` year intervals is `(ending / beginning)^(1/n) - 1`. There are five intervals between 2015 and 2020, not six. CAGR smooths the path and hides volatile intermediate years.

For a hypothetical EPS of 100, 10% annual EPS growth for two years produces `100 × 1.10² = 121`. At an assumed P/E of 20, the scenario price is `121 × 20 = 2,420`. This is a multiplication of assumptions, not proof that a market will pay that multiple. The app uses the source 2020 EPS as its actual scenario base.

```mermaid
flowchart LR
 A[Base EPS] --> C[EPS × 1+growth to the horizon]
 B[Growth and years] --> C
 C --> E[Illustrative price]
 D[Assumed P/E] --> E
 E --> F[Change assumptions; compare sensitivity]
```

### Why the ratio audit is part of the app

Some projected ratios in the assignment do not agree with its underlying figures. For example, 2021 projected operating profit `606.68` divided by sales `3351.89` implies about **18.10%**, while the source prints **20.60%**. Price `19304.46` divided by EPS `348.74` implies approximately **55.35**, while the source prints **62.99**.

The app preserves the source entries and shows the recalculation side by side. It does not silently “correct” the PDF or treat an assignment inconsistency as a claim about the company's audited accounts. Rounding tolerance is applied to the operating-statement identity, and missing denominators produce unavailable ratios rather than fabricated zeros.

## 11. Technology choices and dependencies

- **HTML, CSS, and JavaScript**. Serve a static browser interface with inspectable rendering and validation.

## 12. Training, inference, and evaluation

Review behavior using the checked-in fixtures and assertions. This application has no project-trained model benchmark.

Validation code is available in [`tests/finance.test.js`](<tests/finance.test.js>).

## 13. Limitations and data handling

Historical observations, assignment projections, and hypothetical scenarios have different evidential status.

## 14. Installation and local setup

### Run and understand the code

This is a **static application**: HTML provides structure, CSS provides presentation, JavaScript computes the visible analysis and SVG draws charts. It needs no Flask process, model server, API key or database. GitHub Pages can serve these files; it cannot run a Python backend.

Use Python 3.10+ for data checks and a local HTTP server, and Node.js 22+ for the JavaScript tests. Do not open `index.html` using `file://`, because browsers restrict local module/data loading.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install black==25.1.0 pylint==3.3.8
python -m black --check scripts
python -m pylint scripts
node --test tests/*.test.js
python scripts/check_data.py
python -m http.server 8000 --directory site
```

Open `http://127.0.0.1:8000`. `site/` is the complete deployed website. Data preparation/verification code is in `scripts/`, tests in `tests/`, and the original report/notebook remains outside the deployed artifact. Text is inserted through safe DOM APIs; charts and controls are keyboard-accessible HTML/SVG with responsive layouts. Browser filtering is not server-side data storage.

### Exact local dependency versions

The maintained HTML/JavaScript app needs no third-party Python packages. Python helpers use the standard library. Use the existing browser/Node instructions below; no Python dependency installation is required.

## 15. Repository structure

### Structure, tests and updates

```text
Part-1/ and Part-2/          original reports, preserved
site/data.json              verified selected figures and provenance
site/lib.js                 ratios, CAGR, scenario and audit functions
site/app.js                 controls and safe DOM rendering
site/charts.js              SVG visualization helpers
scripts/check_data.py       PDF identity and accounting checks
tests/                      calculation and invalid-input tests
.github/workflows/pages.yml checked static publishing
```

Tests cover CAGR intervals, missing denominators, bounded scenario inputs, source-ratio discrepancies and historical/projected separation. They verify the software's interpretation, not the authenticity of the report's historical financial figures. To replace this assignment source with verified filings, cite each filing, establish units and observation dates, update the source metadata, then independently reconcile the table before publishing.

Clone with `git clone https://github.com/subhashdixit/page-industries-research-dashboard.git`, then `cd page-industries-research-dashboard` before using the commands below.

## 16. Deployment and operations

Run the exercise locally. The repository does not document a maintained deployment.

## 17. License, credits, and support

The repository does not contain a root LICENSE file. Check upstream and data-source terms before reuse. Report reproducible issues through [GitHub Issues](https://github.com/subhashdixit/page-industries-research-dashboard/issues).
