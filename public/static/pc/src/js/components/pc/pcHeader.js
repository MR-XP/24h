import React from 'react';
import {Row, Col, Menu} from 'antd';
import {Router, Route, Link, browserHistory} from 'react-router';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

export default class PCHeader extends React.Component {

	render() {

		return (
			<header>
				<Row id="header">
					<Col span={4}></Col>
					<Col span={8}>
						<a href="/" className="logo">
							<img src="./static/pc/src/images/logo.png" alt="logo"/>
						</a>
					</Col>
					<Col span={8}>
						<Menu mode="horizontal">
							<SubMenu title={<span>关于我们</span>}>
							 	<Menu.Item key="setting:1" className="introduce">
									<Link to={`/introduce`}>公司简介</Link>
								</Menu.Item>
							 	<Menu.Item key="setting:3" className="information">
									<Link to={`/information`}>最新资讯</Link>
								</Menu.Item>
						 	</SubMenu>
							<Menu.Item key="jianshen" className="jianshen">
								<Link to={`/fitness`}>智能健身</Link>
							</Menu.Item>
							<Menu.Item key="jiameng" className="jiameng">
								<Link to={`/joinin`}>加盟</Link>
							</Menu.Item>
							<Menu.Item key="shouye" className="shouye">
								<Link to={`/`}>首页</Link>
							</Menu.Item>
						</Menu>
					</Col>
					<Col span={4}></Col>
				</Row>
			</header>
		);
	};
}
