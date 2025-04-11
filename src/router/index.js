import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        children: [
          {
            path: '',
            name: 'Dashboard',
            component: () => import('@/views/Dashboard.vue')
          },
        //   {
        //     path: '/users',
        //     name: 'UserManagement',
        //     component: () => import('@/views/Users.vue')
        //   }
        ]
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
      }
]

const router = createRouter({
    history: createWebHistory(),
    routes
  })
  
  export default router