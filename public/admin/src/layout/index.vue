<template>
  <!-- <div v-if="$route.meta.requiresAuth !== true">   
  </div> -->
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside v-if="!isCollapse" width="200px">
      <el-menu :default-active="$route.name" class="el-menu-vertical-demo" @select="handleSelect">
        <el-menu-item index="Dashboard">
          <el-icon>
            <location />
          </el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="DomainSSL">
          <el-icon>
            <goods />
          </el-icon>
          <span>证书管理</span>
        </el-menu-item>
        <el-menu-item index="Users">
          <el-icon>
            <user />
          </el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="Orders">
          <el-icon>
            <document />
          </el-icon>
          <span>订单管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体区域 -->
    <el-container>
      <!-- 头部 -->
      <el-header>
        <el-button @click="toggleCollapse" class="collapse-btn">
          <el-icon>
            <expand v-if="isCollapse" />
            <fold v-else />
          </el-icon>
        </el-button>
        <!-- <h2 style="margin-left: 15px;">{{ headerTitle }}</h2> -->
        <div class="header-right">
          <el-dropdown @command="handleUserCommand">
            <span class="el-dropdown-link">
              管理员 <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Location,
  User,
  Goods,
  Document,
  Expand,
  Fold,
  ArrowDown
} from '@element-plus/icons-vue'

// 数据状态
const isCollapse = ref(false)
// const route = useRoute()
const router = useRouter()

// 计算属性
// const headerTitle = computed(() => {
//   const titles = {
//     Dashboard: '仪表盘',
//     Users: '用户管理',
//     Products: '商品管理',
//     Orders: '订单管理'
//   }
//   return titles[route.name] || '仪表盘'
// })

// 方法
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleSelect = (key) => {
  router.push({ name: key })
}

const handleUserCommand = (command) => {
  if (command === 'logout') {
    // 清除登录状态
    localStorage.removeItem('admin_user')
    // 跳转到登录页
    router.push('/login')
  } else if (command === 'profile') {
    alert('查看个人信息')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  color: #333;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  z-index: 9;
}

.el-aside {
  background-color: #fff;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, .05);
  z-index: 8;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.collapse-btn {
  font-size: 20px;
  padding: 0;
  width: 40px;
  height: 40px;
}

.header-right {
  margin-left: auto;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}

.el-menu {
  border-right: none;
  height: 100%;
}
</style>