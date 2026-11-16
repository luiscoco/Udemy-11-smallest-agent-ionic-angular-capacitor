# Verification · 2026-11-09

This independent edition was implemented and checked on Windows with Node.js 24.22.2, npm 11.19.1 and Python 3.14. Its runtime uses its own installed packages and root .venv. No previous real environment file was read or copied, and no new real environment file was generated. Only named source/test/public asset files were adapted from earlier editions.

## Checks completed

- Strict Angular compiler/template checks passed using `npm run typecheck`.
- `npm test` passed **35 tests**: six frontend transport/workflow tests and 29 Python SDK/API tests. SDK behavior is injected; these tests do not call Claude. They cover strict trimmed prompt validation, actual/chunked body limits, JSON/media type, Origin handling, safe missing-key/provider errors, tool/session isolation, projection/redaction, error subtype handling, missing final results, iterator/query cancellation and disconnects. Frontend tests cover JSON contracts, split Unicode/CRLF SSE parsing, HTTP details, premature EOF and explicit portable SVG attributes/source-card matching.
- `npm run build` produced the actual Ionic Angular production application in frontend/dist/browser. The final build includes the larger card and answer text and source excerpts generated from the current files.
- `npm run dev` was exercised from the application root and started both the Python API on 8600 and Ionic dev server on 5200. The Python launcher resolves this folder's own interpreter and uses the Windows Proactor loop required by SDK subprocesses.
- Root and frontend npm installs reported zero known vulnerabilities at installation. Installed versions include Ionic 9.0.10, Angular 22.2.5 / build 22.2.6, Capacitor 8.6.0 and Python Claude Agent SDK 0.2.179 / FastAPI 0.162.2. Root/frontend lockfiles are present.
- Repeated lesson generation produced identical hashes for the 16 source cards and SVG/PlantUML assets. SVG and PlantUML share all interaction labels, markers resolve to real files, and diagrams use explicit presentation attributes. Root and project BUILD-PROMPT copies are byte-identical.

## Browser and real HTTP

FastAPI was run with a deliberately missing placeholder key. verification/http-check.py guards against a configured key and verifies actual health, Swagger, OpenAPI, unknown API 404, malformed/invalid prompts, wrong media type, oversized body, foreign Origin rejection and configured browser/native CORS. Both missing-key request modes fail safely without inference.

Headless installed Chrome was driven with Playwright. verification/browser-check.py exercises all five Ionic Router sections on one mounted application, selected navigation via Ionic's native shadow-DOM links, retained prompt, all 16 source explanations, actual code token colors, SVG download, both missing-key modes, persistent theme and desktop/mobile width. It checks lesson paragraphs remain at least 21 px, addressing Ionic's default 14 px card prose. Desktop/mobile screenshots and a focused UML image were captured as ignored QA artifacts.

verification/result-check.py uses explicit intercepted browser fixtures to verify the immediate duplicate-submission lock, final result processing after the 500-row timeline cap, colored and sanitized Markdown, large answer text, result retention across navigation, copy/download actions and a simple-mode error result that remains an error. Scripts, remote model images and javascript links are removed. These are fixture tests rather than evidence of provider authentication.

The compiled frontend was also served by the real FastAPI static mount. HTTP checks verified root and all five lesson deep links, public config, the SVG, Swagger and OpenAPI. Unknown API and missing asset routes remain 404. The verification scripts also support this production-web URL through IONIC_TEST_URL.

The optional browser QA tools use Python/Playwright as development tooling. This session reused the existing edition 08 QA installation to drive Chrome; it is not part of edition 11's install or runtime. Independent QA can install Playwright separately. Application setup, API, frontend, unit tests, builds and native sync use this edition's own dependencies.

## Capacitor verification and limits

Capacitor CLI successfully generated **both Android and iOS projects**, then synchronized the final Angular output and four native plugins: Clipboard 8.0.1, Preferences 8.0.1, Filesystem 8.1.5 and Share 8.0.3. Both platforms' copied index/config/diagram assets were compared against the final web build. CapacitorHttp interception remains disabled for streaming fetch behavior.

The generated Xcode project includes PrivacyInfo.xcprivacy in its resources with file timestamp C617.1 and user defaults CA92.1 API reasons for Filesystem and Preferences. The plist parses successfully and the resource reference survives native sync. Full App Store privacy declarations still require distribution review.

No signed Android APK/AAB or iOS application was compiled. No phone/emulator native runtime, native clipboard/share sheet, transport permissions or signing was tested. Native builds require the platform IDE/JDK/SDK tools; iOS compilation requires macOS/Xcode. No IDE was launched, cloud build/store submission triggered or application deployed.

No paid Claude request was made. Real authentication, model access, account credit and inference remain unverified. Health proves key presence only. This local teaching backend needs authentication, HTTPS and cost/rate limits before public exposure. Native CORS allowlisting is not authentication.
