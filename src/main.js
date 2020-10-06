import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
//导入字体图标
import './assets/font_2104322_w3bpmaxjjcn/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://47.101.61.134:12345/api/private/v1/'
axios.interceptors.request.use(config => {
//   console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config
  return config
})
Vue.prototype.$http = axios 
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

Vue.config.productionTip = false
Vue.component('tree-table',TreeTable)
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getDay() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
