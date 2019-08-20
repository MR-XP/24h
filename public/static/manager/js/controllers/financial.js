'use strict';

app.controller('financialController', ['$scope', '$http', '$filter','$state','$location','formatDate',
                          function($scope, $http,$filter,$state,$location,formatDate){

    $scope.txt      =   '财务统计';
		
		var publicLoading = null;
		
    $scope.go=function(){
        $location.path('app/financial');
    };

    //加载三级联动
    $scope.area=app.area;

    $scope.load     =   200;        //加载状态

    $scope.commissionAll_name         = [];//全部姓名
    $scope.commissionAll_money        = [];//全部提成
    $scope.commissionCoach_name       = [];//教练姓名
    $scope.commissionCoach_money      = [];//教练提成
    $scope.commissionMembership_name  = [];//会籍姓名
    $scope.commissionMembership_money = [];//会籍提成
    $scope.commissionStewards_name    = [];//管家姓名
    $scope.commissionStewards_money   = [];//管家提成
    $scope.salesAll                   = [];//总销量

    $scope.commissionName             = [];
    $scope.commissionMoney            = [];

    //数据
    $scope.total={

        card                         :  [],
        coachCourse                  :  [],
        newUsers                     :  [],
        newMember                    :  [],
        sign                         :  [],
        groupAppt                    :  [],
        coachAppt                    :  [],
        bean                         :  [],      //金豆
        consumption                  :  [],      //私教耗课量
        shopId                       :  '',
        tabId                        :  0,       //选项卡id（员工提成）
        shopSalesMonth               :  [],      //场馆月销量前五名
        shopSalesYear                :  [],      //场馆年销量前3名
        courseConsumptionMonth       :  [],      //私教月耗课量
        shoptabId                    :  0,       //选项卡id（场馆销量）

    }

    $scope.parmList = {
        province     :    '',      //省
        city         :    '',      //市
        county       :    '',      //县
    }

    //场馆加载
    $scope.getShopList=function(){

    		var loading=layer.load(1, {shade: [0.5,'#000']});

        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {

                limit        :   0,
                province     :   $scope.parmList.province,
                city         :   $scope.parmList.city,
                county       :   $scope.parmList.county,
		
            }

        }).success(function(data){

            if(data.code==200){
                $scope.shopList=data.data;
            }
						
						layer.close(loading);
						
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.getShopList();

    //跳转
    $scope.go=function(add,type,id){
        $location.path('app/'+add+(type!=0?'/'+type:'') + (id>=0?'/'+id:''))
    };

    //跳转到员工提成详情列表
    $scope.goTC=function(item){
        $location.path('app/statistica-commission/'+item);
    };

    //默认加载员工提成
    $scope.tabs = [true,false,false,false];

    $scope.tab = function(index){
        if(index!='' || index!=undefined || index!='undefined'){
            $scope.total.tabId = index;
        }else{
            $scope.total.tabId = 0;
        }

        // $scope.total.tabId = index;

        angular.forEach($scope.tabs, function(i, v) {
            $scope.tabs[v] = false;
        });

        $scope.tabs[index] = true;
        $scope.loadCommission();

    };

    //销售统计
    $scope.loadTotal=function(time,type){
        if($scope.total.shopId == ''){
            delete $scope.total.shopId;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/report/totalsales',
            data: {

                time_type       :        time,
                type            :        type,
                shop_id         :        $scope.total.shopId,
            }
        }).success(function(data){
            $scope.load=data.code;
            if(data.code==200){
                if(type==1){//会员卡
                    if(time == 'day'){
                        $scope.total.card[0] = data.data;
                    }
                    if(time == 'week'){
                        $scope.total.card[1] = data.data;
                    }
                    if(time == 'month'){
                        $scope.total.card[2] = data.data;
                    }
                    if(time == 'year'){
                        $scope.total.card[3] = data.data;
                    }
                }
                if(type==3){//私教
                    if(time == 'day'){
                        $scope.total.coachCourse[0] = data.data;
                    }
                    if(time == 'week'){
                        $scope.total.coachCourse[1] = data.data;
                    }
                    if(time == 'month'){
                        $scope.total.coachCourse[2] = data.data;
                    }
                    if(time == 'year'){
                        $scope.total.coachCourse[3] = data.data;
                    }
                }
                if(type==4){//金豆
                    if(time == 'day'){
                        $scope.total.bean[0] = data.data;
                    }
                    if(time == 'week'){
                        $scope.total.bean[1] = data.data;
                    }
                    if(time == 'month'){
                        $scope.total.bean[2] = data.data;
                    }
                    if(time == 'year'){
                        $scope.total.bean[3] = data.data;
                    }
                }
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    //场馆销量
    $scope.loadsales = function(time){
        if($scope.total.tabId == ''){
            delete $scope.total.tabId;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/finance/shopSalesVolume',
            data: {
                time_type   :    time,
                shop_id     :    $scope.total.tabId,
            }
        }).success(function(data){

            if(data.code==200){
                $scope.salesList = data.data;
                if(time=='month'){
                    for(var i=0;i<$scope.salesList.length;i++){
                        if(i<5){
                            $scope.total.shopSalesMonth.push($scope.salesList[i]);
                        }
                    }
                }
                if(time=='year'){
                    for(var i=0;i<$scope.salesList.length;i++){
                        if(i<3){
                            $scope.total.shopSalesYear.push($scope.salesList[i]);
                        }
                    }
                }
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    //总销量
    $scope.loadsalesALL = function(type){
        if($scope.total.shopId == ''){
            delete $scope.total.shopId;
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/finance/statiStics',
            data: {

                type        :    type,
                shop_id     :    $scope.total.shopId,

            }
        }).success(function(data){

            if(data.code==200){
                if(type == ''){
                    $scope.salesAll = data.data;
                }
                if(type == 1){
                    $scope.salesAllCard = data.data;
                }
                if(type == 3){
                    $scope.salesAllCourse = data.data;
                }
                if(type == 4){
                    $scope.salesAllBeans = data.data;
                }
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    //店铺私教耗课列表
    $scope.loadCourseConsumption = function(time){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/finance/consumeList',
            data: {

                    time_type   :    time,
                    shop_id     :    $scope.total.tabId,

            }
        }).success(function(data){

            if(data.code==200){
                $scope.courseconsumptionList = data.data.list;
                if(time=='month'){
                	  
                	  $scope.total.courseConsumptionMonth=[];
                	  
                    for(var i=0;i<$scope.courseconsumptionList.length;i++){
                        if(i<4){
                            $scope.total.courseConsumptionMonth.push($scope.courseconsumptionList[i]);
                        }
                    }
                }
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    //私教耗课量
    $scope.loadConsumption=function(time){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/finance/totalSales',
            data: {

                time_type       :       time,
                shop_id         :       $scope.total.shopId

            }
        }).success(function(data){

            if(data.code==200){

               // $scope.total.consumption[time.length-3]=data.data;
                if(time == 'day'){
                    $scope.total.consumption[0] = data.data;
                }
                if(time == 'week'){
                    $scope.total.consumption[1] = data.data;
                }
                if(time == 'month'){
                    $scope.total.consumption[2] = data.data;
                }
                if(time == 'year'){
                    $scope.total.consumption[3] = data.data;
                }
            }


        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    //提成统计
    $scope.loadCommission=function(type){

    	 publicLoading=layer.load(1, {shade: [0.5,'#000']});

        if($scope.total.tabId==undefined || $scope.total.tabId==''){
            $scope.total.tabId = 0;
        }
        type=$scope.total.tabId;
        $http({
            method: 'POST',
            url:window.base_url+'/manager/commission/report',
            data: {

                    shop_id     :     $scope.total.shopId,       // 0查所有
                    user_type   :     $scope.total.tabId,        //0所有，1教练，2会籍，3管家

            }
        }).success(function(data){

            if(data.code==200){

                if(type==0){//全部
                    $scope.total.commissionAll=data.data;
                    $scope.commissionAll_name  = [];
                    $scope.commissionAll_money = [];
                    for(var i=0;i<$scope.total.commissionAll.length;i++){
                        if(i<6){
                            $scope.commissionAll_name.push($scope.total.commissionAll[i].real_name);
                            $scope.commissionAll_money.push($scope.total.commissionAll[i].total_value);
                        }
                    }
                }

                if(type==1){//教练
                    $scope.total.commissionCoach=data.data;
                    $scope.commissionCoach_name  = [];
                    $scope.commissionCoach_money = [];
                    for(var i=0;i<$scope.total.commissionCoach.length;i++){
                        if(i<6){
                            $scope.commissionCoach_name.push($scope.total.commissionCoach[i].real_name);
                            $scope.commissionCoach_money.push($scope.total.commissionCoach[i].total_value);
                        }
                    }
                }

                if(type==2){//会籍
                    $scope.total.commissionMembership=data.data;
                    $scope.commissionMembership_name  = [];
                    $scope.commissionMembership_money = [];
                    for(var i=0;i<$scope.total.commissionMembership.length;i++){
                        if(i<6){
                            $scope.commissionMembership_name.push($scope.total.commissionMembership[i].real_name);
                            $scope.commissionMembership_money.push($scope.total.commissionMembership[i].total_value);
                        }
                    }
                }

                if(type==3){//管家
                    $scope.total.commissionStewards=data.data;
                    $scope.commissionStewards_name  = [];
                    $scope.commissionStewards_money = [];
                    for(var i=0;i<$scope.total.commissionStewards.length;i++){
                        if(i<6){
                            $scope.commissionStewards_name.push($scope.total.commissionStewards[i].real_name);
                            $scope.commissionStewards_money.push($scope.total.commissionStewards[i].total_value);
                        }
                    }
                }

                //加载图表
                fetchData(function (data) {

                    myChart.hideLoading();
                    myChart.setOption({
                        series: [
                            {
                                name: ['第一名：'+data.commissionName[0]],
                                data: [data.commissionMoney[0]],
                            },
                            {
                                name: ['第二名：'+data.commissionName[1]],
                                data: [data.commissionMoney[1]],
                            },
                            {
                                name: ['第三名：'+data.commissionName[2]],
                                data: [data.commissionMoney[2]],
                            },
                            {
                                name: ['第四名：'+data.commissionName[3]],
                                data: [data.commissionMoney[3]],
                            },
                            {
                                name: ['第五名：'+data.commissionName[4]],
                                data: [data.commissionMoney[4]],
                            },
                            {
                                name: ['第六名：'+data.commissionName[5]],
                                data: [data.commissionMoney[5]],
                            },
                        ]
                    })
                });

                layer.close(publicLoading);

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

	//再次加载
	var sum=['day','week','month','year'];

	var againCont=[

		{

			name	:	'card',
			val		:	[1],
			type	:	1

		},
		{

			name	:	'coachCourse',
			val		:	null,
			type	:	0

		},
		{

			name	:	'sales',
			val		:	['',1,3,4],
			type	:	1

		}


	];

	$scope.again=function(){

		publicLoading=layer.load(1, {shade: [0.5,'#000']});

		//静态加载
		$scope.loadCourseConsumption('month');
        $scope.loadCommission();


		//动态加载
		for(var i=0;i<sum.length;i++){

			for(var j=0;j<againCont.length;j++){

				if(againCont[j].type==0){

					if(againCont[j].name=='coachCourse')
						$scope.loadConsumption(sum[i])													//私教耗课

				}else{

					for(var k=0;k<againCont[j].val.length;k++){

						if(againCont[j].name=='card')
							$scope.loadTotal(sum[i],againCont[j].val[k])					//会员卡


						if(againCont[j].name=='sales' && i==3)
							$scope.loadsalesALL(againCont[j].val[k])							//总销量
					}

				}

			}

		}

	}


    //统计图
    var myChart = echarts.init(document.getElementById('main'));
    myChart.showLoading();

    function fetchData(cb) {

        $scope.commissionAllName  = $scope.commissionAll_name;
        $scope.commissionAllMoney = $scope.commissionAll_money;

        if($scope.total.tabId==1){
            $scope.commissionAllName  = $scope.commissionCoach_name;
            $scope.commissionAllMoney = $scope.commissionCoach_money;
        }
        if($scope.total.tabId==2){
            $scope.commissionAllName  = $scope.commissionMembership_name;
            $scope.commissionAllMoney = $scope.commissionMembership_money;
        }
        if($scope.total.tabId==3){
            $scope.commissionAllName  = $scope.commissionStewards_name;
            $scope.commissionAllMoney = $scope.commissionStewards_money;
        }
        if($scope.total.tabId==0){
            $scope.commissionAllName  = $scope.commissionAll_name;
            $scope.commissionAllMoney = $scope.commissionAll_money;
        }


       cb({

            commissionName              :   $scope.commissionAllName,
            commissionMoney             :   $scope.commissionAllMoney

        })
    }

    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: ['本月'],
        },
        series: [
            {
                name: '第六名',
                type: 'bar',
                data: [],
            },
            {
                name: '第五名',
                type: 'bar',
                data: [],
            },
            {
                name: '第四名',
                type: 'bar',
                data: [],
            },
            {
                name: '第三名',
                type: 'bar',
                data: [],
            },
            {
                name: '第二名',
                type: 'bar',
                data: [],
            },
            {
                name: '第一名',
                type: 'bar',
                data: [],
            },
        ]
    };

    myChart.setOption(option);

}]);