import React from 'react';
import {Row, Col, Popover, Button} from 'antd';
import {Link} from 'react-router';

const wechat = (
  <div>
    <div><img src="./static/pc/src/images/pcIndex_qrcode.jpg" /></div>
    <div>关注公众号</div>
  </div>
);
const weibo = (
  <div>
    <div><img src="./static/pc/src/images/weibo_qrcode.png" /></div>
    <div>关注微博</div>
  </div>
);
export default class PCFooter extends React.Component{
  render(){
    return (
      <footer>
        <div id="footer" className="footer">
          <Row className="top">
            <Col span={7}></Col>
            <Col span={10}>
              <Row>
                <Col span={6} className="left">
                  <div className="left-img">
                    <img src="./static/pc/src/images/logo2.png" alt="logo"/>
                  </div>
                </Col>
                <Col span={8} className="middle">
                  <p><Link to={`/problems`}>常见问题&nbsp;&nbsp;FAQ</Link></p>
                  <p><Link to={`/information`}>媒体报道&nbsp;&nbsp;PRESS</Link></p>
                </Col>
                <Col span={10} className="right">
                  <div>电&nbsp;&nbsp;话&nbsp;&nbsp;TEL&nbsp;&nbsp;13811480148</div>
                  <div>
                    <Popover content={wechat} placement="top" trigger="hover" overlayClassName="wechatQrcode">
                      <img src="./static/pc/src/images/wechat.png" />
                    </Popover>
                    <Popover content={weibo} placement="top" trigger="hover" overlayClassName="weiboQrcode">
                      <img src="./static/pc/src/images/weibo.png" />
                    </Popover>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={7}></Col>
          </Row>
          <Row className="bottom">
            <Col span={24}>
              &copy;&nbsp;渝ICP备15010222号-2 保留所有权利.
            </Col>
          </Row>
        </div>
      </footer>
    );
  };
}
