import { Injectable, signal } from "@angular/core";
import { Preferences } from "@capacitor/preferences";
import { createApi } from "./api";
import { isAgentResult, type AgentResult, type TimelineMessage } from "./types";
@Injectable({ providedIn: "root" })
export class LabState {
  prompt = signal("Say hello to the world in one sentence.");
  mode = signal<"stream" | "simple">("stream");
  status = signal("idle");
  error = signal("");
  notice = signal("");
  elapsed = signal(0);
  result = signal<AgentResult | null>(null);
  messages = signal<TimelineMessage[]>([]);
  dark = signal(false);
  health = signal("Checking server…");
  apiUrl = signal("http://127.0.0.1:8600");
  private locked = false;
  private controller: AbortController | null = null;
  private ready = this.configure();
  constructor() {
    void Preferences.get({ key: "smallest-agent-theme" })
      .then(({ value }) => this.applyTheme(value === "dark"))
      .catch(() => {});
  }
  private async configure() {
    try {
      const response = await fetch("config.json");
      if (!response.ok) throw new Error();
      const value: unknown = await response.json();
      if (
        !value ||
        typeof value !== "object" ||
        !("apiUrl" in value) ||
        typeof value.apiUrl !== "string" ||
        !/^https?:\/\//.test(value.apiUrl)
      )
        throw new Error();
      this.apiUrl.set(value.apiUrl.replace(/\/$/, ""));
      const h = await createApi(this.apiUrl()).health(
        AbortSignal.timeout(10000),
      );
      this.health.set(
        h.api_key_configured
          ? "API ready · key configured"
          : "API ready · configure backend key",
      );
    } catch {
      this.health.set("API offline or config.json invalid · check setup");
    }
  }
  private applyTheme(dark: boolean) {
    this.dark.set(dark);
    document.documentElement.classList.toggle("dark", dark);
  }
  toggleTheme() {
    const next = !this.dark();
    this.applyTheme(next);
    void Preferences.set({
      key: "smallest-agent-theme",
      value: next ? "dark" : "light",
    }).catch(() => {});
  }
  async run() {
    const trimmed = this.prompt().trim();
    if (this.locked || !trimmed || trimmed.length > 4000) return;
    this.locked = true;
    this.status.set("loading");
    this.error.set("");
    this.result.set(null);
    this.messages.set([]);
    this.elapsed.set(0);
    const active = new AbortController();
    this.controller = active;
    const started = performance.now();
    const timer = setInterval(
      () => this.elapsed.set((performance.now() - started) / 1000),
      100,
    );
    const deadline = setTimeout(() => active.abort(), 180000);
    let final: AgentResult | null = null;
    try {
      await this.ready;
      if (active.signal.aborted) throw new Error("Canceled");
      const api = createApi(this.apiUrl());
      if (this.mode() === "simple")
        final = await api.query(trimmed, active.signal);
      else
        await api.stream(
          trimmed,
          (message) => {
            if (this.messages().length < 500)
              this.messages.update((rows) => [
                ...rows,
                { ...message, elapsed: (performance.now() - started) / 1000 },
              ]);
            if (
              message.type === "ResultMessage" &&
              isAgentResult(message.data)
            ) {
              final = message.data;
              this.result.set(message.data);
            }
          },
          active.signal,
        );
      if (!final) throw new Error("The agent finished without a final answer.");
      this.result.set(final);
      this.status.set(final.is_error ? "error" : "success");
      if (final.is_error) this.error.set(final.result);
      this.notice.set(
        final.is_error ? "The agent reported an error." : "Answer received.",
      );
    } catch (error) {
      const detail = active.signal.aborted
        ? "The request was canceled or timed out."
        : error instanceof Error
          ? error.message
          : "The request could not finish.";
      this.error.set(detail);
      this.notice.set(detail);
      this.status.set("error");
    } finally {
      clearInterval(timer);
      clearTimeout(deadline);
      this.locked = false;
      this.controller = null;
      this.elapsed.set((performance.now() - started) / 1000);
    }
  }
  cancel() {
    this.controller?.abort();
  }
}
