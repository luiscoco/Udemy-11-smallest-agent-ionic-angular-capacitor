import { Component, HostListener, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonBadge,
  IonTextarea,
} from "@ionic/angular";
import { LabState } from "./lab-state";
import { CodeComponent, AnswerComponent } from "./code.component";
import { copyText, saveText } from "./device";
import steps from "./lesson.json";
@Component({
  selector: "app-course-page",
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonBadge,
    IonTextarea,
    CodeComponent,
    AnswerComponent,
  ],
  templateUrl: "./course.page.html",
})
export class CoursePage {
  readonly state = inject(LabState);
  readonly router = inject(Router);
  readonly section = inject(ActivatedRoute).snapshot.data["section"] as string;
  readonly steps = steps;
  readonly walkthrough = [1, 2, 5, 8, 12].map((n) => steps[n - 1]);
  readonly tabs = [
    { key: "lab", path: "/", label: "Agent lab" },
    { key: "learn", path: "/learn", label: "What you will learn" },
    { key: "run", path: "/run", label: "How to run" },
    {
      key: "architecture",
      path: "/architecture",
      label: "Architecture & workflow",
    },
    { key: "walkthrough", path: "/walkthrough", label: "Code walkthrough" },
  ];
  readonly examples = [
    "Say hello to the world in one sentence.",
    "Explain an AI agent simply.",
    "Show a tiny Python example.",
  ];
  readonly topics = [
    [
      "01 · One interface, three platforms",
      "Ionic components provide accessible mobile UI. Angular manages routes, forms and reactive state. Capacitor packages the same built web application for Android and iOS.",
    ],
    [
      "02 · The smallest Python agent",
      "The server calls query(prompt=…, options=…) from the Python Claude Agent SDK, then uses async for to consume messages until ResultMessage supplies the final answer.",
    ],
    [
      "03 · A clear server boundary",
      "Only FastAPI reads ANTHROPIC_API_KEY from backend/.env. The public frontend config.json contains an API URL; no credentials enter Angular or native bundles.",
    ],
    [
      "04 · Observe real SDK messages",
      "Simple mode waits for JSON. Stream mode parses Server-Sent Events carrying safe SDK lifecycle, assistant and result projections. These are message-level updates rather than token deltas.",
    ],
    [
      "05 · Keep this lesson constrained",
      "Built-in tools, skills, plugins, MCP and persisted sessions are disabled. Strict input validation, request limits, cancellation and safe error details bound the demo.",
    ],
    [
      "06 · Understand completion",
      "ResultMessage includes answer, turns, duration, estimated USD cost and is_error. A done event confirms stream completion; it never overrides an SDK error result.",
    ],
  ];
  readonly setup = `# PowerShell — start in Lesson 0
cd .\\11-smallest-agent-ionic-angular-capacitor
npm install
npm run setup
if (!(Test-Path backend\\.env)) { Copy-Item backend\\.env.example backend\\.env }
notepad backend\\.env
# Set your own ANTHROPIC_API_KEY, save, then:
npm run dev`;
  readonly config = `ANTHROPIC_API_KEY=sk-ant-your-own-key
CLAUDE_MODEL=
AGENT_SYSTEM_PROMPT=You are a concise teaching assistant.
AGENT_MAX_TURNS=1
API_HOST=127.0.0.1
API_PORT=8600
ALLOWED_ORIGINS=http://localhost:5200,http://127.0.0.1:5200,capacitor://localhost,https://localhost`;
  readonly checks = `# Always from the new application root
npm run typecheck
npm test
npm run build
# API also serves the built frontend after restart:
npm run dev:api
# Open http://127.0.0.1:8600
# Health: http://127.0.0.1:8600/api/health
# Swagger: http://127.0.0.1:8600/docs`;
  readonly native = `# From the new application root, after a web build
npm run cap:sync
npm run cap:android
# On macOS with Xcode:
npm run cap:ios
# Android / iOS projects are generated under frontend.
# After each web change: npm run build; npm run cap:sync`;
  json(value: unknown) {
    return JSON.stringify(value, null, 2);
  }
  @HostListener("document:keydown", ["$event"]) shortcut(event: KeyboardEvent) {
    if (
      this.section === "lab" &&
      this.router.url === "/" &&
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      void this.state.run();
    }
  }
  async action(task: () => Promise<unknown>) {
    try {
      await task();
      this.state.notice.set("Ready.");
    } catch (error) {
      this.state.notice.set(
        error instanceof Error ? error.message : "This action is unavailable.",
      );
    }
  }
  copy() {
    void this.action(() => copyText(this.state.result()?.result || ""));
  }
  download() {
    void this.action(() =>
      saveText(
        "agent-answer.md",
        this.state.result()?.result || "",
        "text/markdown",
      ),
    );
  }
  diagram(kind: "svg" | "puml") {
    void this.action(async () => {
      const response = await fetch("assets/workflow." + kind);
      if (!response.ok)
        throw new Error("The workflow asset could not be loaded.");
      await saveText(
        "workflow." + kind,
        await response.text(),
        kind === "svg" ? "image/svg+xml" : "text/plain",
      );
    });
  }
}
