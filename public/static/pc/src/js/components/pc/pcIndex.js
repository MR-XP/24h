import React from 'react';

import PCHeader from './pcHeader.js';
import PCFooter from './pcFooter.js';
import PCIndexWaves from './pcIndex_Waves.js';

import {Row, Col } from 'antd';

export default class PCIndex extends React.Component{

  componentDidMount(){
    const swiper = new Swiper ('#myswiper', {
      direction: 'vertical',
      slidesPerView: 1,
      spaceBetween: 30,
      mousewheel: true,
      effect: 'fade',
      // 如果需要分页器
      pagination: {
        el: '#myswiper_page',
        clickable: true,
      },
    });
    const myswiper1 = new Swiper('#myswiper1', {
      spaceBetween: 30,
      pagination: {
        el: '#myswiper1_page',
        clickable: true,
      },
    });
  };
  render(){
    return (
      <div id="shouye">
        <div className="swiper-container" id="myswiper">
          <PCHeader />
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <div className="slide1 details">
                <div className="content">
                  <div>倾城运动·家 24H智能健身</div>
                  <div className="qrcode">
                    <div><img src="./static/pc/src/images/pcIndex_qrcode.jpg" /></div>
                    <div className="txt">扫码关注“倾城运动·家”公众号</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="slide2 details">
                <div className="content">
                  <div className="first">WHY CHOOSE US</div>
                  <div className="second">倾城运动·家</div>
                  <div className="third">24H智能健身 你身边的健康管家</div>
                  <Row className="fourth">
                    <Col span={2}></Col>
                    <Col span={20}>
                      <Row>
                        <Col span={2}></Col>
                        <Col span={4} className="fourth_icon">
                          <div><img src="./static/pc/src/images/pcIndex_slide2_icon1.png" /></div>
                          <div className="title">24H智能模式</div>
                          <div className="details">365天*24小时营业，扫码入 场，自助健身</div>
                        </Col>
                        <Col span={4} className="fourth_icon">
                          <div><img src="./static/pc/src/images/pcIndex_slide2_icon2.png" /></div>
                          <div className="title">就近原则</div>
                          <div className="details">500-1000m到店锻炼距离，立 足社区,健身便利</div>
                        </Col>
                        <Col span={4} className="fourth_icon">
                          <div><img src="./static/pc/src/images/pcIndex_slide2_icon3.png" /></div>
                          <div className="title">全家共享</div>
                          <div className="details">一人办卡全家享受，带上您的家 一起来健身</div>
                        </Col>
                        <Col span={4} className="fourth_icon">
                          <div><img src="./static/pc/src/images/pcIndex_slide2_icon4.png" /></div>
                          <div className="title">滴滴教练模式</div>
                          <div className="details">无需年卡，没有推销，轻触 按钮，线上预约</div>
                        </Col>
                        <Col span={4} className="fourth_icon fourth_icon5">
                          <div><img src="./static/pc/src/images/pcIndex_slide2_icon5.png" /></div>
                          <div className="title">科学健身</div>
                          <div className="details">根据您的体质报告，为您定制 科学的运动处方</div>
                        </Col>
                        <Col span={2}></Col>
                      </Row>
                    </Col>
                    <Col span={2}></Col>
                  </Row>
                </div>
                <PCIndexWaves />
              </div>
            </div>
            <div className="swiper-slide">
              <div className="slide3 details">
                <div className="content">
                  <div className="first">
                    <div className="txt_top">HEALTH KEEPER</div>
                    <div className="txt_bottom">AROUND YOU</div>
                  </div>
                  <div className="second">
                    <div className="swiper-container" id="myswiper1">
                      <div className="swiper-wrapper" id="pcIndex_Slide3">
                        <div className="swiper-slide">
                          <Row className="myswiper1_img">
                            <Col span={4}></Col>
                            <Col span={8} className="left">
                                <div className="features">
                                  <div className="first_line"><span>1</span>秒购卡</div>
                                  <div className="second_line">购买任意一张会员卡，即可开启24H智能健身之旅second</div>
                                  <div className="third_line">One second purchase card</div>
                                  <div className="fourth_line">Buy any membership card, you can open 24H smart fitness tour</div>
                                </div>
                            </Col>
                            <Col span={8} className="right">
                              <div className="phone">
                                <img src="./static/pc/src/images/card.gif" />
                              </div>
                            </Col>
                            <Col span={4}></Col>
                          </Row>
                        </div>
                        <div className="swiper-slide">
                          <Row className="myswiper1_img">
                            <Col span={4}></Col>
                            <Col span={8} className="left">
                                <div className="features">
                                  <div className="first_line"><span>1</span>人办卡 全家享受</div>
                                  <div className="second_line">全国首家提倡"家庭"理念的24小时智能健身房,倡导用户和家人一同健身,打造有"家的味道"的健身房</div>
                                  <div className="third_line">One person to do card sharing</div>
                                  <div className="fourth_line">The first 24-hour smart gym that promotes the concept of "home" in the country and advocates users and their families to work together to create a "home taste" gym</div>
                                </div>
                            </Col>
                            <Col span={8} className="right">
                              <div className="phone">
                                <img src="./static/pc/src/images/home.gif" />
                              </div>
                            </Col>
                            <Col span={4}></Col>
                          </Row>
                        </div>
                        <div className="swiper-slide">
                          <Row className="myswiper1_img">
                            <Col span={4}></Col>
                            <Col span={8} className="left">
                                <div className="features">
                                  <div className="first_line"><span>1</span>秒预约</div>
                                  <div className="second_line">为会员提供快速约课打卡、健身科普、辅助工具等多样服务</div>
                                  <div className="third_line">1 second reservation</div>
                                  <div className="fourth_line">Provide members with various services such as quick appointment card punching, fitness science, auxiliary tools, etc., and upgrade their all-round sports experience.</div>
                                </div>
                            </Col>
                            <Col span={8} className="right">
                              <div className="phone">
                                <img src="./static/pc/src/images/appt.gif" />
                              </div>
                            </Col>
                            <Col span={4}></Col>
                          </Row>
                        </div>
                        <div className="swiper-slide">
                          <Row className="myswiper1_img">
                            <Col span={4}></Col>
                            <Col span={8} className="left">
                                <div className="features">
                                  <div className="first_line">滴滴私教预约</div>
                                  <div className="second_line">全程无推销,轻触按钮，即可预约私教，您只需要轻触按钮,选择心仪的教练,剩下的由倾城运动·家替您完成</div>
                                  <div className="third_line">Didi personal appointments</div>
                                  <div className="fourth_line">There is no promotion at all, and you can book a private tutor with a touch of a button. You only need to touch the button to select the coach of your choice. The rest is done by Allure Sports.</div>
                                </div>
                            </Col>
                            <Col span={8} className="right">
                              <div className="phone">
                                <img src="./static/pc/src/images/coach.gif" />
                              </div>
                            </Col>
                            <Col span={4}></Col>
                          </Row>
                        </div>
                      </div>
                      <div className="swiper-pagination" id="myswiper1_page"></div>
                    </div>
                  </div>
                  <div className="third">
                    <Row>
                      <Col span={4}></Col>
                      <Col span={16}>
                        <div><img src="./static/pc/src/images/pcIndex_qrcode.jpg" /></div>
                        <div>微信关注倾城运动·家</div>
                        <div>注册就送体验卡一张</div>
                      </Col>
                      <Col span={4}></Col>
                    </Row>
                  </div>
                </div>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="slide5 details">
                <div className="txt">
                  <div>商务合作 269848741@qq.com</div>
                  <div>招商加盟 112703603@qq.com</div>
                </div>
                <PCFooter></PCFooter>
              </div>
            </div>
          </div>
          <div className="swiper-pagination" id="myswiper_page"></div>
        </div>
      </div>
    );
  };
}
