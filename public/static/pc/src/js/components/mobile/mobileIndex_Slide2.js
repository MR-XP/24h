import React from 'react';
import { Carousel, WingBlank } from 'antd-mobile';

export default class MobileIndexSlide2 extends React.Component{

  render(){
    return (
      <div id="M_index_slide2">
        <Carousel dots className="slide1_carouse2">
          <div className="M_slide2">
            <div className="slide2_bg1">
              <div>HEALTH KEEPER</div>
              <div>ABOUT YOU</div>
            </div>
            <div className="slide2_bg2">
              <div className="phone"><img src="./static/pc/src/images/pcIndex_slide2_phonebg.png" /></div>
              <div className="phone_gif"><img src="./static/pc/src/images/card.gif" /></div>
            </div>
            <div className="slide2_bg3">1秒购卡</div>
            <div className="slide2_bg4">购买任意会员卡，即可开启24H智能健身之旅</div>
            <div className="slide2_bg5">One second purchase card</div>
            <div className="slide2_bg6">Buy any membership card, you can open 24H smart fitness tour</div>
          </div>
          <div className="M_slide2">
            <div className="slide2_bg1">
              <div>HEALTH KEEPER</div>
              <div>ABOUT YOU</div>
            </div>
            <div className="slide2_bg2">
              <div className="phone"><img src="./static/pc/src/images/pcIndex_slide2_phonebg.png" /></div>
              <div className="phone_gif"><img src="./static/pc/src/images/home.gif" /></div>
            </div>
            <div className="slide2_bg3">1人办卡 全家享受</div>
            <div className="slide2_bg4">全国首家"家庭"理念.24h智能健身房,倡导家人一同健身</div>
            <div className="slide2_bg5">One person to do card sharing</div>
            <div className="slide2_bg6">The nation’s first "home" concept 24h smart gym, advocating family members to exercise together.</div>
          </div>
          <div className="M_slide2">
            <div className="slide2_bg1">
              <div>HEALTH KEEPER</div>
              <div>ABOUT YOU</div>
            </div>
            <div className="slide2_bg2">
              <div className="phone"><img src="./static/pc/src/images/pcIndex_slide2_phonebg.png" /></div>
              <div className="phone_gif"><img src="./static/pc/src/images/appt.gif" /></div>
            </div>
            <div className="slide2_bg3">1秒预约</div>
            <div className="slide2_bg4">提供快速约课打卡、健身科普、辅助工具等服务。</div>
            <div className="slide2_bg5">One second reservation</div>
            <div className="slide2_bg6">Provide quick appointment card punching, fitness science, auxiliary tools and other services</div>
          </div>
          <div className="M_slide2">
            <div className="slide2_bg1">
              <div>HEALTH KEEPER</div>
              <div>ABOUT YOU</div>
            </div>
            <div className="slide2_bg2">
              <div className="phone"><img src="./static/pc/src/images/pcIndex_slide2_phonebg.png" /></div>
              <div className="phone_gif"><img src="./static/pc/src/images/coach.gif" /></div>
            </div>
            <div className="slide2_bg3">滴滴私教预约</div>
            <div className="slide2_bg4">全程无推销,轻触按钮,选择教练,即可预约私教</div>
            <div className="slide2_bg5">Didi personal appointments</div>
            <div className="slide2_bg6">No promotion at all, touch the button, choose a coach, you can book a private tutor</div>
          </div>
        </Carousel>
      </div>
    );
  };
}
