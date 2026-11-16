import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
@Component({selector:'app-missing-page',imports:[IonContent,IonButton,RouterLink],template:'<ion-content><main class="course"><h1>Lesson not found</h1><p>Choose a section from the agent lab.</p><ion-button routerLink="/">Open agent lab</ion-button></main></ion-content>'})
export class MissingPage {}
