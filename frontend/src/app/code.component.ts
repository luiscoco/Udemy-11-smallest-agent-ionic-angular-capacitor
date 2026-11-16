import { Component, Input, OnChanges, signal } from "@angular/core";
import { IonButton } from "@ionic/angular";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import powershell from "highlight.js/lib/languages/powershell";
import xml from "highlight.js/lib/languages/xml";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { copyText } from "./device";
for (const [name, grammar] of Object.entries({
  typescript,
  python,
  json,
  powershell,
  xml,
}))
  hljs.registerLanguage(name, grammar);
hljs.registerAliases(["ts", "javascript", "js"], {
  languageName: "typescript",
});
function escape(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
export function highlight(code: string, language: string) {
  return hljs.getLanguage(language)
    ? hljs.highlight(code, { language }).value
    : escape(code);
}
@Component({
  selector: "app-code",
  imports: [IonButton],
  template: `<div class="code-block">
    <div class="code-header">
      <span>{{ label || language }}</span
      ><ion-button
        size="small"
        fill="clear"
        (click)="copy()"
        aria-label="Copy code"
        >{{ copied() ? "Copied" : "Copy" }}</ion-button
      >
    </div>
    <pre tabindex="0"><code [innerHTML]="html"></code></pre>
  </div>`,
})
export class CodeComponent implements OnChanges {
  @Input({ required: true }) code = "";
  @Input() language = "typescript";
  @Input() label = "";
  html = "";
  copied = signal(false);
  ngOnChanges() {
    this.html = highlight(this.code, this.language);
    this.copied.set(false);
  }
  async copy() {
    try {
      await copyText(this.code);
      this.copied.set(true);
    } catch {
      this.copied.set(false);
    }
  }
}
@Component({
  selector: "app-answer",
  template: '<div class="answer-markdown" [innerHTML]="html"></div>',
})
export class AnswerComponent implements OnChanges {
  @Input({ required: true }) text = "";
  html = "";
  ngOnChanges() {
    const renderer = new marked.Renderer();
    renderer.code = ({ text, lang }) =>
      `<pre tabindex="0"><code>${highlight(text, (lang || "").split(" ")[0])}</code></pre>`;
    renderer.image = () => "";
    renderer.link = ({ href, text }) =>
      /^https?:\/\//i.test(href)
        ? `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : text;
    this.html = DOMPurify.sanitize(
      marked.parse(this.text, { renderer, async: false }) as string,
      {
        FORBID_TAGS: [
          "script",
          "style",
          "iframe",
          "img",
          "video",
          "audio",
          "form",
        ],
        FORBID_ATTR: ["style"],
      },
    );
  }
}
