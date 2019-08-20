import React from 'react';
import PCHeader from './pcHeader.js';
import PCFooter from './pcFooter.js';

import {Row, Col, Icon } from 'antd';

export default class PCInformation extends React.Component{
  render(){
    return (
      <div id="aboutus_information">
        <PCHeader></PCHeader>
        <div className="first-floor"></div>
        <div className="second-floor">
          <div className="PC_cost">
            <span>——</span>
            最新资讯
            <span>——</span>
          </div>
          <div className="PC_cost-En">LATEST NEWS</div>
          <div className="content">
            <Row>
              <Col span={3}></Col>
              <Col span={18}>
                <Row>
                  <Col span={8} className="news">
                    <a target="_blank" href="http://sports.qianlong.com/2017/1207/2233859.shtml">
                      <div className="thumbnail" >
                        <div className="cover1"></div>
                        <div className="txt">
                          <div className="title">开脑洞 倾城运动·家推出“家庭共享健身”新模式</div>
                          <div className="time">
                            <span><Icon type="clock-circle-o" /> 2017-12-07 10:21 中华网</span>
                            {/*<span><Icon type="eye-o" /> 1890</span>*/}
                          </div>
                        </div>
                      </div>
                    </a>
                  </Col>
                  <Col span={8} className="news">
                    <a target="_blank" href="http://sports.163.com/17/1204/16/D4R0832300050JCM.html">
                      <div className="thumbnail">
                        <div className="cover2"></div>
                        <div className="txt">
                          <div className="title">倾城运动·家 国内首家"家庭"概念智能健身馆来了</div>
                          <div className="time">
                            <span><Icon type="clock-circle-o" /> 2017-12-04 16:56 华龙网</span>
                            {/*<span><Icon type="eye-o" /> 1890</span>*/}
                          </div>
                        </div>
                      </div>
                    </a>
                  </Col>
                  <Col span={8} className="news">
                    <a target="_blank" href="http://sports.sina.com.cn/others/fitness/2017-12-29/doc-ifyqefvw0533405.shtml">
                      <div className="thumbnail">
                        <div className="cover3"></div>
                        <div className="txt">
                          <div className="title">倾城运动•家黑科技 健身领域的互联网智能</div>
                          <div className="time">
                            <span><Icon type="clock-circle-o" /> 2017-12-29 16:54 新浪综合</span>
                            {/*<span><Icon type="eye-o" /> 1890</span>*/}
                          </div>
                        </div>
                      </div>
                    </a>
                  </Col>
                </Row>
              </Col>
              <Col span={3}></Col>
            </Row>
          </div>
        </div>
        <PCFooter></PCFooter>
      </div>
    );
  };
}
