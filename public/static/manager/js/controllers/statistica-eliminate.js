'use strict';

app.controller('statisticaEliminateController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate','arrDate',
									function($scope, $http, $state,$location,$filter,$stateParams,infoService,formatDate,arrDate) {


	$("#dtBox").DateTimePicker({

		language:'zh-CN',
		defaultDate: new Date(),
		animationDuration:200,
		buttonsToDisplay: [ "SetButton", "ClearButton"],
		clearButtonContent: "取消"

	});

	var Stime=arrDate.get($stateParams.type).substring(0,20);
	var Etime=arrDate.get($stateParams.type).substring(20);


    $scope.txt='消除旷课统计';
    $scope.go=function(){
    	$location.path('app/index');
    };

    $scope.select={

		status       :     1,        //1为正常
		page_no      :     1,        //当前页
		page_size    :     10000,    //每页显示条数

	}
	//加载场馆
	$scope.load1=function(){
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
	$scope.load1();


    $scope.parmList={

		phone  			:    '',                   //手机号查询
		shop_id  		:    '',                   //查询场馆
		type  			:    5,                    //1会员卡，3私教课
		pay_type  	:    '',                   //[] 数组，不传所有。['CASH'] 代购，['WXPAY','ALIPAY','SITEPAY'] 线上
		start_time 	:    Stime,                //开始时间
		end_time    :    Etime,                //结束时间
		page_no 		:    1,                    //当前页
		page_size 	:    12,                   //每页显示条数
		order 			:    'a.pay_time desc',    //排序 a.pay_time desc（降序） or asc（升序） a.price desc or as
		start_day 	:    '',
		end_day 		:    '',
		start_hour	: 	 '',
		end_hour		: 	 ''

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }


	//加载
	$scope.load=function(){

		if($scope.parmList.pay_type==''){
            delete $scope.parmList.pay_type;
       	}

       	if($scope.parmList.start_time==''){
            delete $scope.parmList.start_time;
       	}
       	if($scope.parmList.end_time==''){
            delete $scope.parmList.end_time;
       	}

		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/order/reportlist',
	        data: {

					phone  			:        $scope.parmList.phone,
					shop_id  		:        $scope.parmList.shop_id,
					type  			:        $scope.parmList.type,
					pay_type  	:        $scope.parmList.pay_type,
					start_time  :        $scope.parmList.start_time,
					end_time    :        $scope.parmList.end_time,
					page_no 		:        $scope.parmList.page_no,
					page_size 	:        $scope.parmList.page_size,
					order 			:        $scope.parmList.order,

	        }
        }).success(function(data){

            if(data.code==200){
                $scope.statisticaEliminateList=data.data;
                if($scope.statisticaEliminateList.list.length == 'undefined' || $scope.statisticaEliminateList.list.length == undefined){
                	$scope.statisticaEliminateList.list = [];
                }
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	}

	$scope.load();

}]);