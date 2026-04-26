import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { Application } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(Application, config, context);

export default bootstrap;
