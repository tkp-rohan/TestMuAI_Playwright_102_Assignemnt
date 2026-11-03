# Playwright 102 Assignment — TestMu AI

This repository implements all three scenarios from the supplied assignment and prepares the suite for parallel execution on HyperExecute.

## Included scenarios

1. **Simple Form Demo** — navigates to the demo, checks the URL, enters a configurable message, clicks **Get Checked Value**, and verifies the displayed message.
2. **Drag & Drop Sliders** — finds the range input initially set to `15`, drags it to `95`, and verifies its value.
3. **Input Form Submit** — submits an empty form and verifies native required-field validation, fills all fields, selects **United States** by visible option text, submits, and checks the success message.

## Project structure

```text
playwright-102-assignment/
├── .github/workflows/hyperexecute.yml
├── fixtures/test-fixture.js
├── tests/
│   ├── simple-form-demo.spec.js
│   ├── drag-drop-slider.spec.js
│   └── input-form-submit.spec.js
├── artifacts/logs/
├── hyperexecute.yaml
├── playwright.config.js
├── package.json
├── package-lock.json
└── README.md
```

## Requirements

- Node.js 20+
- npm
- TestMu AI account and HyperExecute access
- HyperExecute CLI (for manual cloud runs)

## Environment variables

The suite supports the following variables:

- `LT_USERNAME` — TestMu AI username
- `LT_ACCESS_KEY` — TestMu AI access key
- `TEST_MESSAGE` — optional message used by Scenario 1
- `FORM_EMAIL` — optional email used by Scenario 3
- `FORM_PASSWORD` — non-sensitive test password used by Scenario 3

For a local cloud run, copy the safe template and replace only the placeholder credentials:

```bash
cp .env.example .env
```

Never commit `.env`, `.env.*`, authentication state, or credential files. `.env.example` is the only environment-template file that should be committed.

## Run locally

```bash
npm install
npx playwright install chromium
npm test
```

The fixture runs locally when `LT_USERNAME` and `LT_ACCESS_KEY` are absent. Local run reports are written to `playwright-report/` and `test-results/`.

## Run on TestMu AI / HyperExecute

### 1. Configure HyperExecute secrets

In the TestMu AI HyperExecute dashboard, open **Secrets** and create:

- `LT_USERNAME` — your TestMu AI username
- `LT_ACCESS_KEY` — your TestMu AI access key

Do not commit credentials or put them directly in YAML or JavaScript. `hyperexecute.yaml` injects them through the HyperExecute secret references.

### 2. Configure the environment variables

The YAML injects `TEST_MESSAGE`, `FORM_EMAIL`, and `HE_BUILD_NAME`. You can change these in the `env` section. The tests read values through `process.env`.

The matrix values are exposed as `HE_ENV_os` and `HE_ENV_browser` because `matrixEnvPrefix: true` is enabled. The fixture maps `win` to `Windows 10` and `linux` to `Linux` for TestMu AI browser capabilities.

### 3. Download the HyperExecute CLI

Download the CLI for your local operating system from the official page:
https://www.testmuai.com/support/docs/hyperexecute-cli/

Then set credentials in your terminal (use your real values; do not commit them):

**PowerShell**
```powershell
$env:LT_USERNAME="YOUR_USERNAME"
$env:LT_ACCESS_KEY="YOUR_ACCESS_KEY"
```

**macOS/Linux**
```bash
export LT_USERNAME="YOUR_USERNAME"
export LT_ACCESS_KEY="YOUR_ACCESS_KEY"
```

### 4. Trigger the job

```bash
./hyperexecute --config hyperexecute.yaml --download-artifacts --verbose
```

On Windows, use `.\hyperexecute.exe --config hyperexecute.yaml --download-artifacts --verbose`.

The matrix creates two OS tasks (Windows 10 and Linux), each using the latest Chrome browser. `concurrency: 2` and `combineTasksInMatrixMode: true` allow the two matrix tasks to run at the same time, subject to your HyperExecute plan's available concurrency.

### 5. Review artifacts

The YAML enables `mergeArtifacts: true` and uploads:
- Playwright HTML report
- Playwright JSON report and test output
- Per-test console logs
- Per-test failed-network-request logs

TestMu AI session capabilities also enable `network`, `video`, `console`, `visual`, and `commandLog` capture. Review the session recordings and logs in the TestMu AI dashboard. Use the dashboard's artifact download option to download the merged artifact ZIP.

## GitHub Actions (optional)

1. Push this project to a GitHub repository.
2. In **Settings → Secrets and variables → Actions**, add repository secrets named `LT_USERNAME` and `LT_ACCESS_KEY`.
3. Run the workflow from **Actions → Playwright 102 - HyperExecute → Run workflow**, or push to `main`.

The workflow downloads the Linux HyperExecute CLI and triggers the YAML job.

## Notes / verification before submission

- The assignment requires the GitHub repository to be **private** and shared with `admin@testmuaicertifications.com`.
- Submit both the GitHub repository URL and the TestMu AI Test Session IDs on the exam portal.
- The assignment asks for network logs, video recording, screenshots, and console logs to be enabled. These are enabled in the TestMu AI browser capabilities; Playwright also saves failure screenshots and trace files.
- The first-time TestMu AI account includes 100 minutes according to the assignment. Contact `admin@testmuaicertifications.com` or `support@testmuai.com` if trial minutes expire.
- The cloud run and dashboard session IDs cannot be generated from this prepared source bundle. You must add your own TestMu AI credentials, run the job, and copy the resulting session IDs from your dashboard.
- If the target website changes its selectors or native browser validation wording, inspect the failing step and update the corresponding locator/assertion. The required-field assertion accepts the common Chrome variants “Please fill in this field.” and “Please fill out this field.”

## Individual test execution

```bash
npm run test:scenario1
npm run test:scenario2
npm run test:scenario3
npm run test:headed
```

Scenario 2 uses a real mouse drag based on the slider's native min/max geometry, so it verifies the assignment with actual pointer interaction rather than keyboard shortcuts.

## Reports and diagnostics

```bash
npm run report
npx playwright show-trace test-results/<failed-test>/trace.zip
```

Playwright generates:

- HTML report: `playwright-report/`
- JSON report: `test-results/results.json`
- Failure screenshots and traces: `test-results/`
- Console and failed-network logs: `artifacts/logs/`
- Retained failure videos: configured in Playwright locally

## HyperExecute matrix execution

`hyperexecute.yaml` creates two matrix tasks:

- Windows 10 + Chrome latest
- Linux + Chrome latest

Each task executes the complete Playwright suite. The YAML uses official supported keys for matrix execution, pre steps, dependency caching, environment variables, consolidated artifacts, and TestMu AI Playwright capabilities.

### Configure dashboard secrets

In HyperExecute Dashboard > Secrets, create:

- `LT_USERNAME`
- `LT_ACCESS_KEY`

The credentials are referenced only through:

```yaml
env:
  LT_USERNAME: ${{.secrets.LT_USERNAME}}
  LT_ACCESS_KEY: ${{.secrets.LT_ACCESS_KEY}}
```

Do not add real values to YAML, `.env`, scripts, logs, or Git.

### Download and execute CLI

Download the official HyperExecute CLI for your operating system, then run:

```bash
./hyperexecute --config hyperexecute.yaml --download-artifacts --verbose
```

Windows PowerShell:

```powershell
.\hyperexecute.exe --config hyperexecute.yaml --download-artifacts --verbose
```

Keep `LT_USERNAME` and `LT_ACCESS_KEY` as local environment variables when running the CLI manually. Configure matching Dashboard Secrets for unattended HyperExecute jobs.

### Artifacts

`mergeArtifacts: true` consolidates artifacts from both matrix environments. The dashboard artifact bundle can contain:

- Playwright HTML and JSON reports
- Failure screenshots and traces
- Console and network logs
- TestMu AI session screenshots, videos, network and console information

## Troubleshooting

- If the form button is not visible, wait for navigation and use the existing role and ID locators.
- If Scenario 2 shifts to the wrong value, rerun from a fresh page because range controls are stateful.
- If cloud execution is attempted locally, set `TEST_MODE=cloud` only when both credentials are available.
- If local execution unexpectedly connects to TestMu AI, verify `TEST_MODE` is unset or set to `local`.
- If Chromium is missing, run `npx playwright install chromium`.
- If the target website changes selectors or validation text, update the scenario and rerun the three-test suite.

## Submission checklist

Before submission:

- Run `npm install`
- Run `npx playwright install chromium`
- Run `npm test` and confirm all three scenarios pass locally
- Configure LT_USERNAME and LT_ACCESS_KEY in HyperExecute Secrets
- Run the Windows 10/Chrome and Linux/Chrome matrix
- Download the merged artifacts
- Privately share the repository with `admin@testmuaicertifications.com`
- Save the GitHub repository URL and TestMu AI Test Session IDs for the exam portal
- Submit within the assignment deadline

Cloud execution, session IDs and repository sharing require dashboard access and are not available locally.
