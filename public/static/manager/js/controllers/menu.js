'use strict';

app.controller('menuController', ['$scope', '$state','$location','$filter','$http',
                         function($scope, $state,$location,$filter,$http) {
	
	$scope.txt='菜单配置';
	
	
	//菜单配置
	$scope.menu={

	    "menu": {
	        "button": [
	            {
	                "name": "我要健身", 
	                "sub_button": [
	                 
/*		                {
		                    "type": "scancode_push", 
		                    "name": "扫码开门", 
		                    "key": "rselfmenu_0_1", 
		                    "sub_button": [ ]
		                },
*/
	                    {
	                        "type": "view", 
	                        "name": "课程预约", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=1", 
	                        "sub_button": [ ]
	                    }, 
	                    {
	                        "type": "view", 
	                        "name": "私教预约", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=2", 
	                        "sub_button": [ ]
	                    }, 
	                   	{
	                        "type": "view", 
	                        "name": "门店列表", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=3", 
	                        "sub_button": [ ]
	                    },
	                    {
	                        "type": "view", 
	                        "name": "新人指南", 
	                        "url": "http://mp.weixin.qq.com/mp/homepage?__biz=MzU2MTAzMzM5Mw==&hid=1&sn=e17b43a69eb477bea4b18519b3bb5c28#wechat_redirect", 
	                        "sub_button": [ ]
	                    }
	                ]
	            },
	            {
	                "name": "立即购卡", 
	                "sub_button": [
	                    {
	                        "type": "view", 
	                        "name": "购卡", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=4", 
	                        "sub_button": [ ]
	                    }, 
	                    {
	                        "type": "view", 
	                        "name": "私人教练", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=5", 
	                        "sub_button": [ ]
	                    },
	                    {
	                        "type": "view", 
	                        "name": "福利活动", 
	                        "url": "http://mp.weixin.qq.com/mp/homepage?__biz=MzU2MTAzMzM5Mw==&hid=3&sn=5d3653dcb66908b9125f7614bc8d2904#wechat_redirect", 
	                        "sub_button": [ ]
	                    },
/*	                    {
	                        "type": "click", 
	                        "name": "邀请有礼", 
	                        "url": "", 
	                        "sub_button": [ ]
	                    },*/
	                    {
	                        "type": "view", 
	                        "name": "特价商品", 
	                        "url": "http://mp.weixin.qq.com/mp/homepage?__biz=MzU2MTAzMzM5Mw==&hid=2&sn=9c2d5cd94f77f4459a1316fa52cbeea0#wechat_redirect", 
	                        "sub_button": [ ]
	                    }
/*	                    {
	                        "type": "view", 
	                        "name": "免费健身申请", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=7", 
	                        "sub_button": [ ]
	                    }*/
	                ]
	            },
	            {
	                "name": "家", 
	                "sub_button": [
	                	{
	                        "type": "view", 
	                        "name": "运动轨迹", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=10", 
	                        "sub_button": [ ]
	                    },
	                	{
	                        "type": "view", 
	                        "name": "品牌故事", 
	                        "url": "https://mp.weixin.qq.com/s/tgO3PwHZZXZq6k3b2tr0mg", 
	                        "sub_button": [ ]
	                   	},
	                   	{
	                        "type": "view", 
	                        "name": "合伙人加盟", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=9", 
	                        "sub_button": [ ]
	                    },
	                   	{
	                        "type": "view", 
	                        "name": "个人中心", 
	                        "url": "http://qcyd.24h.51dong.cc", 
	                        "sub_button": [ ]
	                    }
/*	                    {
	                        "type": "view", 
	                        "name": "教练招募", 
	                        "url": "http://qcyd.24h.51dong.cc/index/index/redirecturl?id=8", 
	                        "sub_button": [ ]
	                    }, 
*/	                    
	                ]
	            }
	        ]
	    }

	}
	
	
    $http({
        method: 'POST',
        url:window.base_url+'/manager/merchant/menu',
        data: {
			data	:	$scope.menu
    	}
    }).success(function(data){
		
    }).error( function(data){
        layer.msg('服务器访问失败！', {icon: 2});
    });
	
}]);