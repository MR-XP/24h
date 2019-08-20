import React from 'react';
import { Modal } from 'antd';
import {Link} from 'react-router';

const wechat = (
  <div>
    <div><img src="./static/pc/src/images/pcIndex_qrcode.jpg" /></div>
  </div>
);
const weibo = (
  <div>
    <div><img src="./static/pc/src/images/weibo_qrcode.png" /></div>
  </div>
);

export default class MobileFooter extends React.Component{
  constructor() {
    super();
    this.state = {
      visible1    : false,
      visible2    : false,
    };
  };
  showModal1() {
		this.setState({visible1: true});
	};
  handleOk1(){
    this.setState({visible1: false});
  }
  handleCancel1(){
    this.setState({visible1: false});
  }
  showModal2() {
		this.setState({visible2: true});
	};
  handleOk2(){
    this.setState({visible2: false});
  }
  handleCancel2(){
    this.setState({visible2: false});
  }
  render(){
    return (
      <footer id="M_footer">
        <div className="M_top">
          <div><Link to={`/problems`}><span className="txt_title">常见问题</span>FAQ</Link></div>
          <div><Link to={`/information`}><span className="txt_title">媒体报道</span>PRESS</Link></div>
          <div>
            <span className="txt_title attention">关注我们</span>
            <span>新浪微博</span>
            <img onClick={this.showModal1.bind(this)} className="M_weibo_icon" src="./static/pc/src/images/weibo.png" />
            <Modal wrapClassName="vertical-center-modal M_qrcode"
                   closable={false} footer={null}
                   visible={this.state.visible1}
                   onOk={this.handleOk1.bind(this)}
                   onCancel={this.handleCancel1.bind(this)}
            >
              <img className="M_weibo" src="./static/pc/src/images/weibo_qrcode.png" />
            </Modal>
            <span>微信公众号</span>
            <img onClick={this.showModal2.bind(this)} className="M_wechat_icon" src="./static/pc/src/images/wechat.png" />
            <Modal wrapClassName="vertical-center-modal M_qrcode"
                   closable={false} footer={null} closable={false}
                   visible={this.state.visible2}
                   onOk={this.handleOk2.bind(this)}
                   onCancel={this.handleCancel2.bind(this)}
            >
              <img className="M_wechat" src="./static/pc/src/images/pcIndex_qrcode.jpg" />
            </Modal>
          </div>
          <a href="tel:13811480148">
            <div className="phone">加盟电话 13811480148</div>
          </a>
        </div>
        <div className="M_bottom">
          &copy;&nbsp;渝ICP备15010222号-2 保留所有权利.
        </div>
      </footer>
    );
  };
}
