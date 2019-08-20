app.controller('newcommController', ['$scope', '$state','kclistFactory','kceditFactory','$http','$location','$stateParams','infoService',
                            function($scope, $state,kclistFactory,kceditFactory,$http,$location,$stateParams,infoService) {

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

    if($stateParams.item!=0){

        if(infoService.getForm('courseDtl')){

            $scope.info=infoService.getForm('courseDtl');
            // $('.upload-img').prop('src',window.static_domain+$scope.info.cover);
            $('.upload-img').prop('style',' background: url('+window.static_domain+$scope.info.cover+')'+'50% 50% / cover no-repeat');
            $('.summernote').summernote('code',$scope.info.intro)

            $("div.details-figure").html('');
            for(var j=0;j<$scope.info.images.length;j++){

                picSum.push($scope.info.images[j]);

                $("div.details-figure").append(
                    divPic($scope.info.images[j],j)
                )
            }
        }
    }else{

        $scope.info={

            course_id           :           0,          //为新增
            course_name         :           '',         //课程名称
            coach_user_id       :           0,          //教练,不需要传0
            type                :           1,          //1公开课 2小团课 3私教
            intro               :           1,          //介绍
            level               :           1,          //训练难度，1一般，2进阶
            cover               :           '',         //封面图
            images              :           [],         //介绍图，数组
            time                :           '',         //时长，分钟
            min_user            :           1,          //最小开课人数，不需要传0
            max_user            :           1,          //最大开课人数，不需要传0
            origin_price        :           0,          //原价，不需要传0
            price               :           0,          //现价，不需要传0
            min_buy             :           0,          //最低购买，不需要传0
            max_buy             :           0,          //最多购买，不需要传0
            expire_day          :           0,          //有效天数，不需要传0
            status              :           1,
            kcal                :           1,          //消耗的卡路里（单位千卡）
        }
        $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
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

        $scope.info.intro=$('.summernote').summernote('code');

        $scope.info.images=[];
        for(var i=0;i<$('.img2').length;i++){
            if (truee($('.img2:eq('+i+')').attr('data-img'))) {
                $scope.info.images.push($('.img2:eq('+i+')').attr('data-img'));
            }
        };

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
                origin_price        :  0,
                price               :  0,
                min_buy             :  $scope.info.min_buy,
                max_buy             :  $scope.info.max_buy,
                expire_day          :  $scope.info.expire_day,
                status              :  $scope.info.status,
                kcal                :  $scope.info.kcal,
            }
        }).success(function(data){

            if(data.code==200){

                 $location.path('app/course/1');

            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    };


}]);