import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZoneChangeDetection } from "@angular/core";
import { provideRouter, RouteReuseStrategy } from "@angular/router";
import { IonicRouteStrategy, provideIonicAngular } from "@ionic/angular";
import { App } from "./app/app";
import { CoursePage } from "./app/course.page";
import { MissingPage } from "./app/missing.page";
bootstrapApplication(App, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular({ mode: "md" }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter([
      {
        path: "",
        component: CoursePage,
        data: { section: "lab" },
        pathMatch: "full",
      },
      ...["learn", "run", "architecture", "walkthrough"].map((section) => ({
        path: section,
        component: CoursePage,
        data: { section },
      })),
      { path: "**", component: MissingPage },
    ]),
  ],
}).catch(() => console.error("The application could not start."));
