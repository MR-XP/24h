import React from 'react';
import ReactDOM from 'react-dom';
import MobileFooter from './mobileFooter.js';
import MobileHeader from './mobileHeader.js';

import {Row, Col, Tabs } from 'antd';
const TabPane = Tabs.TabPane;

export default class MobileProblems extends React.Component{
  render(){
    return (
      <div id="M_problems">
        <MobileHeader />
        <Tabs defaultActiveKey="1">
          <TabPane tab="加盟商" key="1">
            <div className="content">
              <div className="question"><span>1.倾城运动·家健身房与传统健身房的区别在哪里？</span></div>
              <div>
                <p>
                  ①倾城运动·家的核心理念领先同行，
                  为24小时智能健身、1000米就近原则、全家共享会员模式、滴滴私教预约、科学的运动处方，
                  这几大核心督促我们的管理智能化，从会员体验设备、预约课程、选购营养餐、健身辅助设施，
                  到商家排课、监控健身房内安防情况，实时查看运营数据等，都通过智能设备和后台系统实现。
                  而传统健身房有固定营业时间；大多数在商业区，离家远；
                  全程人工服务，推销较多，增加了人力资源成本。
                </p>
                <p>
                  ②倾城运动·家经营成本少，倾城运动·家社区店健身前期只需要1名私教，
                  1名健康管家，1名保洁即可。后期可实现教练的兼职化，人力成本每个月就可以省60%的支出。
                  而传统健身房的人力成本极其高昂，
                  常规配置都有：店长、私教经理、私教、会籍经理、会籍顾问、前台、收银、保洁，
                  每个月除基本工资之外还有额外的提成管理成本。
                </p>
                <p>
                  ③倾城运动·家采用国内领先的互联网+智能健身的模式，
                  首创“一人办卡，全家共享”，打造有”家的味道“的健身房，
                  不但改善用户的身体健康，更是改善用户的心灵健康。
                </p>
              </div>
              <div className="question"><span>2.加盟倾城运动·家健身有什么条件吗？</span></div>
              <div>
                <p>
                  只要您的经营理念符合倾城运动·家健身长期发展规划，我们都欢迎您成为我们的城市合伙人，
                  并且总部会免费提供个性化定制，从选址到装修，从器械订货安装到开业推广，
                  我们提供模块化的标准流程，助您一臂之力。
                </p>
              </div>
              <div className="question"><span>3.从设计到开业需要多长时间？需要提供哪些资料？</span></div>
              <div>
                <p>  ①以350平米健身房为例，3个月左右即可开业；</p>
                <p>②加盟商如已有公司，只需提供公司工商营业执照、开户许可证即可；</p>
                <p>③加盟商如还未注册公司，需先自行办理公司工商营业执照、开户许可证，具体可详询招商部；</p>
                <p>④加盟商也可以在当地工商局成立公司。</p>
              </div>
              <div className="question"><span>4.我之前没有从事过健身行业，可以加盟倾城运动·家健身吗？</span></div>
              <div>
                <p>
                  当然可以！倾城运动·家健身会为加盟商提供全方面的管理运营方案，
                  配有专业顾问从选址指导到预售营销，
                  以及日常运营提供一系列的指导支持。您仅需通过倾城运动·家健身后台管理，
                  即可轻松完成健身房日常管理与维护。
                  我们已经成功帮助多位健身行业零经验的创业者，成功完成跨界创业，
                  经营的业绩甚至比有多年行业经验的加盟商更出色。
                </p>
              </div>
              <div className="question"><span>5.不同的地区，门店售卡如何定价？</span></div>
              <div>
                <p>加盟商和总部根据当地健身市场情况进行调研和分析后，最后评判出合理的售卡定价区间。</p>
              </div>
              <div className="question"><span>6.健身器材出现故障，后期维修有保障吗？</span></div>
              <div className="question1">
                <p>倾城运动·家健身和器械供应商达成战略合作，所有设备均有保修制度，全国联保。</p>
              </div>
            </div>
            <MobileFooter />
          </TabPane>
          <TabPane tab="会员" key="3">
            <div className="content">
              <div className="question"><span>1.会员如何购卡？</span></div>
              <div>
                <p>①线上通过倾城运动·家（公众号：hjqc-dev）健身微信公众号购买会员卡。</p>
                <p>②线下可直接去门店由会籍顾问协助办理会员卡。</p>
              </div>
              <div className="question"><span>2.办一张健身卡需要多少钱？</span></div>
              <div>
                <p>地区不同场馆面积不同，会员卡的价格也略有不同，拿重庆西彭店与贝蒙店为例：</p>
                <p>重庆西彭店120平方米，年卡988元。</p>
                <p>重庆贝蒙店400平方米，年卡1188元。</p>
              </div>
              <div className="question"><span>3.健身房配备的设施有哪些？</span></div>
              <div>
                <p>倾城运动·家大部分健身房目前有：有氧区、器械区、操房、淋浴室、更衣室、休息区、私教区等，基本能满足会员的全部健身需求。</p>
              </div>
              <div className="question"><span>4.团体课是免费的吗？</span></div>
              <div className="question1">
                <p>
                  目前所有倾城运动·家健身会员均可享受免费团操课，
                  但因操房有限所以必需通过公众号提前预约，
                  会员在课前1小时内不可取消预约，如果旷课次数较多，有惩罚制度，
                  特殊情况请留意门店运营公告。
                </p>
              </div>
            </div>
            <MobileFooter />
          </TabPane>

        </Tabs>
      </div>
    );
  };
}
