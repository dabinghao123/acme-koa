<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>域名证书管理</span>
        <el-button type="primary">申请证书</el-button>
      </div>
    </template>
    
    <el-table :data="productData" style="width: 100%">
      <el-table-column prop="primaryDomain" label="域名" width="180" />
      <el-table-column  label="申请方式">
        <template #default="scope">
           <span v-if="scope.row.provider === 'dnsManual'">手动解析</span>
           <span v-else-if="scope.row.provider === 'dnsAccount'">DNS账号</span>
        </template>
      </el-table-column>
      <el-table-column  label="状态">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'ready'" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.status === 'renewing'">正在续签</el-tag>
          <el-tag v-else-if="scope.row.status === 'renewed'">已续签</el-tag>
          <el-tag v-else-if="scope.row.status === 'expired'" type="danger">已过期</el-tag>
          <el-tag v-else-if="scope.row.status === 'failed'">申请失败</el-tag>
          <el-tag v-else-if="scope.row.status === 'init'">未申请</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="organization" label="颁发机构" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="自动续签">
        <template #default="scope">
          <el-switch :disabled="scope.row.provider !== 'dnsAccount'" v-model="scope.row.autoRenew" />
        </template>
      </el-table-column>
      <el-table-column prop="expireDate" label="过期时间" />
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

const productData = ref([
  {
    id: 'P001',
    primaryDomain: '*.dznmi.cn',
    privateKey: 'private.key',
    pem: 'certificate.crt',
    expireDate: '2023-06-01',
    startDate: '2023-01-01',
    description: '证书已过期',
    autoRenew: false, // 是否自动续签 
    provider: 'dnsAccount',  //dnsAccount, dnsManual 
    status: 'ready', // 状态：init, ready, renewing, renewed, expired, failed
    organization: 'letsencrypt', //机构
    updatedAt: '2023-01-01 12:00:00',
    createdAt: '2023-01-01 12:00:00'
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