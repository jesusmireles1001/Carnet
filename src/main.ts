import 'zone.js';  // <--- ESTA ES LA LÍNEA QUE TE FALTABA PARA EL ERROR ROJO
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
