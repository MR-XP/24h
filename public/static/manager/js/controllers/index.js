'use strict';

app.controller('indexController', ['$scope', '$http', '$filter','$state','$location','formatDate',
						  function($scope, $http,$filter,$state,$location,formatDate){

    $scope.txt		=	'首页';
	$scope.load		=	200;		//加载状态

	//数据
	$scope.total={

			card			:	[],
            bound           :   [],
            eliminate       :   [],
			coachCourse	    :	[],
            groupCourse     :   [],
            bean            :   [],
			newUsers		:	[],
			newMember		:	[],
			sign			:	[],
			groupAppt		:	[],
			coachAppt		:	[],
			shopId			:	''

	}

	//跳转
	$scope.go=function(add,type,id){
		$location.path('app/'+add+(type!=0?'/'+type:'') + (id>=0?'/'+id:''))
	}

	//销售统计
    $scope.loadTotal=function(time,type){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/report/totalsales',
            data: {

                    time_type       :        time,
                    type            :        type

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
                if(type==2){//小团课
                    if(time == 'day'){
                        $scope.total.groupCourse[0] = data.data;
                    }
                    if(time == 'week'){
                        $scope.total.groupCourse[1] = data.data;
                    }
                    if(time == 'month'){
                        $scope.total.groupCourse[2] = data.data;
                    }
                    if(time == 'year'){
                        $scope.total.groupCourse[3] = data.data;
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
                if(type==5){//消除旷课记录统计
                    if(time == 'day'){
                        $scope.total.eliminate[0] = data.data;
                    }
                    if(time == 'week'){
                        $scope.total.eliminate[1] = data.data;
                    }
                    if(time == 'month'){
                        $scope.total.eliminate[2] = data.data;
                    }
                    if(time == 'year'){
                        $scope.total.eliminate[3] = data.data;
                    }
                }
                if(type==6){//新增绑定用户
                    if(time == 'day'){
                        $scope.total.bound[0] = data.data;
                    }
                    if(time == 'week'){
                        $scope.total.bound[1] = data.data;
                    }
                    if(time == 'month'){
                        $scope.total.bound[2] = data.data;
                    }
                    if(time == 'year'){
                        $scope.total.bound[3] = data.data;
                    }
                }

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    //会员统计
    $scope.loadUsers=function(time,type){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/report/membercount',
            data: {

                    time_type       :        time,
                    card_status     :        type

            }
        }).success(function(data){

           if(data.code==200){

              if(type==0)		//注册会员
            		$scope.total.newUsers[time.length-3]=data.data

            	if(type==1)		//购卡会员
                $scope.total.newMember[time.length-3]=data.data

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

		//签到统计
    $scope.loadSign=function(time){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/report/signcount',
            data: {

                time_type       :       time,
								shop_id					:				$scope.total.shopId

            }
        }).success(function(data){

            if(data.code==200){

               $scope.total.sign[time.length-3]=data.data;

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

	//预约统计
    $scope.loadAppt=function(time,type){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/report/appointmentcount',
            data: {

                time_type       :       time,
                type            :       type,
				shop_id			:		$scope.total.shopId

            }
        }).success(function(data){

            if(data.code==200){

	            if(data.code==200){

	                if(type==1)		//公共课预约
            			$scope.total.groupAppt[time.length-3]=data.data;

	            		if(type==3)		//私教课预约
	                	$scope.total.coachAppt[time.length-3]=data.data

	            }

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }


    //会员反馈
    $scope.feedBack=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/merchant/showfeedback',
            data: {

                page_no       :     1,
                page_size     :     5,
            }

        }).success(function(data){

            if(data.code==200){

                $scope.feedBackList=data.data;

                //加载图表
                fetchData(function (data) {

		            myChart.hideLoading();

		            myChart.setOption({
		                series: [
		                    {
		                        name: '会员卡',
		                        data: data.card,
		                    },
		                    {
		                        name: '私教课',
		                        data: data.coachCourse,
		                    },
                            {
                                name: '小团课',
                                data: data.groupCourse,
                            },
                            {
                                name: '金豆充值',
                                data: data.bean,
                            },
		                    {
		                        name: '注册会员',
		                        data: data.newUsers,
		                    },
		                    {
		                        name: '购卡会员',
		                        data: data.newMember,
		                    },
		                    {
		                        name: '签到人数',
		                        data: data.sign,
		                    },
		                    {
		                        name: '公共预约',
		                        data: data.groupAppt,
		                    },
		                    {
		                        name: '私教预约',
		                        data: data.coachAppt,
		                    },
		                ]
		            })

		        });

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }


	//场馆加载
    $scope.getShopList=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {

                limit	:	0

            }

        }).success(function(data){

            if(data.code==200){

                $scope.shopList=data.data

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }


	//再次加载
	var sum=['day','week','month'];
	var againCont=[

		{

			name	:	'sign',
			val		:	null,
			type	:	0

		},
		{

			name	:	'appt',
			val		:	[1,3],
			type	:	1

		}

	];

	$scope.again=function(){

		var loading=layer.load(1, {shade: [0.5,'#000']});

		for(var i=0;i<sum.length;i++){

			for(var j=0;j<againCont.length;j++){

				if(againCont[j].type==0){

					if(againCont[j].name=='sign')
						$scope.loadSign(sum[i])													//签到

				}else{

					for(var k=0;k<againCont[j].val.length;k++){

						if(againCont[j].name=='appt')
							$scope.loadAppt(sum[i],againCont[j].val[k])		//预约

					}

				}

			}

			if((i+1)==sum.length){

					//加载图表
					setTimeout(function(){

							layer.close(loading);

							fetchData(function (data) {

						    myChart.setOption({
						        series: [
						            {
						                name: '会员卡',
						                data: data.card,
						            },
						            {
						                name: '私教课',
						                data: data.coachCourse,
						            },
                                    {
                                        name: '小团课',
                                        data: data.groupCourse,
                                    },
                                    {
                                        name: '金豆充值',
                                        data: data.bean,
                                    },
						            {
						                name: '注册会员',
						                data: data.newUsers,
						            },
						            {
						                name: '购卡会员',
						                data: data.newMember,
						            },
						            {
						                name: '签到人数',
						                data: data.sign,
						            },
						            {
						                name: '公共预约',
						                data: data.groupAppt,
						            },
						            {
						                name: '私教预约',
						                data: data.coachAppt,
						            },
						        ]
						    })

							})

					},800)

			}

		}

	}

    //统计图
    var myChart = echarts.init(document.getElementById('main'));
    myChart.showLoading();

    function fetchData(cb) {

       cb({
            card				: 	$scope.total.card,
            coachCourse         :   $scope.total.coachCourse,
            groupCourse		    : 	$scope.total.groupCourse,
            bean                :   $scope.total.bean,
            newUsers			: 	$scope.total.newUsers,
            newMember			: 	$scope.total.newMember,
            sign				: 	$scope.total.sign,
            groupAppt			: 	$scope.total.groupAppt,
            coachAppt			: 	$scope.total.coachAppt,
        })

    }

    var option = {
            title: {
                /*text: '折柱混合',*/
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            toolbox: {
                bottom:'5px',
                feature: {
                    magicType: {show: true, type: ['line', 'bar']},
                    saveAsImage: {show: true},
                }
            },
            legend: {
                data:['会员卡','私教课','小团课','金豆充值','注册会员','购卡会员','签到人数','公共预约','私教预约'],
                itemWidth :10,
                itemHeight :10

            },
            grid: {
                top:'80px',
                left: '1%',
                right: '1%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: ['今日','本周','本月'],
                    axisPointer: {
                        type: 'shadow'
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '销量/元',
                    min: 0,
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                {
                    type: 'value',
                    name: '人数/人',
                    min: 0,
                    axisLabel: {
                        formatter: '{value}'
                    }
                }
            ],
            series: [
                {
                    name:'会员卡',
                    type:'bar',
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#e6ce9c'
                        }
                    }
                },
                {
                    name:'私教课',
                    type:'bar',
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#8bdc84'
                        }
                    }
                },
                {
                    name:'小团课',
                    type:'bar',
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#caa5cf'
                        }
                    }
                },
                {
                    name:'金豆充值',
                    type:'bar',
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#98ced2'
                        }
                    }
                },
                {
                    name:'注册会员',
                    type:'bar',
                    yAxisIndex: 1,
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#edc1d6'
                        }
                    }
                },
                {
                    name:'购卡会员',
                    type:'bar',
                    yAxisIndex: 1,
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#afcdeb'
                        }
                    }
                },
                {
                    name:'签到人数',
                    type:'bar',
                    yAxisIndex: 1,
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#eebfbf'
                        }
                    }
                },
                {
                    name:'公共预约',
                    type:'bar',
                    yAxisIndex: 1,
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#bce7cd'
                        }
                    }
                },
                {
                    name:'私教预约',
                    type:'bar',
                    yAxisIndex: 1,
                    data:[],
                    itemStyle: {
                        normal: {
                            color: '#e9beab'
                        }
                    }
                }
            ]
        };

   		myChart.setOption(option);


  }]);