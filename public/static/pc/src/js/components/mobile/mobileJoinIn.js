import React from 'react';
import {Row, Col} from 'antd';
import {message,Form,Input,Button,Modal, Select, Cascader } from 'antd';

import MobileHeader from './mobileHeader.js';
import MobileFooter from './mobileFooter.js';
import MobileJoinInPie from './mobileJoinIn_Pie.js';

const Option = Select.Option;
const FormItem = Form.Item;
const addr=[];
const provinceData = Object.keys(area0);
const cityData = area0;

class MobileJoinIn extends React.Component{
  constructor() {
		super();
		this.state = {
			visible    : false,
      cities     : cityData[provinceData[0]],
      secondCity : cityData[provinceData[0]][0],
      province   : '北京市',
      city       : '北京市',
		};
	};
  handleProvinceChange(value){
    this.setState({
      cities: cityData[value],
      secondCity: cityData[value][0],
    });
    this.setState({province : value});
  };
  onSecondCityChange(value){
    this.setState({
      secondCity: value,
    });
    this.setState({city : value});
  };

	showModal() {
			this.setState({visible: true});
	};
  onChange(value) {
  };

	handleSubmit(e){
    e.preventDefault();
		var myFetchOptions = {
			method: 'POST'
		};
    message.config({
      top: '30%',
      duration: 2,
    });
		var formData = this.props.form.getFieldsValue();
    fetch('http://qcydj.com/web/index/join', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({
        name     : formData.name,
        phone    : formData.phone,
        province : this.state.province,
        city     : this.state.city,
      })
    })
    .then(response => response.json())
    .then(json => {
      if(json.code==200){
        message.success("提交成功");
        setTimeout(()=>{
          this.setState({visible: false});
        },1000);
      }else{
        message.error(json.message);
      }
    });
	};

  handleOk(){
    this.setState({visible: false});
  }
  handleCancel(){
    this.setState({visible: false});
  }
  render(){
    let {getFieldProps} = this.props.form;
    const provinceOptions = provinceData.map(province => <Option key={province} value={province}>{province}</Option>);
    const cityOptions = this.state.cities.map(city => <Option key={city} value={city}>{city}</Option>);
    return (
      <div id="M_joinin">
        <MobileHeader />
        <div className="M_all_top">
          <div className="first-floor"></div>
          <div className="second-floor">
            <div className="Mobile_cost">
              <span>——</span>
              投资成本
              <span>——</span>
            </div>
            <div className="Mobile_cost-En">LOW INVESTMENT COSTS</div>
            <div className="content">
              <Row>
                <Col span={12} className="col_left">
                  <div className="col-content">
                    <div className="level_box">
                      <div className="level_title">A等级</div>
                      <div className="level_details">30万</div>
                      <div className="level_details">100㎡-150㎡</div>
                      <div className="level_details">首年回报收益50%以上</div>
                      <div className="level_details">后期年化收益30%以上</div>
                      <div className="level_details">季度分红</div>
                    </div>
                  </div>
                </Col>
                <Col span={12} className="col_right">
                  <div className="col-content">
                    <div className="level_box">
                      <div className="level_title">B等级</div>
                      <div className="level_details">50万</div>
                      <div className="level_details">150㎡-200㎡</div>
                      <div className="level_details">首年回报收益50%以上</div>
                      <div className="level_details">后期年化收益30%以上</div>
                      <div className="level_details">季度分红</div>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col span={12} className="col_left">
                  <div className="col-content">
                    <div className="level_box">
                      <div className="level_title">C等级</div>
                      <div className="level_details">80万</div>
                      <div className="level_details">200㎡-300㎡</div>
                      <div className="level_details">首年回报收益50%以上</div>
                      <div className="level_details">后期年化收益30%以上</div>
                      <div className="level_details">季度分红</div>
                    </div>
                  </div>
                </Col>
                <Col span={12} className="col_right">
                  <div className="col-content">
                    <div className="level_box">
                      <div className="level_title">D等级</div>
                      <div className="level_details">定制</div>
                      <div className="level_details">300㎡以上</div>
                      <div className="level_details">定制</div>
                      <div className="level_details">定制</div>
                      <div className="level_details">季度分红</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div >
              <MobileJoinInPie />
            </div>
          </div>
          <div className="third-floor">
            <div className="title">健身房后台SAAS管理系统</div>
            <div className="details">倾城运动·家用互联网从新定义健身房管理，帮助健身房提升运营效率，降低管理成本，深度挖掘会员价值，轻松满足健身房对于运营数据查看、课程安排、私教、会员等业务的一切需求。</div>
            <div className="tubiao">
              <img src="./static/pc/src/images/pcJoinIn_tu2.png" />
            </div>
          </div>
          <div className="fourth-floor">
            <div className="Mobile_cost">
              <span>——</span>
              多元化收入
              <span>——</span>
            </div>
            <div className="Mobile_cost-En">DIVERSIFIED INCOME</div>
            <div className="features">
              <Row>
                <Col span={6} className="tu">
                  <div><img src="./static/pc/src/images/pcJoinIn_card.png" /></div>
                  <div className="title">会籍卡收入</div>
                  <div className="details">共享年卡、月卡、活动卡 等多样化会员体系</div>
                </Col>
                <Col span={6} className="tu">
                  <div><img src="./static/pc/src/images/pcJoinIn_coach.png" /></div>
                  <div className="title">私教收入</div>
                  <div className="details">管家式私教体系,课程种类更丰富,滴滴私教模式可以节省更多人力成本</div>
                </Col>
                <Col span={6} className="tu">
                  <div><img src="./static/pc/src/images/pcJoinIn_course.png" /></div>
                  <div className="title">收费小团课</div>
                  <div className="details">精品收费小团课紧跟市场潮流，包含了减脂,增肌训练营等</div>
                </Col>
                <Col span={6} className="tu">
                  <div><img src="./static/pc/src/images/pcJoinIn_store.png" /></div>
                  <div className="title">倾城商城</div>
                  <div className="details">专业营养师定制的增肌or减脂营养餐、智能化屏幕广告投放,运动装备售卖</div>
                </Col>
              </Row>
            </div>
          </div>
          <div className="fifth-floor">
            <div className="Mobile_cost">
              <span>——</span>
              八大政策支持加盟商
              <span>——</span>
            </div>
            <div className="Mobile_cost-En">EIGHT POLICY SUPPORT</div>
            <div className="support"><img src="./static/pc/src/images/pcJoinIn_support.png" /></div>
          </div>
        </div>
        <div className="sixth-floor">
          <div className="Mobile_cost">
            <span>——</span>
            开店流程
            <span>——</span>
          </div>
          <div className="Mobile_cost-En">SHOP OPENING PROCESS</div>
          <div className="process"><img src="./static/pc/src/images/pcJoinIn_process.png" /></div>
        </div>
        <MobileFooter />
        <Button className="join_btn" onClick={this.showModal.bind(this)}>
          <span>申请</span><br />
          <span>加盟</span>
        </Button>
        <Modal title="JOIN US" wrapClassName="M_joinUs"
          visible={this.state.visible} footer={null}
          onCancel={this.handleCancel} closable={false}
          maskClosable={false}>
					<Form horizontal onSubmit={this.handleSubmit.bind(this)}>
						<FormItem>
							<Input placeholder="请输入您的姓名" {...getFieldProps('name')} required="required" />
						</FormItem>
						<FormItem>
							<Input type="tel" placeholder="请输入您的电话" {...getFieldProps('phone')} required="required" />
						</FormItem>
            <FormItem className="address">
              <Select dropdownClassName="M_provinceSelect" defaultValue={provinceData[0]} onChange={this.handleProvinceChange.bind(this)}>
                {provinceOptions}
              </Select>
              <Select dropdownClassName="M_citySelect" value={this.state.secondCity} onChange={this.onSecondCityChange.bind(this)}>
                {cityOptions}
              </Select>
            </FormItem>
						<Button htmlType="submit" className="submit">提交</Button>
            <Button key="back" className="close" onClick={this.handleCancel.bind(this)}>X</Button>
					</Form>
				</Modal>
      </div>
    );
  };
}
export default MobileJoinIn = Form.create({})(MobileJoinIn);
