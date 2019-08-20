'use strict';

app.controller('clubcardController', ['$scope', '$state','clubcardFactory','$location','infoService','$filter','$http','partitionFactory',
                             function($scope, $state,clubcardFactory,$location,infoService,$filter,$http,partitionFactory) {

    $scope.txt='会员卡管理';
    //会员卡编辑模态框
    $scope.editCardModal_open = function(item){
        $('#editCardModal').modal('show');
        $scope.load();
        //获取到传值
        if(item!=0){

            $scope.info = {
                card_name           :       item.card_name,
                days                :       item.days,
                sort                :       item.sort,
                type                :       item.type,
                origin_price        :       item.origin_price,
                price               :       item.price,
                max_use             :       item.max_use,
                active_type         :       item.active_type,
                image               :       item.image,
                card_id             :       item.card_id,
                times               :       item.times,
                status              :       item.status,
                groups              :       item.groups,
                bean_type           :       item.bean_type,
                addMbr_status       :       item.addMbr_status,
                is_activity         :       item.is_activity,
                max_buy				:		item.max_buy		//0为不限制购买，1为只能购买一次，以此类推
            }
            // $('.upload-img').prop('src',window.static_domain+item.image);
            $('.upload-img').prop('style',' background: url('+window.static_domain+item.image+')'+'50% 50% / cover no-repeat');
            $('.summernote').summernote('code',item.description);

            var sum=[];
            for(var i=0;i<$scope.info.groups.length;i++){
                sum.push(parseInt($scope.info.groups[i]));
            }
            $scope.info.groups=sum;


        }else{

            $scope.info={

                card_name           :       '',                      //卡名称
                days                :       '',                      //有效天数
                sort                :       1,                       //排序
                description         :       '',                      //介绍
                type                :       1,                       //时效卡 & 次卡
                origin_price        :       1,                      //原价
                price               :       1,                       //现价
                max_use             :       1,                       //使用人数
                active_type         :       2,
                image               :       '',
                card_id             :       0,
                times               :       '',
                status              :       0,
                groups              :       [],                     //所属区域组的group_id
                bean_type           :       0,                      //是否可以赠送金豆 1:可以 0:不可以
                addMbr_status       :       1,                      //是否可添加成员，0为可以，1为不可以
                is_activity         :       0,                      //0:无活动；1：是世界杯；其它待定
                max_buy				:		0						//0为不限制购买，1为只能购买一次，以此类推
            }
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
            $('.summernote').summernote('code','<p><br></p>');

        }
    };
    $scope.editCardModal_close = function(){
        $('#editCardModal').modal('hide');
    }
    //上传图片模态框
    $scope.imgModal_open = function(){
        $('#avatar-modal').modal('show');
    }
    $scope.imgModal_close = function(){
        $('#avatar-modal').modal('hide');
    }

    //加载分区列表
    partitionFactory.get().then(function (data) {

        $scope.newgroupList = data.data;
    }, function (data) {

    });

    $scope.parmList={

        card_name   :       '',                 //string 查询卡名称
        group_id    :       '',                 //分区id(不传为空)
        status      :       '',                 //int 1 为正常，不传所有
        page_no     :       '1',                //int 当前页
        page_size   :       10,                 //int 每页显示条数
    }

    //分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.loadCard();
    }

    //加载
    $scope.loadCard=function(){
        if($scope.parmList.status==''){
            delete $scope.parmList.status;
        }
        if($scope.parmList.group_id==''){
            delete $scope.parmList.group_id;
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/card/getlist',
            data: {

                card_name   :     $scope.parmList.card_name,
                group_id    :     $scope.parmList.group_id,
                status      :     $scope.parmList.status,
                page_no     :     $scope.parmList.page_no,
                page_size   :     $scope.parmList.page_size,

            }
        }).success(function(data){

            if(data.code==200){

                $scope.newCardList=data.data;

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.loadCard();

    //下架
    $scope.xiajia=function(item){

        layer.msg('确定下架该会员卡吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/card/save',
                    data: {

                        card_id             :     item.card_id,          //0为新增，大于0为编辑
                        card_name           :     item.card_name,        //卡名称
                        description         :     item.description,      //介绍
                        type                :     item.type,             //1 为计时卡 2为计次卡
                        origin_price        :     item.origin_price,     //原价
                        price               :     item.price,            //现价
                        image               :     item.image,
                        days                :     item.days,            //有效天数
                        times               :     item.times,           //次数，计次卡需要
                        active_type         :     item.active_type,     //：购买当日激活，2：首次消费激活
                        max_use             :     item.max_use,        //最大使用人数，多人使用
                        groups              :     item.groups,         //分区的group_id,传数组
                        sort                :     item.sort,           //排序，越大越靠前
                        status              :     0,                    //1 正常，0下架
                        max_buy				:	  item.max_buy		//0为不限制购买，1为只能购买一次，以此类推

                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('下架成功', {icon: 1});
                        $scope.loadCard();

                    }else{
                        layer.msg(data.message, {icon: 2});

                    }

                }).error( function(data){

                    layer.msg('服务器访问失败！', {icon: 2});

                });
            }
        });

    };
    //上架
    $scope.shangjia=function(item){

        layer.msg('确定上架该会员卡吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/card/save',
                    data: {

                        card_id             :     item.card_id,          //0为新增，大于0为编辑
                        card_name           :     item.card_name,        //卡名称
                        description         :     item.description,      //介绍
                        type                :     item.type,             //1 为计时卡 2为计次卡
                        origin_price        :     item.origin_price,     //原价
                        price               :     item.price,            //现价
                        image               :     item.image,
                        days                :     item.days,            //有效天数
                        times               :     item.times,           //次数，计次卡需要
                        active_type         :     item.active_type,     //：购买当日激活，2：首次消费激活
                        max_use             :     item.max_use,        //最大使用人数，多人使用
                        groups              :     item.groups,         //分区的group_id,传数组
                        sort                :     item.sort,           //排序，越大越靠前
                        status              :     1,                    //1 正常，0下架
                        max_buy				:	  item.max_buy		//0为不限制购买，1为只能购买一次，以此类推

                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('上架成功', {icon: 1});
                        $scope.loadCard();

                    }else{
                        layer.msg(data.message, {icon: 2});

                    }

                }).error( function(data){

                    layer.msg('服务器访问失败！', {icon: 2});

                });
            }
        });

    };


    //加载分区节点
    $scope.load=function(){

        partitionFactory.get().then(function(data){

            //获取所有节点
            $scope.sum=[];

            for(var i=0;i<data.data.group.length;i++){

                $scope.sum.push(data.data.group[i].group_id)
            }

            $scope.quyuList=data.data.group;

        })
    }

    //遍历
    $scope.ego=function(){

        for(var i=0;i<$scope.info.groups.length;i++){

            $('input[value='+$scope.info.groups[i]+']').prop('checked',true)

        }

    }

    //保存遍历
    $scope.keep=function(){

        var sum=[];

        for(var i=0;i<$('.my-ipt').length;i++){

            if($('.my-ipt:eq('+i+')').prop('checked'))
                sum.push($('.my-ipt:eq('+i+')').val())
        }

        return sum;
    }


    //回调图片
    $scope.getImg=function(urll){

        $('.upload-img').prop('src',urll)

    }

    //提交函数
    $scope.save = function () {
        $scope.info.description=$('.summernote').summernote('code');


        $http({
            method: 'POST',
            url:window.base_url+'/manager/card/save',
            data: {

                card_name           :  $scope.info.card_name,
                days                :  $scope.info.days,
                price               :  $scope.info.price,
                sort                :  $scope.info.sort,
                description         :  $scope.info.description,
                type                :  $scope.info.type,
                origin_price        :  $scope.info.origin_price,
                max_use             :  $scope.info.max_use,
                active_type         :  $scope.info.active_type,
                image               :  $scope.info.image,
                times               :  $scope.info.times,
                card_id             :  $scope.info.card_id,
                status              :  $scope.info.status,
                bean_type           :  $scope.info.bean_type,
                groups              :  $scope.keep(),
                addMbr_status       :  $scope.info.addMbr_status,
                is_activity         :  $scope.info.is_activity,
                max_buy				:  $scope.info.max_buy		//0为不限制购买，1为只能购买一次，以此类推
            }
        }).success(function(data){

            if(data.code==200){

                 $('#editCardModal').modal('hide');
                 $scope.loadCard();

            }else{

                  layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    };

}]);

