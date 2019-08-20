import React from 'react';
import MobileHeader from './mobileHeader.js';
import MobileFooter from './mobileFooter.js';

export default class MobileFitness extends React.Component{
  render(){
    return (
      <div id="M_fitness">
        <MobileHeader />
        <div className="M_all_top">
          <div className="first-floor">
            <div className="title">
              <span>智能软件</span>
              <span className="symbol">+</span>
              <span>智能硬件</span>
              <span className="symbol">=</span>
              <span>互联网健身房</span>
            </div>
            <div><img src="./static/pc/src/images/pcFitness_tu1.png" /></div>
          </div>
          <div className="second-floor">
            <div className="title">倾城运动·家 24H智能使用流程</div>
            <div><img src="./static/pc/src/images/pcFitness_tu2.png" /></div>
          </div>
        </div>
        <MobileFooter />
      </div>
    );
  };
}
