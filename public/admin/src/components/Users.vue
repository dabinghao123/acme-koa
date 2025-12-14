<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>用户管理</span>
        <el-button type="primary">添加用户</el-button>
      </div>
    </template>
    
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small">编辑</el-button>
          <el-button size="small" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        layout="prev, pager, next"
        :total="100"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: center;"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    id: '001',
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员'
  },
  {
    id: '002',
    name: '李四',
    email: 'lisi@example.com',
    role: '编辑者'
  },
  {
    id: '003',
    name: '王五',
    email: 'wangwu@example.com',
    role: '观察者'
  },
  {
    id: '004',
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '编辑者'
  }
])

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`)
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>