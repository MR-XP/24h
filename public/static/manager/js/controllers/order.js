'use strict';

app.controller('orderController', ['$scope', '$state','orderFactory','$filter','$http', function($scope, $state,orderFactory,$filter,$http) {
    
    $scope.txt='订单管理';
    
/*
    orderFactory.get().then(function(data){
        $scope.newOrderList=data.data.list;
    },function(data){

    });*/


	$scope.parmList={

			keyword		: 		'',						//搜索用户名或姓名
			type 		: 		'',						//订单类型  ： 1购卡，2购小团课，3购私教课，4 储值
			status 		: 		'',					    //订单状态  ： 0取消，1正常
			pay_status 	: 		'',					    //支付状态  ： 0未支付 1：已支付 2：已退款
			page_no 	: 		'1',					//当前页数
			page_size 	: 		10,          			//请求条数
			shop_id		:		''						//场馆ID
	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }

	//加载
	$scope.load=function(){
		if($scope.parmList.status==''){
            delete $scope.parmList.status;
        }
        if($scope.parmList.pay_status==''){
            delete $scope.parmList.pay_status;
        }

		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/order/getlist',
	        data: {

	        		type 			:  		$scope.parmList.type,
	        		status 			: 		$scope.parmList.status,
	        		pay_status		: 		$scope.parmList.pay_status,
	        		page_no			: 		$scope.parmList.page_no,
	        		page_size		: 		$scope.parmList.page_size,
	        		keyword 		: 		$scope.parmList.keyword,
	        		shop_id			:		$scope.parmList.shop_id
	        }
	        }).success(function(data){

	            if(data.code==200){
	                  $scope.newOrderList=data.data;
	            }else{
	                  layer.msg(data.message, {icon: 2});
	            }

	        }).error( function(data){
	            layer.msg('服务器访问失败！', {icon: 2});
	    	});
	}
	$scope.load()
	
	//加载场馆
	$scope.loadShop=function(){
		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/shop/search',
	        data: {

					limit	:	0

	        }
	    }).success(function(data){

            if(data.code==200){
                  $scope.shopList=data.data;
            }else{
                  layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	};
	$scope.loadShop();
	
}]);