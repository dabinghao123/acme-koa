import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'
import Users from '../components/Users.vue'
import DomainSSL from '../components/DomainSSL.vue'
import Orders from '../components/Orders.vue'

// 检查用户是否已登录
const isAuthenticated = () => {
  return !!localStorage.getItem('admin_user')
}

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/Dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: '/users',
        name: 'Users',
        component: Users
      },
      {
        path: '/DomainSSL',
        name: 'DomainSSL',
        component: DomainSSL
      },
      {
        path: '/orders',
        name: 'Orders',
        component: Orders
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated()) {
    next('/')
  } else {
    next()
  }
})

export default router