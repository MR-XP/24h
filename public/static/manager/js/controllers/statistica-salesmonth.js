'use strict';

app.controller('statisticaSalesMonthController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate','arrDate',
									function($scope, $http, $state,$location,$filter,$stateParams,infoService,formatDate,arrDate) {


    $scope.txt='店铺本月销量统计';
    $scope.go=function(){
    	$location.path('app/financial');
    };

	//场馆本月销量
    $scope.loadsalesMonth = function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/finance/shopSalesVolume',
            data: {

                    time_type   :    'month',      //day,week,month,year,不传默认为year

            }
        }).success(function(data){

            if(data.code==200){
                $scope.salesMonthList = data.data;
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadsalesMonth();

}]);