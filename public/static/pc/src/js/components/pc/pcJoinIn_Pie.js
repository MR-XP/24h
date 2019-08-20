import React, { Component } from 'react';

// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入饼状图
import  'echarts/lib/chart/pie';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';

export default class MobileJoinInPie extends Component {
    componentDidMount() {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main_pie'));
      // 绘制图表
      myChart.setOption({
        title: {
          text: '加盟费用组成',
          left: 0,
          top: '25%',
          textStyle: {
            color: '#323232',
            fontSize: 14,
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b}:({d}%)"
        },
        legend: {
          orient: 'vertical',
          x: 'left',
          top: 'middle',
          data:['工人(1人)','装修','其它水电、易耗品','器械','房租(年)'],
          itemWidth :10,
          itemHeight :10,
        },
        color: ['#EF7340','#F79954','#EEB328','#00A294','#20B6AB'],
        series: [
          {
            name:'加盟费用组成',
            type:'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
    			show: false,
    			position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '20',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value:0.5, name:'工人(1人)'},
              {value:3, name:'装修'},
              {value:0.5, name:'其它水电、易耗品'},
              {value:2.5, name:'器械'},
              {value:3.5, name:'房租(年)'},
            ]
          }
        ]
      });
    }
    render() {
      return (
        <div id="main_pie" style={{ width: '100%', height: 350}}></div>
      );
    }
}
