import request from '@/utils/request.js'

export default {
  // 登录接口
  login(params) {
    return request.post('/user/login', params)
  },
  
  // 获取用户信息
  getProfile() {
    return request.get('/user/profile')
  }
}