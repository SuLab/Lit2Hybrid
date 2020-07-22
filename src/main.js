import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import VueGtag from "vue-gtag"

Vue.use(VueGtag, {
  config: { id: "UA-171293218-1" }
});

const vm = new Vue({
  render: h => h(App),
}).$mount('#app')

export default vm;