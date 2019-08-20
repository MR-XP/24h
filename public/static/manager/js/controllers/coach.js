'use strict';

app.controller('coachController', ['$scope', '$state','coachFactory','$location','infoService','$filter','$http',
                             function($scope, $state,coachFactory,$location,infoService,$filter,$http) {

    $scope.txt='教练管理';


    $scope.parmList={

        type            :       2,                      //执教方式，1全职 2兼职
        phone           :       '',                     //手机
        real_name       :       '',                     //姓名
        status          :       '',                     //1为正常，0为锁定。不传列出所有
        sex             :       '',
        page_no         :       '1',                    //当前页
        page_size       :       10,                     //每页显示条数
        shop_id			:		''						//选择场馆
        
    }

    //分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.loadCoach();
    }

    //加载
    $scope.loadCoach=function(){
        if($scope.parmList.sex==''){
            delete $scope.parmList.sex;
        }
        if($scope.parmList.status==''){
            delete $scope.parmList.status;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/getlist',
            data: {
                type        :       $scope.parmList.type,
                phone       :       $scope.parmList.phone,
                real_name   :       $scope.parmList.real_name,
                status      :       $scope.parmList.status,
                sex         :       $scope.parmList.sex,
                page_no     :       $scope.parmList.page_no,
                page_size   :       $scope.parmList.page_size,
                shop_id		:		$scope.parmList.shop_id
            }
        }).success(function(data){

            if(data.code==200){

                $scope.newCoachList=data.data;

            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    }
    $scope.loadCoach();
	
	//加载私教场馆
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

    //锁定
    $scope.suoding=function(item){

        layer.msg('确定锁定该教练吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/coach/save',
                    data: {

                        user_id             : item.user_id,
                        real_name           : item.real_name,
                        avatar              : item.avatar,
                        sex                 : item.sex,
                        phone               : item.phone,
                        type                : item.type,
                        speciality          : item.sum,
                        intro               : item.intro,
                        images              : item.images,
                        seniority           : item.seniority,
                        score               : item.score,
                        shop_id				: item.shop_id,
                        /*shops               : item.shops,*/
                        status              : 0,
                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('锁定成功', {icon: 1});
                        $scope.loadCoach()

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
    $scope.jiesuo=function(item){

        layer.msg('确定解锁该教练吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/coach/save',
                    data: {

                        user_id             : item.user_id,
                        real_name           : item.real_name,
                        avatar              : item.avatar,
                        sex                 : item.sex,
                        phone               : item.phone,
                        type                : item.type,
                        speciality          : item.sum,
                        intro               : item.intro,
                        images              : item.images,
                        seniority           : item.seniority,
                        score               : item.score,
                        shop_id				: item.shop_id,
                        /*shops               : item.shops,*/
                        status              : 1,
                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('解锁成功', {icon: 1});
                        $scope.loadCoach()

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

    $scope.sum=[];//擅长
    $scope.sum1=[];//场馆
    $scope.b=[];

    $scope.data=[
        {id:1,title:'增肌'},
        {id:2,title:'产后恢复'},
        {id:3,title:'格斗'},
        {id:4,title:'瑜伽'},
        {id:5,title:'减脂塑形'},
    ];
    for(var i=0;i<$scope.data.length;i++){

        $scope.sum.push($scope.data[i].id)
    }

    //遍历
    $scope.newEgo=function(){

        var num='';

        for(var i=0;i<$('.my-ipt1').length;i++){
            if($('.my-ipt1:eq('+i+')').prop('checked'))
                num+=$('.my-ipt1:eq('+i+')').parent('.i-checks').find('span').text()+','
        }
        $scope.sum=num;
    }

    //加载店铺节点
    $scope.load=function(){
        $scope.parmListShop={

            status      :       1,                  //1为正常 不传为所有；
            page_no     :       1,                  //int 当前页
            page_size   :       10000,              //int 每页显示条数
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/getlist',
            data: {

                status      :       $scope.parmListShop.status,
                page_no     :       $scope.parmListShop.page_no,
                page_size   :       $scope.parmListShop.page_size,
            }
        }).success(function(data){

            if(data.code==200){
                $scope.storelist=data.data;
                for(var i=0;i<$scope.storelist.list.length;i++){
                    $scope.sum1.push($scope.storelist.list[i].shop_id)
                }
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.load();


    //保存遍历
    $scope.keep=function(){

        var sum1=[];

        for(var i=0;i<$('.my-ipt2').length;i++){

            if($('.my-ipt2:eq('+i+')').prop('checked'))
                sum1.push($('.my-ipt2:eq('+i+')').val())
        }
        return sum1;
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
        $scope.sum_adept = [];
        $('#editCoachModal').modal('show');
        if(item!=0){
            $scope.info={

                user_id             :           item.user_id,
                real_name           :           item.real_name,
                avatar              :           item.avatar,
                sex                 :           item.sex,
                phone               :           item.phone,
                type                :           item.type,
                speciality          :           item.speciality,
                intro               :           item.intro,
                images              :           item.images,
                seniority           :           item.seniority,
                score               :           item.score,
                shops               :           item.shops,
                sale_rate           :           item.sale_rate,
                course_rate         :           item.course_rate,
                status              :           item.status,
                shop_id				:			item.shop_id
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

            //字符串处理成数组
            //擅长遍历
            $scope.b=$scope.info.speciality.split(",");
            $scope.sum_adept = $scope.info.speciality.split(",");
            if($scope.sum_adept.length>0){
                $('.my-ipt1').prop('checked',false);
                for(var i=0;i<$scope.sum_adept.length;i++){

                    for(var j=0;j<$('.my-ipt1').length;j++){

                        if($scope.sum_adept[i]==$('.my-ipt1:eq('+j+')').parent('.i-checks').find('span').text()){
                            $('.my-ipt1:eq('+j+')').prop('checked',true);

                        }
                    }
                }
            }

            //店铺遍历
            var sumShops = [];
            for(var i=0;i<$scope.info.shops.length;i++){
                sumShops.push(parseInt($scope.info.shops[i].shop_id));
            }

            $('.my-ipt2').prop('checked',false);
            if(sumShops.length>0){
                for(var i=0;i<sumShops.length;i++){
                    $('input[value='+sumShops[i]+']').prop('checked',true);
                }
            }

            var sum1=[];
            for(var i=0;i<$scope.info.shops.length;i++){
                sum1.push(parseInt($scope.info.shops[i].shop_id))
            }

        }
        else{
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
            $('.my-ipt1').prop('checked',false);
            $('.my-ipt2').prop('checked',false);
            $("div.details-figure div").remove();
            $('.summernote').summernote('code','<p><br></p>');
            $scope.info={

                user_id             :           0,          //0为新增
                real_name           :           '',         //姓名
                avatar              :           '',         //头像
                sex                 :           1,          //1男2女
                phone               :           '',         //电话
                type                :           2,          //1全职 2兼职
                speciality          :           '',         //擅长
                intro               :           '',         //介绍
                images              :           [],         //封面图，传数组
                seniority           :           1,          //教龄
                score               :           1,          //星级
                shops               :           [],         //服务的店铺id，传数组
                sale_rate           :           '',         //售课提成,0.05表示5%
                course_rate         :           '',         //耗课提成,0.05表示5%
                status              :           1,          //1正常，0锁定
                shop_id				:			''			//所属场馆
            }
        }
    };

    $scope.editModal_close=function(){
        $('#editCoachModal').modal('hide');
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

    //详情图点击
    $scope.look1=function(ix){

         $scope.ix=ix;
         $('#avatar-modal1').modal('show')

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

        $scope.newEgo();
        $scope.parmList.status = '';

        $scope.info.intro=$('.summernote').summernote('code');

        $scope.info.images=[];
        for(var i=0;i<$('.img2').length;i++){
            if (truee($('.img2:eq('+i+')').attr('data-img'))) {
                $scope.info.images.push($('.img2:eq('+i+')').attr('data-img'));
            }
        };

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/save',
            data: {

                user_id             : $scope.info.user_id,
                real_name           : $scope.info.real_name,
                avatar              : $scope.info.avatar,
                sex    				: $scope.info.sex,
                phone               : $scope.info.phone,
                type                : $scope.info.type,
                speciality          : $scope.sum,
                intro               : $scope.info.intro,
                images              : $scope.info.images,
                seniority           : $scope.info.seniority,
                score               : $scope.info.score,
                shops               : $scope.keep(),
                sale_rate           : $scope.info.sale_rate,
                course_rate         : $scope.info.course_rate,
                status              : $scope.info.status,
                shop_id				: $scope.info.shop_id
            }
        }).success(function(data){

            if(data.code==200){

                $('#editCoachModal').modal('hide');
                $scope.loadCoach();

            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    };

}]);


