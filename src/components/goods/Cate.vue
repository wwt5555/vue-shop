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
                  <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
              </el-col>
          </el-row>
          <!-- 表格 -->
            <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type = "false" :show-index="true" index-text="#" border :show-row-hover="false">
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
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCatesById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
          <!-- 分页区域 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 4, 5, 6]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
      </el-card>
      <!-- 添加分类的对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%" @close="addCateDialogClosed">
        <!-- 添加分类的表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称：" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：">
                <!-- options用来指定数据源
                    props用来指定配置对象 -->
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="{ expandTrigger: 'hover',value: 'cat_id',label: 'cat_name',children: 'children',checkStrictly: true}"
                @change="parentCateChange"
                clearable></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCateInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 删除分类对话框 -->
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
            ],
            //控制添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            //添加分类的表单数据对象
            addCateForm: {
                //将要添加的分类的名称
                cat_name: '',
                //父级分类的Id
                cat_pid: 0,
                //分类的等级
                cat_level: 0
            },
            //添加分类表单的验证规则对象
            addCateFormRules: {
                cat_name: [
                    {required:true,message:'请输入分类名称',trigger:'blur'}
                ]
            },
            //父级分类的列表
            parentCateList: [],
            //选中的父级分类的id数组
            selectedKeys: [],
            //控制编辑分类对话框的显示与隐藏
            editDialogVisible: false,
            //查询到的分类对象
            editForm: {},
            //编辑表单的验证规则对象
            editFormRules: {cat_name: 
            {required:true,message:'请输入分类名称',trigger: 'blur'}}
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
        },
        //监听pagesize的改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        //监听pagenum的改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        //点击按钮显示添加分类对话框
        showAddCateDialog(){
            //先获取父级分类的数据列表
            this.getParentCateList()
            //再展示对话框
            this.addCateDialogVisible = true
        },
        //获取父级分类的数据列表
        async getParentCateList(){
            const {data:res} = await this.$http.get('categories',{params:{type: 2}})
            if(res.meta.status !== 200){
                return this.$message.error('获取父级分类的数据列表失败')
            }
            // console.log(res.data);
            this.parentCateList = res.data
        },
        //选择项发生变化触发这个函数
        parentCateChange(){
            // console.log(this.selectedKeys);
            //如果selectedKeys数组中的length大于0，证明选中了父级分类
            if(this.selectedKeys.length > 0){
                //父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
                //为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            } else {
                //父级分类的id
                this.addCateForm.cat_pid = 0
                //为当前分类的等级赋值
                this.addCateForm.cat_level = 0     
            }
        },
        addCate(){
            // console.log(this.addCateForm);
            this.$refs.addCateFormRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.post('categories',this.addCateForm)
                if(res.meta.status !== 201){
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        //监听关闭对话框的事件，重置表单数据
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        },
        //展示编辑分类对话框
        async showEditDialog(id){
            const{data:res} = await this.$http.get('categories/'+id)
            if(res.meta.status !==200){
                return this.$message.error('获取分类失败')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        //监听编辑分类对话框的关闭事件
        editDialogClosed(){
          this.$refs.editFormRef.resetFields()
        },
        //编辑分类并提交
        editCateInfo(){
            this.$refs.editFormRef.validate(async valid=>{
            if(!valid) return
            //可以发起添加用户的网络请求
            const {data:res} = await this.$http.put('categories/' + this.editForm.cat_id,{
              cat_name: this.editForm.cat_name
            })
            if(res.meta.status !== 200){
              return this.$message.error('更新分类信息失败')
            }
            this.$message.success('更新分类信息成功')
            //隐藏添加的对话框
            this.editDialogVisible = false
            //重新获取用户的列表
            this.getCateList()
        })
        },
        //根据id删除分类
        async removeCatesById(id) {
          //弹框询问用户是否删除数据
          const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(error => error)
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data:res} = await this.$http.delete('categories/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除用户信息失败')
        }
        this.$message.success('删除用户信息成功')
        this.queryInfo.pagenum = 1
        this.getCateList()
        }
    }

}
</script>

<style lang="less" scoped>
.treeTable{
margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>