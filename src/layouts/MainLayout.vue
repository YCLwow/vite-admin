<template>
    <div class="main-layout">
      <!-- 侧边栏 (支持响应式折叠) -->
      <div class="sidebar-mask" v-if="isMobile && !isCollapse" @click="toggleSidebar"></div>
      <el-aside 
        class="sidebar-container"
        :class="{ 'collapse': isCollapse, 'mobile': isMobile }"
        :style="{ width: isCollapse ? '64px' : '240px' }"
      >
        <!-- Logo 区域 -->
        <div class="logo-wrapper" @click="router.push('/')">
          <!-- <img src="@/assets/logo.png" class="logo" alt="logo"> -->
          <span v-show="!isCollapse" class="logo-text">admin编辑器</span>
        </div>
  
        <!-- 导航菜单 -->
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          router
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
  
          <el-sub-menu index="user-management">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/users">用户列表</el-menu-item>
            <el-menu-item index="/roles">角色管理</el-menu-item>
          </el-sub-menu>
  
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/settings">基本设置</el-menu-item>
            <el-menu-item index="/logs">操作日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
  
      <!-- 主内容区域 -->
      <div class="main-container" :class="{ 'collapse': isCollapse }">
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleSidebar">
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="item in breadcrumb" :key="item.path">
                {{ item.meta.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-dropdown>
              <div class="user-info">
                <el-avatar :size="30" src="@/assets/avatar.png" />
                <span class="username">管理员</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
  
        <!-- 页面内容 -->
        <div class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watchEffect } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import {
    HomeFilled,
    User,
    Setting,
    Fold,
    Expand,
    ArrowDown
  } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  
  // 响应式状态
  const isCollapse = ref(false)
  const isMobile = ref(false)
  
  // 计算当前激活菜单
  const activeMenu = computed(() => route.path)
  
  // 面包屑导航
  const breadcrumb = computed(() => {
    return route.matched.filter(item => item.meta?.title)
  })
  
  // 切换侧边栏
  const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
    if (isMobile.value) {
      document.body.classList.toggle('lock-scroll')
    }
  }
  
  // 响应式处理
  const checkMobile = () => {
    const rect = document.body.getBoundingClientRect()
    isMobile.value = rect.width < 768
    isCollapse.value = isMobile.value
  }
  
  // 监听窗口变化
  window.addEventListener('resize', checkMobile)
  checkMobile() // 初始化检测
  
  // 退出登录
  const logout = () => {
    // 这里添加退出逻辑
    router.push('/login')
  }
  </script>
  
  <style scoped lang="scss">
  .main-layout {
    height: 100vh;
    display: flex;
  
    .sidebar-container {
      background-color: #304156;
      transition: width 0.3s;
      height: 100vh;
      
      &.collapse {
        :deep(.el-sub-menu__title span) {
          display: none;
        }
      }
  
      .logo-wrapper {
        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        cursor: pointer;
        .logo {
          width: 32px;
          height: 32px;
        }
        .logo-text {
          color: #fff;
          margin-left: 12px;
          font-weight: 600;
        }
      }
  
      :deep(.el-menu) {
        border-right: none;
        background-color: #304156;
        
        .el-menu-item, .el-sub-menu__title {
          color: #bfcbd9;
          
          &:hover {
            background-color: #263445;
          }
          
          &.is-active {
            color: #409EFF;
            background-color: #263445;
          }
        }
      }
    }
  
    .main-container {
      flex: 1;
      overflow: hidden;
      
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0,21,41,.08);
        
        .header-left {
          display: flex;
          align-items: center;
          
          .collapse-btn {
            margin-right: 20px;
            font-size: 20px;
            cursor: pointer;
          }
        }
        
        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;
          .username {
            margin: 0 8px;
          }
        }
      }
  
      .app-main {
        height: calc(100vh - 60px);
        padding: 20px;
        overflow-y: auto;
        background-color: #f0f2f5;
      }
    }
  }
  
  // 移动端样式
  @media screen and (max-width: 768px) {
    .sidebar-container {
      position: fixed !important;
      z-index: 1001;
      left: 0;
      top: 0;
      
      &.collapse {
        left: -240px !important;
      }
    }
    
    .sidebar-mask {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      background: rgba(0,0,0,.5);
    }
  }
  </style>