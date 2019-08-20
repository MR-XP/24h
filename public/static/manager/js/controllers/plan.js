app.controller('planController', ['$scope', '$state','kclistFactory','kceditFactory','$location','infoService','$filter','$http','$stateParams',
                     function($scope, $state,kclistFactory,kceditFactory,$location,infoService,$filter,$http,$stateParams) {

    $scope.txt='排课管理';

    $("#dtBox").DateTimePicker({

        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"

    });

    //默认加载
    $scope.tabs = [true, false];

    $scope.tab = function(index){

        angular.forEach($scope.tabs, function(i, v) {
            $scope.tabs[v] = false;
        });

        $scope.tabs[index] = true;

    };

    //回调
    if($stateParams.id){

        angular.forEach($scope.tabs, function(i, v) {
            $scope.tabs[v] = false;
        })

        $scope.tabs[$stateParams.id] = true;
    }

    $scope.go2=function(item){

        if(item==0)
            $location.path('app/new-commoncourse/0')

        else{

            infoService.setForm('courseDtl',item);
            $location.path('app/new-commoncourse/1')

        }
    };

    $scope.go3=function(id){

        if(id==0)
            $location.path('app/new-privatecourse/0')

        else{

            infoService.setForm('courseDtl',id);
            $location.path('app/new-privatecourse/1')
        }
    };
}]);

//排课列表
app.controller('rowController', ['$scope','$location','$filter','$http','formatDate','$filter','$timeout',
                     	   function($scope,$location,$filter,$http,formatDate,$filter,$timeout) {

    //加载三级联动
    $scope.area=app.area;

	//切换
	$scope.newWeek=function(num){
		$scope.loadTime($scope.getWeek(num));
	}

	//copy
	$scope.copy=function(time,type){
		txt=type=='day'?'明天':'下周';
		layer.confirm('您确定复制到'+txt+'吗？', {

		  btn: ['确定','返回'] //按钮
		}, function(){

		  	$http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/copy',
            data: {

				type		:	1,
				day			:	time,
				copy_type	:	type,
            }
            }).success(function(data){

                if(data.code==200){

                   layer.msg('复制成功！', {icon: 1});
                   $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	})

		}, function(){

		});

	}

    $scope.selectShop = {
        province    :    '',    //省
        city        :    '',    //市
        county      :    '',    //县
        status      :     1,    //int 1 为正常,不传查所有
        limit       :     0,    //返回条数，0为所有
    }

    //列表参数
    $scope.row={

        start_time  :   '',
        end_time    :   '',
        shop_id     :   '',

    }

    //加载店铺列表
    $scope.loadShop=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {

                province    :   $scope.selectShop.province,
                city        :   $scope.selectShop.city,
                county      :   $scope.selectShop.county,
                status      :   $scope.selectShop.status,
                limit       :   $scope.selectShop.limit,

            }
            }).success(function(data){

                if(data.code==200){
                    $scope.shopList = [];
                    $scope.shopList=data.data;
                    $scope.row.shop_id = '';
                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

            })

    }
    $scope.loadShop();


	//加载列表
    $scope.loadList=function(){
        if($scope.row.shop_id=='' || $scope.row.shop_id==null || $scope.row.shop_id=='null')
            delete $scope.row.shop_id;

        $http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/search',
            data: {

                type            :     1,						//公共课
                start_time      :     $scope.row.start_time,	//you kown
                end_time        :     $scope.row.end_time,		//you kown
                status          :     1,						//有效课程
                shop_id         :     $scope.row.shop_id,

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.rowCourseList=data.data;
                    $scope.courseNum = 0;

					$timeout(function(){
                        $scope.courseHeight = $('.xp-rowCourse-cont').height();
                        $scope.courseNum = parseInt($scope.courseHeight/150);
                        if($scope.courseNum>1){
                            for(var i=0;i<$scope.courseNum;i++){
                                $(".grey").append("<div class='bg-box-grey'></div>");
                                document.getElementById("grey").style.position="relative";
                                document.getElementById("grey").style.top="-"+parseInt($scope.courseHeight)+"px";
                            }
                        }else{
                            document.getElementById("grey").style.position="relative";
                            document.getElementById("grey").style.top="0px";
                        }

					},1000);
                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	});

    }

    $scope.compareCoach=function(item){//判断教练状态 1:未签到 2:已签到 3:迟到 4:旷课 5:未签出 6:早退 7:又迟到又早退
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.coach_signIn = new Date(item.coach_sign_time.replace(/-/gi,'/'));//教练签到时间
        $scope.coach_signOut= new Date(item.coach_sign_out_time.replace(/-/gi,'/'));//教练签出时间
        if(item.coach_sign_time=='0000-00-00 00:00:00'){
            $scope.lateTime     = Math.ceil(($scope.newTimes-$scope.course_start)/1000/60);//向上取整,迟到时间
        }else{
            $scope.lateTime     = Math.ceil(($scope.coach_signIn-$scope.course_start)/1000/60);//向上取整,迟到时间
        }
        if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
            $scope.leaveTime    = 0;
        }else{
            $scope.leaveTime    = Math.ceil(($scope.course_end-$scope.coach_signOut)/1000/60);//向上取整,早退时间
        }


        if($scope.newTimes<=$scope.course_start){//当前时间小于课程开始时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 1;//未签到
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    return 2;//已签到
                }else{
                    return 4;//旷课
                }
            }
        }
        if($scope.newTimes>=$scope.course_end){//当前时间大于课程结束时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 4;//旷课
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    return 5;//未签出
                }else{
                    if($scope.coach_signIn>=$scope.course_end){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut<=$scope.course_start){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 6;//早退
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 7;//又迟到又早退
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 3;//迟到
                    }
                }
            }
        }
        if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){//当前时间大于课程开始时间，小于课程结束时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 3;//迟到
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    if($scope.coach_signIn<=$scope.course_start){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start){
                        return 3;//迟到
                    }
                }else{
                    if($scope.coach_signOut<=$scope.course_start){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 6;//早退
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 7;//又迟到又早退
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 3;//迟到
                    }
                }
            }
        }

    }
    $scope.compareCourse=function(item){//判断课程状态 1.未成团 2.已成团 3.进行中 4.已完成
        // console.log(item.appointments);
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.coach_sign   = new Date(item.coach_sign_time.replace(/-/gi,'/'));//教练签到时间
        $scope.user_count   = item.user_count;//当前预约人数
        $scope.min_count    = item.min_count;//最小开课人数
        if($scope.user_count<$scope.min_count){
            return 1;//未成团
        }else{
            if($scope.newTimes<=$scope.course_start){
                return 2;//已成团
            }
            if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){
                return 3;//进行中
            }
            if($scope.newTimes>=$scope.course_end){
                return 4;//已完成
            }
        }
    }
    $scope.compareUser=function(item){//判断预约签到状态  1:有人签到  0::无人签到
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        if($scope.newTimes>$scope.course_end){//当前时间大于课程结束时间
            $scope.UserType = 0;
            for(var i=0;i<item.appointments.length;i++){
                $scope.UserTimeIn  ='';

                if(item.appointments[i].sign_time!='0000-00-00 00:00:00'){
                    $scope.UserTimeIn  = new Date(item.appointments[i].sign_time.replace(/-/gi,'/'));
                    if($scope.UserTimeIn <= $scope.course_start){
                        $scope.UserType = $scope.UserType + 1;
                    }
                    if($scope.UserTimeIn > $scope.course_start && $scope.UserTimeIn < $scope.course_end){
                        if(Math.ceil(($scope.UserTimeIn-$scope.course_start)/1000/60) <= 10){
                            $scope.UserType = $scope.UserType + 1;
                        }else{
                            $scope.UserType = $scope.UserType + 0;
                        }
                    }
                    if($scope.UserTimeIn >= $scope.course_end){
                        $scope.UserType = $scope.UserType + 0;
                    }
                }
            }
            if($scope.UserType >= 1){
                return 1;
            }else{
                return 0;
            }
        }
    }


	//编辑类
	$scope.rowDtl={

		plan_id			:	0,		//排课ID,0为新增加
		type 			:	1,		//公共课
		now_day			:	'',		//排课日期对象
		course_id		:	'',		//you kown
		start_time		:	'',		//you kown
		end_time		:	'',
		start_day		:	'',
		end_day			:	'',
		shop_id			:	'',
		coach_user_id	:	'',
		look			:	false
	}

	//新建
	$scope.open=function(){
		$scope.rowDtl.plan_id=0;
		$scope.rowDtl.look=true;
	}

	//编辑按钮
	$scope.edit=function(item){

		$scope.rowDtl.look			=	true;
		$scope.rowDtl.plan_id		=	item.plan_id;
		$scope.rowDtl.course_id		=	item.course_id;
		$scope.rowDtl.shop_id		=	item.shop_id;
		$scope.rowDtl.coach_user_id	=	item.coach_user_id;

		//日期
		$scope.rowDtl.now_day=item.start_time.substr(0,10);

		//开始时间
		$scope.rowDtl.start_time=item.start_time.substr(item.start_time.indexOf(' ')+1,5);

		//结束时间
		$scope.rowDtl.end_time=item.end_time.substr(item.end_time.indexOf(' ')+1,5);
	}

	//切换课程
	$scope.upTime=function(){
		$scope.rowDtl.start_time='';
		$scope.rowDtl.end_time=''
	}

	//取消按钮
	$scope.cancel=function(id,num){

		layer.confirm('您确定取消该节排课吗？', {
		  btn: ['确定','返回'] //按钮
		}, function(){

            if(num>0){
                layer.confirm('该课程已有预约，确定取消吗？', {
                  btn: ['确定','返回'] //按钮
                }, function(){

                    $http({
                        method: 'POST',
                        url:window.base_url+'/manager/classplan/cancel',
                        data: {

                            plan_id     :   id
                        }

                    }).success(function(data){

                        if(data.code==200){

                           layer.msg('取消成功！', {icon: 1});
                           $scope.loadList()

                        }else{
                            layer.msg(data.message, {icon: 2});

                        }

                    }).error( function(data){
                        layer.msg('服务器访问失败！', {icon: 2});
                    })

                }, function(){}

                );
            }else{
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/classplan/cancel',
                    data: {

                        plan_id     :   id

                    }
                }).success(function(data){

                    if(data.code==200){

                       layer.msg('取消成功！', {icon: 1});
                       $scope.loadList()

                    }else{
                        layer.msg(data.message, {icon: 2});

                    }

                }).error( function(data){
                        layer.msg('服务器访问失败！', {icon: 2});
                })
            }



		}, function(){}

        );
	}

    $scope.verifyTime = function (keys) {
        if (keys && $scope.rowDtl[keys]) {
            var t = $scope.rowDtl[keys].split(':');
            if (t[0] > 23 || t[1] > 59) {
                $scope.rowDtl[keys] = null;
            }
        } else {
            $scope.rowDtl.end_time = '';
        }
    }

    //自动计算结束时间
    $scope.$watch('rowDtl.start_time', function (val) {
        if (val) {
            var time = 60, t = val.split(':');		//默认60分钟

            if ($scope.rowDtl.course_id) {
                for (i=0;i<$scope.groupList.length;i++) {
                    if ($scope.rowDtl.course_id == $scope.groupList[i]['course_id']) {
                        time = Number($scope.groupList[i]['time']);
                        break;
                    }
                }
            }

            var hour = Math.floor(time / 60);
            t[0] = Number(t[0]) + hour;
            if (time >= 60) {
                time -= 60 * hour;
            }
            var m = Number(t[1]) + time;
            if (m >= 60) {
                m -= 60;
                t[0] += 1;
            }
            t[1] = m;
            if (t[0] >= 24) {
                t[0] = t[0] - 24;
            }
            t.forEach(function (item, key) {
                t[key] = item < 10 ? '0' + item : item;
            })
            $scope.rowDtl.end_time = t.join(':');
        } else {
            $scope.rowDtl.end_time = '';
        }
    });

	//提交排课
	$scope.saveDtl=function(){

		if(typeof $scope.rowDtl.now_day =='object'){
			f=formatDate.get($scope.rowDtl.now_day);
			$scope.rowDtl.now_day=f.y+'-'+$filter('zeroFill')(f.m)+'-'+$filter('zeroFill')(f.d);	//对象转为字符串

		}


		$scope.rowDtl.start_day=$scope.rowDtl.now_day+' '+$scope.rowDtl.start_time;				//开始时间
		$scope.rowDtl.end_day=$scope.rowDtl.now_day+' '+$scope.rowDtl.end_time;					//结束时间

		$http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/save',
            data: {

				plan_id			:	$scope.rowDtl.plan_id,
				type			:	1,
				course_id		:	$scope.rowDtl.course_id,
				start_time		:	$scope.rowDtl.start_day,
				end_time		:	$scope.rowDtl.end_day,
				shop_id			:	$scope.rowDtl.shop_id,
				coach_user_id	:	$scope.rowDtl.coach_user_id

            }
            }).success(function(data){

                if(data.code==200){

                    layer.msg('发布成功！', {icon: 1});
                    $scope.rowDtl.look=false;
                    $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	})

	}

	//加载公共课列表
    $scope.loadGroup=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/search',
            data: {

                type            :     1,
                course_name     :     '',
                status          :     1,
				coach_user_id	:	  '',
				limit			:	  0

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.groupList=data.data;
					$scope.rowDtl.course_id=$scope.groupList[0].course_id;

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

        	})

    }

    //加载私教列表
    $scope.loadCoach=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/search',
            data: {

                keyword		:	'',
                status		:	1,
                limit		:	0

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.coachList=data.data;
					$scope.rowDtl.coach_user_id=$scope.coachList[0].user_id;

                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

        	})

    }

	//查看会员
	$scope.users={
		show	:	false,
		list	:	[]
	}

	$scope.lookUser=function(item){
		$scope.users.show=true;
		$scope.users.list=item;
	}

	$timeout(function(){
		$scope.loadTime($scope.getWeek())
	},1000)

}]);

//私教时间段列表
app.controller('coachPlanController', ['$scope','$location','$filter','$http','formatDate','$filter','$timeout',
                     	  function($scope,$location,$filter,$http,formatDate,$filter,$timeout) {

    //加载三级联动
    $scope.area=app.area;

	//切换
	$scope.newWeek=function(num){

		$scope.loadTime($scope.getWeek(num))

	}

	//copy
	$scope.copy=function(time,type){
		txt=type=='day'?'明天':'下周';
		layer.confirm('您确定复制到'+txt+'吗？', {

		  btn: ['确定','返回'] //按钮
		}, function(){

		  	$http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/copy',
            data: {

				type		:	3,
				day			:	time,
				copy_type	:	type,
            }
            }).success(function(data){

                if(data.code==200){

                   layer.msg('复制成功！', {icon: 1});
                   $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	})

		}, function(){

		});

	}

	//列表参数
	$scope.row={

		start_time	:	'',
		end_time	:	'',

	}
	//加载列表
    $scope.loadList=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/search',
            data: {

                type            :     3,						//私教课
                start_time      :     $scope.row.start_time,	//you kown
                end_time        :     $scope.row.end_time,		//you kown
                status          :     1,						//有效课程
				coach_user_id	:	  $scope.rowDtl.coach_user_id

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.rowCourseList=data.data
                    $scope.courseNum = 0;
                    $scope.course_num = [];

                    $timeout(function(){
                        $scope.courseHeight = $('.xp-rowCourse-cont').height();
                        $scope.courseNum = parseInt($scope.courseHeight/150);
                        if($scope.courseNum>1){
                            for(var i=0;i<$scope.courseNum;i++){
                                $scope.course_num.push(i);
                                $(".grey").append("<div class='bg-box-grey'></div>");
                                document.getElementById("grey-p").style.position="relative";
                                document.getElementById("grey-p").style.top="-"+parseInt($scope.courseHeight)+"px";
                            }
                        }else{
                            document.getElementById("grey-p").style.position="relative";
                            document.getElementById("grey-p").style.top="0px";
                        }

                    },1000);

                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	});

    }

	//编辑类
	$scope.rowDtl={

		plan_id			:	0,		//排课ID,0为新增加
		type 			:	3,		//公共课
		now_day			:	'',		//排课日期对象
		start_time		:	'',		//you kown
		end_time		:	'',
		start_day		:	'',
		end_day			:	'',
		coach_user_id	:	'',
		look			:	false
	}

	//新建
	$scope.open=function(){
		$scope.rowDtl.plan_id=0;
		$scope.rowDtl.look=true;
	}

	//编辑按钮
	$scope.edit=function(item){

		$scope.rowDtl.look			=	true;
		$scope.rowDtl.plan_id		=	item.plan_id;
		$scope.rowDtl.coach_user_id	=	item.coach_user_id;

		//日期
		$scope.rowDtl.now_day=item.start_time.substr(0,10);

		//开始时间
		$scope.rowDtl.start_time=item.start_time.substr(item.start_time.indexOf(' ')+1,5);

		//结束时间
		$scope.rowDtl.end_time=item.end_time.substr(item.end_time.indexOf(' ')+1,5);
	}
	
	$scope.verifyTime = function (keys) {
        if (keys && $scope.rowDtl[keys]) {
            var t = $scope.rowDtl[keys].split(':');
            if (t[0] > 23 || t[1] > 59) {
                $scope.rowDtl[keys] = null;
            }
        } else {
            $scope.rowDtl.end_time = '';
        }
    }

    //自动计算结束时间
    $scope.$watch('rowDtl.start_time', function (val) {
        if (val) {
            var time = 60, t = val.split(':');		//默认60分钟

/*            if ($scope.rowDtl.course_id) {
                for (i=0;i<$scope.groupList.length;i++) {
                    if ($scope.rowDtl.course_id == $scope.groupList[i]['course_id']) {
                        time = Number($scope.groupList[i]['time']);
                        break;
                    }
                }
            }*/

            var hour = Math.floor(time / 60);
            t[0] = Number(t[0]) + hour;
            if (time >= 60) {
                time -= 60 * hour;
            }
            var m = Number(t[1]) + time;
            if (m >= 60) {
                m -= 60;
                t[0] += 1;
            }
            t[1] = m;
            if (t[0] >= 24) {
                t[0] = t[0] - 24;
            }
            t.forEach(function (item, key) {
                t[key] = item < 10 ? '0' + item : item;
            })
            $scope.rowDtl.end_time = t.join(':');
        } else {
            $scope.rowDtl.end_time = '';
        }
    });
	
	//取消按钮
	$scope.cancel=function(id){

		layer.confirm('您确定取消该节排课吗？', {
		  btn: ['确定','返回'] //按钮
		}, function(){

		  	$http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/cancel',
            data: {

				plan_id		:	id

            }
            }).success(function(data){

                if(data.code==200){

                   layer.msg('取消成功！', {icon: 1});
                   $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	})

		}, function(){



		});


	}
	
    $scope.compareCoach=function(item){//判断教练状态 1:未签到 2:已签到 3:迟到 4:旷课 5:未签出 6:早退 7:又迟到又早退
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.coach_signIn = new Date(item.coach_sign_time.replace(/-/gi,'/'));//教练签到时间
        $scope.coach_signOut= new Date(item.coach_sign_out_time.replace(/-/gi,'/'));//教练签出时间
        if(item.coach_sign_time=='0000-00-00 00:00:00'){
            $scope.lateTime     = Math.ceil(($scope.newTimes-$scope.course_start)/1000/60);//向上取整,迟到时间
        }else{
            $scope.lateTime     = Math.ceil(($scope.coach_signIn-$scope.course_start)/1000/60);//向上取整,迟到时间
        }
        if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
            $scope.leaveTime    = 0;
        }else{
            $scope.leaveTime    = Math.ceil(($scope.course_end-$scope.coach_signOut)/1000/60);//向上取整,早退时间
        }


        if($scope.newTimes<=$scope.course_start){//当前时间小于课程开始时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 1;//未签到
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    return 2;//已签到
                }else{
                    return 4;//旷课
                }
            }
        }
        if($scope.newTimes>=$scope.course_end){//当前时间大于课程结束时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 4;//旷课
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    return 5;//未签出
                }else{
                    if($scope.coach_signIn>=$scope.course_end){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut<=$scope.course_start){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 6;//早退
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 7;//又迟到又早退
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 3;//迟到
                    }
                }
            }
        }
        if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){//当前时间大于课程开始时间，小于课程结束时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 3;//迟到
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    if($scope.coach_signIn<=$scope.course_start){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start){
                        return 3;//迟到
                    }
                }else{
                    if($scope.coach_signOut<=$scope.course_start){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 6;//早退
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 7;//又迟到又早退
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 3;//迟到
                    }
                }
            }
        }

    }
    $scope.compareCourse=function(item){//判断课程状态 1.未成团 2.已成团 3.进行中 4.已完成
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.coach_sign   = new Date(item.coach_sign_time.replace(/-/gi,'/'));//教练签到时间
        $scope.user_count   = item.user_count;//当前预约人数
        $scope.min_count    = item.min_count;//最小开课人数
        if($scope.user_count<$scope.min_count){
            return 1;//未成团
        }else{
            if($scope.newTimes<=$scope.course_start){
                return 2;//已成团
            }
            if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){
                return 3;//进行中
            }
            if($scope.newTimes>=$scope.course_end){
                return 4;//已完成
            }
        }
    }
    $scope.compareUser=function(item){//判断预约签到状态  1:有人签到  0::无人签到
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        if($scope.newTimes>$scope.course_end){//当前时间大于课程结束时间
            $scope.UserType = 0;
            for(var i=0;i<item.appointments.length;i++){
                $scope.UserTimeIn  ='';

                if(item.appointments[i].sign_time!='0000-00-00 00:00:00'){
                    $scope.UserTimeIn  = new Date(item.appointments[i].sign_time.replace(/-/gi,'/'));
                    if($scope.UserTimeIn <= $scope.course_start){
                        $scope.UserType = $scope.UserType + 1;
                    }
                    if($scope.UserTimeIn > $scope.course_start && $scope.UserTimeIn < $scope.course_end){
                        if(Math.ceil(($scope.UserTimeIn-$scope.course_start)/1000/60) <= 10){
                            $scope.UserType = $scope.UserType + 1;
                        }else{
                            $scope.UserType = $scope.UserType + 0;
                        }
                    }
                    if($scope.UserTimeIn >= $scope.course_end){
                        $scope.UserType = $scope.UserType + 0;
                    }
                }
            }
            if($scope.UserType >= 1){
                return 1;
            }else{
                return 0;
            }
        }
    }

	//提交时间
	$scope.saveDtl=function(){

		if(typeof $scope.rowDtl.now_day =='object'){
			f=formatDate.get($scope.rowDtl.now_day);
			$scope.rowDtl.now_day=f.y+'-'+$filter('zeroFill')(f.m)+'-'+$filter('zeroFill')(f.d);	//对象转为字符串
		}

		$scope.rowDtl.start_day=$scope.rowDtl.now_day+' '+$scope.rowDtl.start_time;				//开始时间
		$scope.rowDtl.end_day=$scope.rowDtl.now_day+' '+$scope.rowDtl.end_time;					//结束时间

		$http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/save',
            data: {

				plan_id			:	$scope.rowDtl.plan_id,
				type			:	3,
				start_time		:	$scope.rowDtl.start_day,
				end_time		:	$scope.rowDtl.end_day,
				coach_user_id	:	$scope.rowDtl.coach_user_id

            }
            }).success(function(data){

                if(data.code==200){

                    layer.msg('发布成功！', {icon: 1});
                    $scope.rowDtl.look=false;
                    $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
        	})

	}

    //加载私教列表
    $scope.loadCoach=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/search',
            data: {

                keyword		:	'',
                status		:	1,
                limit		:	0

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.coachList=data.data;
					$scope.rowDtl.coach_user_id=$scope.coachList[0].user_id;
					$scope.loadList()
                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

        	})

    }

	//查看会员
	$scope.users={

		show	:	false,
		list	:	[]

	}

	$scope.lookUser=function(item){
		$scope.users.show=true;
		$scope.users.list=item
	}

	$timeout(function(){
		$scope.loadTime($scope.getWeek())
	},1000)

}]);

//小团课排课列表
app.controller('rowGroupController', ['$scope','$location','$filter','$http','formatDate','$filter','$timeout',
                           function($scope,$location,$filter,$http,formatDate,$filter,$timeout) {

    //加载三级联动
    $scope.area=app.area;

    //切换
    $scope.newWeek=function(num){

        $scope.loadTime($scope.getWeek(num))

    }

    //copy
    $scope.copy=function(time,type){
        txt=type=='day'?'明天':'下周';
        layer.confirm('您确定复制到'+txt+'吗？', {

          btn: ['确定','返回'] //按钮
        }, function(){

            $http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/copy',
            data: {

                type        :   2,
                day         :   time,
                copy_type   :   type,
            }
            }).success(function(data){

                if(data.code==200){

                   layer.msg('复制成功！', {icon: 1});
                   $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
            })

        }, function(){

        });

    }

    $scope.selectShop = {
        province    :    '',    //省
        city        :    '',    //市
        county      :    '',    //县
        status      :     1,    //int 1 为正常,不传查所有
        limit       :     0,    //返回条数，0为所有
    }

    //列表参数
    $scope.row={

        start_time  :   '',
        end_time    :   '',
        shop_id     :   '',

    }

    //加载店铺列表
    $scope.loadShop=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {

                province    :   $scope.selectShop.province,
                city        :   $scope.selectShop.city,
                county      :   $scope.selectShop.county,
                status      :   $scope.selectShop.status,
                limit       :   $scope.selectShop.limit,

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.shopList=data.data;
                    $scope.rowDtl.shop_id = $scope.shopList[0].shop_id;
                    // $scope.row.shop_id = $scope.shopList[0].shop_id;

                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

            })

    }
    $scope.loadShop();


    //加载列表
    $scope.loadList=function(){
        if($scope.row.shop_id=='' || $scope.row.shop_id==null || $scope.row.shop_id=='null')
            delete $scope.row.shop_id;

        $http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/search',
            data: {

                type            :     2,                        //小团课
                start_time      :     $scope.row.start_time,    //you kown
                end_time        :     $scope.row.end_time,      //you kown
                status          :     1,                        //有效课程
                shop_id         :     $scope.row.shop_id,

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.rowCourseList=data.data;
                    $scope.courseNum = 0;

                    $timeout(function(){
                        $scope.courseHeight = $('.xp-rowCourse-cont').height();
                        $scope.courseNum = parseInt($scope.courseHeight/150);
                        if($scope.courseNum>1){
                            for(var i=0;i<$scope.courseNum;i++){
                                $(".grey").append("<div class='bg-box-grey'></div>");
                                document.getElementById("grey-g").style.position="relative";
                                document.getElementById("grey-g").style.top="-"+parseInt($scope.courseHeight)+"px";
                            }
                        }else{
                            document.getElementById("grey-g").style.position="relative";
                            document.getElementById("grey-g").style.top="0px";
                        }

                    },1000);
                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
            });

    }

    $scope.compareCoach=function(item){//判断教练状态 1:未签到 2:已签到 3:迟到 4:旷课 5:未签出 6:早退 7:又迟到又早退
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.coach_signIn = new Date(item.coach_sign_time.replace(/-/gi,'/'));//教练签到时间
        $scope.coach_signOut= new Date(item.coach_sign_out_time.replace(/-/gi,'/'));//教练签出时间
        if(item.coach_sign_time=='0000-00-00 00:00:00'){
            $scope.lateTime     = Math.ceil(($scope.newTimes-$scope.course_start)/1000/60);//向上取整,迟到时间
        }else{
            $scope.lateTime     = Math.ceil(($scope.coach_signIn-$scope.course_start)/1000/60);//向上取整,迟到时间
        }
        if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
            $scope.leaveTime    = 0;
        }else{
            $scope.leaveTime    = Math.ceil(($scope.course_end-$scope.coach_signOut)/1000/60);//向上取整,早退时间
        }


        if($scope.newTimes<=$scope.course_start){//当前时间小于课程开始时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 1;//未签到
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    return 2;//已签到
                }else{
                    return 4;//旷课
                }
            }
        }
        if($scope.newTimes>=$scope.course_end){//当前时间大于课程结束时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 4;//旷课
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    return 5;//未签出
                }else{
                    if($scope.coach_signIn>=$scope.course_end){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut<=$scope.course_start){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 6;//早退
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 7;//又迟到又早退
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 3;//迟到
                    }
                }
            }
        }
        if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){//当前时间大于课程开始时间，小于课程结束时间
            if(item.coach_sign_time=='0000-00-00 00:00:00'){
                return 3;//迟到
            }else{
                if(item.coach_sign_out_time=='0000-00-00 00:00:00'){
                    if($scope.coach_signIn<=$scope.course_start){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start){
                        return 3;//迟到
                    }
                }else{
                    if($scope.coach_signOut<=$scope.course_start){
                        return 4;//旷课
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 6;//早退
                    }
                    if($scope.coach_signIn<=$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 2;//已签到
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut<$scope.course_end){
                        return 7;//又迟到又早退
                    }
                    if($scope.coach_signIn>$scope.course_start && $scope.coach_signOut>=$scope.course_end){
                        return 3;//迟到
                    }
                }
            }
        }

    }
    $scope.compareCourse=function(item){//判断课程状态 1.未成团 2.已成团 3.进行中 4.已完成
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.coach_sign   = new Date(item.coach_sign_time.replace(/-/gi,'/'));//教练签到时间
        $scope.user_count   = item.user_count;//当前预约人数
        $scope.min_count    = item.min_count;//最小开课人数
        if($scope.user_count<$scope.min_count){
            return 1;//未成团
        }else{
            if($scope.newTimes<=$scope.course_start){
                return 2;//已成团
            }
            if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){
                return 3;//进行中
            }
            if($scope.newTimes>=$scope.course_end){
                return 4;//已完成
            }
        }
    }
    $scope.compareUser=function(item){//判断预约签到状态  1:有人签到  0::无人签到
        $scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(item.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(item.end_time.replace(/-/gi,'/'));//课程结束时间
        if($scope.newTimes>$scope.course_end){//当前时间大于课程结束时间
            $scope.UserType = 0;
            for(var i=0;i<item.appointments.length;i++){
                $scope.UserTimeIn  ='';

                if(item.appointments[i].sign_time!='0000-00-00 00:00:00'){
                    $scope.UserTimeIn  = new Date(item.appointments[i].sign_time.replace(/-/gi,'/'));
                    if($scope.UserTimeIn <= $scope.course_start){
                        $scope.UserType = $scope.UserType + 1;
                    }
                    if($scope.UserTimeIn > $scope.course_start && $scope.UserTimeIn < $scope.course_end){
                        if(Math.ceil(($scope.UserTimeIn-$scope.course_start)/1000/60) <= 10){
                            $scope.UserType = $scope.UserType + 1;
                        }else{
                            $scope.UserType = $scope.UserType + 0;
                        }
                    }
                    if($scope.UserTimeIn >= $scope.course_end){
                        $scope.UserType = $scope.UserType + 0;
                    }
                }
            }
            if($scope.UserType >= 1){
                return 1;
            }else{
                return 0;
            }
        }
    }


    //编辑类
    $scope.rowDtl={

        plan_id         :   0,      //排课ID,0为新增加
        type            :   2,      //公共课
        now_day         :   '',     //排课日期对象
        course_id       :   '',     //you kown
        start_time      :   '',     //you kown
        end_time        :   '',
        start_day       :   '',
        end_day         :   '',
        shop_id         :   '',
        coach_user_id   :   '',
        look            :   false
    }

    //新建
    $scope.open=function(){
        $scope.rowDtl.plan_id=0;
        $scope.rowDtl.look=true;
        $scope.rowDtl.course_id = '';
    }

    //编辑按钮
    $scope.edit=function(item){

        $scope.rowDtl.look          =   true;
        $scope.rowDtl.plan_id       =   item.plan_id;
        $scope.rowDtl.course_id     =   item.course_id;
        $scope.rowDtl.shop_id       =   item.shop_id;
        $scope.rowDtl.coach_user_id =   item.coach_user_id;

        //日期
        $scope.rowDtl.now_day=item.start_time.substr(0,10);

        //开始时间
        $scope.rowDtl.start_time=item.start_time.substr(item.start_time.indexOf(' ')+1,5);

        //结束时间
        $scope.rowDtl.end_time=item.end_time.substr(item.end_time.indexOf(' ')+1,5);
    }

    //切换课程
    $scope.upTime=function(){
        $scope.rowDtl.start_time='';
        $scope.rowDtl.end_time=''
    }

    //取消按钮
    $scope.cancel=function(id){

        layer.confirm('您确定取消该节排课吗？', {
          btn: ['确定','返回'] //按钮
        }, function(){

            $http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/cancel',
            data: {

                plan_id     :   id

            }
            }).success(function(data){

                if(data.code==200){

                   layer.msg('取消成功！', {icon: 1});
                   $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
            })

        }, function(){



        });


    }

    $scope.verifyTime = function (keys) {
        if (keys && $scope.rowDtl[keys]) {
            var t = $scope.rowDtl[keys].split(':');
            if (t[0] > 23 || t[1] > 59) {
                $scope.rowDtl[keys] = null;
            }
        } else {
            $scope.rowDtl.end_time = '';
        }
    }

    //自动计算结束时间
    $scope.$watch('rowDtl.start_time', function (val) {
        if (val) {
            var time = 60, t = val.split(':');      //默认60分钟

            if ($scope.rowDtl.course_id) {
                for (i=0;i<$scope.groupList.length;i++) {
                    if ($scope.rowDtl.course_id == $scope.groupList[i]['course_id']) {
                        time = Number($scope.groupList[i]['time']);
                        break;
                    }
                }
            }

            var hour = Math.floor(time / 60);
            t[0] = Number(t[0]) + hour;
            if (time >= 60) {
                time -= 60 * hour;
            }
            var m = Number(t[1]) + time;
            if (m >= 60) {
                m -= 60;
                t[0] += 1;
            }
            t[1] = m;
            if (t[0] >= 24) {
                t[0] = t[0] - 24;
            }
            t.forEach(function (item, key) {
                t[key] = item < 10 ? '0' + item : item;
            })
            $scope.rowDtl.end_time = t.join(':');
        } else {
            $scope.rowDtl.end_time = '';
        }
    });

    //加载私教列表
    $scope.loadCoach=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/search',
            data: {

                keyword     :   '',
                status      :   1,
                limit       :   0

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.coachList=data.data;
                    // $scope.rowDtl.coach_user_id=$scope.coachList[0].user_id;
                    $scope.loadGroup();

                }else{

                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

            });

    }
     //加载小团课列表
    $scope.loadGroup=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/search',
            data: {

                type            :     2,
                course_name     :     '',
                status          :     1,
                coach_user_id   :     $scope.rowDtl.coach_user_id,
                limit           :     0

            }
            }).success(function(data){

                if(data.code==200){

                    $scope.groupList=data.data;
                    if($scope.groupList.length!=0){
                        $scope.rowDtl.course_id=$scope.groupList[0].course_id;
                    }else{
                        layer.msg('该教练暂时没有小团课', {icon: 2});
                        $scope.rowDtl.course_id = '';
                        return;
                    }
                    // $scope.rowDtl.course_id=$scope.groupList[0].course_id;
                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});

            })

    }

    //提交排课
    $scope.saveDtl=function(){

        if(typeof $scope.rowDtl.now_day =='object'){
            f=formatDate.get($scope.rowDtl.now_day);
            $scope.rowDtl.now_day=f.y+'-'+$filter('zeroFill')(f.m)+'-'+$filter('zeroFill')(f.d);    //对象转为字符串

        }
        if($scope.rowDtl.course_id == '' || $scope.rowDtl.course_id == null){
            layer.msg('未选择小团课！', {icon: 2});
            return;
        }

        $scope.rowDtl.start_day=$scope.rowDtl.now_day+' '+$scope.rowDtl.start_time;             //开始时间
        $scope.rowDtl.end_day=$scope.rowDtl.now_day+' '+$scope.rowDtl.end_time;                 //结束时间

        $http({
            method: 'POST',
            url:window.base_url+'/manager/classplan/save',
            data: {

                plan_id         :   $scope.rowDtl.plan_id,
                type            :   2,
                course_id       :   $scope.rowDtl.course_id,
                start_time      :   $scope.rowDtl.start_day,
                end_time        :   $scope.rowDtl.end_day,
                shop_id         :   $scope.rowDtl.shop_id,
                coach_user_id   :   $scope.rowDtl.coach_user_id

            }
            }).success(function(data){

                if(data.code==200){

                    layer.msg('发布成功！', {icon: 1});
                    $scope.rowDtl.look=false;
                    $scope.loadList()

                }else{
                    layer.msg(data.message, {icon: 2});

                }

            }).error( function(data){
                layer.msg('服务器访问失败！', {icon: 2});
            })

    }

    //查看会员
    $scope.users={
        show    :   false,
        list    :   []
    }

    $scope.lookUser=function(item){
        $scope.users.show=true;
        $scope.users.list=item;
    }

    $timeout(function(){
        $scope.loadTime($scope.getWeek())
    },1000)

}]);


