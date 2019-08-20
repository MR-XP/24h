window.HX_CONFIG = {
    loadingBase: {template: '<ion-spinner icon="android" class="spinner spinner-android" style="stroke: #fff"><svg viewBox="0 0 64 64"><g transform="rotate(315.7000000000001,32,32)"><circle stroke-width="6" stroke-dasharray="130.10559854346837" stroke-dashoffset="0.33136094674554784" r="26" cx="32" cy="32" fill="none" transform="scale(1,1) translate(0,0) rotate(-270,32,32)"></circle></g></svg></ion-spinner>'},
    HOST			:	 	'',
    TEMPLATE_HOST	:		"static/mobilev2/",
    STATIC_HOST		: 		"static/mobilev2/",
    VERSION	   		: 		"V2",
    PAGEVERSION		:		"?v=1.0.0"
};

// Ionic Starter App
angular.module('App', ["ionic", "ngAnimate", "App.ctrls", "oc.lazyLoad", "App.filters", "App.directives","App.services"])

    .run(["$ionicPlatform", "$ionicLoading", "$rootScope", "$state", "$location","$session","ajaxService",
    
        function ($ionicPlatform, $ionicLoading, $rootScope, $state, $location, $session, ajaxService) {

			$ionicLoading.show(HX_CONFIG.loadingBase);
			
			//加载定位
			setTimeout(function(){
				
				getLocation(function(){
        	 		loadCity()
        		})
				
			},200);
			
			function loadCity(){
				
				//All
				ajaxService.ajax('getProvinceCity',{},function(json){
					
					if(json.code==200){		
						
						window.citys=json.data
						
					}else{
						
						//无回调时默认添加重庆
						window.citys=[
						
							{
								
								province	:	'重庆市',
								child		:	[
								
									{
										city	:	'重庆市'
									}
								
								]
								
							}
							
						]
						
					}
					
					//current
					ajaxService.ajax('getAddress',{
	
						longitude	:		window.userLoc.longitude,
						latitude	:		window.userLoc.latitude,
						
					},function(json){
						
						if(json.code==200){			//定位获取成功
							
							window.userLoc.province	=	json.data.province;
							window.userLoc.city		=	json.data.city;
							
						}else{						//定位获取失败
							
							window.userLoc.province	=	'重庆市';
							window.userLoc.city		=	'重庆市';
							
						}
						
						$ionicLoading.hide()
					})

				})

			}
			
			var missLoginView = ["reg","reg-data"];		//不需要注册的页面
			
			$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
					
				//$ionicLoading.show(HX_CONFIG.loadingBase);
				
	        	if (missLoginView.indexOf(toState.name) == -1 && !window.member){
	                
	                $state.go('reg');										//跳转到注册页
					
	                event.preventDefault(); 								//阻止默认事件，即原本页面的加载
			
	            }
	        	
	        	/*else{
		
		                $ionicLoading.hide()
		                	
		            }*/
			
	    	});

            //you know
            $rootScope.back = function () {
                history.back();
            };
            
            $rootScope.location = function (path, type) {

                if (type) 
                    path = $state.href(path).replace("#", "")
               
                $location.path(path);
            };
            
            $rootScope.stopBubbling = function (e) {
                e.stopPropagation();
            };
            
            $rootScope.setDocumentTitle = function(title) {
		    	document.title = title;
			   	i = document.createElement('iframe');
		        i.src = '/favicon.ico';
		        i.style.display = 'none';
		        i.onload = function() {
		            setTimeout(function(){
		                i.remove();
		            }, 9)
		        }
		        document.body.appendChild(i);
			};
            
        }])
		
    .config(["$stateProvider", "$urlRouterProvider", "$ionicConfigProvider", function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $ionicConfigProvider.platform.android.templates.maxPrefetch(8);
        $ionicConfigProvider.platform.ios.templates.maxPrefetch(8);

        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('bottom');
		
		$urlRouterProvider.when('/users', '/users/index');			     

		var nowUrl=location.href.substr(location.href.lastIndexOf('/')+1,10);

		if(nowUrl!='payv2.html')
			$urlRouterProvider.otherwise('/users')

		
        $stateProvider
		
		//注册
		.state('reg', {
            url: '/reg',
            templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/reg.html"+HX_CONFIG.PAGEVERSION,
            controller: 'regCtrl',
            cache: false
        })
		
		//注册资料填写
		.state('reg-data', {
            url: '/reg-data',
            templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/reg-data.html"+HX_CONFIG.PAGEVERSION,
            controller: 'regDataCtrl',
            cache: false
        })
		
		//用户端
		.state('users', {
			url: '/users',
			template: '<ion-nav-view class="slide-left-right"></ion-nav-view>',
			resolve: {
				ollc: ['$ocLazyLoad', function ($ocLazyLoad) {
					return $ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/usersCtrls.js?v='+HX_CONFIG.PAGEVERSION+'')
				}]
			},
			cache: false
		})
			//you kown
			.state('users.index', {
				url: '/index',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/index.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//个人设置
			.state('users.set', {
				url: '/set',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/set.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//我的订单
			.state('users.order', {
				url: '/order',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/order.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//我的预约
			.state('users.appt', {
				url: '/appt/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/appt.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//我的课程
			.state('users.my-course', {
				url: '/my-course',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/my-course.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//会员充值
			.state('users.recharge', {
				url: '/recharge',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/recharge.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//向我们反馈
			.state('users.feedback', {
				url: '/feedback',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/feedback.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//历史运动
			.state('users.sport-history', {
				url: '/sport-history',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/sport-history.html"+HX_CONFIG.PAGEVERSION,
				resolve: {
					ollc: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/plugins/echarts.simple.min.js')
					}]
				},
				cache: false
			})
			
			//私教列表
			.state('users.coach-list', {
				url: '/coach-list',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/coach-list.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
		
			//私教详情
			.state('users.coach-dtl', {
				url: '/coach-dtl/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/coach-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教购买
			.state('users.coach-pay', {
				url: '/coach-pay/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/coach-pay.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})

			//公共课详情
			.state('users.groupCourse-dtl', {
				url: '/groupCourse-dtl/:planId',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/groupCourse-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//我的会员卡
			.state('users.my-card', {
				url: '/my-card/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/my-card.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})

			//场馆列表
			.state('users.club-list', {
				url: '/club-list',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/club-list.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//场馆详情
			.state('users.club-dtl', {
				url: '/club-dtl/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/club-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//我的优惠劵
			.state('users.my-coupon', {
				url: '/my-coupon',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/my-coupon.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教招募
			.state('users.coach-recruit', {
				url: '/coach-recruit',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/coach-recruit.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教招募填写
			.state('users.coach-recruit-sub', {
				url: '/coach-recruit-sub',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/coach-recruit-sub.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//合伙人加盟
			.state('users.join', {
				url: '/join',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/join.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//签到记录
			.state('users.sign-record', {
				url: '/sign-record/:userId/:cardId',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/sign-record.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//会员卡成员列表
			.state('users.member-card', {
				url: '/member-card/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/member-card.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
		
		//私教端
		.state('coach', {
			url: '/coach',
			template: '<ion-nav-view class="slide-left-right"></ion-nav-view>',
			resolve: {
				ollc: ['$ocLazyLoad', function ($ocLazyLoad) {
					return $ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/coachCtrls.js?v='+HX_CONFIG.PAGEVERSION+'')
				}]
			},
			cache: false
		})
		
			//私教中心
			.state('coach.index', {
				url: '/index',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/index.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教课程列表
			.state('coach.course-list', {
				url: '/course-list',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/course-list.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教课程详情
			.state('coach.course-dtl', {
				url: '/course-dtl/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/course-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教预约
			.state('coach.appt', {
				url: '/appt',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/appt.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})

			//私教预约详情
			.state('coach.appt-dtl', {
				url: '/appt-dtl/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/appt-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教时间
			.state('coach.times', {
				url: '/times',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/times.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教时间设置
			.state('coach.time-set', {
				url: '/time-set',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/time-set.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//私教照片设置
			.state('coach.photos', {
				url: '/photos',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/coach/photos.html"+HX_CONFIG.PAGEVERSION,
/*				resolve: {
				ollc: ['$ocLazyLoad', function ($ocLazyLoad) {
					return 	$ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/plugins/camera/css/intial.css'),
							$ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/plugins/camera/js/hammer.min.js'),
							$ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/plugins/camera/js/lrz.all.bundle.js'),
							$ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/plugins/camera/js/iscroll-zoom-min.js'),
							$ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/plugins/camera/js/PhotoClip.js')
				}]
				},*/
				cache: false
			})

		//销售端
		.state('saleman', {
			url: '/saleman',
			template: '<ion-nav-view class="slide-left-right"></ion-nav-view>',
			resolve: {
				ollc: ['$ocLazyLoad', function ($ocLazyLoad) {
					return $ocLazyLoad.load(HX_CONFIG.STATIC_HOST + 'js/salemanCtrls.js?v='+HX_CONFIG.PAGEVERSION+'')
				}]
			},
			cache: false
		})
		//销售首页
		.state('saleman.index', {
			url: '/index',
			templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/saleman/index.html"+HX_CONFIG.PAGEVERSION,
			cache: false
		})
		//销售名下的会员
		.state('saleman.user-list', {
			url: '/user-list',
			templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/saleman/user-list.html"+HX_CONFIG.PAGEVERSION,
			cache: false
		})
		//销售名下的会员购卡详情
		.state('saleman.user-dtl', {
			url: '/user-dtl',
			templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/saleman/user-dtl.html"+HX_CONFIG.PAGEVERSION,
			cache: false
		})


		//会员端
			//首页
			.state('users.home', {
				url: '/home',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/home.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//会员卡列表
			.state('users.card-list', {
				url: '/card-list',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/card-list.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			
			//会员卡详情
			.state('users.card-dtl', {
				url: '/card-dtl/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/card-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//公共课排课列表
			.state('users.comCourse-plan', {
				url: '/comCourse-plan',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/comCourse-plan.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//公共课详情
			.state('users.comCourse-dtl', {
				url: '/comCourse-dtl/:planId',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/comCourse-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//公共课约课规则
			.state('users.appt-com-rules', {
				url: '/appt-com-rules/:id',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/appt-com-rules.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//精品团课排课列表
			.state('users.groCourse-plan', {
				url: '/groCourse-plan',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/groCourse-plan.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//精品团课列表
			.state('users.groCourse-list', {
				url: '/groCourse-list',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/groCourse-list.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//精品团课详情(预约)
			.state('users.groCourse-dtl', {
				url: '/groCourse-dtl/:planId',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/groCourse-dtl.html"+HX_CONFIG.PAGEVERSION,
				cache: false
			})
			//精品团课详情
			.state('users.groCourse-info', {
				url: '/groCourse-info',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/groCourse-info.html"+HX_CONFIG.PAGEVERSION,
				cache: false,
				params:{item:null},//参数不出现在地址上
			})
			//精品团课详情(购买)
			.state('users.groCourse-order', {
				url: '/groCourse-order',
				templateUrl: HX_CONFIG.TEMPLATE_HOST + "tpl/users/groCourse-order.html"+HX_CONFIG.PAGEVERSION,
				cache: false,
				params:{item:null,orderId:null},//参数不出现在地址上
			})

    }]);