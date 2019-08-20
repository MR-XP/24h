import React, { Component } from 'react';

// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入柱状图
import  'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

export default class PCJoinInBar extends Component {
    componentDidMount() {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main_bar'));
      // 绘制图表
      myChart.setOption({
        tooltip: {
          formatter: {
          }
        },
        xAxis: {
          data: ["A级:100㎡-150㎡", "B级:150㎡-200㎡", "C级:200㎡-300㎡", "D级:定制"],
          name: '面积',
        },
        yAxis: {
          axisLabel: {
            formatter: '{value}万'
          },
          name: '成本',
        },
        series: [{
          type: 'bar',
          data: [30, 50, 80, 100],
          barWidth: '20%',
          itemStyle: {
            color: '#F9A734',
          },
        }]
      });
    }
    render() {
      return (
        <div id="main_bar" style={{ width: '100%', height: 350}}></div>
      );
    }
}
