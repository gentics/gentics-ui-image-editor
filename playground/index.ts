require('core-js/client/shim.min.js');
require('zone.js');

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { PlaygroundModule } from './playground-module';

platformBrowserDynamic().bootstrapModule(PlaygroundModule);
