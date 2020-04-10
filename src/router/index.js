import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/Upload')
  },
  {
    path: '/upload-demo',
    name: 'UploadDemo',
    component: () => import('@/views/UploadDemo')
  }
]

const router = new VueRouter({
  routes
})

export default router
