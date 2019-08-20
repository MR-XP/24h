import React from 'react';
import MobileHeader from './mobileHeader.js';
import MobileFooter from './mobileFooter.js';

import {Row, Col} from 'antd';

export default class MobileIntroduce extends React.Component{
  render(){
    return (
      <div id="M_introduce">
        <MobileHeader />
        <div className="M_all_top">
          <div className="first-floor"></div>
          <div className="second-floor">
            <div className="Mobile_cost">
              <span>——</span>
              公司简介
              <span>——</span>
            </div>
            <div className="Mobile_cost-En">COMPANY PROFILE</div>
            <div className="content">
              <p>重庆恒久倾城网络科技有限公司成立于2015年，总部位于重庆市，健身行业领先的互联网+智能健身创新企业。于2017年8月正式启动“倾城运动·家” 24小时智能健身项目。</p>
              <p>倾城运动·家’是一个线上科技与线下专业完美结合的项目。全程互联网+模式,用户健身同时,实时联网收录用户健身数据,分析用户运动习惯和健身效果。</p>
              <p>倾城运动·家,是全国首家提倡"家庭"理念的24小时智能健身房,主打"家庭共享"智能健身模式,"一人办卡,全家享瘦",倡导用户和家人一同健身,打造有"家的味道"的健身房,让更多的家庭,因为倾城运动·家而改变,让家人,邻居,朋友更亲近。</p>
              <p>倾城运动·家面向全国招募城市合伙人,提供从装修、智能技术支持、培训、推广,到后期管理的一整套完整服务。目前已于多家知名地产商达成战略合作,有望在2019年完成200家加盟直营店。</p>
            </div>
          </div>
          <div className="third-floor">
            <div className="Mobile_cost">
              <span>——</span>
              里程碑
              <span>——</span>
            </div>
            <div className="Mobile_cost-En">MILESTONE</div>
            <div className="content">
              <img src="./static/pc/src/images/pcIntroduce_tu1.png" />
            </div>
          </div>
        </div>
        <MobileFooter />
      </div>
    );
  };
}
