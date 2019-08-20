'use strict';

app.controller('statisticaSignController', ['$scope', '$http', '$state','$location','infoService','formatDate','getNowTime','$filter','$stateParams','arrDate',
	function($scope, $http, $state,$location,infoService,formatDate,getNowTime,$filter,$stateParams,arrDate) {


	$("#dtBox").DateTimePicker({

        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"

    });

	if($stateParams.type && $stateParams.type!='undefined' && $stateParams.type!=undefined){

		var Stime=arrDate.get($stateParams.type).substring(0,20);
		var Etime=arrDate.get($stateParams.type).substring(20);
	}

    $scope.txt='签到统计';
    $scope.go=function(){
    	$location.path('app/index');
    };

    //加载店铺
    $scope.selectShop={

		status       :     1,        //1为正常
		page_no      :     1,        //当前页
		page_size    :     10000,    //每页显示条数

	}
	$scope.load1=function(){
		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/shop/getlist',
	        data: {

				status       :      $scope.selectShop.status,
				page_no      :      $scope.selectShop.page_no,
				page_size    :      $scope.selectShop.page_size,
	        }
	    }).success(function(data){

            if(data.code==200){
                  $scope.newStoreList=data.data;
            }else{
                  layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	};
	$scope.load1();

    $scope.parmList={

    	type          :        '',       //1通过会员卡签到，2通过预约课程签到
		user_id       :        '',       //会员user_id
		start_time    :        Stime,       //查询时间范围的开始时间
		phone         :        '',       //会员电话
		shop_id       :        '',       //场馆id
		order         :         2,       //1表升序，2表降序
		end_time      :        Etime,       //结束时间
		page_no       :         1,       //当前页
		page_size     :         12,      //每页显示条数

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }

    //动态加载时间
    $scope.setTime=function(a,b){
    	return getNowTime.get(a,b);
    }
	//加载
	$scope.load=function(){

       	if($scope.parmList.start_time==''){
            delete $scope.parmList.start_time;
       	}
       	if($scope.parmList.end_time==''){
            delete $scope.parmList.end_time;
       	}
		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/sign/getlist',
	        data: {

					type          :    $scope.parmList.type,
					user_id       :    $scope.parmList.user_id,
					start_time    :    $scope.parmList.start_time,
					phone         :    $scope.parmList.phone,
					shop_id       :    $scope.parmList.shop_id,
					order         :    $scope.parmList.order,
					end_time      :    $scope.parmList.end_time,
					page_no       :    $scope.parmList.page_no,
					page_size     :    $scope.parmList.page_size,
	        }
	        }).success(function(data){

	            if(data.code==200){

	                $scope.statisticaSignList=data.data;

	            }else{
	                  layer.msg(data.message, {icon: 2});
	            }

	        }).error( function(data){
	            layer.msg('服务器访问失败！', {icon: 2});
	        });
		}

		$scope.load();

}]);