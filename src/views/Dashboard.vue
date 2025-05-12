<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>系统概览</h2>
      <div class="date-picker">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
      </div>
    </div>
    
    <!-- 顶部卡片统计 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(item, index) in statCards" :key="index">
          <el-card shadow="hover" class="stat-card" :class="item.type">
            <div class="card-body">
              <div class="card-icon">
                <i :class="item.icon"></i>
              </div>
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-value">{{ item.value }}</div>
                <div class="card-footer">
                  <span :class="item.trend > 0 ? 'up' : 'down'">
                    {{ Math.abs(item.trend) }}% 
                    <i :class="item.trend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                  </span>
                  <span class="period">较上周</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-container">
      <el-row :gutter="20">
        <!-- 销售趋势图 -->
        <el-col :span="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>销售趋势</span>
                <el-radio-group v-model="salesTrendType" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">全年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart" ref="salesTrendChartRef"></div>
          </el-card>
        </el-col>
        
        <!-- 访问来源占比 -->
        <el-col :span="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>访问来源</span>
              </div>
            </template>
            <div class="chart" ref="sourcePieChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 最近订单列表 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>最近订单</span>
                <el-button type="text" @click="viewAllOrders">查看全部</el-button>
              </div>
            </template>
            <el-table :data="recentOrders" stripe style="width: 100%">
              <el-table-column prop="id" label="订单号" width="250"></el-table-column>
              <el-table-column prop="customer" label="客户名称"></el-table-column>
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="{ row }">
                  ¥{{ row.amount.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 地区销售分布 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>地区销售分布</span>
              </div>
            </template>
            <div class="chart" ref="regionMapChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 产品销量排行 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>产品销量排行</span>
              </div>
            </template>
            <div class="chart" ref="productRankChartRef"></div>
          </el-card>
        </el-col>
        
        <!-- 实时监控 -->
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>系统实时监控</span>
                <el-button size="small" type="primary" @click="refreshMonitor">刷新</el-button>
              </div>
            </template>
            <div class="monitor-container">
              <div class="monitor-item">
                <div class="item-label">CPU使用率</div>
                <el-progress :percentage="systemMonitor.cpu" :color="cpuProgressColor"></el-progress>
              </div>
              <div class="monitor-item">
                <div class="item-label">内存使用率</div>
                <el-progress :percentage="systemMonitor.memory" :color="memoryProgressColor"></el-progress>
              </div>
              <div class="monitor-item">
                <div class="item-label">磁盘使用率</div>
                <el-progress :percentage="systemMonitor.disk" :color="diskProgressColor"></el-progress>
              </div>
              <div class="monitor-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ systemMonitor.onlineUsers }}</div>
                  <div class="stat-label">在线用户</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ systemMonitor.qps }}次/秒</div>
                  <div class="stat-label">QPS</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ systemMonitor.responseTime }}ms</div>
                  <div class="stat-label">响应时间</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, computed, watch } from 'vue';
// 直接使用导入语句，不使用命名空间导入，避免类型声明问题
import { init, use, ECharts } from 'echarts/core';
import { BarChart, LineChart, PieChart, MapChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import homeApi from '@/api/home.js'
// 注册必要的组件
use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  CanvasRenderer,
  VisualMapComponent
]);

// 图表颜色预设
const colorPalette = {
  primary: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
  pie: {
    '直接访问': '#5470c6',
    '搜索引擎': '#91cc75',
    '邮件营销': '#fac858',
    '联盟广告': '#ee6666',
    '社交媒体': '#73c0de'
  }
};

export default defineComponent({
  name: 'Dashboard',
  setup() {
    // 日期选择器
    const dateRange = ref<Date[]>([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]);
    
    // 统计卡片数据
    const statCards = ref([
      {
        title: '总销售额',
        value: '¥126,560',
        icon: 'el-icon-s-goods',
        type: 'primary',
        trend: 12.5
      },
      {
        title: '今日订单',
        value: '835',
        icon: 'el-icon-s-order',
        type: 'success',
        trend: 3.2
      },
      {
        title: '用户总数',
        value: '12,843',
        icon: 'el-icon-user',
        type: 'info',
        trend: 6.8
      },
      {
        title: '访问量',
        value: '4,521',
        icon: 'el-icon-view',
        type: 'warning',
        trend: -2.5
      }
    ]);
    
    // 销售趋势图类型
    const salesTrendType = ref('week');
    
    // 近期订单
    const recentOrders = ref([
      { id: 'ORD-2023001', customer: '张三', amount: 1256.00, status: '已完成' },
      { id: 'ORD-2023002', customer: '李四', amount: 895.50, status: '处理中' },
      { id: 'ORD-2023003', customer: '王五', amount: 2430.00, status: '待付款' },
      { id: 'ORD-2023004', customer: '赵六', amount: 1782.60, status: '已完成' },
      { id: 'ORD-2023005', customer: '钱七', amount: 3654.00, status: '已发货' }
    ]);
    
    // 系统监控数据
    const systemMonitor = reactive({
      cpu: 45,
      memory: 62,
      disk: 28,
      onlineUsers: 238,
      qps: 126,
      responseTime: 42
    });

    // 颜色计算 - 使用标准进度条颜色
    const getProgressColor = (percentage: number) => {
      if (percentage < 30) return '#67C23A';
      if (percentage < 70) return '#E6A23C';
      return '#F56C6C';
    };
    
    const cpuProgressColor = computed(() => getProgressColor(systemMonitor.cpu));
    const memoryProgressColor = computed(() => getProgressColor(systemMonitor.memory));
    const diskProgressColor = computed(() => getProgressColor(systemMonitor.disk));
    
    // 获取状态标签类型
    const getStatusType = (status: string) => {
      const statusMap: Record<string, string> = {
        '已完成': 'success',
        '处理中': 'primary',
        '待付款': 'warning',
        '已发货': 'info'
      };
      return statusMap[status] || '';
    };
    
    // 刷新系统监控
    const refreshMonitor = () => {
      systemMonitor.cpu = Math.floor(Math.random() * 50) + 30;
      systemMonitor.memory = Math.floor(Math.random() * 40) + 40;
      systemMonitor.disk = Math.floor(Math.random() * 30) + 20;
      systemMonitor.onlineUsers = Math.floor(Math.random() * 300) + 150;
      systemMonitor.qps = Math.floor(Math.random() * 200) + 50;
      systemMonitor.responseTime = Math.floor(Math.random() * 60) + 30;
    };
    
    // 图表DOM引用
    const salesTrendChartRef = ref<HTMLElement | null>(null);
    const sourcePieChartRef = ref<HTMLElement | null>(null);
    const regionMapChartRef = ref<HTMLElement | null>(null);
    const productRankChartRef = ref<HTMLElement | null>(null);

    // 图表实例对象
    const charts = reactive<Record<string, ECharts | null>>({
      salesTrend: null,
      sourcePie: null,
      regionMap: null,
      productRank: null
    });
    
    // 图表数据
    const chartData = reactive({
      // 销售趋势数据 - 根据周/月/年获取
      salesTrend: {
        week: {
          xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          sales: [5200, 4900, 7000, 8300, 9500, 11400, 14250],
          orders: [120, 112, 145, 163, 178, 190, 210]
        },
        month: {
          xAxis: Array.from({length: 30}, (_, i) => `${i+1}日`),
          sales: Array.from({length: 30}, () => Math.floor(Math.random() * 10000) + 2000),
          orders: Array.from({length: 30}, () => Math.floor(Math.random() * 100) + 80)
        },
        year: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          sales: [85000, 78000, 92000, 105000, 120000, 135000, 148000, 156000, 168000, 179000, 195000, 210000],
          orders: [1850, 1720, 2100, 2380, 2780, 3100, 3350, 3500, 3720, 3950, 4200, 4500]
        }
      },
      
      // 访问来源数据
      sourcePie: [
        { value: 335, name: '直接访问' },
        { value: 580, name: '搜索引擎' },
        { value: 140, name: '邮件营销' },
        { value: 220, name: '联盟广告' },
        { value: 410, name: '社交媒体' }
      ],
      
      // 地区销售数据
      regionMap: [
        { name: '北京', value: 9800 },
        { name: '上海', value: 8900 },
        { name: '广州', value: 8200 },
        { name: '深圳', value: 7600 },
        { name: '杭州', value: 6800 },
        { name: '南京', value: 6300 },
        { name: '武汉', value: 5800 },
        { name: '成都', value: 5600 }
      ],
      
      // 产品销量数据
      productRank: [
        { name: '产品A', value: 320 },
        { name: '产品B', value: 302 },
        { name: '产品C', value: 284 },
        { name: '产品D', value: 263 },
        { name: '产品E', value: 224 },
        { name: '产品F', value: 190 },
        { name: '产品G', value: 152 },
        { name: '产品H', value: 120 }
      ]
    });
    
    // 初始化销售趋势图
    const initSalesTrendChart = () => {
      if (!salesTrendChartRef.value) return;
      
      charts.salesTrend = init(salesTrendChartRef.value);
      
      const data = chartData.salesTrend[salesTrendType.value];
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['销售额', '订单量'],
          right: 10,
          top: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '50px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.xAxis
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额',
            axisLabel: { formatter: '{value} 元' }
          },
          {
            type: 'value',
            name: '订单量',
            axisLabel: { formatter: '{value} 单' }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: data.sales
          },
          {
            name: '订单量',
            type: 'line',
            yAxisIndex: 1,
            data: data.orders
          }
        ]
      };
      
      charts.salesTrend.setOption(option);
    };
    
    // 初始化访问来源图
    const initSourcePieChart = () => {
      if (!sourcePieChartRef.value) return;
      
      charts.sourcePie = init(sourcePieChartRef.value);
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: chartData.sourcePie.map(item => item.name)
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: { show: false },
            data: chartData.sourcePie.map(item => ({
              ...item,
              itemStyle: {
                color: colorPalette.pie[item.name as keyof typeof colorPalette.pie]
              }
            })),
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: () => Math.random() * 200
          }
        ]
      };
      
      charts.sourcePie.setOption(option);
    };
    
    // 初始化地区销售分布图
    const initRegionMapChart = () => {
      if (!regionMapChartRef.value) return;
      
      charts.regionMap = init(regionMapChartRef.value);
      
      const option = {
        title: {
          text: '各地区销售额',
          left: 'center',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: '{b}: {c}元'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '40px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.regionMap.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '销售额',
          axisLabel: { formatter: '{value}元' }
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: chartData.regionMap.map(item => item.value),
            itemStyle: {
              color: function(params: any) {
                return colorPalette.primary[params.dataIndex % colorPalette.primary.length];
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}'
            },
            animationDelay: (idx: number) => idx * 100
          }
        ]
      };
      
      charts.regionMap.setOption(option);
    };
    
    // 初始化产品销量排行图
    const initProductRankChart = () => {
      if (!productRankChartRef.value) return;
      
      charts.productRank = init(productRankChartRef.value);
      
      // 排序数据
      const sortedData = [...chartData.productRank].sort((a, b) => b.value - a.value);
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '10px',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: { formatter: '{value}件' }
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(item => item.name),
          axisLabel: { fontSize: 12 }
        },
        series: [
          {
            name: '销量',
            type: 'bar',
            data: sortedData.map(item => item.value),
            itemStyle: {
              color: function(params: any) {
                return colorPalette.primary[params.dataIndex % colorPalette.primary.length];
              }
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c}件'
            },
            animationDuration: 1500,
            animationEasing: 'elasticOut'
          }
        ]
      };
      
      charts.productRank.setOption(option);
    };
    
    // 更新销售趋势图数据
    const updateSalesTrendChart = () => {
      if (!charts.salesTrend) return;
      
      const data = chartData.salesTrend[salesTrendType.value];
      charts.salesTrend.setOption({
        xAxis: { data: data.xAxis },
        series: [
          { data: data.sales },
          { data: data.orders }
        ]
      });
    };
    
    // 监听销售趋势类型变化
    watch(salesTrendType, updateSalesTrendChart);
    
    // 初始化所有图表
    const initAllCharts = () => {
      try {
        initSalesTrendChart();
        initSourcePieChart();
        initRegionMapChart();
        initProductRankChart();
      } catch (error) {
        console.error('图表初始化错误:', error);
      }
    };
    
    // 页面加载时初始化图表
    onMounted(() => {
      // 延迟初始化图表，确保DOM已渲染
      setTimeout(initAllCharts, 300);
      
      // 监听窗口大小变化，重绘图表
      window.addEventListener('resize', () => {
        Object.values(charts).forEach(chart => chart?.resize());
      });


      // 获取list数据
      getListData();
    });
    

    const getListData = () => {
      console.log('获取list数据');
      homeApi.getListData().then(res => {
        console.log(res);
      });
      
    };

    // 查看所有订单
    const viewAllOrders = () => {
      console.log('查看所有订单');
      // 跳转到订单页面
    };
    
    // 处理日期变化
    const handleDateChange = () => {
      // 可以添加更新图表数据的逻辑
      console.log('日期范围变化:', dateRange.value);
    };
    
    return {
      dateRange,
      statCards,
      salesTrendType,
      recentOrders,
      systemMonitor,
      cpuProgressColor,
      memoryProgressColor,
      diskProgressColor,
      getStatusType,
      refreshMonitor,
      viewAllOrders,
      handleDateChange,
      // 导出图表DOM引用
      salesTrendChartRef,
      sourcePieChartRef,
      regionMapChartRef,
      productRankChartRef
    };
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.stat-card .card-body {
  display: flex;
  padding: 20px;
}

.stat-card .card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 28px;
  color: #fff;
}

.stat-card.primary .card-icon {
  background-color: #409eff;
}

.stat-card.success .card-icon {
  background-color: #67c23a;
}

.stat-card.info .card-icon {
  background-color: #909399;
}

.stat-card.warning .card-icon {
  background-color: #e6a23c;
}

.card-content {
  flex: 1;
}

.card-title {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #303133;
}

.card-footer {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.card-footer .up {
  color: #67c23a;
  margin-right: 5px;
}

.card-footer .down {
  color: #f56c6c;
  margin-right: 5px;
}

.card-footer .period {
  color: #909399;
}

.chart-card {
  margin-bottom: 0;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 300px;
}

.monitor-container {
  padding: 10px;
}

.monitor-item {
  margin-bottom: 20px;
}

.item-label {
  margin-bottom: 5px;
  color: #606266;
  font-size: 14px;
}

.monitor-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
