import { Component, inject } from "@angular/core";
import { IonApp, IonRouterOutlet, IonToast } from "@ionic/angular";
import { LabState } from "./lab-state";
@Component({
  selector: "app-root",
  imports: [IonApp, IonRouterOutlet, IonToast],
  template: `<ion-app
    ><ion-router-outlet /><ion-toast
      [isOpen]="!!state.notice()"
      [message]="state.notice()"
      [duration]="5000"
      (didDismiss)="state.notice.set('')"
  /></ion-app>`,
})
export class App {
  readonly state = inject(LabState);
}
