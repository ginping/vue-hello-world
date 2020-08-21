import proxy from './instance/proxy.js'
import initOptions from './instance/init.js'
import Watcher from './observer/watcher.js'
import { callHook } from './instance/lifecycle.js'
import Compiler from './compile/index.js'

export default class MyVue {
  constructor(options) {
    const vm = this
    vm.$options = options
    initOptions(vm) // 初始化参数, 为 vm._data 对象的属性添加 getter、setter 拦截器
    for (const key in vm._data) {
      proxy(vm, '_data', key) // 将 vm._data 对象的属性访问代理到 vm 上
    }
    vm.$watch = function(key, cb) { // 给 vm 实例挂上变化侦测方法 $watch, 参数是要检测的响应式对象属性值和要执行的回调函数
      new Watcher(vm, key, cb) // 该 demo 中 Watcher 实例行为只在这一处, 模拟 user watcher, Vue 在渲染视图的时候还会实例化一个渲染 Watcher
    }
    callHook(vm, 'created') // 调用回调函数 created
    new Compiler(vm.$options.el, vm) // 模板编译, 主要是将 {{ data.a.b }} 这种花括号的字符串替换成 vm 实例响应式对象具体的属性值
    callHook(vm, 'monuted') // 调用回调函数 mounted
  }
}
