import React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import {Router,Route,hashHistory} from 'react-router';
import 'antd/dist/antd.css';
import { Button } from 'antd';
import MediaQuery from 'react-responsive';

import PCIndex           from './components/pc/pcIndex.js';

import MobileIndex       from './components/mobile/mobileIndex.js';

class Root extends React.Component{

  render(){
    const PCJoinIn = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/pc/pcJoinIn.js').default)
      },'joinin')
    }
    const PCFitness = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/pc/pcFitness.js').default)
      },'fitness')
    }
    const PCIntroduce = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/pc/pcIntroduce.js').default)
      },'introduce')
    }
    const PCInformation = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/pc/pcInformation.js').default)
      },'information')
    }
    const PCProblems = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/pc/pcProblems.js').default)
      },'problems')
    }

    const MobileJoinIn = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/mobile/mobileJoinIn.js').default)
      },'joinin')
    }
    const MobileFitness = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/mobile/mobileFitness.js').default)
      },'fitness')
    }
    const MobileIntroduce = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/mobile/mobileIntroduce.js').default)
      },'introduce')
    }
    const MobileInformation = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/mobile/mobileInformation.js').default)
      },'information')
    }
    const MobileProblems = (location, cb) => {
      require.ensure([], require => {
        cb(null, require('./components/mobile/mobileProblems.js').default)
      },'problems')
    }

    return (
      //这里替换了之前的 Index，变成了程序的入口
      <div id="myContent">
        <MediaQuery query="(min-device-width: 1224px)">
          <Router history={hashHistory}>
            <Route path="/" component={PCIndex} />
            <Route path="/joinin" getComponent={PCJoinIn} />
            <Route path="/fitness" getComponent={PCFitness} />
            <Route path="/introduce" getComponent={PCIntroduce} />
            <Route path="/information" getComponent={PCInformation} />
            <Route path="/problems" getComponent={PCProblems} />
          </Router>
        </MediaQuery>
        <MediaQuery query="(max-device-width: 1224px)">
          <Router history={hashHistory}>
            <Route path="/" component={MobileIndex} />
            <Route path="/joinin" getComponent={MobileJoinIn} />
            <Route path="/fitness" getComponent={MobileFitness} />
            <Route path="/introduce" getComponent={MobileIntroduce} />
            <Route path="/information" getComponent={MobileInformation} />
            <Route path="/problems" getComponent={MobileProblems} />
          </Router>
        </MediaQuery>
      </div>
    );
  };
}

ReactDOM.render(<Root/>, document.getElementById('mainContainer'));
