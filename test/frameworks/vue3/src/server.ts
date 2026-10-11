import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { isUsaElement } from 'motionary/components/vue';
import { App } from './App';
export const render = () => {
  const app = createSSRApp(App);
  app.config.compilerOptions.isCustomElement = isUsaElement;
  return renderToString(app);
};
