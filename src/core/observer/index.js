import Dep from './dep.js'

class Observer {
  constructor(value) {
    this.walk(value) // 遍历对象每一个属性, 如果是嵌套的对象就递归调用自己深度遍历, 如果是普通属性就添加 getter、setter 拦截
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object') {
        this.walk(obj[key])
      }
      defineReactive(obj, key, obj[key]) // 通过 Object.defineProperty API 添加 getter、setter 拦截
    })
  }
}

const defineReactive = (obj, key, value) => {
  const dep = new Dep() // 实例化一个依赖管理器 dep, 该实例对象负责收集依赖、派发更新, 依赖收集在实例对象的 subs: Array<Watcher> 属性上
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend() // 收集依赖, 该方法会将当前全局唯一 Watcher 也就是 Dep.target 静态属性收集到当前 dep 实例的 subs: Array<Watcher> 属性
      }
      return value
    },
    set(newVal) {
      if (newVal === value) {
        return
      }
      value = newVal
      dep.notify() // 派发更新, 更新视图（Vue的渲染 Watcher）或者执行传入 vm.$watch(key, cb) 的回调函数 cb
    }
  })
}

export default function observe(value) {
  // observe 函数就是实例化一个 Observer 观察者对象
  return new Observer(value)
}
