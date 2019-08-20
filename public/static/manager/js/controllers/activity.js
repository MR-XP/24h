'use strict';

app.controller('activityController', ['$scope', '$state','$location','infoService','$filter','$http','clubcardFactory',
						function($scope, $state,$location,infoService,$filter,$http,clubcardFactory) {

    $scope.txt='活动竞猜';

    // $("#dtBox").DateTimePicker({

    //     language:'zh-CN',
    //     defaultDate: new Date(),
    //     animationDuration:200,
    //     buttonsToDisplay: [ "SetButton", "ClearButton"],
    //     clearButtonContent: "取消"

    // });

    $("#dtBox").DateTimePicker({

        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"

    });

    $scope.parmList={
        page_no     :       '1',                //int 当前页
        page_size   :       10,                 //int 每页显示条数
    }

    //分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }

    //加载活动列表
    $scope.load=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/activity/getList',
            data: {
                page_no     :       $scope.parmList.page_no,
                page_size   :       $scope.parmList.page_size,
            }
        }).success(function(data){

            if(data.code==200){
                $scope.activityList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.load();

    //加载会员卡
    clubcardFactory.get().then(function(data){
        $scope.newCardList=data.data;
    });

    //禁用
    $scope.lock=function(item){
        layer.msg('确定锁定该活动吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/activity/save',
                    data: {
                        id                    :       item.id,         //0是新增；非0是编辑
						mch_id                :       item.mch_id, 
						shop_id               :       item.shop_id, 
						name                  :       item.name,       //世界杯;活动名称
						info                  :       item.info,       //活动简介; 活动简介
						data                  :       item.data,       //活动数据 球队id
						card_id               :       item.card_id,    //活动会员卡id
						values                :       item.values,     //活动有效数据 球队id
						status                :       0,               //1：正常；0：失效
						start_time            :       item.start_time, //开始时间
						end_time              :       item.end_time,   //结束时间
                    }
                }).success(function(data){
                    if(data.code==200){
                        layer.msg('禁用成功', {icon: 1});
                        $scope.load();
                    }else{
                        layer.msg(data.message, {icon: 2});
                    }
                }).error( function(data){
                    layer.msg('服务器访问失败！', {icon: 2});
                });
            }
        });
    };

    //启用
    $scope.unlock=function(item){

        layer.msg('确定解锁该活动吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/activity/save',
                    data: {
						id                    :       item.id,         //0是新增；非0是编辑
						mch_id                :       item.mch_id, 
						shop_id               :       item.shop_id, 
						name                  :       item.name,       //世界杯;活动名称
						info                  :       item.info,       //活动简介; 活动简介
						data                  :       item.data,       //活动数据 球队id
						card_id               :       item.card_id,    //活动会员卡id
						values                :       item.values,     //活动有效数据 球队id
						status                :       1,               //1：正常；0：失效
						start_time            :       item.start_time, //开始时间
						end_time              :       item.end_time,   //结束时间
                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('启用成功', {icon: 1});
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

    $scope.sum1=[];//球队
    
    //加载球队列表
    $scope.loadTeam=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/activity/getTeamList',
            data: {}
        }).success(function(data){

            if(data.code==200){
                $scope.teamList=data.data;
                for(var i=0;i<$scope.teamList.length;i++){
                    $scope.sum1.push($scope.teamList[i].id);
                }
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadTeam();

    //保存遍历
    $scope.keep=function(){

        var sum1=[];

        for(var i=0;i<$('.my-ipt2').length;i++){

            if($('.my-ipt2:eq('+i+')').prop('checked'))
                sum1.push($('.my-ipt2:eq('+i+')').val())
        }
        return sum1;
    }

    //编辑模态框
    $scope.editModal_open=function(item){
        $('#editModal').modal('show');
        if(item!=0){
            $scope.info={
                id                    :       item.id,         //0是新增；非0是编辑
				mch_id                :       item.mch_id, 
				shop_id               :       item.shop_id, 
				name                  :       item.name,       //世界杯;活动名称
				info                  :       item.info,       //活动简介; 活动简介
				data                  :       item.data,       //活动数据 球队id
				card_id               :       item.card_id,    //活动会员卡id
				values                :       item.values,     //活动有效数据 球队id
				status                :       item.status,     //1：正常；0：失效
				start_time            :       item.start_time, //开始时间
				end_time              :       item.end_time,   //结束时间
            }

            $('.summernote').summernote('code',$scope.info.info);

            item.data = item.data.split(','); //以分号拆分字符串 

            //球队遍历
            var sumTeam = [];
            for(var i=0;i<item.data.length;i++){
                sumTeam.push(parseInt(item.data[i]));
            }

            $('.my-ipt2').prop('checked',false);
            if(sumTeam.length>0){
                for(var i=0;i<sumTeam.length;i++){
                    $('input[value='+sumTeam[i]+']').prop('checked',true);
                }
            }

            var sum1=[];
            for(var i=0;i<item.data.length;i++){
                sum1.push(parseInt(item.data[i]))
            }
        }else{
        	$('.my-ipt2').prop('checked',false);
            $scope.info={
                id                    :       0,               //0是新增；非0是编辑
				shop_id               :       '', 
				name                  :       '',              //世界杯;活动名称
				info                  :       '',              //活动简介; 活动简介
				data                  :       '',              //活动数据 球队id
				card_id               :       153,             //活动会员卡id
				values                :       '',              //活动有效数据 球队id
				status                :       1,               //1：正常；0：失效
				start_time            :       '',              //开始时间
				end_time              :       '',              //结束时间
            }
        }
    };

    $scope.editModal_close=function(){
        $('#editModal').modal('hide');
    };


    //提交函数
    $scope.save = function () {
    	$scope.info.info=$('.summernote').summernote('code');
    	var teamNum = '';
    	for(var i=0;i<$scope.keep().length;i++){
    		if(i==$scope.keep().length-1){
    			teamNum = teamNum + $scope.keep()[i];
    		}else{
    			teamNum = teamNum + $scope.keep()[i]+',';
    		}
    	}
        $http({
            method: 'POST',
            url:window.base_url+'/manager/activity/save',
            data: {

                id                    :           $scope.info.id, 		
				shop_id               :           $scope.info.shop_id, 
				name                  :           $scope.info.name, 
				info                  :           $scope.info.info, 
				data                  :           teamNum, 
				card_id               :           $scope.info.card_id, 
				values                :           teamNum, 
				status                :           $scope.info.status, 
				start_time            :           $scope.info.start_time, 
				end_time              :           $scope.info.end_time, 
            }
        }).success(function(data){

            if(data.code==200){

                $('#editModal').modal('hide');
                $scope.load();

            }else{

                  layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    };
}]);

