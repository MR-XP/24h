var app = angular.module('App.services', []);

app.service('infoService' , [function(){

	var service = {};
	var data = {}

	service.setForm = function(key , val){
		data[key] = val;
	}
	service.getForm = function(key){
		return data[key];
	}
	return service;
}]);

app.service('$session', function () {
    return {
        get: function (key) {
            return sessionStorage[key];
        },
        set: function (key, value) {
            sessionStorage[key] = value;
        },
        remove: function (key) {
            sessionStorage.removeItem(key);
        },
        clear: function () {
            sessionStorage.clear();
        },
        setObj: function (key, obj) {
            var str = JSON.stringify(obj);
            sessionStorage[key] = str;
        },
        getObj: function (key) {
            var str = sessionStorage[key];
            if (str) {
                return JSON.parse(str);
            }
            return false;
        }
    };
});

app.service('$local', function () {
    return {
        get: function (key) {
            return localStorage[key];
        },
        set: function (key, value) {
            localStorage[key] = value;
        },
        remove: function (key) {
            localStorage.removeItem(key);
        },
        clear: function () {
            localStorage.clear();
        },
        setObj: function (key, obj) {
            var str = JSON.stringify(obj);
            localStorage[key] = str;
        },
        getObj: function (key) {
            var str = localStorage[key];
            if (str) {
                return JSON.parse(str);
            }
            return false;
        }
    };
});

app.service('formatDate',[function(){
	
	return {
		
		get	: function (date){
			
			y = date.getFullYear();
	        m = date.getMonth() + 1;
	        d = date.getDate();
			return {y: y, m: m, d: d}
		}
	}

}]);

app.service('$popup' , ["$ionicPopup" , function($ionicPopup){
	return {
		alert : function(title , subTitle , template){
			$ionicPopup.alert({
           	  title    : title, // String. 弹窗的标题。
           	  subTitle : subTitle,
           	  template : template,
           	  cssClass : 'tc',
           	  okText   : '确定', // String (默认: 'OK')。OK按钮的文字。
           	  okType   : '', // String (默认: 'button-positive')。OK按钮的类型。
           });
		}
	}
}]);

//AJAX server
app.service('ajaxService', ["$ionicLoading", "$http","$location", function ($ionicLoading,$http,$location) {

    var service = {};

	var methodMap = {

	   //公用模块
    	uploadByString          : {url : '/index/common/uploadByString'    , method : 'post'},				 			 //上传base64
    	open          			: {url : HX_CONFIG.VERSION+'/open_door/open'    , method : 'post'},				 		 //管理员开门



        //用户端

        	//登录模块
        	sendcode             	: {url : HX_CONFIG.VERSION+'/user/sendcode'    , method : 'post'},						 //获取验证码
        	sign             		: {url : HX_CONFIG.VERSION+'/user/sign'    	   , method : 'post'},						 //注册

        	//个人资料模块
        	getuserinfo             : {url : HX_CONFIG.VERSION+'/user/getuserinfo'  , method : 'post'},						 //获取用户信息
            edituserinfo            : {url : HX_CONFIG.VERSION+'/user/edituserinfo'  , method : 'post'},                     //编辑用户信息
        	orderHasActivity        : {url : HX_CONFIG.VERSION+'/order/orderHasActivity'  , method : 'post'},			     //用户订单中是否有活动会员卡
            

        	//课程模块
        	getCourseList			: {url : HX_CONFIG.VERSION+'/plan/search', method : 'post'},						 	 //排课列表
        	getPlanInfo				: {url : HX_CONFIG.VERSION+'/plan/getPlanInfo', method : 'post'},				 	 	 //公共课程详情
    		make					: {url : HX_CONFIG.VERSION+'/member_plan/make', method : 'post'},				 	 	 //课程预约
    		seniorMake				: {url : HX_CONFIG.VERSION+'/member_plan/seniorMake', method : 'post'},				 	 //高级预约(大吃小)

        	//课程
        	getPlanList             : {url : HX_CONFIG.VERSION+'/member_plan/getPlanList'  , method : 'post'},				 //预约列表
        	getUserCourse           : {url : HX_CONFIG.VERSION+'/member/getUserCourse'  , method : 'post'},				 	 //我的课程列表
        	saveplansign            : {url : HX_CONFIG.VERSION+'/member_plan/saveplansign'  , method : 'post'},				 //确认上课
        	cancel             		: {url : HX_CONFIG.VERSION+'/member_plan/cancel'  , method : 'post'},				 	 //取消预约
			courseComment			: {url : HX_CONFIG.VERSION+'/course_comment/courseComment'  , method : 'post'},			 //会员评价
			
        	//会员卡模块
        	getcardlist             : {url : HX_CONFIG.VERSION+'/card/getcardlist' , method : 'post'},						 //会员卡列表
        	getcardinfo             : {url : HX_CONFIG.VERSION+'/card/getcardinfo' , method : 'post'},						 //会员卡详情
        	userGetcardinfo         : {url : HX_CONFIG.VERSION+'/member/getcardinfo' , method : 'post'},					 //我的会员卡
        	bindCardUser         	: {url : HX_CONFIG.VERSION+'/member/bindCardUser' , method : 'post'},					 //设置子成员
            memberCard              : {url : HX_CONFIG.VERSION+'/sold_card_user/getMember' , method : 'post'},               //会员卡成员列表
        	lockMemberCard          : {url : HX_CONFIG.VERSION+'/sold_card_user/lockUser' , method : 'post'},				 //会员卡锁定


        	//支付模块
    		getOrderlist            : {url : HX_CONFIG.VERSION+'/order/getlist'  , method : 'post'},				 	 	 //订单列表
    		createorder            	: {url : HX_CONFIG.VERSION+'/order/createorder'  , method : 'post'},				 	 //统一下单
    		orderCancel            	: {url : HX_CONFIG.VERSION+'/order/cancel'  , method : 'post'},				 	 	 	 //取消订单
    		orderDetail            	: {url : HX_CONFIG.VERSION+'/order/detail'  , method : 'post'},				 	 	 	 //订单详情
    		pay            			: {url : HX_CONFIG.VERSION+'/order/pay'  , method : 'post'},				 	 	 	 //支付订单

    		//店铺模块
    		shopList				: {url : HX_CONFIG.VERSION+'/shop/getShopList'  , method : 'post'},						 //店铺列表
    		shopDetail				: {url : HX_CONFIG.VERSION+'/shop/getShopDetail'  , method : 'post'},					 //店铺详情
    		getShopOnline			: {url : HX_CONFIG.VERSION+'/shop/getShopOnline'  , method : 'post'},					 //在场人数
    		getAddress				: {url : HX_CONFIG.VERSION+'/shop/getAddress'  , method : 'post'},					 	 //当前所在城市
    		getProvinceCity			: {url : HX_CONFIG.VERSION+'/shop/getProvinceCity'  , method : 'post'},					 //所有城市

    		//私教模块
    		getCoachList			: {url : HX_CONFIG.VERSION+'/coach/getCoachList'  , method : 'post'},					 //私教列表
    		getCoachInfo			: {url : HX_CONFIG.VERSION+'/coach/getCoachInfo'  , method : 'post'},					 //私教详情
    		coachApply				: {url : HX_CONFIG.VERSION+'/coach/createCoachApplication'  , method : 'post'},			 //私教申请

    		//优惠劵
    		getCoupon				: {url : HX_CONFIG.VERSION+'/coupon/getlist'  , method : 'post'},					 	 //优惠劵列表
    		giveCoupon				: {url : HX_CONFIG.VERSION+'/coupon/give'  , method : 'post'},					 		 //赠送优惠劵

    		//其他模块
    		addFeedBack				: {url : HX_CONFIG.VERSION+'/feed_back/addFeedBack'  , method : 'post'},				 //会员反馈
    		signRecord				: {url : HX_CONFIG.VERSION+'/sign/getlist'  , method : 'post'},				 	 		 //会员签到

            //竞猜模块
            getCurrentActivity      : {url : HX_CONFIG.VERSION+'/activity/getCurrentActivity'  , method : 'post'},           //不同时段的活动获取
            getActivityTeam         : {url : HX_CONFIG.VERSION+'/activity/getActivityTeam'  , method : 'post'},              //获取球队信息
            activitySave            : {url : HX_CONFIG.VERSION+'/activity/save'  , method : 'post'},                         //竞猜提交
            checkOnlyActivity       : {url : HX_CONFIG.VERSION+'/activity/checkMemberOnlyActivity'  , method : 'post'},      //用户是否参与同类竞猜


            

    	//私教端

            coachCenter             : {url : HX_CONFIG.VERSION+'/coachinfo/coachinfo'  , method : 'post'},                   //教练个人中心
            coachOrder              : {url : HX_CONFIG.VERSION+'/coachinfo/coachOrder'  , method : 'post'},                  //私教的我的预约
            coachSureclass          : {url : HX_CONFIG.VERSION+'/coachinfo/sureclass'  , method : 'post'},              	 //私教的确认上课
            coachCourseList         : {url : HX_CONFIG.VERSION+'/coachinfo/coachCourse'  , method : 'post'},                 //私教的私教课程
            coachCourseDtl          : {url : HX_CONFIG.VERSION+'/coachinfo/courseDetail'  , method : 'post'},                //私教的课程详情
            coachImages             : {url : HX_CONFIG.VERSION+'/coachinfo/coachImage'  , method : 'post'},                  //私教的相册
            uplodeCoachImages       : {url : HX_CONFIG.VERSION+'/coachinfo/uplodeimages'  , method : 'post'},                //私教相册更新
            coachOrderTime          : {url : HX_CONFIG.VERSION+'/coachinfo/orderTime'  , method : 'post'},                   //私教的约课时间
            coachCreateTime         : {url : HX_CONFIG.VERSION+'/coachinfo/createTime'  , method : 'post'},                  //教练添加时间段
            coachCopyTime           : {url : HX_CONFIG.VERSION+'/coachinfo/copy'  , method : 'post'},                        //教练复制时间段
            coachCourseMake         : {url : HX_CONFIG.VERSION+'/coachinfo/courseMake'  , method : 'post'},                  //教练上课人数

        //销售端
        	salemanList				: {url : '/index/saleman/search'  , method : 'post'},						 			 //销售人员列表
            memberCode              : {url : HX_CONFIG.VERSION+'/saleman/saveCode'  , method : 'post'},                      //销售人员二维码
            salemanUser             : {url : HX_CONFIG.VERSION+'/saleman/getuser'  , method : 'post'},                       //销售人员名下的会员
	};

    var sendAJAX = function (url, method, body, cb) {
        method = method.toLocaleUpperCase();
        if (HX_CONFIG.debug) {
            console.log("--------------------------------准备发送AJAX----------------------------------");
            console.log("HOST：", HX_CONFIG.HOST);
            console.log("URL：", url);
            console.log("method：", method);
            console.log("body：", body);
        }

        for (var k in body) {
            if (body.hasOwnProperty(k)) {
                if (k.indexOf("$") != -1) {
                    url.replace("{" + k + "}", body[k]);
                    delete  body[k];
                }
            }
        }

        switch (method) {
            case "GET":
                var config = {params: body , headers : {X_REQUESTED_WITH : 'xmlhttprequest'}};
                $http.get(HX_CONFIG.HOST + url, config).success(function (data) {
                	if(data.errCode == 10000){
                		$.toast(data.message , 'text');
                		$location.path('employee_login');
                		return;
                	}
                	if(data.errCode == 21001){
                		$.toast(data.message , 'text');
                		window._member = {};
                		$location.path('login');
                		return;
                	}
                    HX_CONFIG.debug && console.log("url=" + url, "成功", "返回结果：", data, "\n");
                    cb && cb(data);
                }).error(function (err) {
                    HX_CONFIG.debug && console.log("url=" + url, "错误", "返回结果：err = ", err, "\n");
                    cb && cb({errCode: -9999, message: "访问服务器失败！"});
                });
                break;
            case "POST":
                $http.post(HX_CONFIG.HOST + url, body , {headers : {X_REQUESTED_WITH : 'xmlhttprequest'}}).success(function (data) {
                    HX_CONFIG.debug && console.log("url = " + url, "成功", "返回结果：", data, "\n");
                    if(data.errCode == 10000){
                    	$.toast(data.message , 'text');
                		$location.path('employee_login');
                		return;
                	}
                    if(data.errCode == 21001){
                    	$.toast(data.message , 'text');
                		$location.path('login');
                		return;
                	}
                    cb && cb(data);
                }).error(function (err) {
                    HX_CONFIG.debug && console.log("url = " + url, "错误", "返回结果：err = ", err, "\n");
                    cb && cb({errCode: -9999, message: "访问服务器失败！"});
                });
                break;
        }

    };
    
    service.ajax = function (method, opts, cb) {
        var mm = methodMap[method];
        if (mm) {
            sendAJAX(mm.url, mm.method, opts, cb);
        } else {
            //未找到方法
            HX_CONFIG.debug && console.log("url=" + url, "错误", "返回结果：err = ", "无法请求，无效的请求！", "\n");
            cb && cb({errCode: -1, message: "无效的请求"})
        }
    };

    return service;
}]);


