import { pushTarget, popTarget } from './dep.js'

export default class Watcher {
  constructor(vm, expression, cb) {
    this.vm = vm
    this.cb = cb
    this.expression = expression
    this.value = this.get() // 实例化 Watcher 时会执行 get 方法, 该 demo 中就是根据传入的 expression 取值, expression 就是 vm._data 对象的属性值, 可以是深度访问的字符串 'vm._data.deep.a'
  }

  // 实例化时调用该方法获取表达式的值
  get() {
    pushTarget(this) // 将当前正在实例化的 watcher 设到全局唯一 Dep.target 上

    // 根据传入的 deep.a 字符串去访问 vm 实例的 this.deep.a 属性值
    // 这里在访问属性值的时候会触发响应式对象属性的 getter 拦截, getter 拦截中会收集依赖, 将当前正在实例化的 watcher（也就是 Dep.target）收集起来
    // 让 watcher 订阅 this.deep.a 的的变化, this.deep.a 变化时会调用 getter 拦截时收集依赖的 dep 实例的 notify 方法以派发视图更新或执行回调函数
    let val = this.vm
    this.expression.split('.').forEach(key => {
      val = val[key]
    })
    popTarget()
    return val
  }

  addDep(dep) {
    dep.addSub(this)
  }

  update() {
    // const value = this.get() // 会触发死循环, 无限添加订阅者, 派发更新的时候会去 get 新值（触发 getter 拦截）, 调用 this.get() 会收集依赖 watcher, 因为 getter 拦截中是判断 Dep.target 来收集依赖
    // 读到新值后将新值、旧值传入 vm.$watch 方法第二个回调函数参数并执行回调函数
    let value = this.vm
    this.expression.split('.').forEach(key => {
      value = value[key]
    })
    const oldValue = this.value
    this.value = value
    this.cb.call(this.vm, this.value, oldValue)
  }
}
