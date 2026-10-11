// Vue 3: template compiled at runtime with isCustomElement = isUsaElement; `:checked.prop` sets the property,
// `@usa:change` listens to the custom event; <KeepAlive> caches a second switch (#ka-sw).
import { defineComponent, ref, KeepAlive, h } from 'vue';

const fx = (): any => (globalThis as any).__fx;

const Tab = defineComponent({
  props: { name: String },
  template: `<div class="tab">
    <usa-switch v-if="name === 'a'" id="ka-sw" label="Cached" @usa:change="(e) => log('ka:' + e.detail.checked)"></usa-switch>
    <p v-else id="tab-b">B</p>
  </div>`,
  methods: { log: (s: string) => fx()?.log.push(s) },
});
const TabA = defineComponent({ name: 'TabA', components: { Tab }, template: `<Tab name="a" />` });
const TabB = defineComponent({ name: 'TabB', components: { Tab }, template: `<Tab name="b" />` });

export const App = defineComponent({
  components: { KeepAlive, TabA, TabB },
  setup() {
    const checked = ref(false);
    const show = ref(true);
    const tab = ref('a');
    const f = fx();
    if (f) Object.assign(f, { setChecked: (v: boolean) => (checked.value = v), show: (v: boolean) => (show.value = v), keepAlive: (t: string) => (tab.value = t) });
    const onChange = (e: CustomEvent<{ checked: boolean }>) => {
      fx().log.push('change:' + e.detail.checked);
      checked.value = e.detail.checked;
    };
    return { checked, show, tab, onChange };
  },
  template: `<section id="fx">
    <p id="status">{{ checked ? 'on' : 'off' }}</p>
    <usa-switch v-if="show" id="sw" label="Wifi" :checked.prop="checked" @usa:change="onChange"></usa-switch>
    <KeepAlive><component :is="tab === 'a' ? 'TabA' : 'TabB'" /></KeepAlive>
  </section>`,
});
void h;
