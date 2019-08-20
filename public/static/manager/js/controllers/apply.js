'use strict';

app.controller('applyController', ['$scope', '$state','$location','infoService','$filter','$http',
						function($scope, $state,$location,infoService,$filter,$http) {

    $scope.txt='教练申请';

    $scope.go=function(item){
        $location.path('app/certificate-photos/'+item);
    };

    $scope.parmList={
        status         :    '',    //1 通过，0 等待审核，2 拒绝
        page_no        :    1,     //当前页
        page_size      :    12,    //每页显示条数
    }
	//分页
    $scope.maxSize=5;
	$scope.pages=function(){
		$scope.load();
	}
    //加载
    $scope.load=function(){
        if($scope.parmList.status==''){
            delete $scope.parmList.status;
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/applicationList',
            data: {

                status             :        $scope.parmList.status,
                page_no            :        $scope.parmList.page_no,
                page_size          :        $scope.parmList.page_size,

            }
        }).success(function(data){

            if(data.code==200){

                $scope.applyList=data.data;

            }else{

                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.load();

    //通过审核
    $scope.pass=function(id,status){

        layer.msg('你确定通过审核吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/coach/dispose',
                    data: {
                        application_id          :    id,
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
                    url:window.base_url+'/manager/coach/dispose',
                    data: {
                        application_id          :    id,
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
    //教练申请证书编辑模态框
    $scope.editModal_open = function(item){
        console.log(item);
        $('#editModal').modal('show');
        $scope.coachImages = item;
    };
    $scope.editModal_close = function(){
        $('#editModal').modal('hide');
    }

}]);

app.controller('certificatePhotosController', ['$scope', '$state','$http','$location','$stateParams','infoService',
                            function($scope, $state,$http,$location,$stateParams,infoService) {

    $scope.txt='查看证书';

    $scope.go=function(){
        $location.path('app/apply');
    };

    $scope.parmList={

        application_id      :            $stateParams.item,        //申请序号
        status              :            '',                       //1 通过，0 等待审核，2 拒绝
        page_no             :            1,                        //当前页
        page_size           :            100000,                   //每页显示条数

    }

    //加载
    $scope.load=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/applicationList',
            data: {

                    application_id      :     $scope.parmList.application_id,
                    status              :     $scope.parmList.status,
                    page_no             :     $scope.parmList.page_no,
                    page_size           :     $scope.parmList.page_size,

            }
        }).success(function(data){

            if(data.code==200){
                $scope.applyList=data.data.list[0].certs;
                /*console.log($scope.applyList)*/

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.load();

}]);