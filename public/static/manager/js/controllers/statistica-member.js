'use strict';

app.controller('statisticaMemberController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate','arrDate',
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
	
	if($stateParams.id == 0){
		$scope.txt='注册会员统计';	
	}
	if($stateParams.id == 1){
		$scope.txt='购卡会员统计';	
	}

    $scope.go=function(){
    	$location.path('app/index');
    };
    $scope.goTime=function(item){
    	$scope.cardList = item.card;
    };

    $scope.parmList={

    	phone           :        '',           		//手机号查询
		card_status     :        $stateParams.id,   //0查询注册会员，1查询购卡会员，2查询即将过期会员
		start_time      :        Stime,            	//开始时间
		end_time        :        Etime,            	//结束时间
		page_no         :        1,             	//当前页
		page_size       :        12,            	//每页显示条数

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }

	//加载
	$scope.load=function(){

       	if($scope.parmList.start_time==''){
            delete $scope.parmList.start_time;
       	}
       	if($scope.parmList.end_time==''){
            delete $scope.parmList.end_time;
       	}
       	
       	if($stateParams.id == 0){
       		$http({
		        method: 'POST',
		        url:window.base_url+'/manager/user/reportlist',
		        data: {
	
		        		phone           :       $scope.parmList.phone,
						card_status     :       $scope.parmList.card_status,
						start_time      :       $scope.parmList.start_time,
						end_time        :       $scope.parmList.end_time,
						page_no         :       $scope.parmList.page_no,
						page_size       :       $scope.parmList.page_size,
		        }
		        }).success(function(data){
	
		            if(data.code==200){
		                  $scope.statisticaMemberList=data.data;
		            }else{
		                  layer.msg(data.message, {icon: 2});
		            }
	
		        }).error( function(data){
		            layer.msg('服务器访问失败！', {icon: 2});
	    	});
       	}
       	
		if($stateParams.id == 1){
       		$http({
		        method: 'POST',
		        url:window.base_url+'/manager/user/buyCardUser',
		        data: {
		        		
	        		phone           :       $scope.parmList.phone,
					start_time      :       $scope.parmList.start_time,
					end_time        :       $scope.parmList.end_time,
					page_no         :       $scope.parmList.page_no,
					page_size       :       $scope.parmList.page_size
						
		        }
		        }).success(function(data){
	
		            if(data.code==200){
		                  $scope.statisticaMemberList=data.data;
		            }else{
		                  layer.msg(data.message, {icon: 2});
		            }
	
		        }).error( function(data){
		            layer.msg('服务器访问失败！', {icon: 2});
	    	});
       	}
	    
	}
	$scope.load();
	
	//导出
	$scope.dwp=function(){
		$('#loading').modal('show');
		
		if($stateParams.id == 0){
			$http({
	            method: 'POST',
	            url:window.base_url+'/manager/user/exportUserData',
	            data: {
	        		phone           :       $scope.parmList.phone,
					start_time      :       $scope.parmList.start_time,
					end_time        :       $scope.parmList.end_time,
					page_no         :       $scope.parmList.page_no,
					page_size       :       $scope.parmList.page_size,
					card_status     :       0,
	                address			:		'reportList'
	            }
		        }).success(function(data){
		            if(data.code==200){
		            	window.location.href=window.base_url+'/manager/user/exportUser?name=注册会员导出';
		            	$('#loading').modal('hide');
		            }else{
		                layer.msg(data.message, {icon: 2});
		            }
		        }).error( function(data){
		            layer.msg('服务器访问失败', {icon: 2});
	        });	
		}
		
		if($stateParams.id == 1){
			$http({
	            method: 'POST',
	            url:window.base_url+'/manager/user/exportUserData',
	            data: {
	        		phone           :       $scope.parmList.phone,
					start_time      :       $scope.parmList.start_time,
					end_time        :       $scope.parmList.end_time,
					page_no         :       $scope.parmList.page_no,
					page_size       :       $scope.parmList.page_size,
	                address			:		'buyCardUser'
	            }
		        }).success(function(data){
		            if(data.code==200){
		            	window.location.href=window.base_url+'/manager/user/exportUser?name=购卡会员导出';
		            	$('#loading').modal('hide');
		            }else{
		                layer.msg(data.message, {icon: 2});
		            }
		        }).error( function(data){
		            layer.msg('服务器访问失败', {icon: 2});
	        });
		}
		
	}
	
}]);