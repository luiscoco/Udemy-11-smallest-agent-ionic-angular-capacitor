# The Smallest Agent · Ionic + Angular + Capacitor + FastAPI

Independent edition 11. A real Ionic 9 / Angular 22 application runs in a browser and is packaged by Capacitor 8 for Android and iOS. A separate FastAPI server runs the actual Python Claude Agent SDK. Earlier editions and credentials are untouched.

Includes five working lesson routes, readable typography, pastel cards, persistent light/dark theme, Stream/Simple agent modes, SDK event inspection, syntax-colored code and Markdown, a 16-step UML sequence and source explanations generated from this edition's actual files.

## Windows quick start

Use Node.js 24 LTS and Python 3.12 or newer available as `python`. From **Lesson 0**, run in PowerShell:

```powershell
cd .\11-smallest-agent-ionic-angular-capacitor
npm install
npm run setup
if (!(Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
notepad backend\.env
```

Replace `ANTHROPIC_API_KEY` with your own Anthropic key, save, then run:

```powershell
npm run dev
```

Open **http://localhost:5200**. FastAPI health: **http://127.0.0.1:8600/api/health**. Real Swagger UI: **http://127.0.0.1:8600/docs**. Stop both with Ctrl+C.

`npm run setup` creates this edition's own root `.venv` and installs backend requirements and frontend packages. There is no dependency on another edition's environment. If you use a Python launcher instead, create the environment with `py -3 -m venv .venv` first. `Start-Application.ps1` resolves its own directory. Always run the npm commands from this new folder, rather than Lesson 0 or backend.

Separate terminals, both starting at the application root:

```powershell
# Terminal 1
npm run dev:api
# Terminal 2
npm run dev:web
```

The explicit Python equivalent from the application root is:

```powershell
.\.venv\Scripts\python.exe backend/run.py
```

## Private configuration

Only **backend/.env** contains credentials. The scaffold creates only its example and never overwrites a real file. It is loaded relative to the backend module; process environment has precedence. Restart FastAPI after changes.

```dotenv
ANTHROPIC_API_KEY=sk-ant-your-own-key
CLAUDE_MODEL=
AGENT_SYSTEM_PROMPT=You are a concise teaching assistant.
AGENT_MAX_TURNS=1
API_HOST=127.0.0.1
API_PORT=8600
ALLOWED_ORIGINS=http://localhost:5200,http://127.0.0.1:5200,capacitor://localhost,https://localhost
```

Empty CLAUDE_MODEL uses the SDK default. An override must be available to your Anthropic account. Turns default to 1 and accept integers 1–10. Placeholder/empty keys count as missing. Health reports presence, not authenticated readiness or available credit. The lesson screens work without a key; inference fails safely without calling Claude.

The frontend uses **frontend/public/config.json** for a public API URL:

```json
{"apiUrl":"http://127.0.0.1:8600"}
```

Never put a key in that file, Angular source, Capacitor config or native assets. There is no frontend secret .env. Rebuild the web app and sync native assets after editing config.json. ALLOWED_ORIGINS is an exact comma-separated allowlist, including protocol and port. Native Capacitor origins here are explicitly configured to capacitor://localhost on iOS and https://localhost on Android. A native app can omit Origin, so CORS is not authentication.

## Build and check

```powershell
npm run generate:lesson
npm run typecheck
npm test
npm run build
```

Typecheck uses Angular's compiler, including strict templates. Tests use injected SDK behavior and spend no API credits. The deterministic lesson generator validates 16 matching SVG/PlantUML labels and source markers, extracts real Python/TypeScript excerpts and copies the diagrams. SVG uses explicit presentation attributes so frames, strokes and fonts do not depend on embedded CSS support.

Angular output is **frontend/dist/browser**. After building, restart FastAPI with `npm run dev:api` and open **http://127.0.0.1:8600** for a single-server production-web preview. FastAPI serves API/docs before static files and supports lesson deep links; unknown API URLs remain API 404s. A static-only hosting service still needs the separate reachable Python server.

Root and frontend package-lock.json files support repeat installs with `npm ci` and `npm --prefix frontend ci`. Python requirements pin the primary runtime packages. Application runtime uses only this folder's dependencies.

## Capacitor Android and iOS

The client includes real Capacitor core, Android/iOS platform packages and Clipboard, Preferences, Filesystem and Share plugins. Capacitor's webDir is the actual Angular production output. CapacitorHttp interception remains disabled because native HTTP interception can buffer fetch responses and break incremental SSE observation.

```powershell
# From the application root, after npm run build
npm run cap:sync
npm run cap:android
# On macOS with Xcode:
npm run cap:ios
```

The cap:android and cap:ios commands open native IDEs only when you request them. Native builds require the corresponding SDKs, IDEs and signing setup; web compilation does not prove a signed native binary works. If a platform directory is absent, run `npx cap add android` or `npx cap add ios` from **frontend**, then sync. Android uses Android Studio/JDK requirements for Capacitor 8; iOS compilation requires macOS/Xcode.

For a phone, set API_HOST=0.0.0.0 and change config.json to a reachable HTTPS API or your Windows PC's LAN address. The phone and PC must share a reachable network; allow the development API port through Windows Firewall. A phone's 127.0.0.1 points to itself. Android emulator can reach the PC at http://10.0.2.2:8600.

Packaged HTTPS WebViews and mobile transport policies can reject an HTTP API. Use HTTPS for native testing/production. For local HTTP-only development, use narrowly scoped platform transport exceptions: development-only Capacitor server.cleartext plus android.allowMixedContent on Android, and an appropriate local-network ATS exception on iOS, then sync/rebuild. Do not use a production server.url pointing to a development laptop. The generated iOS project includes PrivacyInfo.xcprivacy as a resource with Filesystem C617.1 and Preferences CA92.1 API reasons. Review the full distribution privacy declarations before release.

Copy uses the Capacitor clipboard. Theme uses Preferences with storage-failure fallback. Save actions download browser files or write a cache file and invoke the native share sheet. No broad storage permission is requested by this cache-based flow.

## API behavior and safety

- GET /api/health exposes only status and api_key_configured.
- POST /api/agent/query accepts JSON {prompt}, returns result, num_turns, duration_ms, total_cost_usd and is_error.
- POST /api/agent/stream emits real SDK message projections, then done. Errors emit error without done. This is SDK message streaming, not token deltas.
- Actual bytes are bounded at 32 KiB. Invalid JSON/media/Origin/size/prompt receive safe 400/415/403/413/422 responses before SDK work. Input is a strict trimmed 1–4000 character string. Missing key gives query 503 or an SSE error; provider failure gives query 502 or a safe SSE error.
- SDK tools, autoapprovals, settings, skills, MCP, plugins and session persistence are disabled. The key goes into this run's subprocess options without global environment mutation. Safe projection excludes thinking, tool arguments, paths, raw environment and session identifiers, and redacts exact key occurrences.
- Query disconnects and three-minute deadlines cancel work. FastAPI SSE handles disconnects and heartbeat comments; aclosing closes SDK iterators. The client handles UTF-8/CRLF/frame boundaries, validates messages and requires both final result and done. is_error remains a failure.
- Visible timeline rows are capped at 500 while final results continue to be processed. Angular state is per running application and survives lesson navigation. An immediate lock prevents duplicate requests.
- Highlight.js escapes code; model Markdown passes DOMPurify and Angular sanitization. Images are suppressed and links restricted to HTTP(S). Unknown code languages remain escaped text. API errors preserve safe details while avoiding provider traces.

Before public deployment add HTTPS, authentication, cost/rate limits and a suitable Origin allowlist. Do not expose an unrestricted paid inference endpoint.

See **BUILD-PROMPT.txt**, **ASSETS.md** and **VERIFICATION.md** for the reusable specification, provenance and actual verification limits.

Official references: https://ionicframework.com/docs/angular/build-options · https://capacitorjs.com/docs/getting-started · https://capacitorjs.com/docs/config · https://fastapi.tiangolo.com/ · https://code.claude.com/docs/en/agent-sdk/python
