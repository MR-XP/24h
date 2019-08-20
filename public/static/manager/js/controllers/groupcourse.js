app.controller('newgroupController', ['$scope', '$state','$http','$location','$stateParams','infoService',
                            function($scope, $state,$http,$location,$stateParams,infoService) {

    $scope.parmList={

        type            :       2,                      //执教方式，1全职 2兼职
        status          :       1,                      //1为正常，0为锁定。不传列出所有*/
        page_no         :       1,                      //当前页
        page_size       :       1000,                     //每页显示条数
    }
    //加载
    $scope.load=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/getlist',
            data: $scope.parmList,
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

    $scope.load();

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

    //记录
    var couSum = [],
        couId  = 0;

    //加载小团课
    $scope.loadGroupCourse = function () {
        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/search',
            data: {

                type  :    2,//小团课
            }
        }).success(function(data){

            if(data.code==200){

                $scope.newGroupList=data.data;
                if($stateParams.id!=0){

                    if(infoService.getForm('courseDtl')){

                        $scope.info=infoService.getForm('courseDtl');
                        $('.upload-img').prop('src',window.static_domain+$scope.info.cover);

                        $('.summernote').summernote('code',$scope.info.intro);

                        $("div.details-figure").html('');
                        for(var j=0;j<$scope.info.images.length;j++){

                            picSum.push($scope.info.images[j]);

                            $("div.details-figure").append(
                                divPic($scope.info.images[j],j)
                            )
                        }
                        $scope.childList = [];
                        if($scope.info.groups!=""){
                            $scope.childList=$scope.info.groups.split(",");
                        }
                        couId = $scope.childList.length-1;
                        if($scope.childList.length>0){
                            for(var i=0;i<$scope.childList.length;i++){
                                if($scope.childList[i]!=""){
                                    $("div.child-course").append(
                                        '<div class="alone row aa detail" style="height: 100%;">'+
                                            '<div class="col-md-3 col-xs-3 m-b no-padder text-right">'+
                                                ''+
                                            '</div>'+
                                            '<div class="col-md-8 col-xs-8 m-b no-padder text-right">'+
                                                getDiv($scope.childList[i],i)+
                                            '</div>'+
                                            '<div class="col-md-1 col-xs-1 m-b no-padder text-center">'+
                                                '<button class="btn delete" couid="'+i+'" onclick="removeCourse(\''+i+'\')">'+
                                                    '删除'+
                                                '</button>'+
                                            '</div>'+
                                        '</div>'
                                    );
                                }
                            }
                        }
                    }

                }else{

                    $scope.info={

                        course_id           :           0,          //0为新增
                        course_name         :           '',         //课程名称
                        coach_user_id       :           '',         //教练,不需要传0
                        type                :           2,          //1公开课 2小团课 3私教
                        intro               :           1,          //介绍
                        level               :           1,          //训练难度，1一般，2进阶
                        cover               :           '',         //封面图
                        images              :           [],         //介绍图，数组
                        time                :           60,         //时长，分钟
                        min_user            :           0,          //最小开课人数，不需要传0
                        max_user            :           0,          //最大开课人数，不需要传0
                        origin_price        :           0,          //原价，不需要传0
                        price               :           0,          //现价，不需要传0
                        min_buy             :           1,          //最低购买，不需要传0
                        max_buy             :           0,          //最多购买，不需要传0
                        expire_day          :           0,          //有效天数，不需要传0
                        status              :           1,
                        kcal                :           1,          //消耗的卡路里（单位千卡）
                        groups              :           [],         //数组形式，添加子课程

                    }
                }


            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    };
    $scope.loadGroupCourse();

    //累计
    function getDiv(id,num){

        var data = "<select class='group-list'>";

        for(var i=0;i<$scope.newGroupList.length;i++){
            if($scope.newGroupList[i].course_id == id)
                 data +="<option selected value="+$scope.newGroupList[i].course_id+">"+$scope.newGroupList[i].course_name+"</option>"
            else
                data +="<option value="+$scope.newGroupList[i].course_id+">"+$scope.newGroupList[i].course_name+"</option>"
        }

        data +="</select>";
        return data;

    }

    //添加子课程
    $("button.add-child-course").click(function(){
        couId++;
        couSum.push(couId);
        $("div.child-course").append(function(){
            return  '<div class="alone row aa detail" style="height: 100%;">'+
                        '<div class="col-md-3 col-xs-3 m-b no-padder text-right">'+
                            ''+
                        '</div>'+
                        '<div class="col-md-8 col-xs-8 m-b no-padder text-right">'+
                            getDiv('')+
                        '</div>'+
                        '<div class="col-md-1 col-xs-1 m-b no-padder text-center">'+
                            '<button class="btn delete" couid="'+couId+'" onclick="removeCourse('+couId+')">'+
                                '删除'+
                            '</button>'+
                        '</div>'+
                    '</div>';
        });

    });

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
        var List = [];
        for(var i=0;i<$('.group-list').length;i++){
            if($('.group-list:eq('+i+')').val() != ''){
                List.push($('.group-list:eq('+i+')').val());
            }
        }


        $scope.info.intro=$('.summernote').summernote('code');

        $scope.info.images=[];
        for(var i=0;i<$('.img2').length;i++){
            if (truee($('.img2:eq('+i+')').attr('data-img'))) {
                $scope.info.images.push($('.img2:eq('+i+')').attr('data-img'));
            }
        };


        if($scope.info.min_buy=='' || $scope.info.min_buy==0 || $scope.info.min_buy==undefined || $scope.info.min_buy=='undefined'){
            layer.msg('最低购买节数必填', {icon: 2});
            return
        }

        $http({
                method: 'POST',
                url:window.base_url+'/manager/course/save',
                data: {

                    course_id           :  $scope.info.course_id,
                    course_name         :  $scope.info.course_name,
                    coach_user_id       :  $scope.info.coach_user_id,
                    type                :  $scope.info.type,
                    intro               :  $scope.info.intro,
                    level               :  $scope.info.level,
                    cover               :  $scope.info.cover,
                    images              :  $scope.info.images,
                    time                :  $scope.info.time,
                    min_user            :  $scope.info.min_user,
                    max_user            :  $scope.info.max_user,
                    origin_price        :  $scope.info.origin_price,
                    price               :  $scope.info.price,
                    min_buy             :  $scope.info.min_buy,
                    max_buy             :  $scope.info.max_buy,
                    expire_day          :  $scope.info.expire_day,
                    status              :  $scope.info.status,
                    kcal                :  $scope.info.kcal,
                    groups              :  List,
                }
            }).success(function(data){

                if(data.code==200){

                     $location.path('app/course/2');

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

            });

    };

}]);
