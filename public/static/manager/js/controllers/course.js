app.controller('courseController', ['$scope', '$state','kclistFactory','kceditFactory','$location','infoService','$filter','$http','$stateParams',
                     function($scope, $state,kclistFactory,kceditFactory,$location,infoService,$filter,$http,$stateParams) {

    $scope.txt='课程管理';
    $scope.courseType = 1;

    //默认加载
    $scope.tabs = [true, false];

    $scope.tab = function(index){

        angular.forEach($scope.tabs, function(i, v) {
            $scope.tabs[v] = false;
        });

        $scope.tabs[index] = true;

    };
    //加载教练
    $scope.loadCoach=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/search',
            data: {
                keyword    :      '',           //名字或者手机
                status     :      1,            // 1为正常
                limit      :      0,            //返回条数，0为所有
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
    //加载公共课
    $scope.parmListCom={

        type            :        1,                 // 1公开，2小团，3私教
        course_name     :       '',                 //课程名称
        status          :       '',                 //int 1 为正常，不传所有
        level           :        0,                 //训练难度，0所有，1一般，2进阶
        page_no         :       '1',                //int 当前页
        page_size       :       10,                 //int 每页显示条数
    }
    $scope.maxSize=5;
    $scope.pagesCom=function(){
        $scope.loadCom();
    }
    $scope.loadCom=function(){
        if($scope.parmListCom.status==''){
            delete $scope.parmListCom.status;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/getlist',
            data: {
                type            :     $scope.parmListCom.type,
                course_name     :     $scope.parmListCom.course_name,
                status          :     $scope.parmListCom.status,
                level           :     $scope.parmListCom.level,
                page_no         :     $scope.parmListCom.page_no,
                page_size       :     $scope.parmListCom.page_size,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.commonCourseList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadCom();
    //加载私教课
    $scope.parmListPri={
        type            :        3,                 // 1公开，2小团，3私教
        status          :        '',                //int 1 为正常，0为锁定
        level           :        0,                 //训练难度，0所有，1一般，2进阶
        page_no         :       '1',                //int 当前页
        page_size       :       10,                 //int 每页显示条数
        course_name     :        '',                //课程名称
        coach_user_id   :        '',                //教练
    }
    $scope.maxSize=5;
    $scope.pagesPri=function(){
        $scope.loadPri();
    }
    $scope.loadPri=function(){
        if($scope.parmListPri.status==''){
            delete $scope.parmListPri.status;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/getlist',
            data: {
                type            :     $scope.parmListPri.type,
                status          :     $scope.parmListPri.status,
                level           :     $scope.parmListPri.level,
                page_no         :     $scope.parmListPri.page_no,
                page_size       :     $scope.parmListPri.page_size,
                course_name     :     $scope.parmListPri.course_name,
                coach_user_id   :     $scope.parmListPri.coach_user_id,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.privateCourseList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadPri();
    //加载小团课
    $scope.parmListGro={
        type            :        2,                 // 1公开，2小团，3私教
        status          :        '',                //int 1 为正常，0为锁定
        level           :        0,                 //训练难度，0所有，1一般，2进阶
        page_no         :       '1',                //int 当前页
        page_size       :       10,                 //int 每页显示条数
        course_name     :        '',                //课程名称
        coach_user_id   :        '',                //教练
    }
    $scope.maxSize=5;
    $scope.pagesGro=function(){
        $scope.loadGro();
    }
    $scope.loadGro=function(){
        if($scope.parmListGro.status==''){
            delete $scope.parmListGro.status;
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/getlist',
            data: {
                type            :     $scope.parmListGro.type,
                status          :     $scope.parmListGro.status,
                level           :     $scope.parmListGro.level,
                page_no         :     $scope.parmListGro.page_no,
                page_size       :     $scope.parmListGro.page_size,
                course_name     :     $scope.parmListGro.course_name,
                coach_user_id   :     $scope.parmListGro.coach_user_id,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.groupCourseList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadGro();
    //加载小团课无分页
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
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    };
    $scope.loadGroupCourse();

    //锁定
    $scope.lock=function(item){
        layer.msg('确定锁定该课程吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/course/save',
                    data: {
                        course_id           :   item.course_id,        //0为新增
                        course_name         :   item.course_name,      //课程名称
                        coach_user_id       :   item.coach_user_id,    //教练，不需要传0
                        type                :   item.type,             //1公开课 2小团课 3私教
                        intro               :   item.intro,            //介绍
                        level               :   item.level,            //训练难度，1一般，2进阶
                        cover               :   item.cover,            //封面图
                        images              :   item.images,           //介绍图，数组
                        time                :   item.time,             //时长，分钟
                        min_user            :   item.min_user,         //最小开课人数 不需要传0
                        max_user            :   item.max_user,         //最大开课人数 不需要传0
                        origin_price        :   item.origin_price,     //原价 不需要传0
                        price               :   item.price,            //现价 不需要传0
                        min_buy             :   item.min_buy,          //最低购买 不需要传0
                        max_buy             :   item.max_buy,          //最多购买 不需要传0
                        expire_day          :   item.expire_day,       //有效天数 不需要传0
                        status              :   0,                     //1正常，0锁定，-1删除
                        groups              :   item.groups,           //数组形式，添加子课程
                        kcal                :   item.kcal,             //消耗千卡
                    }
                }).success(function(data){
                    if(data.code==200){
                        layer.msg('锁定成功', {icon: 1});
                        if(item.type==1){//公共课
                            $scope.loadCom();
                        }
                        if(item.type==2){//小团课
                            $scope.loadGro();
                        }
                        if(item.type==3){//私教课
                            $scope.loadPri();
                        }
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
        layer.msg('确定解锁该课程吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/course/save',
                    data: {
                        course_id           :   item.course_id,        //0为新增
                        course_name         :   item.course_name,      //课程名称
                        coach_user_id       :   item.coach_user_id,    //教练，不需要传0
                        type                :   item.type,             //1公开课 2小团课 3私教
                        intro               :   item.intro,            //介绍
                        level               :   item.level,            //训练难度，1一般，2进阶
                        cover               :   item.cover,            //封面图
                        images              :   item.images,           //介绍图，数组
                        time                :   item.time,             //时长，分钟
                        min_user            :   item.min_user,         //最小开课人数 不需要传0
                        max_user            :   item.max_user,         //最大开课人数 不需要传0
                        origin_price        :   item.origin_price,     //原价 不需要传0
                        price               :   item.price,            //现价 不需要传0
                        min_buy             :   item.min_buy,          //最低购买 不需要传0
                        max_buy             :   item.max_buy,          //最多购买 不需要传0
                        expire_day          :   item.expire_day,       //有效天数 不需要传0
                        status              :   1,                     //1正常，0锁定，-1删除
                        groups              :   item.groups,           //数组形式，添加子课程
                        kcal                :   item.kcal,             //消耗千卡
                    }
                }).success(function(data){
                    if(data.code==200){
                        layer.msg('锁定成功', {icon: 1});
                        if(item.type==1){//公共课
                            $scope.loadCom();
                        }
                        if(item.type==2){//小团课
                            $scope.loadGro();
                        }
                        if(item.type==3){//私教课
                            $scope.loadPri();
                        }
                    }else{
                        layer.msg(data.message, {icon: 2});
                    }
                }).error( function(data){
                    layer.msg('服务器访问失败！', {icon: 2});
                });
            }
        });
    };
    //删除
    $scope.delete=function(item){
        layer.msg('确定解锁该课程吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/course/save',
                    data: {
                        course_id           :   item.course_id,        //0为新增
                        course_name         :   item.course_name,      //课程名称
                        coach_user_id       :   item.coach_user_id,    //教练，不需要传0
                        type                :   item.type,             //1公开课 2小团课 3私教
                        intro               :   item.intro,            //介绍
                        level               :   item.level,            //训练难度，1一般，2进阶
                        cover               :   item.cover,            //封面图
                        images              :   item.images,           //介绍图，数组
                        time                :   item.time,             //时长，分钟
                        min_user            :   item.min_user,         //最小开课人数 不需要传0
                        max_user            :   item.max_user,         //最大开课人数 不需要传0
                        origin_price        :   item.origin_price,     //原价 不需要传0
                        price               :   item.price,            //现价 不需要传0
                        min_buy             :   item.min_buy,          //最低购买 不需要传0
                        max_buy             :   item.max_buy,          //最多购买 不需要传0
                        expire_day          :   item.expire_day,       //有效天数 不需要传0
                        status              :   -1,                     //1正常，0锁定，-1删除
                        groups              :   item.groups,           //数组形式，添加子课程
                        kcal                :   item.kcal,             //消耗千卡
                    }
                }).success(function(data){
                    if(data.code==200){
                        layer.msg('锁定成功', {icon: 1});
                        if(item.type==1){//公共课
                            $scope.loadCom();
                        }
                        if(item.type==2){//小团课
                            $scope.loadGro();
                        }
                        if(item.type==3){//私教课
                            $scope.loadPri();
                        }
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
    };
    //累计子课程
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
    //编辑模态框
    $scope.editModal_open=function(item,num){
        $('#editModal').modal('show');
        $scope.courseType = num;
        if(num == 1){
            $scope.coachId = 0;
            $scope.courseTime = 0;
        };
        if(num == 2){
            $scope.coachId = 2;
            $scope.courseTime = 0;
        };
        if(num == 3){
            $scope.coachId = 3;
            $scope.courseTime = 60;
        };
        if(item != 0){
            $("div.child-course div").remove();
            $scope.info={
                course_id           :           item.course_id,     //0为新增
                course_name         :           item.course_name,   //课程名称
                coach_user_id       :           item.coach_user_id, //教练，不需要传0
                type                :           item.type,          //1公开课 2小团课 3私教
                intro               :           item.intro,         //介绍
                level               :           item.level,         //训练难度，1一般，2进阶
                cover               :           item.cover,         //封面图
                images              :           item.images,        //介绍图，数组
                time                :           item.time,          //时长，分钟
                min_user            :           item.min_user,      //最小开课人数 不需要传0
                max_user            :           item.max_user,      //最大开课人数 不需要传0
                origin_price        :           item.origin_price,  //原价 不需要传0
                price               :           item.price,         //现价 不需要传0
                min_buy             :           item.min_buy,       //最低购买 不需要传0
                max_buy             :           item.max_buy,       //最多购买 不需要传0
                expire_day          :           item.expire_day,    //有效天数 不需要传0
                status              :           item.status,        //1正常，0锁定，-1删除
                groups              :           item.groups,        //数组形式，添加子课程
                kcal                :           item.kcal,          //消耗的卡路里（单位千卡）
            }
            $('.upload-img').prop('style',' background: url('+window.static_domain+$scope.info.cover+')'+'50% 50% / cover no-repeat');
            $('.summernote').summernote('code',$scope.info.intro);
            $("div.details-figure").html('');
            for(var j=0;j<$scope.info.images.length;j++){
                picSum.push($scope.info.images[j]);
                $("div.details-figure").append(
                    divPic($scope.info.images[j],j)
                )
            }
            if(num==2){
                $scope.childList = [];
                if($scope.info.groups!=""){
                    // $scope.childList=$scope.info.groups.split(",");
                    $scope.childList=$scope.info.groups;
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
                course_id           :           0,                 //0为新增
                course_name         :           '',                //课程名称
                coach_user_id       :           $scope.coachId,    //教练，不需要传0
                type                :           num,               //1公开课 2小团课 3私教
                intro               :           '',                //介绍
                level               :           1,                 //训练难度，1一般，2进阶
                cover               :           '',                //封面图
                images              :           [],                //介绍图，数组
                time                :           $scope.courseTime, //时长，分钟
                min_user            :           0,                 //最小开课人数 不需要传0
                max_user            :           0,                 //最大开课人数 不需要传0
                origin_price        :           0,                 //原价 不需要传0
                price               :           0,                 //现价 不需要传0
                min_buy             :           0,                 //最低购买 不需要传0
                max_buy             :           0,                 //最多购买 不需要传0
                expire_day          :           0,                 //有效天数 不需要传0
                status              :           1,                 //1正常，0锁定，-1删除
                groups              :           '',                //数组形式，添加子课程
                kcal                :           0,                 //消耗的卡路里（单位千卡）
            }
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
            $("div.details-figure div").remove();
            $('.summernote').summernote('code','<p><br></p>');
            $("div.child-course div").remove();
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
    //添加子课程
    //记录
    var couSum = [],
        couId  = 0;
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
        // return;
        for(var i=0;i<$('.group-list').length;i++){
            if($('.group-list:eq('+i+')').val() != ''){
                List.push($('.group-list:eq('+i+')').val());
            }
        }
        if($scope.info.type==2){
            // $scope.info.groups = List.toString();
            $scope.info.groups = List;
        }

        $scope.info.intro=$('.summernote').summernote('code');

        $scope.info.images=[];
        for(var i=0;i<$('.img2').length;i++){
            if (truee($('.img2:eq('+i+')').attr('data-img'))) {
                $scope.info.images.push($('.img2:eq('+i+')').attr('data-img'));
            }
        };

        if($scope.info.type != 1){
            if($scope.info.min_buy=='' || $scope.info.min_buy==0 || $scope.info.min_buy==undefined || $scope.info.min_buy=='undefined'){
                layer.msg('最低购买节数必填', {icon: 2});
                return
            }
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/save',
            data: {
                course_id           :           $scope.info.course_id,     //0为新增
                course_name         :           $scope.info.course_name,   //课程名称
                coach_user_id       :           $scope.info.coach_user_id, //教练，不需要传0
                type                :           $scope.info.type,          //1公开课 2小团课 3私教
                intro               :           $scope.info.intro,         //介绍
                level               :           $scope.info.level,         //训练难度，1一般，2进阶
                cover               :           $scope.info.cover,         //封面图
                images              :           $scope.info.images,        //介绍图，数组
                time                :           $scope.info.time,          //时长，分钟
                min_user            :           $scope.info.min_user,      //最小开课人数 不需要传0
                max_user            :           $scope.info.max_user,      //最大开课人数 不需要传0
                origin_price        :           $scope.info.origin_price,  //原价 不需要传0
                price               :           $scope.info.price,         //现价 不需要传0
                min_buy             :           $scope.info.min_buy,       //最低购买 不需要传0
                max_buy             :           $scope.info.max_buy,       //最多购买 不需要传0
                expire_day          :           $scope.info.expire_day,    //有效天数 不需要传0
                status              :           $scope.info.status,        //1正常，0锁定，-1删除
                groups              :           $scope.info.groups,        //数组形式，添加子课程
                kcal                :           $scope.info.kcal,          //消耗的卡路里（单位千卡）
            }
        }).success(function(data){

            if(data.code==200){

                 // $location.path('app/course/1');
                $('#editModal').modal('hide');
                if($scope.info.type==1){//公共课
                    $scope.loadCom();
                }
                if($scope.info.type==2){//小团课
                    $scope.loadGro();
                }
                if($scope.info.type==3){//私教课
                    $scope.loadPri();
                }

            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    };

}]);


