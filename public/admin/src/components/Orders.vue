<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>订单管理</span>
        <el-button type="primary">新建订单</el-button>
      </div>
    </template>
    
    <el-table :data="orderData" style="width: 100%">
      <el-table-column prop="id" label="订单号" width="180" />
      <el-table-column prop="customer" label="客户" width="180" />
      <el-table-column prop="amount" label="金额" />
      <el-table-column prop="date" label="下单时间" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small">详情</el-button>
          <el-button size="small" type="danger">取消</el-button>
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

const orderData = ref([
  {
    id: 'O20230001',
    customer: '张三',
    amount: '¥299.99',
    date: '2023-01-15',
    status: '已完成'
  },
  {
    id: 'O20230002',
    customer: '李四',
    amount: '¥199.99',
    date: '2023-01-16',
    status: '配送中'
  },
  {
    id: 'O20230003',
    customer: '王五',
    amount: '¥99.99',
    date: '2023-01-17',
    status: '待付款'
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