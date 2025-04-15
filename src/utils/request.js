// utils/request.js
import axios from 'axios'

const service = axios.create({
  // baseURL: '192.168.20.138:8080', // 基础路径
  timeout: 10000,                    // 超时时间
  withCredentials: true               // 解决跨域问题[4](@ref)
})


// 定义无需 Token 的接口路径
const whiteList = ['/api/login', '/api/refresh-token']

service.interceptors.request.use(config => {
  if (!whiteList.some(url => config.url.includes(url))) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      router.push('/login') // 无 Token 跳转登录页
    }
  }
  return config
})

  service.interceptors.response.use(
    response => {
      // 处理标准响应格式
      if (response.data.code === 200) {
        return response.data.result
      } else {
        return Promise.reject(response.data.message)
      }
    },
    error => {
      // 统一错误处理
      const status = error.response?.status
      switch(status) {
        case 401: console.error('登录过期'); break
        case 403: console.error('无权限访问'); break
        case 500: console.error('服务器错误'); break
        default: console.error('请求失败:', error.message)
      }
      return Promise.reject(error)
    }
  )

  export default service 