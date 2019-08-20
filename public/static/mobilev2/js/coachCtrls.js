var app = angular.module('App', []);
app.controller("coachIndexCtrl", ["$scope","$ionicLoading","ajaxService","$timeout",
				   function ($scope,$ionicLoading,ajaxService,$timeout) {	

	//开门权限
	$scope.open=false;

	//在场人数
	$scope.load=function(){

		ajaxService.ajax('getShopOnline',{
			
			shop_id		: window.shop.id
			
		},function(json){
			
			if(json.code==200){

				$scope.peopleSum=json.data;
				
			}
			
		})
		
	}

	//教练个人中心加载
	$scope.McoachCenter=function(){

		ajaxService.ajax('coachCenter',{},function(json){

			if(json.code==200){

				$scope.loadMcoachCenter=json.data
				
				//简介
				$('.line-two p').html('简介：'+$scope.loadMcoachCenter.intro)
				
			}

		})
	}
	
	//返回个人中心
	$scope.go=function(){
		
		window.location.href=window.base_url;
		
	}

	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){

		$scope.McoachCenter();
		$ionicLoading.show(HX_CONFIG.loadingBase)
		
	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		
		$timeout(function(){
			$ionicLoading.hide()
		},500)

	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

//我的约课
app.controller("apptCtrl", ["$scope","$ionicLoading","ajaxService","$ionicScrollDelegate","$timeout","$ionicActionSheet","$popup",
				  function ($scope,$ionicLoading,ajaxService,$ionicScrollDelegate,$timeout,$ionicActionSheet,$popup) {
	
	//显示进度条
	$scope.showRow=function(item,ix){

		$timeout(function(){
			$('.bar-mv-'+ix+'').css('width',item.user_count/item.max_count*100+'%')
		},600)
		
	}
					
	
	var nowTime=new Date();

	//判断时间
	$scope.judge=function(time){

		time=time.replace(/-/gi,'/');

		newTime=new Date(time);

		if(nowTime<newTime)
			return 1

		if(nowTime>newTime)
			return 2

		if(nowTime==newTime)
			return 3

	}
	
	//判断时间第二段
	$scope.contrastTime=function(signTime,endTime){

		if(signTime=='0000-00-00 00:00:00'){
			
			return 2
			
		}else{
			
			endTime=endTime.replace(/-/gi,'/');
			
			signTime=signTime.replace(/-/gi,'/');

			var newEndTime=new Date(endTime);
			var newSignTime=new Date(signTime);

			if(newSignTime < newEndTime)
				return 1
			
			if(newSignTime > newEndTime)
				return 2

			if(newSignTime == newEndTime)
				return 3
				
		}

	}

	var haveApptpage = function(){
    	return {
            currPage  	: 	1,
            totalPage 	: 	2,
            list     	: 	[],
        }
    }

	var finishApptpage = function(){
    	return {
            currPage  	: 	1,
            totalPage 	: 	2,
           	list		:	[],
        }
    }

	$scope.haveApptpage 	= 	haveApptpage();
	$scope.finishApptpage 	= 	finishApptpage();

	//默认加载进行中
	$scope.active=0;

	$scope.toggleActive=function(v){

		$scope.active=v;
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);

		if(v==0)
			angular.element('.tab-nav-look').css({'left':'0','margin-left':'0'});
		else
			angular.element('.tab-nav-look').css({'left':'15%','margin-left':angular.element('.tab-nav-look').width()+2+'px'});

	}

	//进行中
	$scope.loadhaveAppt=function(cb){

		ajaxService.ajax('coachOrder', {

			appointment_status		:	0,
			page_no					:	$scope.haveApptpage.currPage

		}, function (json) {

	        if (json.code==200) {

				if($scope.haveApptpage.currPage == 1){
	    			$scope.haveApptpage.list=json.data.list;
	    		}else{
	    			$scope.haveApptpage.list=$scope.haveApptpage.list.concat(json.data.list);
	    		}

    			$scope.haveApptpage.currPage  = json.data.page_no+1;
    			$scope.haveApptpage.totalPage = json.data.total_pages+1;

				if(cb)
    				cb()

	        }

    	});

	}

	//已完成
	$scope.loadfinishAppt=function(cb){

		ajaxService.ajax('coachOrder', {

			appointment_status		: 	1,
			page_no					:	$scope.finishApptpage.currPage

		}, function (json) {

	        if (json.code==200) {

				if($scope.finishApptpage.currPage == 1){
	    			$scope.finishApptpage.list=json.data.list;
	    		}else{
	    			$scope.finishApptpage.list=$scope.finishApptpage.list.concat(json.data.list);
	    		}

				$scope.finishApptpage.currPage  = json.data.page_no+1;
    			$scope.finishApptpage.totalPage = json.data.total_pages+1;

				if(cb)
    				cb()

	        }

    	});

	}

	//确认上课
	$scope.save=function(item){

	   //显示上拉菜单
	   var hideSheet = $ionicActionSheet.show({

		     buttons: [
		       { text: '确定' }
		     ],
		     titleText: '您确定已上完该课程吗？',
		     cancelText: '返回',
		     cancel: function() {
		          hideSheet()
		     },
		     buttonClicked: function() {

		        $ionicLoading.show(HX_CONFIG.loadingBase);

		       	ajaxService.ajax('coachSureclass',{

		       		appointment_id	: item.appointment_id

		       	},function(json){

		       		if(json.code==200){

		       			item.sign=2;
		       			hideSheet()

		       		}else{
		       			$popup.alert('尊敬的教练',null,json.message);
		       		}

		       		$ionicLoading.hide()

		       	})

		     }
	   })

	}


	//下拉刷新
    $scope.doPTRefresh = function () {

        nowTime=new Date();

        if($scope.active == 0){
        	$scope.haveApptpage.currPage = 1;
        	$scope.loadhaveAppt(function(){
        	 	$scope.$broadcast('scroll.refreshComplete');
        	})
        }else{
        	$scope.finishApptpage.currPage = 1;
        	$scope.loadfinishAppt(function(){
        	 	$scope.$broadcast('scroll.refreshComplete');
        	})
        }

    };

    //无限加载回调
    $scope.onPTLoadMore = function () {
    	if($scope.active == 0){
        	$scope.loadhaveAppt(function(){
        		$scope.$broadcast('scroll.infiniteScrollComplete');
        	})
        }else{
        	$scope.loadfinishAppt(function(){
        	 	$scope.$broadcast('scroll.infiniteScrollComplete');
        	})
        }

    };

	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

//我的预约列表
app.controller("apptDtlCtrl", ["$scope","$ionicLoading","ajaxService","$local","$timeout","$session","$ionicPopup","$location","$filter","$ionicScrollDelegate","$stateParams",
				   function ($scope,$ionicLoading,ajaxService,$local,$timeout,$session,$ionicPopup,$location,$filter,$ionicScrollDelegate,$stateParams) {


	//显示进度条
	$scope.showRow=function(){

		$timeout(function(){
			$('.bar-mv').css('width',$scope.apptDtl.count/$scope.apptDtl.course.max_count*100+'%')
		},600)
	}

	//预约详情加载
	$scope.loadApptDel=function(){
		ajaxService.ajax('coachCourseMake',{
			plan_id  :	$stateParams.id
		},function(json){

			if(json.code==200){

				$scope.apptDtl=json.data;
				$scope.newTimes     = new Date();//当前时间
				$scope.course_start_time = new Date($scope.apptDtl.course.start_time.replace(/-/gi,'/'));//课程开始时间
				$scope.course_end_time   = new Date($scope.apptDtl.course.end_time.replace(/-/gi,'/'));//课程结束时间
				if($scope.newTimes<=$scope.course_start_time){//当前时间小于课程开始时间
	        		$scope.courseState = 0;
	        	}
	        	if($scope.newTimes>=$scope.course_end_time){//当前时间大于课程结束时间
	        		$scope.courseState = 2;
	        	}
	        	if($scope.newTimes>$scope.course_start_time && $scope.newTimes<$scope.course_end_time){//当前时间大于课程开始时间，小于课程结束时间
	        		$scope.courseState = 1;
	        	}

			}

		})
	}

	//判断会员状态
	$scope.compareUser=function(user,course){//0:未签到 1:签到显示签到时间 2:旷课
		$scope.newTimes     = new Date();//当前时间
        $scope.course_start = new Date(course.start_time.replace(/-/gi,'/'));//课程开始时间
        $scope.course_end   = new Date(course.end_time.replace(/-/gi,'/'));//课程结束时间
        $scope.user_signIn = new Date(user.sign_time.replace(/-/gi,'/'));//会员签到时间

        if($scope.newTimes<=$scope.course_start){//当前时间小于课程开始时间
        	if(user.sign_time == "0000-00-00 00:00:00"){
        		return 0;//0:未签到
        	}else{
        		return 1;//1:签到显示签到时间
        	}

        }
        if($scope.newTimes>=$scope.course_end){//当前时间大于课程结束时间
        	if(user.sign_time == "0000-00-00 00:00:00"){
        		return 2;//2:旷课
        	}else{
        		if($scope.user_signIn<$scope.course_end){
        			return 1;//1:签到显示签到时间
        		}
        		if($scope.user_signIn>=$scope.course_end){
        			return 2;//2:旷课
        		}
        	}

        }
        if($scope.newTimes>$scope.course_start && $scope.newTimes<$scope.course_end){//当前时间大于课程开始时间，小于课程结束时间
        	if(user.sign_time == "0000-00-00 00:00:00"){
        		return 0;//0:未签到
        	}else{
        		return 1;//1:签到显示签到时间
        	}
        }
	}


	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){
		$scope.loadApptDel();


	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){

	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

app.controller("courseDtlCtrl", ["$scope","$ionicLoading","ajaxService","$stateParams","$ionicSlideBoxDelegate",
				   function ($scope,$ionicLoading,ajaxService,$stateParams,$ionicSlideBoxDelegate) {

	//加载私教课程详情
	$scope.load=function(){

		ajaxService.ajax('coachCourseDtl',{

			course_id  :	$stateParams.id  

		},function(json){

			if(json.code==200){

				$scope.data=json.data;
				$ionicSlideBoxDelegate.update();
				$('#intro').html($scope.data.intro);

			}

		})

	}



	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){
		$scope.load()
	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){

	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

app.controller("courseListCtrl", ["$scope","$ionicLoading","ajaxService","$local","$timeout","$session","$ionicPopup","$location","$filter","$ionicScrollDelegate",
				   function ($scope,$ionicLoading,ajaxService,$local,$timeout,$session,$ionicPopup,$location,$filter,$ionicScrollDelegate) {

	//私教课列表加载
	$scope.load=function(){
		ajaxService.ajax('coachCourseList',{},function(json){

			if(json.code==200){

				$scope.courseList=json.data

			}

		})
	}




	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){
		$scope.load();


	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){

	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

app.controller("photosCtrl", ["$scope","$ionicLoading","ajaxService","$local","$timeout","$session","$ionicPopup","$location","$filter",
				   function ($scope,$ionicLoading,ajaxService,$local,$timeout,$session,$ionicPopup,$location,$filter) {

	$scope.coachPhotos=[];

	//教练相册加载
	$scope.load=function(){
		ajaxService.ajax('coachImages',{},function(json){

			if(json.code==200)
				$scope.coachPhotos=json.data.images


		})
	}

	//更新
	$scope.upload=function(){

		ajaxService.ajax('uplodeCoachImages',{

			images 		: 	$scope.coachPhotos

		},function(json){

			if(json.code==200){

				console.log('ok')

			}

		})
	}

	//保存
	$scope.save=function(data,imgName,cb){

		ajaxService.ajax('uploadByString',{

			data 		: 		data,
            filename 	: 		imgName

		},function(json){

			if(json.code==200){

				$scope.coachPhotos.push(json.data)

                if(cb)
                	cb()
			}
		})

	}
	$scope.xuanze = function($event){
		// console.log($event);
		var checkbox = $('.mwq-choose',$($event.target).parent().parent());
		// console.log(checkbox);
		checkbox.prop('checked',checkbox.prop('checked')==false);
	}

	//删除图片
	$(".mwq-delete-btn").click(function(){
		var sum=[];
        for(var i=0;i<$('.mwq-choose').length;i++){

            if($('.mwq-choose:eq('+i+')').prop('checked'))
            	sum.push($('.mwq-choose:eq('+i+')').val());
        }

        var tempArray1 = [];//临时数组1
        var tempArray2 = [];//临时数组2

        for(var i=0;i<sum.length;i++){
        	tempArray1[sum[i]]=true;
        }
        for(var i=0;i<$scope.coachPhotos.length;i++){
        	if(!tempArray1[$scope.coachPhotos[i]]){
        		tempArray2.push($scope.coachPhotos[i]);
        	}
        }
        // console.log(tempArray2);
        $scope.coachPhotos=tempArray2;

        if(sum.length>0){
        	$scope.upload();
        }
        $('.mwq-choose').prop('checked',false);

	});

	$(".mwq-up-btn").click(function(){
		$(".clipbg").fadeIn();
		$('#file').click()
	});

	var clipArea = new  PhotoClip("#clipArea", {
			size: [306, 180],//裁剪框大小
			outputSize:[510,300],//打开图片大小，[0,0]表示原图大小
			file: "#file",
			ok: "#clipBtn",
			loadStart: function() { //图片开始加载的回调函数。this 指向当前 PhotoClip 的实例对象，并将正在加载的 file 对象作为参数传入。（如果是使用非 file 的方式加载图片，则该参数为图片的 url）
				$(".loading").removeClass("displaynone");
			},
			loadComplete: function() {//图片加载完成的回调函数。this 指向当前 PhotoClip 的实例对象，并将图片的 <img> 对象作为参数传入。
				$(".loading").addClass("displaynone");

			},
			done: function(dataURL) { //裁剪完成的回调函数。this 指向当前 PhotoClip 的实例对象，会将裁剪出的图像数据DataURL作为参数传入。

				var imgName = $('#file').val().substr($('#file').val().lastIndexOf('\\') + 1);
				var img=dataURL;
				var data=img.substr(img.indexOf(',') + 1);

				//请求
				$scope.save(data,imgName,function(){
					$scope.upload()
				});

				$(".clipbg").fadeOut()
			}
		});
		$("#back").click(function(){
			$(".clipbg").fadeOut()
		})

	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){

		$scope.load();
		$ionicLoading.hide();

	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){

	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

app.controller("timesCtrl", ["$scope","$ionicLoading","ajaxService","$local","$timeout","$session","$ionicActionSheet","$ionicPopup","$location","$filter","formatDate","$popup",
				   function ($scope,$ionicLoading,ajaxService,$local,$timeout,$session,$ionicActionSheet,$ionicPopup,$location,$filter,formatDate,$popup) {

	$scope.coachTimes=[];
	$scope.nowTimes=[];
	$scope.TimeS='';
	$scope.TimeE='';
	$scope.PlanID='';
	$scope.addNum='';
	$scope.startDay='';

	$scope.info = {
		start_time   :  '',
		end_time     :  '',
		user_county  :  0,
		plan_id      :  '',
		SDay         :  '',
		SHours       :  '',
	}

	$scope.copy={

		copyTime 	: 		'',
		ix 			: 		'',
		startTime 	: 		'',
		endTime 	: 		''

	};


	//日期选择
	$scope.clickDateMenu=function(time,ix){

		divWh=$('.xp-coach-week-arr').width();

		v=$('.date-menu-li:eq('+ix+')').offset().left;

		$scope.nowMap=$('.date-menu-li:eq('+ix+')').attr('nowmap');

		$scope.nowDay=$('.date-menu-li:eq('+ix+')').attr('nowDay');

		angular.element('.date-menu-active').css('left',(v-divWh)+'px')

		if($scope.coachTimes)
			$scope.nowTimes=$scope.coachTimes[time]

		$scope.copy.copyTime=time;
		$scope.copy.ix=ix;

		$('#SDay').val(time)

	}


	//加载
	$scope.load=function(startTime,endTime,type){

		ajaxService.ajax('coachOrderTime',{

			start_time		:	startTime,
			end_time		:	endTime,
			user_count	    :	''

		},function(json){

			$scope.coachTimes=json.data;
			$scope.copy.startTime=startTime;
			$scope.copy.endTime=endTime;

			$scope.clickDateMenu(type?$scope.copy.copyTime:startTime,type?type:0);


		})

	}

	$scope.change = function($event,id,TimeS,TimeE){

		if($($event.target).attr('type')==0){
			$('.box1').css({'background-color':'#fff','color':'rgba(0,0,0,0.66)','border':'1px solid rgba(0,0,0,0.12)'}).attr('type',0);
			$($event.target).css({'background-color':'#f28019','color':'#fff','border':'1px solid #f28019'}).attr('type','1');
			$scope.TimeS = TimeS;
			$scope.TimeE = TimeE;
			$scope.PlanID = id;

		}else{
			$($event.target).css({'background-color':'#fff','color':'rgba(0,0,0,0.66)','border':'1px solid rgba(0,0,0,0.12)'}).attr('type',0);
			$($event.target).attr('type','0');
			$scope.TimeS = '';
			$scope.TimeE = '';
			$scope.PlanID = '';
		}

	}

	// 添加时间段
	$scope.addTime=function(num){

		$('.mwq-make-mode').css('bottom','0');
		$('.mwq-make-bg').show();

		if(num==1){
			if($scope.PlanID!=''){
				// $('#SDay').val($scope.TimeS.substr(0,10));
				$('#newHours').val($scope.TimeS.substr(-8,5));
				$('#SHours').val($scope.TimeE.substr(-8,5));
			}
		}
		if(num==0){
			$scope.PlanID='';
			$('#newHours').val('');
			$('#SHours').val('');
		}
		$scope.addNum=num;

	}
	// 关闭添加弹窗
	$scope.cancelAdd=function(){

		$timeout(function(){
			$('.mwq-make-bg').hide()
		},500);
		$('.mwq-make-mode').css('bottom',-($('.mwq-make-mode').height()+50)+'px')
	}

	$scope.ckCopy=function(type){

		var hideSheet = $ionicActionSheet.show({
		    buttons: [
		       { text: '复制' }
		    ],
		    titleText: '确认复制吗？',
		    cancelText: '取消',
		    cancel: function() {
		        hideSheet()
		    },
		    buttonClicked: function() {

		       	//请求数据
		       	ajaxService.ajax('coachCopyTime' , {

		       		day		        :	type=='day'?$scope.copy.copyTime:$scope.copy.startTime,
					copy_type 		:	type,

		       	} , function(json){

		    		if(json.code==200){

						$popup.alert('尊敬的教练','','复制成功');
						$('.mwq-make-bg').hide();
						$('.mwq-make-mode-copy').css('bottom',-($('.mwq-make-mode-copy').height()+50)+'px');
						hideSheet();

						if(type=='day'){
							$scope.load($scope.copy.startTime,$scope.copy.endTime,$scope.copy.ix)
						}
					}else{
						$popup.alert('尊敬的用户','',json.message);
					}
					$ionicLoading.hide();
	    		})
		    }
		});
	}

	$scope.delete = function(){

		// $ionicLoading.show(HX_CONFIG.loadingBase);

		var a=$ionicPopup.confirm({

			title			:	'尊敬的教练',
			template		: 	'你确定删除该时间吗？',
			cancelText		:	'再想想',
			okText			:	'立即删除',
			cssClass		:	'tc'
		});

		a.then(function(res) {
		    if(res) {

		       	ajaxService.ajax('coachCreateTime',{

					status       :     0,
					plan_id      :     $scope.PlanID,
					start_time   :     $scope.TimeS,
					end_time     :     $scope.TimeE,

				},function(json){

					if(json.code==200){
						$popup.alert('尊敬的教练','','删除成功');
					}else{

						$popup.alert('尊敬的教练','','时间已过，不能再次编辑');

					}
					$ionicLoading.hide();
					$scope.load($scope.copy.startTime,$scope.copy.endTime,$scope.copy.ix)

				})
		    }
		})

	}

	$scope.showCopy = function(){

		$('.mwq-make-mode-copy').css('bottom','0');
		$('.mwq-make-bg').show();
	}
	// 关闭复制弹窗
	$scope.cancelCopy=function(){

		$timeout(function(){
			$('.mwq-make-bg').hide()
		},500);
		$('.mwq-make-mode-copy').css('bottom',-($('.mwq-make-mode-copy').height()+50)+'px')
	}

	$scope.autoTime = function(){

		//获取初始值
		var shijian = new Date($('#SDay').val());
		var newDay 	= shijian.getFullYear()+'-'+($filter('zeroFill')(shijian.getMonth()+1))+'-'+$filter('zeroFill')(shijian.getDate());
		var newHours = $('#newHours').val();
		$scope.info.start_time = newDay +' '+ newHours;

		if($scope.info.start_time!=''){

			//解决兼容性
			var nowTime=$scope.info.start_time.replace(/-/gi,'/');

			//时间对象
			var startTime 	=	new Date(nowTime);
			var endTime	= 	new Date(nowTime);

			//计算一个小时
			var nowHours=1000 * 60 * 60;
			endTime.setTime(endTime.getTime()+nowHours);

			$scope.info.end_time		=	endTime.getFullYear()+'-'+($filter('zeroFill')(endTime.getMonth()+1))+'-'+$filter('zeroFill')(endTime.getDate())+' '+$filter('zeroFill')(endTime.getHours())+':'+$filter('zeroFill')(endTime.getMinutes());

			$scope.info.start_time		=	startTime.getFullYear()+'-'+($filter('zeroFill')(startTime.getMonth()+1))+'-'+$filter('zeroFill')(startTime.getDate())+' '+$filter('zeroFill')(startTime.getHours())+':'+$filter('zeroFill')(startTime.getMinutes());


			if(newHours.length==5)
				// $('#SHours').val($scope.info.end_time.substr($scope.info.end_time.indexOf(' ')+1,5));
				$('#SHours').val($scope.info.end_time.substr(-5,5));

		}

	}
	$scope.clearTime = function(){
		// $scope.info.SHours = '';
		$('#newHours').val('');
		$('#SHours').val('');
	}


	$scope.edit = function(){

		$ionicLoading.show(HX_CONFIG.loadingBase);

		ajaxService.ajax('coachCreateTime',{

			plan_id      :     $scope.PlanID,
			start_time   :     $scope.info.start_time,
			end_time     :     $scope.info.end_time,
			user_count   :     0,

		},function(json){

			if(json.code==200){
				if($scope.addNum==1)
					$popup.alert('尊敬的教练','','修改成功');
				if($scope.addNum==0)
					$popup.alert('尊敬的教练','','添加成功');

				$('.mwq-make-bg').hide();
				$('.mwq-make-mode').css('bottom',-($('.mwq-make-mode').height()+50)+'px');

				$scope.load($scope.copy.startTime,$scope.copy.endTime,$scope.copy.ix)

			}else{

				$popup.alert('尊敬的教练','',json.message);

			}
			$ionicLoading.hide();
		})

	}


	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){
		$ionicLoading.show(HX_CONFIG.loadingBase);
		angular.element('.date-menu-active').css('opacity','0');
	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		
		angular.element('.date-menu-active').css({'left':'0','opacity':'1'});
		$ionicLoading.hide()
		
	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);

app.controller("timeSetCtrl", ["$scope","$ionicLoading","ajaxService","$local","$timeout","$session","$ionicPopup","$location","$filter",
				   function ($scope,$ionicLoading,ajaxService,$local,$timeout,$session,$ionicPopup,$location,$filter) {



	//页面刚加载
	$scope.$on('$ionicView.beforeEnter',function(){


	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){

	});

	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){

	});

}]);