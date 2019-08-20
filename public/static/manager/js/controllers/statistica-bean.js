'use strict';

app.controller('statisticaBeanController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate','arrDate',
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


    $scope.txt='金豆充值统计';
    $scope.go=function(){
    	$location.path('app/index');
    };

    $scope.parmList={

		keyword       :     '',            //搜索用户手机或者姓名
		type          :     4,             //1购卡，2购小团课，3购私教课，4 储值
		status        :     1,             //0取消，1正常
		pay_status    :     1,             //0：未支付 1：已支付 2：已退款
		start_time    :     Stime,         //开始时间
		end_time      :     Etime,         //结束时间
		page_no       :     1,             //当前页
		page_size     :     12,            //每页显示条数

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }


	//加载
	$scope.load=function(){

		if($scope.parmList.keyword==''){
            delete $scope.parmList.keyword;
        }

		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/order/getlist',
	        data: {

					keyword         :        $scope.parmList.keyword,
					type            :        $scope.parmList.type,
					status          :        $scope.parmList.status,
					pay_status      :        $scope.parmList.pay_status,
					start_time      :        $scope.parmList.start_time,
					end_time        :        $scope.parmList.end_time,
					page_no         :        $scope.parmList.page_no,
					page_size       :        $scope.parmList.page_size,

	        }
        }).success(function(data){

            if(data.code==200){
                $scope.statisticaBeansList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	}

	$scope.load();

}]);