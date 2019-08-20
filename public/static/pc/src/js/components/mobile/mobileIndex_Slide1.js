import React from 'react';
import { Carousel, WingBlank } from 'antd-mobile';

export default class MobileIndexSlide1 extends React.Component{

  render(){
    return (
      <div id="M_index_slide1">
        <Carousel dots className="slide1_carousel">
          <div className="M_slide1">
            <div><img src="./static/pc/src/images/pcIndex_slide2_icon1.png" /></div>
            <div className="wenzi1">24H智能模式</div>
            <div className="wenzi2">365天*24小时营业，扫码入场，自助健身</div>
          </div>
          <div className="M_slide1">
            <div><img src="./static/pc/src/images/pcIndex_slide2_icon2.png" /></div>
            <div className="wenzi1">就近原则</div>
            <div className="wenzi2">500-1000m到店锻炼距离，立 足社区,健身便利</div>
          </div>
          <div className="M_slide1">
            <div><img src="./static/pc/src/images/pcIndex_slide2_icon3.png" /></div>
            <div className="wenzi1">全家共享</div>
            <div className="wenzi2">一人办卡全家享受，带上您的家 一起来健身</div>
          </div>
          <div className="M_slide1">
            <div><img src="./static/pc/src/images/pcIndex_slide2_icon4.png" /></div>
            <div className="wenzi1">滴滴教练模式</div>
            <div className="wenzi2">无需年卡，没有推销，轻触 按钮，线上预约</div>
          </div>
          <div className="M_slide1">
            <div><img src="./static/pc/src/images/pcIndex_slide2_icon5.png" /></div>
            <div className="wenzi1">科学健身</div>
            <div className="wenzi2">根据您的体质报告，为您定制 科学的运动处方</div>
          </div>
        </Carousel>
      </div>
    );
  };
}
