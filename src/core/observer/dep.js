export default class Dep {
  constructor() {
    this.subs = []
  }

  // 收集依赖方法
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  // 收集依赖的操作方法, 在 Watcher 实例的 addDep(dep) 中被调用 dep.addSub(this)
  addSub(sub) {
    this.subs.push(sub)
  }

  // 派发更新
  notify() {
    const subs = this.subs.slice() // 防止更新读取新值得时候无限收集新的依赖派发新的更新
    for (const sub of subs) {
      sub.update()
    }
  }
}

Dep.target = null
const targetStack = []

export function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
