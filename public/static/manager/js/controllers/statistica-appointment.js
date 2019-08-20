'use strict';

app.controller('statisticaAppointmentController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate','arrDate',
												function($scope, $http, $state,$location,$filter,$stateParams,infoService,formatDate,arrDate) {
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
    $scope.txt='公共课预约统计';
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

	//加载课程
    $scope.selectCoursera={

		status       :     1,        //1为正常
		page_no      :     1,        //当前页
		page_size    :     10000,    //每页显示条数
		type         :     1,        //1公开，2小团，3私教

	}
	$scope.load1=function(){
		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/course/getlist',
	        data: {

					status       :      $scope.selectCoursera.status,
					page_no      :      $scope.selectCoursera.page_no,
					page_size    :      $scope.selectCoursera.page_size,
					type         :      $scope.selectCoursera.type,
	        }
	    }).success(function(data){

            if(data.code==200){
                  $scope.newCourseList=data.data;
            }else{
                  layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	};
	$scope.load1();




    $scope.parmList={

		user_id     :       '',              //查询单个用户的预约
		plan_type   :       $stateParams.id, //课程类型 1公共课 2小团课 3私教课
		start_time  :       Stime,           //开课时间
		end_time    :       Etime,           //课程结束时间
		shop_id     :       '',              //场馆id
		course_id   :       '',              //课程id
		status      :       1,               //1为正常，空为所有，-1取消
		page_no     :       1,               //当前页
		page_size   :       12,              //每页显示条数

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }

	//加载
	$scope.load=function(){

		if($scope.parmList.course_id==''){
            delete $scope.parmList.course_id;
       	}
       	if($scope.parmList.start_time==''){
            delete $scope.parmList.start_time;
       	}
       	if($scope.parmList.end_time==''){
            delete $scope.parmList.end_time;
       	}

		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/appointment/getlist',
	        data: {

	        	user_id     :   $scope.parmList.user_id,
				plan_type   :   $scope.parmList.plan_type,
				start_time  :   $scope.parmList.start_time,
				end_time    :   $scope.parmList.end_time,
				shop_id     :   $scope.parmList.shop_id,
				course_id   :   $scope.parmList.course_id,
				status      :   $scope.parmList.status,
				page_no     :   $scope.parmList.page_no,
				page_size   :   $scope.parmList.page_size,

	        }
        }).success(function(data){

            if(data.code==200){
                $scope.statisticaAppointment=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	}

	$scope.load();
}]);