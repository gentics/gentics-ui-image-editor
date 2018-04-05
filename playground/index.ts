import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { PlaygroundModule } from './playground-module';

require('core-js/client/shim.min.js');
require('zone.js');

platformBrowserDynamic().bootstrapModule(PlaygroundModule);
