import React, { Component } from 'react';

// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入饼状图
import  'echarts/lib/chart/pie';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';

export default class PCJoinInPie extends Component {
    componentDidMount() {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main_pie'));
      // 绘制图表
      myChart.setOption({
        title : {
          text: '加盟费用组成',
          left:'center',
          top :'middle',
          textStyle: {
            color: '#323232',
            fontWeight: 'bold',
            fontSize: 12,
          },
        },
        color: ['#EF7340','#F79954','#EEB328','#00A294','#20B6AB'],
        series: [
          {
            name:'加盟费用组成',
            type:'pie',
            radius: ['40%', '55%'],
            labelLine: {
              show : false,
            },
            data:[
              {
                value:0.5,
                name:'工人(1人)',
                label: {
                  normal: {
                    formatter: '{a|{d}%}\n{hr1|}{hr|}\n{a|{b}}',
                    padding: [0, 5],
                    fontSize: 10,
                    rich: {
                      a: {
                        color: '#666',
                        lineHeight: 22,
                        align: 'right'
                      },
                      hr: {
                        borderColor: '#EF7340',
                        width: 80,
                        borderWidth: 0.5,
                        height: 0
                      },
                      hr1: {
                        width: 5,
                        height: 5,
                        backgroundColor:'#EF7340',
                        borderRadius: 2.5,
                      },
                    },
                  }
                },
              },
              {
                value:3,
                name:'装修',
                label: {
                  normal: {
                    formatter: '{a|{d}%}\n{hr1|}{hr|}\n{a|{b}}',
                    padding: [0, 5],
                    fontSize: 10,
                    rich: {
                      a: {
                        color: '#666',
                        lineHeight: 22,
                        align: 'right'
                      },
                      hr: {
                        borderColor: '#F79954',
                        width: 50,
                        borderWidth: 0.5,
                        height: 0
                      },
                      hr1: {
                        width: 5,
                        height: 5,
                        backgroundColor:'#F79954',
                        borderRadius:2.5,
                      },
                    },
                  }
                },
              },
              {
                value:0.5,
                name:'其它',
                label: {
                  normal: {
                    formatter: '{a|{d}%}\n{hr1|}{hr|}\n{a|{b}}',
                    padding: [0, 5],
                    fontSize: 10,
                    rich: {
                      a: {
                        color: '#666',
                        lineHeight: 22,
                        align: 'right'
                      },
                      hr: {
                        borderColor: '#EEB328',
                        width: 70,
                        borderWidth: 0.5,
                        height: 0
                      },
                      hr1: {
                        width: 5,
                        height: 5,
                        backgroundColor:'#EEB328',
                        borderRadius:2.5,
                      },
                    },
                  }
                },
              },
              {
                value:2.5,
                name:'器械',
                label: {
                  normal: {
                    formatter: '{a|{d}%}\n{hr|}{hr1|}\n{a|{b}}',
                    padding: [0, 5],
                    fontSize: 10,
                    rich: {
                      a: {
                        color: '#666',
                        lineHeight: 22,
                        align: 'left'
                      },
                      hr: {
                        borderColor: '#00A294',
                        width: 80,
                        borderWidth: 0.5,
                        height: 0
                      },
                      hr1: {
                        width: 5,
                        height: 5,
                        backgroundColor:'#00A294',
                        borderRadius:2.5,
                      },
                    },
                  }
                },
              },
              {
                value:3.5,
                name:'房租(年)',
                label: {
                  normal: {
                    formatter: '{a|{d}%}\n{hr|}{hr1|}\n{a|{b}}',
                    padding: [0, 5],
                    fontSize: 10,
                    rich: {
                      a: {
                        color: '#666',
                        lineHeight: 22,
                        align: 'left'
                      },
                      hr: {
                        borderColor: '#20B6AB',
                        width: 60,
                        borderWidth: 0.5,
                        height: 0
                      },
                      hr1: {
                        width: 5,
                        height: 5,
                        backgroundColor:'#20B6AB',
                        borderRadius:2.5,
                      },
                    },
                  }
                },
              },
            ]
          }
        ]
      });
    }
    render() {
      return (
        <div id="main_pie" style={{ width: '100%', height: '10rem'}}></div>
      );
    }
}
