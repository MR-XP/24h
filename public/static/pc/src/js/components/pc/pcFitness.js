import React from 'react';
import PCHeader from './pcHeader.js';
import PCFooter from './pcFooter.js';

export default class PCFitness extends React.Component{
  render(){
    return (
      <div id="jianshen">
        <PCHeader></PCHeader>
        <div className="first-floor">
          <div className="title">
            <span>智能软件</span>
            <span className="symbol">+</span>
            <span>智能硬件</span>
            <span className="symbol">=</span>
            <span>互联网健身房</span>
          </div>
          <div><img src="./static/pc/src/images/pcFitness_tu1.png" /></div>
          {/*<div id="advert">
            <div className="bg1">
              <div>
                <img src="./static/pc/src/images/pcFitness_icon01.png" className="icon01" />
                <img src="./static/pc/src/images/pcFitness_icon02.png" className="icon02" />
                <img src="./static/pc/src/images/pcFitness_icon03.png" className="icon03" />
                <img src="./static/pc/src/images/pcFitness_icon04.png" className="icon04" />
                <img src="./static/pc/src/images/pcFitness_icon05.png" className="icon05" />
                <img src="./static/pc/src/images/pcFitness_icon06.png" className="icon06" />
                <img src="./static/pc/src/images/pcFitness_icon07.png" className="icon07" />
                <img src="./static/pc/src/images/pcFitness_icon08.png" className="icon08" />
                <img src="./static/pc/src/images/pcFitness_icon09.png" className="icon09" />
                <img src="./static/pc/src/images/pcFitness_icon10.png" className="icon10" />
                <img src="./static/pc/src/images/pcFitness_icon11.png" className="icon11" />
                <img src="./static/pc/src/images/pcFitness_icon12.png" className="icon12" />
                <img src="./static/pc/src/images/pcFitness_icon13.png" className="icon13" />
                <img src="./static/pc/src/images/pcFitness_icon14.png" className="icon14" />
                <img src="./static/pc/src/images/pcFitness_icon15.png" className="icon15" />
                <img src="./static/pc/src/images/pcFitness_icon16.png" className="icon16" />
              </div>
            </div>
            <div className="bg2">
              <div>
                <span className="icon17">
                  <img src="./static/pc/src/images/pcFitness_icon17.png" />
                </span>
                <span className="icon18">
                  <img src="./static/pc/src/images/pcFitness_icon18.png" />
                </span>
                <span className="icon19">
                  <img src="./static/pc/src/images/pcFitness_icon19.png" />
                </span>
              </div>
            </div>
            <div className="bg3">
              <div className="icon20">
                <img src="./static/pc/src/images/pcFitness_icon20.png" />
              </div>
            </div>
          </div>*/}
        </div>
        <div className="second-floor">
          <div className="title">倾城运动·家24H智能使用流程</div>
          <div><img src="./static/pc/src/images/pcFitness_tu2.png" /></div>
        </div>
        <PCFooter></PCFooter>
      </div>
    );
  };
}
