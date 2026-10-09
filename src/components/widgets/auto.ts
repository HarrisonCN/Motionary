// dist/widgets.umd.js: registers every 6.x widget and every 6.x effect pack on load
// (load after components.umd.js when you also use <usa-fx>). API: window.UsaWidgets.
import { defineWidgets } from './index';
import { registerAllPlugins } from '../fx2/index';

defineWidgets();
registerAllPlugins();
export * from './index';
export * from '../fx2/index';
