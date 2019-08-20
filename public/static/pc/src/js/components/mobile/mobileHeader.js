import React from 'react';
import {Router, Route, Link, browserHistory} from 'react-router';
import {Row, Col, Menu, Dropdown, Icon} from 'antd';

const menu = (
	<Menu className="menu_M">
		<Menu.Item key="0">
			<Link to={`/`}>首页</Link>
		</Menu.Item>
		<Menu.Item key="1">
			<Link to={`/joinin`}>加盟</Link>
		</Menu.Item>
		<Menu.Item key="2">
			<Link to={`/fitness`}>智能健身</Link>
		</Menu.Item>
		<Menu.Item key="3">
			<Link to={`/introduce`}>公司简介</Link>
		</Menu.Item>
		<Menu.Item key="4">
			<Link to={`/information`}>最新资讯</Link>
		</Menu.Item>
	</Menu>
);

export default class MobileHeader extends React.Component {
	constructor(){
		super();
	};

	render() {
		return (
			<header id="header_M">
				<Row>
					<Col span={12} className="left">
						<img src="./static/pc/src/images/M_logo.png" alt="logo"/>
					</Col>
					<Col span={12} className="right">
						<Dropdown overlay={menu} trigger={['click']}>
							<img src="./static/pc/src/images/M_menu.png" alt="logo"/>
						</Dropdown>
					</Col>
				</Row>
			</header>
		);
	};
}
