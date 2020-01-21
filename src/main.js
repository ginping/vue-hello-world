import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.use(Element)

import axios from 'axios'
Object.defineProperty(Vue.prototype, '$axios', { value: axios })

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
