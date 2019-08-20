'use strict';

app.controller('couponController', ['$scope', '$state','$location','infoService','$filter','$http','clubcardFactory',
                            function($scope, $state,$location,infoService,$filter,$http,clubcardFactory) {

    $scope.txt='优惠券管理';
    //加载优惠券
    $scope.parmList={

        coupon_name       :          '',            //优惠券名称
        type              :          '',            //1打折，2直减现金，不传所有
        status            :          '',            //1为正常,0锁定，不传所有
        page_no           :          1,             //当前页
        page_size         :          10,            //每页显示条数
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
        if($scope.parmList.type==''){
            delete $scope.parmList.type;
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coupon/getlist',
            data: {

                coupon_name       :     $scope.parmList.coupon_name,
                type              :     $scope.parmList.type,
                status            :     $scope.parmList.status,
                page_no           :     $scope.parmList.page_no,
                page_size         :     $scope.parmList.page_size,
            }
        }).success(function(data){

            if(data.code==200){
                $scope.newCouponList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.load();

    //下架
    $scope.xiajia=function(item){

        layer.msg('确定下架该优惠券吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/coupon/save',
                    data: {

                        coupon_id        :       item.coupon_id,
                        coupon_name      :       item.coupon_name,
                        cover            :       item.cover,
                        type             :       item.type,
                        is_give          :       item.is_give,
                        discount_value   :       item.discount_value,
                        send_type        :       item.send_type,
                        relation_id      :       item.relation_id,
                        expire_time      :       item.expire_time,
                        status           :       0,

                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('下架成功', {icon: 1});
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

    //上架
    $scope.shangjia=function(item){

        layer.msg('确定上架该优惠券吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/coupon/save',
                    data: {

                        coupon_id        :       item.coupon_id,
                        coupon_name      :       item.coupon_name,
                        cover            :       item.cover,
                        type             :       item.type,
                        is_give          :       item.is_give,
                        discount_value   :       item.discount_value,
                        send_type        :       item.send_type,
                        relation_id      :       item.relation_id,
                        expire_time      :       item.expire_time,
                        status           :       1,

                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('上架成功', {icon: 1});
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

    //会员卡编辑模态框
    $scope.editModal_open = function(item){
        $('#editModal').modal('show');
        if(item!=0){
            $scope.info={

                coupon_id        :         item.coupon_id,
                coupon_name      :         item.coupon_name,
                cover            :         item.cover,
                type             :         item.type,
                is_give          :         item.is_give,
                discount_value   :         item.discount_value,
                send_type        :         item.send_type,
                relation_id      :         item.relation_id,
                expire_time      :         item.expire_time,
                status           :         item.status,
            }
            $('.upload-img').prop('style',' background: url('+window.static_domain+$scope.info.cover+')'+'50% 50% / cover no-repeat');

        }else{
            $scope.info={

                coupon_id        :         0,                           //0为新增，大于0为编辑
                coupon_name      :         '',                          //优惠券名称
                cover            :         '',                          //封面
                type             :         2,                           //1打折，2直减现金
                is_give          :         1,                           //0不可以赠送，1可以
                discount_value   :         1,                           //折扣值，根据type
                send_type        :         'BUY_CARD',                  //固定值，传"BUY_CARD"
                relation_id      :         '',                          //关联card_id。买这张卡就送这张优惠券
                expire_time      :         dayTime,                     //过期时间
                status           :         1,                           //1 正常，0下架
            }
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
        }
    };
    $scope.editModal_close = function(){
        $('#editModal').modal('hide');
    }
    //上传图片模态框
    $scope.imgModal_open = function(){
        $('#avatar-modal').modal('show');
    }
    $scope.imgModal_close = function(){
        $('#avatar-modal').modal('hide');
    }
    $("#dtBox").DateTimePicker({

        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"

    });

    var nowDay = new Date();
    var timeYear = nowDay.getFullYear();
    var timeMonth = nowDay.getMonth()+1;
    var timeDay = nowDay.getDate();
    timeMonth = (timeMonth<10 ? "0"+timeMonth:timeMonth);
    timeDay   = (timeDay<10 ? "0"+timeDay:timeDay);
    var dayTime = timeYear+'-'+timeMonth+'-'+timeDay+' '+'00:00:00';

    //加载会员卡
    clubcardFactory.get().then(function(data){
        $scope.newCardList=data.data;
    });

    //回调图片
    $scope.getImg=function(urll){

        $('.upload-img').prop('src',urll)

    }


    //提交函数
    $scope.save = function () {

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coupon/save',
            data: {

                coupon_id        :       $scope.info.coupon_id,
                coupon_name      :       $scope.info.coupon_name,
                cover            :       $scope.info.cover,
                type             :       $scope.info.type,
                is_give          :       $scope.info.is_give,
                discount_value   :       $scope.info.discount_value,
                send_type        :       $scope.info.send_type,
                relation_id      :       $scope.info.relation_id,
                expire_time      :       $scope.info.expire_time,
                status           :       $scope.info.status,
            }
        }).success(function(data){

            if(data.code==200){

                $scope.load();
                $('#editModal').modal('hide');

            }else{

                  layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    };

}]);

