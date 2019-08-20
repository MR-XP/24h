import React from 'react';
import {Row, Col} from 'antd';
import MobileHeader from './mobileHeader.js';
import MobileFooter from './mobileFooter.js';
import MobileIndexSlide1 from './mobileIndex_Slide1.js';
import MobileIndexSlide2 from './mobileIndex_Slide2.js';

export default class MobileIndex extends React.Component{

  render(){

    return (
      <div id="shouye_M">
        <MobileHeader />
        <div className="M_all_top">
          <div className="M_one">
            <div className="M_qrcode">
              <div><img src="./static/pc/src/images/pcIndex_qrcode.jpg" /></div>
              <div className="txt">扫码关注"倾城运动·家"公众号</div>
            </div>
            <div className="M_txt">倾城运动·家 24H智能健身</div>
          </div>
          <div className="M_two">
            <div className="bg_txt">WHY CHOOSE US</div>
            <div className="title">倾城运动·家</div>
            <div className="details">24H智能健身 你身边的健康管家</div>
            <MobileIndexSlide1 />
          </div>
          <MobileIndexSlide2 />
          <div className="M_four">
            <div>
              <p>商务合作 269848741@qq.com</p>
              <p>招商加盟 112703603@qq.com</p>
            </div>
          </div>
        </div>
        <MobileFooter />
      </div>
    );
  };
}
