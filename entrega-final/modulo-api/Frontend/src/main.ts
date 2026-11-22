import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

import { AppComponent } from './app/app.component';

registerLocaleData(localeEsCo);

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
}).catch((err) => console.error(err));
