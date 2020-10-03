<template>
  <div>
      <!-- 面包屑导航区 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图 -->
      <el-card>
          <!-- 添加角色按钮区域 -->
          <el-row>
              <el-col>
                  <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
              </el-col>
          </el-row>

          <!-- 角色列表区域 -->
          <el-table :data="rolelist" border stripe>
              <el-table-column type="expand">
                <template v-slot="role">
                  <el-row v-for="(item1,i1) in role.row.children" :key="item1.id" :class="['bdbottom', i1===0 ? 'bdtop' : '','vcenter']">
                    <!-- 一级权限 -->
                    <el-col :span="5" >
                      <el-tag closable @close="removeRightById(role.row,item1.id)">{{item1.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 二级和三级权限 -->
                    <el-col :span="19">
                      <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0 ? '' : 'bdtop', 'vcenter']">
                        <el-col :span="6">
                          <el-tag type="success" closable @close="removeRightById(role.row,item2.id)">{{item2.authName}}</el-tag>
                          <i class="el-icon-caret-right"></i>
                        </el-col>
                        <el-col :span="18">
                          <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRightById(role.row,item3.id)">{{item3.authName}}</el-tag>
                        </el-col>
                      </el-row>
                    </el-col>
                  </el-row>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="角色名称" prop="roleName"></el-table-column>
              <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
              <el-table-column label="操作" width="300">
                  <template v-slot="roles">
                      <!-- 编辑按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(roles.row.id)">编辑</el-button>
                      <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(roles.row.id)">删除</el-button>
                      <!-- 分配权限按钮 -->
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(roles.row)">分配权限</el-button>
                  </template>
              </el-table-column>
          </el-table>
      </el-card>
      <!-- 添加角色的对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addDialogClosed">
        <!-- 内容主体区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc" v-on:keyup.enter.native='addRole'></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色的对话框 -->
      <el-dialog
        title="编辑角色"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc" v-on:keyup.enter.native='editRoleInfo'></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key='id' default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
    data() {
        return {
            rolelist: [],
            //添加角色的表单数据
            addForm: {
                roleName: '',
                roleDesc: ''
            },
            //添加表单的验证规则对象
            addFormRules: {
            roleName: [
                {required:true,message:'请输入角色名称',trigger: 'blur'},
                {min:2,max:10,message:'角色名称的长度在2-10个字符之间',trigger:'blur'}
            ],
            roleDesc: [
                {required:false,message:'请输入角色描述',trigger: 'blur'}
            ]},
            //控制添加角色对话框的显示与隐藏
            addDialogVisible: false,
            //控制修改角色对话框的显示与隐藏
            editDialogVisible: false ,
            //查询到的角色信息对象
            editForm: {},
            //编辑表单的验证规则对象
            editFormRules: {
                roleName: [
                {required:true,message:'请输入角色名称',trigger: 'blur'},
                {min:2,max:10,message:'角色名称的长度在2-10个字符之间',trigger:'blur'}
            ],
            roleDesc: [
                {required:false,message:'请输入角色描述',trigger: 'blur'}
            ]
            },
            //控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            //所有权限的数据
            rightslist: {},
            //树形控件的属性绑定对象
            treeProps: {
              label:'authName',
              children:'children'
            },
            //默认选中的节点id值数组
            defKeys: [],
            //当前即将分配权限的角色的id
            roleId: ''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        async getRolesList(){
            const {data:res} = await this.$http.get('roles')
            if(res.meta.status !== 200){
                return this.$message.error('获取角色列表失败')
            }
            this.rolelist = res.data
            // console.log(this.rolelist);
        },
        //监听添加角色对话框的关闭事件
        addDialogClosed(){
          this.$refs.addFormRef.resetFields()
        },
        //点击按钮，添加新角色
        addRole(){
          this.$refs.addFormRef.validate(async valid=>{
            if(!valid) return
            //可以发起添加角色的网络请求
            const {data:res} = await this.$http.post('roles',this.addForm)
            if(res.meta.status !== 201){
              return this.$message.error('添加角色失败')
            }
            this.$message.success('添加角色成功')
            //隐藏添加的对话框
            this.addDialogVisible = false
            //重新获取角色的列表
            this.getRolesList()
          })
        },
        //展示编辑用户的对话框
        async showEditDialog(id) {
          //console.log(id);
          const{data:res} = await this.$http.get('roles/'+id)
          if(res.meta.status !==200){
            return this.$message.error('查询用户信息失败')
          }
          this.editForm = res.data
          this.editDialogVisible = true
        },
        //监听编辑角色对话框的关闭事件
        editDialogClosed(){
          this.$refs.editFormRef.resetFields()
        },
        //编辑角色信息并提交
        editRoleInfo(){
          this.$refs.editFormRef.validate(async valid=>{
            if(!valid) return
            //可以发起添加角色的网络请求
            const {data:res} = await this.$http.put('roles/' + this.editForm.roleId,{
              roleName:this.editForm.roleName,roleDesc:this.editForm.roleDesc
            })
            if(res.meta.status !== 200){
              return this.$message.error('更新角色信息失败')
            }
            this.$message.success('更新角色信息成功')
            //隐藏添加的对话框
            this.editDialogVisible = false
            //重新获取用户的列表
            this.getRolesList()
        })
        },
        //根据id删除角色信息
        async removeRolesById(id) {
          //弹框询问用户是否删除数据
          const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(error => error)
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data:res} = await this.$http.delete('roles/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除角色信息失败')
        }
        this.$message.success('删除角色信息成功')
        this.getRolesList()
        },
        //根据id删除对应的权限
        async removeRightById(role,rightId) {
          //弹框提示用户是否删除
          const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(error => error)
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
        role.children = res.data
        },
        //展示分配权限的对话框
        async showSetRightDialog(role){
          this.roleId = role.id
          //获取所有权限的数据
          const{data:res} = await this.$http.get('rights/tree')
          if(res.meta.status !== 200){
            return this.$message.error('获取权限数据失败')
          }
          this.rightslist = res.data
          // console.log(this.rightslist);
          //递归获得三级元素节点的id
          this.getLeafKeys(role,this.defKeys)
          this.setRightDialogVisible = true
        },
        //通过递归的形式，获取角色下所有三级权限的id,并保存到defKeys数组中
        getLeafKeys(node,arr){
          if(!node.children) {
            return arr.push(node.id)
          }
          node.children.forEach(item => {
            this.getLeafKeys(item,arr)
          })
        },
        //监听分配权限对话框的关闭事件
        setRightDialogClosed(){
          this.defKeys=[]
        },
        //点击为角色分配权限
        async allotRights(){
          const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
          ]
          // console.log(keys);
          const idStr = keys.join(',')
          const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
          if(res.meta.status !== 200){
            return res.$message.error('分配权限失败')
          }
          this.$message.success('分配权限成功')
          this.getRolesList()
          this.setRightDialogVisible = false
        }
        
    }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>