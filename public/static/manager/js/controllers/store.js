'use strict';

app.controller('storeController', ['$scope', '$state','storeFactory','$location','infoService','$filter','$log','$http',
						function($scope, $state,storeFactory,$location,infoService,$filter,$log,$http) {

    //加载三级联动
    $scope.area=app.area;

    $scope.txt='店铺管理';
    $scope.go=function(item){

        if(item==0)
            $location.path('app/new-store/0')

        else{

            infoService.setForm('storeDtl',item);
            $location.path('app/new-store/1')

        }
    };

    $scope.goOnline = function(item){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/online',
            data: {

                shop_id          :    item,
            }
        }).success(function(data){

            if(data.code==200){

                $scope.onlineList=data.data;

            }else{
                  layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }


    $scope.parmList={

        shop_name   :       '',                 //string 查询店铺名称
        province    :       '',                 //省
        city        :       '',                 //市
        county      :       '',                 //区县
        status      :       '',                  //1为正常 不传为所有；
        page_no     :       '1',                //int 当前页
        page_size   :       10,                 //int 每页显示条数
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
            url:window.base_url+'/manager/shop/getlist',
            data: {

                shop_name   :       $scope.parmList.shop_name,
                province    :       $scope.parmList.province,
                city        :       $scope.parmList.city,
                county      :       $scope.parmList.county,
                status      :       $scope.parmList.status,
                page_no     :       $scope.parmList.page_no,
                page_size   :       $scope.parmList.page_size,
            }
        }).success(function(data){

            if(data.code==200){
                $scope.newStoreList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.load();

    //禁用
    $scope.lock=function(item){
        layer.msg('确定禁用该店铺吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/shop/save',
                    data: {
                        shop_id               :       item.shop_id,
                        shop_name             :       item.shop_name,
                        tel                   :       item.tel,
                        intro                 :       item.intro,
                        aerobic_apparatus     :       item.aerobic_apparatus,
                        anaerobic_apparatus   :       item.anaerobic_apparatus,
                        cover                 :       item.cover,
                        images                :       item.images,
                        province              :       item.province,
                        city                  :       item.city,
                        county                :       item.county,
                        address               :       item.address,
                        establishment_date    :       item.establishment_date,
                        area                  :       item.area,
                        longitude             :       item.longitude,
                        latitude              :       item.latitude,
                        status                :       0,
                        devices               :       item.devices,
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

        layer.msg('确定启用该店铺吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/shop/save',
                    data: {

                        shop_id               :       item.shop_id,
                        shop_name             :       item.shop_name,
                        tel                   :       item.tel,
                        intro                 :       item.intro,
                        aerobic_apparatus     :       item.aerobic_apparatus,
                        anaerobic_apparatus   :       item.anaerobic_apparatus,
                        cover                 :       item.cover,
                        images                :       item.images,
                        province              :       item.province,
                        city                  :       item.city,
                        county                :       item.county,
                        address               :       item.address,
                        establishment_date    :       item.establishment_date,
                        area                  :       item.area,
                        longitude             :       item.longitude,
                        latitude              :       item.latitude,
                        status                :       1,
                        devices               :       item.devices,
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

    //加载三级联动
    $scope.area=app.area;
    $scope.id = '';
    $scope.type = 0;

    //加载管家
    $scope.stewards={

        real_name   :   '',           //姓名
        phone       :   '',           //电话
        status      :   1,            //1为正常
        limit       :   0,            //返回数量，0为所有
    }

    //加载
    $scope.loadStewards=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/search',
            data: {

                real_name :    $scope.stewards.real_name,
                phone     :    $scope.stewards.phone,
                status    :    $scope.stewards.status,
                limit     :    $scope.stewards.limit,
            }
        }).success(function(data){

            if(data.code==200){
                $scope.stewardsList=data.data;
                if($scope.stewardsList.length>0){
                    $scope.id = $scope.stewardsList[0].user_id;
                }else{
                    $scope.id = '';
                }

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.search_N = function(){
        if($scope.stewards.real_name == ''){
            layer.msg('请输入管家名称进行查找！');
            return;
        }
        $scope.loadStewards();
    }
    $scope.search_P = function(){
        if($scope.stewards.phone == ''){
            layer.msg('请输入管家电话进行查找！');
            return;
        }
        $scope.loadStewards();
    }
    $scope.genggai = function(){
        $scope.type = 0;
    }

    $("#dtBox").DateTimePicker({

        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"

    });


    function div(id,int,ali,att){//设备号

        return '<div class="alone row aa detail" style="height: 100%;">'+
                        '<div class="col-md-2 col-xs-2 m-b no-padder text-right">'+
                            '设备号：'+
                        '</div>'+
                        '<div class="col-md-3 col-xs-3 m-b padder-lr-none">'+
                            '<input type="text" class="shebeihao" value="'+id+'">'+
                        '</div>'+
                        '<div class="col-md-2 col-xs-2 m-b no-padder text-right">'+
                            '刷新时间：'+
                        '</div>'+
                        '<div class="col-md-3 col-xs-3 m-b padder-lr-none">'+
                            '<input type="number" class="shijian" value="'+int+'">'+
                        '</div>'+
                        '<div class="col-md-1 col-xs-1 m-b padder-r-none">'+
                            '秒'+
                        '</div>'+
                        '<div class="col-md-1 col-xs-1 m-b padder-l-none">'+
                            '<button class="btn remove" btnid="'+id+'" onclick="remove(\''+id+'\')">删除</button>'+
                        '</div>'+
                        '<div class="col-md-2 col-xs-2 m-b no-padder text-right">'+
                            '设备别名：'+
                        '</div>'+
                        '<div class="col-md-3 col-xs-3 m-b padder-lr-none">'+
                            '<input type="text" class="bieming"  value="'+ali+'" >'+
                        '</div>'+
                        '<div class="col-md-2 col-xs-2 m-b no-padder text-right">'+
                            '附加数据：'+
                        '</div>'+
                        '<div class="col-md-3 col-xs-3 m-b padder-lr-none">'+
                            '<input type="text" class="fujiashuju" value="'+att+'" >'+
                        '</div>'+
                    '</div>'
    }

    function divPic(img,id){//详情图

        return  '<div class="col-md-3 col-xs-3 no-padder bb" id="'+img+'">'+
                    '<div style="width:85px;height:50px;margin-bottom:10px;">'+
                        '<img class="img2" style="width:85px;height:50px;" src="uploads/'+img+'"  data-img="'+img+'" >'+
                    '</div>'+
                    '<div class="wenzi removePic" picid="'+id+'" onclick="removePic(\''+id+'\')" style="position: relative;top: -60px;right:-70px;width: 15px; height:15px;line-height:15px;background-color: rgba(0,0,0,0.3);color: #fff;text-align: center;cursor: pointer">'+
                        'X'+
                    '</div>'+
                '</div>'
    }

    //编辑模态框
    $scope.editModal_open=function(item){
        $('#editModal').modal('show');
        if(item!=0){
            if(item.manager == null){
                $scope.type = 0;
            }else{
                $scope.type = 1;
            }
            $scope.info={
                shop_name             :       item.shop_name,
                tel                   :       item.tel,
                intro                 :       item.intro,
                cover                 :       item.cover,
                images                :       item.images,
                province              :       item.province,
                city                  :       item.city,
                county                :       item.county,
                address               :       item.address,
                establishment_date    :       item.establishment_date,
                area                  :       item.area,
                status                :       item.status,
                manager_user_id       :       item.manager_user_id,
                device_id             :       item.device_id,
                device_attach         :       item.device_attach,
                qrcode_interval       :       item.qrcode_interval,
                shop_id               :       item.shop_id,
                aerobic_apparatus     :       item.aerobic_apparatus,
                anaerobic_apparatus   :       item.anaerobic_apparatus,
                longitude             :       item.longitude,
                latitude              :       item.latitude,
                jingweidu             :       item.jingweidu,
                devices               :       item.devices,
                manager               :       item.manager,
            }
            $('.upload-img').prop('style',' background: url('+window.static_domain+$scope.info.cover+')'+'50% 50% / cover no-repeat');
            if($scope.type == 1){
                $('.user-avatar').prop('style',' background: url('+window.static_domain+item.manager.avatar+')'+'50% 50% / cover no-repeat');
            }
            $('.summernote').summernote('code',$scope.info.intro);

            $scope.info.jingweidu=$scope.info.longitude+','+$scope.info.latitude;

            if($scope.info.manager_user_id==0){
                $scope.type = 0;
            }

            $("div.equipment").html('');
            for(var j=0;j<item.devices.length;j++){

                btnSum.push(item.devices[j].device_id);

                $("div.equipment").append(
                    div(item.devices[j].device_id,item.devices[j].qrcode_interval,item.devices[j].device_alias,item.devices[j].device_attach)
                )
            }
            $("div.details-figure").html('');
            for(var j=0;j<$scope.info.images.length;j++){

                picSum.push($scope.info.images[j]);

                $("div.details-figure").append(
                    divPic($scope.info.images[j],j)
                )
            }
        }else{
            $scope.type = 0;
            $scope.info={
                shop_name             :       '',                      //名称
                tel                   :       '',                      //电话
                intro                 :       '',                      //介绍
                cover                 :       '',                      //封面
                images                :       [],                      //图片（数组）
                province              :       '',                      // 省份
                city                  :       '',                      //城市
                county                :       '',                      //区县
                address               :       '',                      //地址
                establishment_date    :       '',                      //成立时间
                area                  :       '',                      //面积
                status                :       1,                       //1启用，0禁用
                manager_user_id       :       '',                      //管家用户id
                device_id             :       1,                       //智能门设备ID
                device_attach         :       '',                      //智能门附加数据
                qrcode_interval       :       5,                       //int 二维码有效时间(秒)
                shop_id               :       0,
                aerobic_apparatus     :       '',                      //有氧器械
                anaerobic_apparatus   :       '',                      //无氧器械
                longitude             :       '',                      //经度
                latitude              :       '',                      //纬度
                jingweidu             :       '',
            }
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
            $("div.details-figure div").remove();
            $("div.equipment div").remove();
        }
    };

    $scope.editModal_close=function(){
        $('#editModal').modal('hide');
    };
    //上传图片模态框
    $scope.imgModal_open = function(){
        $('#avatar-modal').modal('show');
    }
    $scope.imgModal_close = function(){
        $('#avatar-modal').modal('hide');
    }
    $scope.imgModal1_open = function(){
        $('#avatar-modal1').modal('show');
    }
    $scope.imgModal1_close = function(){
        $('#avatar-modal1').modal('hide');
    }

    //回调图片
    $scope.getImg=function(urll){

        $('.upload-img').prop('src',urll);

    }
    $scope.getImgs=function(urll,data){

        $('#'+picId+' .img2').prop('src',urll);
        $('#'+picId+' .img2').attr('data-img',data);
    }

    //判断上传图片是否为空
    function truee(obj){

        if(obj && obj!=undefined && obj!="undefined"  && obj!=null && obj!="null")
            return true
        else
            return false
    }

    //提交函数
    $scope.save = function () {
        var devices=[];
        for(var k=0;k<$('.detail').length;k++){

            devices.push({
                device_id:$('.detail .shebeihao').eq(k).val(),
                qrcode_interval:$('.detail .shijian').eq(k).val(),
                device_alias:$('.detail .bieming').eq(k).val(),
                device_attach:$('.detail .fujiashuju').eq(k).val(),
            });
        }
        $scope.info.intro=$('.summernote').summernote('code');
        $scope.b=$scope.info.jingweidu.split(",");


        $scope.info.images=[];
        for(var i=0;i<$('.img2').length;i++){
            if (truee($('.img2:eq('+i+')').attr('data-img'))) {
                $scope.info.images.push($('.img2:eq('+i+')').attr('data-img'));
            }
        };

        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/save',
            data: {

                shop_id                     :       $scope.info.shop_id,
                shop_name                   :       $scope.info.shop_name,
                tel                         :       $scope.info.tel,
                intro                       :       $scope.info.intro,
                cover                       :       $scope.info.cover,
                images                      :       $scope.info.images,
                province                    :       $scope.info.province,
                city                        :       $scope.info.city,
                county                      :       $scope.info.county,
                address                     :       $scope.info.address,
                establishment_date          :       $scope.info.establishment_date,
                area                        :       $scope.info.area,
                status                      :       $scope.info.status,
                manager_user_id             :       $scope.id,
                devices                     :       devices,
                aerobic_apparatus           :       $scope.info.aerobic_apparatus,
                anaerobic_apparatus         :       $scope.info.anaerobic_apparatus,
                longitude                   :       $scope.b[0],
                latitude                    :       $scope.b[1],
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

