<template>
    <div class="Login">
        <div class="card-container" :class="{ 'show-register': isRegister }">
            <!-- 登录表单 -->
            <el-form :model="loginForm" ref="loginFormRef" class="login-container">
                <h2 class="form-title">登录</h2>
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
                
                <div class="form-footer">
                    <span>没有账号？</span>
                    <el-button type="text" @click="toggleForm">立即注册</el-button>
                </div>
            </el-form>

            <!-- 注册表单 -->
            <el-form :model="registerForm" ref="registerFormRef" class="register-container" :rules="registerRules">
                <h2 class="form-title">注册</h2>
                
                <el-form-item prop="username">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User"></el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="请设置密码" prefix-icon="Lock"
                        show-password></el-input>
                </el-form-item>

                <el-form-item prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" prefix-icon="Lock"
                        show-password></el-input>
                </el-form-item>

                <el-form-item prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="Message"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" class="register-btn" @click="handleRegister">注册</el-button>
                </el-form-item>
                
                <div class="form-footer">
                    <span>已有账号？</span>
                    <el-button type="text" @click="toggleForm">返回登录</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import userApi from '@/api/user.js'

// 控制当前显示登录还是注册
const isRegister = ref(false)

// 登录表单数据
const loginForm = reactive({ username: '', password: '', id: '2' })
const loginFormRef = ref(null)

// 注册表单数据
const registerForm = reactive({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    email: ''
})
const registerFormRef = ref(null)

// 注册表单验证规则
const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        if (registerForm.confirmPassword !== '') {
            registerFormRef.value.validateField('confirmPassword')
        }
        callback()
    }
}

const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
    } else {
        callback()
    }
}

const registerRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
        { validator: validatePass, trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validatePass2, trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
}

// 当前语言设置
const currentLang = ref(localStorage.getItem('lang') || 'zh-CN')
const router = useRouter()

// 切换语言
const changeLanguage = () => {
    localStorage.setItem('lang', currentLang.value)
    window.location.reload()
}

// 登录处理
const handleLogin = async () => {
    try {
        if (!loginForm.username || !loginForm.password) {
            ElMessage.warning('请输入用户名和密码')
            return
        }
        
        await userApi.login(loginForm)
        ElMessage.success('登录成功')
        router.push('/')
    } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
    }
}

// 注册处理
const handleRegister = async () => {
    try {
        // 表单验证
        await registerFormRef.value.validate()
        
        // 调用注册接口（根据实际接口调整）
        await userApi.register({
            username: registerForm.username,
            password: registerForm.password,
            email: registerForm.email
        })
        
        ElMessage.success('注册成功，请登录')
        // 注册成功后切换到登录表单
        isRegister.value = false
        
        // 清空注册表单
        registerForm.username = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
        registerForm.email = ''
    } catch (error) {
        console.error('注册失败:', error)
        if (error.message) {
            ElMessage.error(error.message)
        } else {
            ElMessage.error('注册失败，请稍后重试')
        }
    }
}

// 切换登录/注册表单
const toggleForm = () => {
    isRegister.value = !isRegister.value
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
    
    .card-container {
        position: relative;
        width: 420px;
        height: 480px;
        perspective: 1000px;
        transform-style: preserve-3d;
    }
    
    .login-container,
    .register-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 50px 40px 30px;
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.95);
        backface-visibility: hidden;
        transition: all 0.6s ease;
    }
    
    .register-container {
        transform: rotateY(180deg);
        z-index: 0;
        height: auto;
    }
    
    .card-container.show-register {
        .login-container {
            transform: rotateY(-180deg);
        }
        
        .register-container {
            transform: rotateY(0);
            z-index: 1;
        }
    }
    
    .form-title {
        text-align: center;
        font-size: 24px;
        color: #303133;
        margin-bottom: 30px;
        font-weight: 600;
    }

    .lang-switch {
        position: absolute;
        top: 15px;
        right: 15px;

        select {
            padding: 8px 10px;
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

    .login-btn,
    .register-btn {
        width: 100%;
        height: 48px;
        font-size: 16px;
        margin-top: 10px;
    }
    
    .form-footer {
        margin-top: 20px;
        text-align: center;
        color: #606266;
        
        .el-button--text {
            padding: 0 5px;
            font-weight: 500;
        }
    }
}

/* 输入框样式 */
.el-input__wrapper {
    height: 48px;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    transition: all 0.3s;
}

.el-input__inner {
    height: 48px;
}

.el-input__prefix {
    left: 16px;
    font-size: 18px;
    color: #999;
}

/* 聚焦状态 */
.el-input__wrapper.is-focus {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2) !important;
}

/* 错误提示样式 */
.el-form-item__error {
    padding-left: 16px;
    font-size: 12px;
}
</style>