'use strict';

app.controller('auditController', ['$scope', '$state','auditFactory','$location','infoService','$filter','$http',
						function($scope, $state,auditFactory,$location,infoService,$filter,$http) {

    $scope.txt='审核管理';

    $scope.parmList={
        type               :           '',                 //1购卡，2购小团课，3购私教课，4充值，不传所有
        phone              :           '',                 //搜索电话
        name               :           '',                 //搜索名字
        page_no            :           1,                  //当前页
        page_size          :           10,         		   //每页显示条数
        shop_id			   :		   ''				   //场馆ID
    }
	//分页
    $scope.maxSize=5;
	$scope.pages=function(){
		$scope.load();
	}
    //加载
    $scope.load=function(){
        if($scope.parmList.type==''){
            delete $scope.parmList.type;
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/approval/getlist',
            data: {

                type               :        $scope.parmList.type,
                phone              :        $scope.parmList.phone,
                name               :        $scope.parmList.name,
                page_no            :        $scope.parmList.page_no,
                page_size          :        $scope.parmList.page_size,
				shop_id			   :		$scope.parmList.shop_id
            }
        }).success(function(data){

            if(data.code==200){

                $scope.newAuditList=data.data;

            }else{

                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.load();

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

    //通过审核
    $scope.pass=function(id,status){

        layer.msg('你确定通过审核吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/approval/dispose',
                    data: {
                        approval_id             :    id,
                        status                  :    1,
                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('通过审核成功', {icon: 1});
                        $scope.load()

                    }else{
						layer.msg(data.message, {icon: 2});

                    }

                }).error( function(data){

                    layer.msg('服务器访问失败！', {icon: 2});

                });
            }
        });

    };

    //拒绝审核
    $scope.reject=function(id,status){

        layer.msg('确定拒绝吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/approval/dispose',
                    data: {
                        approval_id             :    id,
                        status                  :    2,
                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('拒绝成功', {icon: 1});
                        $scope.load()

                    }else{
                        layer.msg(data.message, {icon: 2});

                    }

                }).error( function(data){

                    layer.msg('服务器访问失败！', {icon: 2});

                });
            }
        });

    };

}]);