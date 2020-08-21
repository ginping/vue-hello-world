export default class compiler {
  constructor(el, vm) {
    vm.$el = document.querySelector(el)
    this.replace(vm.$el, vm)
  }

  replace(el, vm) {
    // el 是真实 dom 节点
    for (const node of Array.from(el.childNodes)) {
      const txt = node.textContent // 取当前节点文本内容
      const reg = /\{\{(.*?)\}\}/ // 匹配满足 {{  }} 包着的内容

      const match = reg.exec(txt)
      if (node.nodeType === 3 && match) { // 既是文本节点又有 {{ }}
        const arr = match[1].trim().split('.')
        let val = vm // 取到 Vue 实例的 this.deep.a 的值
        arr.forEach(key => {
          val = val[key]
        })
        node.data = txt.replace(reg, val).trim() // 首次渲染替换 {{ deep.a }} 为 Vue 实例的 this.deep.a 的值
        vm.$watch(match[1].trim(), function(newVal) { // 实例化一个观察者 Watcher 并传入回调函数, 该回调函数会挂在该 watcher 实例的 cb 属性上并在 update 方法中更新
          node.data = txt.replace(reg, newVal).trim() // 该 demo 中简单将 dom 节点的内容替换成设置侦测属性的新值（操作 dom）
        })
      }
      if (node.nodeType === 1) { // 元素节点
        const nodeAttr = node.attributes // 获取元素的所有属性
        for (const attr of Array.from(nodeAttr)) {
          const name = attr.name
          const exp = attr.value
          // v-model 指令, 将 input 标签的值和 v-model 表达式的值绑定
          if (name.includes('v-model')) {
            let val = vm
            const arr = exp.trim().split('.')
            arr.forEach(key => {
              val = val[key]
            })
            node.value = val

            vm.$watch(exp, function(newVal) {
              node.value = newVal
            })

            node.addEventListener('input', e => {
              const newVal = e.target.value
              const arr = exp.split('.')
              let val = vm
              arr.forEach((key, i) => {
                if (i === arr.length - 1) {
                  val[key] = newVal
                } else {
                  val = val[key]
                }
              })
            })
          }
        }
      }

      // 递归调用自己的子节点
      if (node.childNodes && node.childNodes.length) {
        this.replace(node, vm)
      }
    }
  }
}
