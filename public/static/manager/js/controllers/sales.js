'use strict';

app.controller('salesController', ['$scope', '$state','storeFactory','$location','infoService','$filter','$log','$http',
						function($scope, $state,storeFactory,$location,infoService,$filter,$log,$http) {

    //加载三级联动
    $scope.area=app.area;

    $scope.txt='销售人员管理';

    $scope.parmList={
        type            :        '',             //销售类型（可不传）
		phone           :        '',             //手机
		real_name       :        '',             //姓名
		status          :        '',             //1为正常，0为锁定。不传列出所有
		page_no         :        1,              //当前页
		page_size       :        10,             //每页显示条数
    }
    //分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.loadSales();
    }
    //加载
    $scope.loadSales=function(){
        if($scope.parmList.type==''){
            delete $scope.parmList.type;
        }
        if($scope.parmList.status==''){
            delete $scope.parmList.status;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/saleman/getlist',
            data: {
                type            :    $scope.parmList.type,
				phone           :    $scope.parmList.phone,
				real_name       :    $scope.parmList.real_name,
				status          :    $scope.parmList.status,
				page_no         :    $scope.parmList.page_no,
				page_size       :    $scope.parmList.page_size,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.newSalesList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadSales();

    //锁定
    $scope.lock=function(item){
        layer.msg('确定锁定该销售员吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/saleman/save',
                    data: {
                        real_name   :    item.real_name,
                        phone       :    item.phone,
                        type 		:    item.type,
                        images 		:    item.images,
                        intro       :    item.intro,
                        avatar		:	 item.avatar,
                        status  	:    0,
                    }
                }).success(function(data){
                    if(data.code==200){
                        layer.msg('锁定成功', {icon: 1});
                        $scope.loadSales();
                    }else{
                        layer.msg(data.message, {icon: 2});
                    }

                }).error( function(data){
                    layer.msg('服务器访问失败！', {icon: 2});
                });
            }
        });
    };
    //解锁
    $scope.unlock=function(item){
        layer.msg('确定解锁该销售员吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/saleman/save',
                    data: {
                        real_name   :    item.real_name,
                        phone       :    item.phone,
                        type 		:    item.type,
                        images 		:    item.images,
                        intro       :    item.intro,
                        avatar		:	 item.avatar,
                        status  	:    1,
                    }
                }).success(function(data){
                    if(data.code==200){
                        layer.msg('解锁成功', {icon: 1});
                        $scope.loadSales();
                    }else{
                        layer.msg(data.message, {icon: 2});
                    }

                }).error( function(data){
                    layer.msg('服务器访问失败！', {icon: 2});
                });
            }
        });
    };

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
        	$scope.info={
                real_name   :     item.real_name,
				phone       :     item.phone,
				// type        :     item.type,
				images      :     item.images,
				intro       :     item.intro,
				status      :     item.status,
				avatar      :     item.avatar,
            }
            $('.upload-img').prop('style',' background: url('+window.static_domain+$scope.info.avatar+')'+'50% 50% / cover no-repeat');
            $('.summernote').summernote('code',$scope.info.intro);
            $("div.details-figure").html('');
            for(var j=0;j<$scope.info.images.length;j++){
                picSum.push($scope.info.images[j]);
                $("div.details-figure").append(
                    divPic($scope.info.images[j],j)
                )
            }
        }else{
            $("div.details-figure div").remove();
            $('.summernote').summernote('code','<p><br></p>');
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
        	$scope.info={
                user_id     :  0,
                real_name   :  '',   //姓名
				phone       :  '',   //电话
				// type        :  '',   //销售类型（可不传）
				images      :  [],   //销售人员形象照
				intro       :  '',   //销售人员描述
				status      :  1,   //1正常，0锁定
				avatar      :  '',   //销售人员头像
            }
        }
    };

    $scope.editModal_close=function(){
        $('#editModal').modal('hide');
    };
    //上传图片模态框
    $scope.imgModal_open = function(){
        $('#avatar-modal2').modal('show');
    }
    $scope.imgModal_close = function(){
        $('#avatar-modal2').modal('hide');
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
    //回调详情图
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
        console.log($scope.info.user_id);
        if($scope.info.user_id != 0){
            delete $scope.info.user_id;
        }else{
            $scope.info.user_id == 0;
        }
        $scope.info.intro=$('.summernote').summernote('code');
        $scope.info.images=[];
        for(var i=0;i<$('.img2').length;i++){
            if (truee($('.img2:eq('+i+')').attr('data-img'))) {
                $scope.info.images.push($('.img2:eq('+i+')').attr('data-img'));
            }
        };
        $http({
            method: 'POST',
            url:window.base_url+'/manager/saleman/save',
            data: {
                user_id     :     $scope.info.user_id,
                real_name   :     $scope.info.real_name,
				phone       :     $scope.info.phone,
				// type        :     $scope.info.type,
				images      :     $scope.info.images,
				intro       :     $scope.info.intro,
				status      :     $scope.info.status,
				avatar      :     $scope.info.avatar,
            }
        }).success(function(data){
            if(data.code==200){
                $('#editModal').modal('hide');
                $scope.loadSales();
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    };
}]);

