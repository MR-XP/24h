'use strict';

app.controller('statisticaCommissionController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate','arrDate',
									function($scope, $http, $state,$location,$filter,$stateParams,infoService,formatDate,arrDate) {

	if($stateParams.item == '' || $stateParams.item == undefined || $stateParams.item == 'undefined'){
		$stateParams.item = 0;
	}


	$(document).ready(function()
	{
		$("#dtBox-1").DateTimePicker(
		{
			parentElement: ".separator-1",
			monthYearSeparator: "-"
		});

	});

	//加载三级联动
    $scope.area=app.area;

    $scope.txt='员工提成列表';
    $scope.go=function(){
    	$location.path('app/financial');
    };

    $scope.goTime=function(item){
    	$scope.xqCardList = item.sales_card_list;//售卡列表
    	$scope.xqUsedCourseList = item.used_course_list;//耗课列表
    	$scope.xqCourseList = item.sales_course_list;//售课列表
    };
    //获取当前时间（年月）
    var now = new Date();
    var nowMonth = now.getMonth()+1;
    nowMonth =(nowMonth<10 ? "0"+nowMonth:nowMonth);
    var this_Month = nowMonth+'-'+ now.getFullYear();


    $scope.parmListShop={

		province   :   '',    //省
		city       :   '',    //市
		county     :   '',    //区,县
		// status     :   '',    //int 1 为正常,不传查所有
		limit      :   0,     //返回条数，0为所有

	}

	//加载场馆列表
	$scope.getShopList=function(){

		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/shop/search',
	        data: {

				province   :   $scope.parmListShop.province,
				city       :   $scope.parmListShop.city,
				county     :   $scope.parmListShop.county,
				// status     :   $scope.parmListShop.status,
				limit      :   $scope.parmListShop.limit,

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
	}
	$scope.getShopList();


    $scope.parmList={

		shop_id      :     $stateParams.item,     //0查所有
		user_type    :     0,     //0所有，1教练，2会籍，3管家
		month        :     '',     //月份,eg. 2017-12
		page_no      :     1,
    	page_size    :     10,
    	myMonth      :     this_Month,

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }

	//加载提成列表
	$scope.load=function(){

		if($scope.parmList.myMonth!=''){
			$scope.parmList.month = $scope.parmList.myMonth.substring(3,7)+'-'+$scope.parmList.myMonth.substring(0,2);
		}

		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/commission/getlist',
	        data: {

					shop_id      :  $scope.parmList.shop_id,
					user_type    :  $scope.parmList.user_type,
					month        :  $scope.parmList.month,
					page_no      :  $scope.parmList.page_no,
					page_size    :  $scope.parmList.page_size,

	        }
        }).success(function(data){

            if(data.code==200){
                $scope.commissionList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
	}

	$scope.load();

}]);