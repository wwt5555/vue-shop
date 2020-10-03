<template>
  <div>
      <!-- 面包屑导航区 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区 -->
      <el-card>
          <!-- 添加分类按钮 -->
          <el-row>
              <el-col>
                  <el-button type="primary">添加分类</el-button>
              </el-col>
          </el-row>
          <!-- 表格 -->
            <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type = "false" :show-index="true" index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template v-slot:isok="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                <!-- 排序 -->
                <template v-slot:order="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template v-slot:opt="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
          <!-- 分页区域 -->
      </el-card>
  </div>
</template>

<script>
export default {
    data() {
        return {
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            //商品分类的数据列表
            catelist: [],
            //总数据条数
            total: 0,
            //为table指定列的定义
            columns:[
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    //表示当前列定义为模板列
                    type: 'template',
                    //表示当前这一列使用的模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    //表示当前列定义为模板列
                    type: 'template',
                    //表示当前这一列使用的模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    //表示当前列定义为模板列
                    type: 'template',
                    //表示当前这一列使用的模板名称
                    template: 'opt'
                }
            ]
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        //获取商品分类数据
        async getCateList(){
            const {data:res} = await this.$http.get('categories',{params: this.queryInfo})
            if(res.meta.status !==200){
                return this.$message.error('获取商品分类失败')
            }
            // console.log(res.data);
            this.catelist = res.data.result
            this.total = res.data.total
        }
    }

}
</script>

<style>

</style>