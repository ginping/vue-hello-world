import observe from '../observer/index.js'

const LIFECYCLE_HOOKS = [
  'created',
  'mounted'
]

export default function initOptions(vm) {
  vm._data = vm.$options.data
  observe(vm._data) // 将 vm._data 变成响应式对象, 这里是简单实现, Vue 会遍历对象和数组的属性递归调用自己将所有对象和数组都变成响应式对象
  LIFECYCLE_HOOKS.forEach(hook => {
    vm.$options[hook] = vm.$options[hook] || function() {}
  })
}
