import MyVue from '../src/core/index.js'

const app = new MyVue({
  el: '#app',
  data: {
    msg: 'Hello MyVue',
    deep: {
      a: 1,
      b: 2
    }
  },
  mounted() {
    this.deep.b = 2333
  }
})

const plusOneA = () => app.deep.a++
const minusOneA = () => app.deep.a--
const plusOneB = () => app.deep.b++
const minusOneB = () => app.deep.b--
const double = () => { app.deep.a = app.deep.a * app.deep.b }
const half = () => { app.deep.a = Math.round(app.deep.a / app.deep.b) }
const initDeepA = () => { app.deep.a = 0 }

window.app = app
window.plusOneA = plusOneA
window.minusOneA = minusOneA
window.plusOneB = plusOneB
window.minusOneB = minusOneB
window.double = double
window.half = half
window.initDeepA = initDeepA
