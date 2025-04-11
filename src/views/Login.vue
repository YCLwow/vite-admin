<template>
    <div class="Login">
        <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-container">
            <div class="lang-switch">
                <select v-model="currentLang" @change="changeLanguage">
                    <option value="zh-CN">中文</option>
                    <option value="en">英文</option>
                </select>
            </div>

            <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="账号" prefix-icon="User"></el-input>
            </el-form-item>

            <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock"
                    show-password></el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
            </el-form-item>
        </el-form>
    </div>

</template>

<script setup>
import { ref, reactive } from 'vue'

import userApi from '@/api/user.js'

const loginForm = ref({ username: '', password: '' })
const rules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 12, message: '长度3-12个字符' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/, message: '需包含字母和数字' }
    ]
})
const currentLang = ref(localStorage.getItem('lang') || 'zh-CN')

const changeLanguage = () => {
    localStorage.setItem('lang', currentLang.value)
    window.location.reload()  // 强制刷新生效[3,4](@ref)
}


const  handleLogin = async () => {
    try {
    await userApi.login(loginForm.value); // 登录接口调用
    // 登录成功后跳转
    this.$router.push('/dashboard');  // 路径跳转
    // 或使用命名路由（推荐）
    this.$router.push({ name: 'Dashboard' }); 
  } catch (error) {
    console.error('登录失败:', error);
  }
}
</script>

<style lang="scss">
.Login {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;

    .login-container {
        width: 420px;
        padding: 60px 40px 20px 40px;
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.95);
        position: relative;
        z-index: 1;

    }

    .lang-switch {
        position: absolute;
        top: 6px;
        right: 10px;

        select {
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #e4e7ed;
            background: rgba(255, 255, 255, 0.9);
            appearance: none;
            cursor: pointer;

            &:focus {
                outline: none;
                border-color: var(--el-color-primary);
            }
        }
    }

    /* 标题样式 */
    .login-title {
        text-align: center;
        font-size: 24px;
        color: #303133;
        margin-bottom: 40px;
        letter-spacing: 1px;
    }

    .login-btn{
        margin: auto;
    }

}



/* 输入框样式 */
::v-deep .el-input__wrapper {
    height: 48px;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    transition: all 0.3s;
}

::v-deep .el-input__prefix {
    left: 16px;
    font-size: 18px;
    color: #999;
}

/* 聚焦状态 */
::v-deep .el-input__wrapper.is-focus {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2) !important;
}

/* 错误提示样式 */
::v-deep .el-form-item__error {
    padding-left: 40px;
    background: url('data:image/svg+xml;utf8,<svg ...></svg>') no-repeat left center;
}
</style>