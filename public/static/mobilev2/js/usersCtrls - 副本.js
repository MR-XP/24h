var app = angular.module('App', []);
app.controller("userIndexCtrl", ["$scope","$ionicLoading","ajaxService","$local","$timeout","$session","$ionicPopup","$location","$filter",
				   function ($scope,$ionicLoading,ajaxService,$local,$timeout,$session,$ionicPopup,$location,$filter) {	
	//开门权限
	$scope.open=false;
	
	//角色权限
	$scope.coach=false;
	$scope.saleman=false;
	
	//会员信息
	$scope.userLoad=function(){
		
		ajaxService.ajax('getuserinfo',null,function(json){
			
			if(json.code==200)	
				$scope.info=json.data
				
		})
		
	}

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

	//购买弹窗
	$scope.cardGo=function(){
		
		if($scope.info.cards && $scope.info.cards.length>0){
			
			$location.path('users/my-card/'+$scope.info.cards[0].sold_card_id)
			
		}else{
			
			var a=$ionicPopup.confirm({
						
				title			:	'尊敬的用户',
				template		: 	'你还未购买会员卡呢',
				cancelText		:	'不用了',
				okText			:	'立即购买',
				cssClass		:	'tc'
			});
			
			a.then(function(res) {
			    if(res) {
			       
			       $location.path('users/card-list')
			       
			    } 
			})		
		}	
		
	}
	
	//打开摄像头
	$scope.scanQRCode=function(){

		wx.scanQRCode({
            desc: '请扫描二维码',
            needResult: 0,
            scanType: ["qrCode"],
            success: function (res) {                    
            }
       	})
		
	}
	
	//获取场馆信息
	$scope.getShop=function(){

		window.shop.name	=	$scope.shop.list[$('.opendoor-shop option:selected').index()].shop_name;
		$scope.shop.name	=	$scope.shop.list[$('.opendoor-shop option:selected').index()].shop_name;
		window.shop.id		=	$scope.shop.list[$('.opendoor-shop option:selected').index()].shop_id;
		window.shop.county	=	$scope.shop.list[$('.opendoor-shop option:selected').index()].county;
		$scope.shop.county	=	$scope.shop.list[$('.opendoor-shop option:selected').index()].county;

	}
	
	//开门
	$scope.openDoor=function(){

		$ionicLoading.show();
		ajaxService.ajax('open',{
			
			shop_id		: window.shop.id
			
		},function(json){
			
			if(json.code==200){
				
				$ionicLoading.hide()
				
			}else{
				$timeout(function(){
					
					$ionicLoading.hide()
					
				},3000)
			}
			angular.element('.opendoor-mode').hide()
		})
		
	}
	
	//开门弹窗
	$scope.openShow=function(){
		angular.element('.opendoor-mode').show()
	}
	
	//关闭弹窗
	$scope.openHide=function(){
		angular.element('.opendoor-mode').hide()
	}
	
	
	//跳转
	$scope.go=function(urll){
		console.log(urll+'/index');
		$location.path(urll+'/index');
		
		$timeout(function(){
			window.location.reload()
		},500)
		
	}
	
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		
		//验证是否有账户
		if(!window.member)
			$location.path('reg')

		//加载用户信息
		$scope.userLoad()
		
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		
		//开门权限
		$scope.open=window.open;
		
		$scope.groups=window.groups;

		for(var i=0;i<$scope.groups.length;i++){
			
			if($scope.groups[i]=='教练')
				$scope.coach=true
			
			if($scope.groups[i]=='销售')
				$scope.saleman=true
				
		}
		
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//个人设置
app.controller("userSetCtrl", ["$scope","$ionicLoading","ajaxService","infoService","$ionicActionSheet","$popup","$location","$filter",
				     function ($scope,$ionicLoading,ajaxService,infoService,$ionicActionSheet,$popup,$location,$filter) {
	
	//初始化
	$scope.list={
		height	:	loopNb(140,70),
		kg		:	loopNb(35,96),
		sex		:	[
				{
					name	:	'男士',
					val		:	1
				},
				{
					name	:	'女士',
					val		:	2
				}
		]
	};
	
	//循环体
	function loopNb(f,v){
		
		$scope.sum=[];
		for(var i=0;i<v;i++){
			$scope.sum.push(f+i)
		}
		
		return $scope.sum
	}
	
	//加载数据
	$scope.load=function(){
    	
    	$scope.info = infoService.getForm('info');
    	
    	if(!$scope.info){
    		
    		ajaxService.ajax('getuserinfo' , {} , function(json){
	    		
	    		if(json.code==200){
	    			
	    			$scope.info = json.data;

	    			if($scope.info.cards.length>0)
	    				$scope.info.sold_card_id=json.data.cards[0].sold_card_id
	    			else
	    				$scope.info.sold_card_id=''
	    			
	    			$scope.info.birthday=new Date($scope.info.birthday);
	    			
	    			infoService.setForm('info' , $scope.info);
	    			
	    		}
	    		
	    	})

    	}
    	
    }
	
	//提交
	$scope.sub=function(){
			// 显示上拉菜单
		   var hideSheet = $ionicActionSheet.show({
		     buttons: [
		       { text: '保存' }
		     ],
		     titleText: '确认修改您的个人信息吗',
		     cancelText: '取消',
		     cancel: function() {
		          hideSheet()
		     },
		     buttonClicked: function() {
		       
		       	//请求数据
		       	ajaxService.ajax('edituserinfo' , {
		       		
		       		sex				:	$scope.info.sex,
		       		height			:	$scope.info.height,
		       		weight			:	$scope.info.weight,
		       		birthday		:	$scope.info.birthday,
		       		hope			:	'暂无',
		       		avatar			:	$scope.info.avatar,
		       		sold_card_id	:	$scope.info.sold_card_id,
		       		
		       	} , function(json){
	    		
		    		if(json.code==200){
		    			
		    			$popup.alert('尊敬的用户',null,'保存成功');		    			
		    			infoService.setForm('info' , $scope.info);
		    			$location.path('users')
		    			
		    		}
	    		
	    		})

		     }
		   });
	}
	
	
	//上传图片
	var gmMain = $(".up-img");
    gmMain.DM({
            beforeFun: function () {
                $ionicLoading.show(HX_CONFIG.loadingBase);
            },
            completeFun: function (result) {

            	ajaxService.ajax('uploadByString' , {
            		
            		filename	:	result.file.name,
            		data		:	result.clearBase64
            		
            	} , function(json){
	    		
		    		if(json.code==200){
		    			
		    			$ionicLoading.hide();
		    			$scope.info.avatar = json.data;
		    		}
	    		
	    		})

            },errorFun: function (file) {
            	$popup.alert('尊敬的申请人',null,'无法上传照片，请稍后再试！');
            }
    });
	
	//加载图片
	$scope.loadImg=function(){
		
		$ionicLoading.show(HX_CONFIG.loadingBase);
		
		setTimeout(function(){
			
			$ionicLoading.hide()
			
		},2000)
		
	};
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
		
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//我的订单
app.controller("orderCtrl", ["$scope","$ionicLoading","ajaxService","$ionicScrollDelegate","$timeout","$ionicActionSheet","$popup","$location",
				  function ($scope,$ionicLoading,ajaxService,$ionicScrollDelegate,$timeout,$ionicActionSheet,$popup,$location) {
	
	var notPaypage = function(){
    	return {
            currPage  	: 	1,
            totalPage 	: 	2,
            list     	: 	[]
        }
    }
	
	var Paypage = function(){
    	return {
            currPage  	: 	1,
            totalPage 	: 	2,
           	list		:	[]
        }
    }
	
	$scope.notPaypage = notPaypage();
	$scope.Paypage = Paypage();
	
	//默认加载未支付订单
	$scope.active=0;
	
	$scope.toggleActive=function(v){
		
		$scope.active=v;
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
		
		if(v==0)
			angular.element('.tab-nav-look').css({'left':'0','margin-left':'0'});
		else
			angular.element('.tab-nav-look').css({'left':'15%','margin-left':angular.element('.tab-nav-look').width()+2+'px'});
		
	}

	//未支付订单
	$scope.loadnotPay=function(cb){
		
		ajaxService.ajax('getOrderlist', {
			
			pay_status	: 	0,
			page_no		:	$scope.notPaypage.currPage
			
		}, function (json) {
			
	        if (json.code==200) {
				
				if($scope.notPaypage.currPage == 1){
	    			$scope.notPaypage.list=json.data.list;
	    		}else{
	    			$scope.notPaypage.list=$scope.notPaypage.list.concat(json.data.list);
	    		}
	    		
	            $scope.notPaypage.currPage  = $scope.notPaypage.currPage+1;
	            $scope.notPaypage.totalPage = json.data.total_pages+1;
				
				if(cb)
    				cb()
    				
	        }
	        
    	})
    	    	
	}
	
	//已支付订单
	$scope.loadPay=function(cb){
		
		ajaxService.ajax('getOrderlist', {
			
			pay_status	: 	1,
			page_no		:	$scope.Paypage.currPage
			
		}, function (json) {
			
	        if (json.code==200) {
				
				if($scope.Paypage.currPage == 1){
	    			$scope.Paypage.list=json.data.list;
	    		}else{
	    			$scope.Paypage.list=$scope.Paypage.list.concat(json.data.list);
	    		}
	    		
	            $scope.Paypage.currPage  = $scope.Paypage.currPage+1;
    			$scope.Paypage.totalPage = json.data.total_pages+1;
				
				if(cb)
    				cb()
	        }
	        
    	})
    	
	}
	
	//下拉刷新
    $scope.doPTRefresh = function () {
        
        if($scope.active == 0){
        	$scope.notPaypage.currPage = 1;
        	$scope.loadnotPay(function(){
        	 	$scope.$broadcast('scroll.refreshComplete');
        	})
        }else{
        	$scope.Paypage.currPage = 1;
        	$scope.loadPay(function(){
        	 	$scope.$broadcast('scroll.refreshComplete');
        	})
        }   

    };
    
    //无限加载回调
    $scope.onPTLoadMore = function () {
    	if($scope.active == 0){
        	$scope.loadnotPay(function(){
        		$scope.$broadcast('scroll.infiniteScrollComplete');
        	})
        }else{
        	$scope.loadPay(function(){
        	 	$scope.$broadcast('scroll.infiniteScrollComplete');
        	})
        }
        
    };
	
	
	//订单支付
	$scope.pay=function(id){
		
		window.location.href=window.base_url+'/pay.html?order_id='+id;
		
		//显示上拉菜单
/*	   var hideSheet = $ionicActionSheet.show({
	     buttons: [
	       { text: '微信支付' },
	       { text: '豆支付' },
	     ],
	     titleText: '选择支付方式',
	     cancelText: '取消',
	     cancel: function() {
	          hideSheet()
	     },
	     buttonClicked: function(index) {
	       	
	       	$ionicLoading.show(HX_CONFIG.loadingBase);
	       	
	       	var type='';
	       	//支付类型
	       	switch(index){
	       		
	       		case 0	:	
	       		type='WXPAY';
	       		break;
	       		case 1	:	
	       		type='SITEPAY';
	       		break;
	       		case 2	:	
	       		type='ALIPAY';
	       		break;
	       	}
	       	
	       	//请求数据
	       	ajaxService.ajax('orderPay' , {
	       		
	       		order_id	:	id,
	       		pay_type	:	type
	       		
	       	} , function(json){
    			
    			$ionicLoading.hide();
    			
	    		if(json.code==200){
	    			
		    		if(type=='WXPAY')
						window.location.href=window.base_url+'/v1/pay/pay/?order_id='+id
					else
						window.location.href=json.data

	    		}else{
	    			
	    			if(json.code==10028){
	    				
	    				$popup.alert('尊敬的用户',null,'恭喜您，支付成功！');
	    				$scope.notPaypage.currPage = 1;
	    				
	    			}else{
	    				
	    				$popup.alert('尊敬的用户',null,json.message);
	    				
	    			}
	    			
	    		}
    		
    		})

	     }
	   });*/

	}
	
	
	//取消订单
	$scope.cancelPay=function(item){
		
		//显示上拉菜单
	   var hideSheet = $ionicActionSheet.show({
	     buttons: [
	       { text: '我确认' }
	     ],
	     titleText: '你确定取消订单吗？',
	     cancelText: '再想想',
	     cancel: function() {
	          hideSheet()
	     },
	     buttonClicked: function(index) {
	       	
	       	$ionicLoading.show(HX_CONFIG.loadingBase);

	       	//请求数据
	       	ajaxService.ajax('orderCancel' , {
	       		
	       		order_id	:	item.order_id
	       		
	       	},function(json){

    			$ionicLoading.hide();
    			
	    		if(json.code==200){
		    		hideSheet();
		    		item.pay_status=2

	    		}else{
	    			
	    			$popup.alert('尊敬的用户',null,json.message);
	    			
	    		}
    		
    		})

	     }
	   });
	}

	
	
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

//我的约课
app.controller("apptCtrl", ["$scope","$ionicLoading","ajaxService","$ionicScrollDelegate","$timeout","$ionicActionSheet","$popup","$ionicPopup","$location","$stateParams",
				  function ($scope,$ionicLoading,ajaxService,$ionicScrollDelegate,$timeout,$ionicActionSheet,$popup,$ionicPopup,$location,$stateParams) {

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
	
	//默认加载进行中的课程
	$scope.active=0;
	
	$scope.toggleActive=function(v){
		
		$scope.active=v;
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
		
		if(v==0)
			angular.element('.tab-nav-look').css({'left':'0','margin-left':'0'});
		else
			angular.element('.tab-nav-look').css({'left':'15%','margin-left':angular.element('.tab-nav-look').width()+2+'px'});
			
	};

	if($stateParams.id)
        $scope.toggleActive($stateParams.id)


    //进行的预约
	$scope.loadhaveAppt=function(cb){
		
		ajaxService.ajax('getPlanList', {
			
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
	        
    	})

	}
	
	//已完成的预约
	$scope.loadfinishAppt=function(cb){
		
		ajaxService.ajax('getPlanList', {
			
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
	        
    	})
    	
	}
	
	//取消预约
	$scope.cancel=function(item){

	   //显示上拉菜单
	   var hideSheet = $ionicActionSheet.show({
	     buttons: [
	       { text: '确定' }
	     ],
	     titleText: item.plan.type==3?'确定取消该预约吗？取消后该节课将原路返还给您。':'确定取消该预约吗？',
	     cancelText: '返回',
	     cancel: function() {
	          hideSheet()
	        },
	     buttonClicked: function() {
	        
	        $ionicLoading.show(HX_CONFIG.loadingBase);
	        
	       	ajaxService.ajax('cancel',{
	       		
	       		appointment_id	: item.appointment_id
	       		
	       	},function(json){
	       		
	       		$ionicLoading.hide();
	       		if(json.code==200){
	       			item.status=-1;
	       			hideSheet()
	       		}else{
	       			$popup.alert('尊敬的用户',null,json.message);
	       			hideSheet()
	       		}
	       		
	       	})

	     }
	   })
	   
	}
	
	//下单
	$scope.createOrder=function(id){
		
		ajaxService.ajax('createorder',{
			
			type			:	5,	//取消旷课
			product_num		:	1,
			product_id		:	id
			
		},function(json){
			
			if(json.code==200){

				window.location.href=window.base_url+'/pay.html?order_id='+json.data.order_id
				
			}else{
				$location.path('users/order')
			}
			
		})
		
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
		        
		       	ajaxService.ajax('saveplansign',{
		       		
		       		appointment_id	: item.appointment_id
		       		
		       	},function(json){
		       		
		       		if(json.code==200){
		       			
		       			item.sign=3;
		       			hideSheet()
		       			
		       		}else{
		       			$popup.alert('尊敬的用户',null,json.message);
		       			hideSheet()
		       		}
		       		
		       		$ionicLoading.hide()
		       		
		       	})

		     }
	   })
	   
	}
	
	
	//评论
	$scope.cmet=function(item){

		var cmet=$ionicPopup.prompt({
			
		   	title				:	'对这个教练评价',
		   	inputType			: 	'',
		   	inputPlaceholder	: 	'说点什么吧',
		    cancelText			: 	'算了', 
		  	cancelType			: 	'button button-light',
		  	okText				: 	'提交', 

		}).then(function(res){

			if(res){
				
				$ionicLoading.show(HX_CONFIG.loadingBase);
				
				ajaxService.ajax('CoachComment',{
		       		
		       		appointment_id	: 	item.appointment_id,
		       		rate			:	5,
		       		content			:	res
		       		
		       	},function(json){
		       		
		       		if(json.code==200){
		       			
		       			item.sign=4;
		       			$popup.alert('尊敬的用户',null,'评价成功!');
		       			
		       		}else{
		       			$popup.alert('尊敬的用户',null,json.message)
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

//会员充值-新
app.controller("rechargeCtrl", ["$scope","$ionicLoading","ajaxService","$popup","$location",
				   function ($scope,$ionicLoading,ajaxService,$popup,$location) {
	
	$scope.pay={
		num	:	'100'
	};
	
	//替换多余字符
	$scope.rel=function(txt){
		
		$scope.pay.num=txt.replace(/\D/gi,'');
		
	}
		
	//下单并跳转订单详情
	$scope.go=function(){
		
		if(!window.member){
			
			$scope.reg()			//未注册用户跳转
			
		}else{
			
			if($scope.pay.num==0 || $scope.pay.num=='')
				$popup.alert('尊敬的用户',null,'充值金额不能填零哟');
			else
				$scope.createOrder()
			
		}

	}
	
	
	//下单
	$scope.createOrder=function(){
		
		ajaxService.ajax('createorder',{
			
			type			:	4,	//1会员卡、2小团课、3私教课、4储值
			origin_price	:	$scope.pay.num
			
		},function(json){
			
			if(json.code==200){

				window.location.href=window.base_url+'/pay.html?order_id='+json.data.order_id
				
			}
			
		})
		
	}

	//跳转注册
	$scope.reg=function(){

		var a=$ionicPopup.confirm({
					
			title			:	'尊敬的用户',
			template		: 	'您还未注册账号呢',
			cancelText		:	'再看看',
			okText			:	'立即注册',
			cssClass		:	'tc'
		});
		
		a.then(function(res) {
			
		    if(res) {
		       
		       $location.path('reg')
		       
		    } 
		})
	
	}
	
	
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

//向我们反馈
app.controller("feedbackCtrl", ["$scope","$ionicLoading","ajaxService","$popup","$location",
				   	  function ($scope,$ionicLoading,ajaxService,$popup,$location) {
	
	$scope.data={
		
		content	:	''
		
	};
	
	//提交
	$scope.go=function(){

		ajaxService.ajax('addFeedBack', {
			
			content	:	$scope.data.content
			
		}, function (json) {
			
	        if (json.code==200) {
				
				$popup.alert('尊敬的用户',null,'发送成功！您的宝贵意见是对我们最大的支持和肯定');
				$location.path('users')
    				
	        }else{
	        	
	        	$popup.alert('尊敬的用户',null,json.message)
	        }
	        
    	})
		
	}
	
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

//会员卡列表
app.controller("cardListCtrl", ["$scope","$ionicLoading","ajaxService","$ionicScrollDelegate","$ionicPopup","$location",
				   	  function ($scope,$ionicLoading,ajaxService,$ionicScrollDelegate,$ionicPopup,$location) {
				   	  	
				   	  	
				   	  	
/*	
 * 	
 * 	动画效果，暂时不需要了
 * 
 *	//类别
	$scope.category={
		
		0	:	'年卡',
		20	:	'家庭卡',
		40	:	'月卡',
		60	:	'次卡',
		80	:	'活动'
		
	}
	
	//类别名称
	$scope.categoryName='年卡';
	
	//类别值
	$scope.categoryVal=0;
	
	//类别宽度
	$scope.categoryWh=$('.tab-nav-li').width();
	
	//线条宽度
	$scope.tabLook=$('.tab-nav-look').width();
	
	//默认加载动画
	angular.element('.tab-nav-look').css('margin-left',($scope.categoryWh - $scope.tabLook)/2+'px');
	
	//点击筛选
	$scope.toggleActive=function(v){
		
		$scope.categoryName=$scope.category[v];
		$scope.categoryVal=v;
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
		
		angular.element('.tab-nav-look').css({'left':v+'%','margin-left':(($scope.categoryWh - $scope.tabLook)/2 +'px')});	

	}*/
	

	//会员卡列表加载
	$scope.load=function(){
		ajaxService.ajax('getcardlist',{
			
			shop_id		:	window.shop.id
			
		},function(json){
			
			if(json.code==200){
				
				$scope.cardList=json.data;
				$scope.people()
			}
			
		})
	}
	
	//在场人数
	$scope.people=function(){

		ajaxService.ajax('getShopOnline',{
			
			shop_id		: window.shop.id
			
		},function(json){
			
			if(json.code==200){

				$scope.peopleSum=json.data;
				
			}
			
		})
		
	}
	
	$scope.go=function(id){
		$location.path('users/card-dtl/'+id)
	}
	
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

//会员卡详情
app.controller("cardDtlCtrl", ["$scope","$ionicLoading","ajaxService","$stateParams","$location",
				     function ($scope,$ionicLoading,ajaxService,$stateParams,$location) {
	
	//下单并跳转订单详情
	$scope.go=function(){
		
		if(!window.member){
			
			$scope.reg()			//未注册用户跳转
			
		}else{
			
			$scope.createOrder()
			
		}

	}
	
	//销售人员加载
	$scope.loadSale=function(){
		
		ajaxService.ajax('salemanList', {}, function(json) {

			if(json.code == 200) {
				
					$scope.salemanList = json.data;
					
					var nullSaleman = {
								saleman_id		:	0,
								real_name		:	""
					};
					
					$scope.salemanList.unshift(nullSaleman);
					$scope.salemanId = 0;
					
			} else {
				$popup.alert('尊敬的用户', null, json.message);
			}

		})
		
	}
	
	//下单
	$scope.createOrder=function(){
		
		ajaxService.ajax('createorder',{
			
			type			:	1,	//1会员卡、2小团课、3私教课、4储值
			product_num		:	1,
			product_id		:	$scope.info.card_id,
			shop_id			:	window.shop.id,
			seller_id		:	$scope.salemanId
			
		},function(json){
			
			if(json.code==200){
	
				window.location.href=window.base_url+'/pay.html?order_id='+json.data.order_id
				
			}
			
		})
		
	}
	
	//会员卡详情加载
	$scope.load=function(){
		
		ajaxService.ajax('getcardinfo',{ card_id : $stateParams.id },function(json){
			
			if(json.code==200){
				
				$scope.info=json.data;
				
			}
			
		})
		
	}

	//跳转注册
	$scope.reg=function(){

		var a=$ionicPopup.confirm({
					
			title			:	'尊敬的用户',
			template		: 	'您还未注册账号呢',
			cancelText		:	'再看看',
			okText			:	'立即注册',
			cssClass		:	'tc'
		});
		
		a.then(function(res) {
			
		    if(res) {
		       
		       $location.path('reg')
		       
		    } 
		})
	
	}
	
	//临时
/*	switch($stateParams.id){
		
		case '29':
		$scope.txt='(赠送10次)';
		break;
		case '30':
		$scope.txt='(赠送50次)';
		break;
		case '31':
		$scope.txt='(赠送100次)';
		break;
		case '32':
		$scope.txt='(赠送200次)';
		break;
		
	}
*/

	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load();
		$scope.loadSale()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
/*		if(window.shop.id==0)
			$location.path('users/card-list')*/
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//会员卡购买
app.controller("cardPayCtrl", ["$scope","$ionicLoading","ajaxService","$stateParams","$popup","$location","$ionicPopup",
				   function ($scope,$ionicLoading,ajaxService,$stateParams,$popup,$location,$ionicPopup) {
	
	//支付方式
	$scope.paytype='WXPAY';
	
	//协议
	$scope.wk=true;
	
	$scope.set=function(){
		$scope.wk=!$scope.wk;
	}
	
	//购买类型
	$scope.payType=function(type){
		
		switch(type){
			
			case 0	:
			$scope.paytype='WXPAY';
			break;
			case 1	:
			$scope.paytype='SITEPAY';
			break;
			case 2	:
			$scope.paytype='ALIPAY';
			break;
			case 3	:
			$scope.paytype='GROUPPAY';
			break;
		}
		
	}
	
	//组合购买
	$scope.groupPay={
		
		name		:	'',
		money		:	0,
		bean		:	0,
		nowMoney	:	0
		
	}
	
	//购买类型
	$scope.newPay=function(){
		
		if(!window.member){
			
			$scope.reg()
			
		}else{
			
			if(!$scope.wk){
				$popup.alert('尊敬的用户',null,'您得同意协议才行哟');
				return
			}
			
			if($scope.paytype=='GROUPPAY'){
				
				if($scope.info.pre_paid && $scope.info.pre_paid>0){
	
					$scope.groupPay.bean=$scope.info.pre_paid;
					
					var newMoney=$scope.cardInfo.price-$scope.info.pre_paid;
					newMoney=newMoney.toFixed(2);
					$scope.groupPay.nowMoney=newMoney>0?newMoney:0;
					
				}else{
	
					$scope.paytype='WXPAY';
					$scope.groupPay.nowMoney=$scope.cardInfo.price;
	
				}
				
				$scope.groupPay.name=$scope.cardInfo.card_name;
				$scope.groupPay.money=$scope.cardInfo.price;
				
				$('.pay-group-mode').show();
				
			}else{
				$scope.pay()
			}
			
		}

	}
	
	$scope.pay=function(){

		$ionicLoading.show(HX_CONFIG.loadingBase);

		ajaxService.ajax('doCardOrder',{
	   		
	   		money			:	$scope.cardInfo.price,
			origin_price	:	$scope.cardInfo.origin_price,
			pay_type		:	$scope.paytype,
			card_id			:	$scope.cardInfo.card_id
	   		
	   	},function(json){
	   		
	   		$ionicLoading.hide();

	   		if(json.code==200){

	   			window.location.href=window.base_url+'/v1/pay/pay/?name='+$scope.paytype+'&order_id='+json.data
				
	   		}else{

	    			if(json.code==10028){
	    				
	    				$popup.alert('尊敬的用户',null,'恭喜您，支付成功！');
	    				$location.path('users')
	    				
	    			}else{
	    				
	    				$popup.alert('尊敬的用户',null,json.message);
	    				
	    			}
	    			
	    		}

	   	})
		
	}
	
	$scope.cancel=function(){
		$('.pay-group-mode').hide()
	}
	
	//会员卡详情加载
	$scope.load=function(){
		
		ajaxService.ajax('getcardinfo',{ card_id : $stateParams.id },function(json){
			
			
			if(json.code==200){
				
				$scope.cardInfo=json.data;
				
				$('#description').html($scope.cardInfo.description)
			}
			
		})
		
	}
	
	//用户信息加载
	$scope.userLoad=function(){
		
		ajaxService.ajax('getuserinfo',null,function(json){
			
			if(json.code==200)	
				$scope.info=json.data
			
		})
		
	}
	
	function stopPropagation(e) {  
	    e = e || window.event;  
	    if(e.stopPropagation) { //W3C阻止冒泡方法  
	        e.stopPropagation();  
	    } else {  
	        e.cancelBubble = true; //IE阻止冒泡方法  
	    }  
	}
	
	//弹出协议
	$scope.show=function(){
		stopPropagation();
		
		$('.aet-mode').slideDown(250);
	}
    
    $scope.close=function(){
   		$('.aet-mode').slideUp(250);
    }
	
	//跳转注册
	$scope.reg=function(){

		var a=$ionicPopup.confirm({
					
			title			:	'尊敬的用户',
			template		: 	'您还未注册账号呢',
			cancelText		:	'再看看',
			okText			:	'立即注册',
			cssClass		:	'tc'
		});
		
		a.then(function(res) {
			
		    if(res) {
		       
		       $location.path('reg')
		       
		    } 
		})
	
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load();
		$scope.userLoad()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//运动历史
app.controller("sportHistoryCtrl", ["$scope","$ionicLoading","ajaxService",
				   function ($scope,$ionicLoading,ajaxService) {

	$scope.historyData={
		
		item	:	["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],		//日期
		data	:	[
						[10,12,13,23,453,43,78,45,18,15,48,15],
						[345,12,13,33,4323,123,3423,1231,3456,12,234,150]
					],
		id		:	'newChart',
		legend	:	['约课','里程'],
		color	:	['#5e8cf9','#f28019']
		
	}
	
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

//私教列表
app.controller("coachListCtrl", ["$scope","$ionicLoading","ajaxService","$timeout","$location",
				   	   function ($scope,$ionicLoading,ajaxService,$timeout,$location) {
	
	//列表参数
	$scope.list={			
		
		speciality	:	'',
		sex			:	'',
		order		:	''
	}
	
	//健身需求
	$scope.demand=[
		'增肌',
		'产后恢复',
		'格斗',
		'瑜伽',
		'减脂塑形'
	]
	
	//星级
	$scope.stars=[];
	
	//描述
	$scope.nowTxt='筛选';
	
	//加载
	$scope.load=function(){

		ajaxService.ajax('getCoachList',{
			
			speciality	:	$scope.list.speciality,
			province	:	window.userLoc.province,
			city		:	window.userLoc.city,
			sex			:	$scope.list.sex,
			order		:	$scope.list.order,
			shop_id		:	window.shop.id
		
		},function(json){
			
			if(json.code==200){
				
				var sum=[];
				
				for(var i=0;i<json.data.length;i++){
					
					if(json.data[i].type==2 && json.data[i].price)
						sum.push(json.data[i])

					if(i+1==json.data.length)
						$scope.coachList=sum

				}

			}
			
		})
		
	}

	//下拉筛选
	$scope.look=function(){
		
		if(angular.element('.screen-mode').css('display')=='none')
			angular.element('.screen-mode').fadeIn()
		else
			angular.element('.screen-mode').fadeOut()
		
	}

	//选择需求
	$scope.get=function(txt,type){
		
		//性别选择
		if(type==1){
			
			if($scope.list.sex==txt)
				$scope.list.sex='';
			else
				$scope.list.sex=txt;
		
		//需求选择
		}else{
			
			if($scope.list.speciality==txt){
				$scope.nowTxt='筛选';
				$scope.list.speciality='';
			}else{
				$scope.list.speciality=txt;
				$scope.nowTxt=$scope.list.speciality;
			}

		}
		
		angular.element('.screen-mode').fadeOut();
		$scope.load()
	}

	//排序
	$scope.sort=function(type){
		
		//默认排序
		if(type==1){
			$scope.list.order=''
		}
			
		//销量排序
		if(type==2){
			if($scope.list.order=='' || $scope.list.order=='price asc' || $scope.list.order=='price desc'){
				$scope.list.order='buy_num asc'
			}else{
				
				if($scope.list.order=='buy_num asc')
					$scope.list.order='buy_num desc'
				else
					$scope.list.order='buy_num asc'
			}
		}	

		//价格排序
		if(type==3){
			if($scope.list.order=='' || $scope.list.order=='buy_num asc' || $scope.list.order=='buy_num desc'){
				$scope.list.order='price asc'
			}else{
				
				if($scope.list.order=='price asc')
					$scope.list.order='price desc'
				else
					$scope.list.order='price asc'
			}
		}
		
		angular.element('.screen-mode').fadeOut();
		$scope.load()
	}

	//星级加载
	$scope.getStars=function(num){
		
		sum=[];
		for(var i=0;i<num;i++){
			sum.push(i)	
		}
		return sum;
		
	}
	
	//跳转
	$scope.go=function(id){
		$location.path('users/coach-dtl/'+id)
	}

	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){

	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//私教详情
app.controller("coachDtlCtrl", ["$scope","$ionicLoading","ajaxService","$stateParams","$filter","formatDate","infoService","$location","$ionicPopup",
				   	  function ($scope,$ionicLoading,ajaxService,$stateParams,$filter,formatDate,infoService,$location,$ionicPopup) {

	//私教购买
	$scope.coachItem='';

	//星级加载
	$scope.sum=[];
	$scope.getStars=function(){

		for(var i=0;i<$scope.info.score;i++){
			$scope.sum.push(i)	
		}
		
	}
	
	//评价星级加载
	$scope.getStarsTwo=function(num){
		
		sum=[];
		for(var i=0;i<num;i++){
			sum.push(i)	
		}
		return sum;
		
	}
	
	//当前时间段
	$scope.nowTimesList=[];

	//日期选择
	$scope.clickDateMenu=function(time,ix){
		
		v=$('.date-menu-li:eq('+ix+')').offset().left;
		
		$scope.nowMap=$('.date-menu-li:eq('+ix+')').text();
		
		//$scope.nowDay=$filter('zeroFill')(formatDate.get(new Date(time)).d);
		$scope.nowDay=$('.date-menu-li:eq('+ix+')').attr('nowDay');

		if(ix==0)
			angular.element('.date-menu-active').css('left','1.2rem')
		else
			angular.element('.date-menu-active').css('left',v+'px')

		if($scope.info)
			$scope.nowTimesList=$scope.info.plan[time]

	}

	//获取课程
	$scope.getId=function(item){
		$scope.coachItem=item;
	}

	//去支付
	$scope.go=function(){
		
		if(!window.member){
			
			var a=$ionicPopup.confirm({
						
				title			:	'尊敬的用户',
				template		: 	'您还未注册账号呢',
				cancelText		:	'再看看',
				okText			:	'立即注册',
				cssClass		:	'tc'
			});
			
			a.then(function(res) {
				
			    if(res) {
			       
			       $location.path('reg')
			       
			    } 
			})
			
		}else{
			infoService.setForm('coachItem',$scope.coachItem);
			$location.path('users/coach-pay/'+$stateParams.id)
		}
		
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load=function(){
			
			ajaxService.ajax('getCoachInfo',{
				
				coach_id	:	$stateParams.id
				
			},function(json){
				
				if(json.code==200){
					
					
					$scope.info=json.data;
					$scope.nowTimesList=$scope.info.plan[$scope.nowTime()];
					$scope.coachItem=json.data.course[0];
					$('#intro').html($filter('limitTo')($scope.info.intro,'30'));
					$scope.getStars()
				}
				
			})
			
		}
		$scope.load()
	});
	
	//获取当天时间
	$scope.nowTime=function(){
		var time=new Date();
		return time.getFullYear()+'-'+$filter('zeroFill')(time.getMonth()+1)+'-'+$filter('zeroFill')(time.getDate())
	}
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//私教购买-新
app.controller("coachPayCtrl", ["$scope","$ionicLoading","ajaxService","infoService","$location","$ionicActionSheet","$popup","$stateParams",
				   	  function ($scope,$ionicLoading,ajaxService,infoService,$location,$ionicActionSheet,$popup,$stateParams) {
	
	$scope.coach=false;
	$scope.coach=infoService.getForm('coachItem');
	
	
	if(!$scope.coach && $stateParams.id!='undefined'){
		$location.path('users/coach-dtl/'+$stateParams.id);
		return
	}else if(!$scope.coach && $stateParams.id=='undefined'){
		$location.path('users/coach-list');
		return
	}
	
	//所购买的课程数量
	$scope.coach.now_buy=$scope.coach.min_buy;
	
	//所要支付的现价
	$scope.coach.money=$scope.coach.min_buy * $scope.coach.price;
	
	//减节数
	$scope.rde=function(){
		
		if($scope.coach.now_buy>$scope.coach.min_buy)
			$scope.coach.now_buy=$scope.coach.now_buy - $scope.coach.min_buy;

		if($scope.coach.now_buy<$scope.coach.min_buy)
			$scope.coach.now_buy=$scope.coach.min_buy
			
		$scope.coach.money=$scope.coach.now_buy * $scope.coach.price;
		
	}
	
	//添加节数
	$scope.add=function(){

		$scope.coach.now_buy+=$scope.coach.min_buy;
		
		if($scope.coach.max_buy!=0 && $scope.coach.now_buy>$scope.coach.max_buy)
			$scope.coach.now_buy=$scope.coach.max_buy
		
		$scope.coach.money=$scope.coach.now_buy * $scope.coach.price;

	}
	
	//下订单
	$scope.createOrder=function(){

		ajaxService.ajax('createorder',{
			
			type			:	$scope.coach.type,		
			product_num		:	$scope.coach.now_buy,
			product_id		:	$scope.coach.course_id
			
		},function(json){
			
			if(json.code==200){

				window.location.href=window.base_url+'/pay.html?order_id='+json.data.order_id
				
			}else{
				$popup.alert('尊敬的用户',null,json.message);
			}
			
		})
		
	}

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


//私教购买-旧
/*app.controller("coachPayCtrl", ["$scope","$ionicLoading","ajaxService","infoService","$location","$ionicActionSheet","$popup","$stateParams",
				   	  function ($scope,$ionicLoading,ajaxService,infoService,$location,$ionicActionSheet,$popup,$stateParams) {
	
	$scope.coach=infoService.getForm('coachItem');
	if(!$scope.coach)
		$location.path('users/coach-dtl/'+$stateParams.id)
	
	//支付类型
	$scope.paytype='WXPAY';
	 
	//所购买的课程数量
	$scope.coach.now_buy=$scope.coach.min_buy;
	
	//所要支付的现价
	$scope.coach.money=$scope.coach.min_buy * $scope.coach.price;
	
	//所要支付的原价
	$scope.coach.or_price=$scope.coach.min_buy * $scope.coach.origin_price;
	
	//减节数
	$scope.rde=function(){
		
		if($scope.coach.now_buy>$scope.coach.min_buy){
			$scope.coach.now_buy=$scope.coach.now_buy-$scope.coach.min_buy;
			$scope.coach.money=$scope.coach.now_buy * $scope.coach.price;
			$scope.coach.or_price=$scope.coach.now_buy * $scope.coach.origin_price;
		}
		
	}
	
	//添加节数
	$scope.add=function(){
		$scope.coach.now_buy+=$scope.coach.min_buy;
		$scope.coach.money=$scope.coach.now_buy * $scope.coach.price;
		$scope.coach.or_price=$scope.coach.now_buy * $scope.coach.origin_price;
	}
	
	
	//组合购买
	$scope.groupPay={
		
		name		:	'',
		money		:	0,
		bean		:	0,
		nowMoney	:	0
		
	}
	
	//购买类型
	$scope.payType=function(){
		
		//显示上拉菜单
	   var hideSheet = $ionicActionSheet.show({
	     buttons: [
	       { text: '微信支付' },
	       { text: '豆支付' },
	       { text: '组合支付'}
	     ],
	     titleText: '选择支付方式',
	     cancelText: '取消',
	     cancel: function() {
	          hideSheet()
	     },
	     buttonClicked: function(index) {

	       	var type='';
	       	//支付类型
	       	switch(index){
	       		
	       		case 0	:	
	       		type='WXPAY';
	       		break;
	       		case 1	:	
	       		type='SITEPAY';
	       		break;
	       		case 2	:	
	       		type='GROUPPAY';
	       		break;
	       	}
	       	
	       	$scope.paytype=type;
	       	
			if($scope.paytype=='GROUPPAY'){
				hideSheet();
				$scope.newPay()
			}else
				$scope.pay()

	     }
	   })
	}
	
	//组合支付
	$scope.newPay=function(){

		if($scope.info.pre_paid && $scope.info.pre_paid>0){

			$scope.groupPay.bean=$scope.info.pre_paid;
			
			var newMoney=($scope.coach.now_buy * $scope.coach.price)-$scope.info.pre_paid;
			newMoney=newMoney.toFixed(2);
			
			$scope.groupPay.nowMoney=newMoney>0?newMoney:0;
			
		}else{
			$scope.paytype='WXPAY';
			$scope.groupPay.nowMoney=$scope.coach.now_buy * $scope.coach.price;
		}
		
		$scope.groupPay.name=$scope.coach.course_name;
		$scope.groupPay.money=$scope.coach.now_buy * $scope.coach.price;
		
		$('.pay-group-mode').show();
	}

	$scope.pay=function(){
		
		$ionicLoading.show(HX_CONFIG.loadingBase);
		
		//请求数据
       	ajaxService.ajax('doCourseOrder' , {
       		
       		money			:	$scope.coach.money,
       		origin_price	:	$scope.coach.or_price,
       		product_num		:	$scope.coach.now_buy,
       		course_id		:	$scope.coach.course_id,
       		pay_type		:	$scope.paytype,
       		
       	} , function(json){

	   		$ionicLoading.hide();

	   		if(json.code==200){

	   			window.location.href=window.base_url+'/v1/pay/pay/?name='+$scope.paytype+'&order_id='+json.data
				
	   		}else{

    			if(json.code==10028){
    				
    				$popup.alert('尊敬的用户',null,'恭喜您，支付成功！');
    				$location.path('users/my-course')
    				
    			}else{
    				
    				$popup.alert('尊敬的用户',null,json.message);
    				
    			}
	    			
	    	}
		
		})
       	
	}
	
	//关闭弹窗
	$scope.cancel=function(){
		$('.pay-group-mode').hide()
	}
	
	
	//用户信息加载
	$scope.userLoad=function(){
		
		ajaxService.ajax('getuserinfo',null,function(json){
			
			if(json.code==200)	
				$scope.info=json.data
			
		})
		
	}

	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		//$scope.shopList()
		$scope.userLoad()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);
*/


//我的课程
app.controller("myCourseCtrl", ["$scope","$ionicLoading","ajaxService","$filter","$location","formatDate","$popup","$timeout","$stateParams","$ionicScrollDelegate",
				   	  function ($scope,$ionicLoading,ajaxService,$filter,$location,formatDate,$popup,$timeout,$stateParams,$ionicScrollDelegate) {
	
	//约课
	$scope.make={
		
		shopId		:	0,
		courseId	:	0,
		planId		:	0
	}
	
	//商铺列表
	$scope.shopList=[];
	
	//所有时间段
	$scope.times=false;
	
	//当天时间段
	$scope.nowTimes=[];
	
	//当前选择日期
	$scope.nowDate="";


	//默认加载小团课
	$scope.active=0;
	
	$scope.toggleActive=function(v){
		
		$scope.active=v;
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
		
		if(v==0)
			angular.element('.tab-nav-look').css({'left':'0','margin-left':'0'});
		else
			angular.element('.tab-nav-look').css({'left':'15%','margin-left':angular.element('.tab-nav-look').width()+2+'px'});
			
	};

	if($stateParams.id)
        $scope.toggleActive($stateParams.id)
	
	//加载小团课
	$scope.loadGroupClass=function(){
		
		ajaxService.ajax('getUserCourse',{
			
			type	:	2
			
		},function(json){
			
			if(json.code==200)	
				$scope.groupClassList=json.data;
		})
		
	}
	//加载私教课
	$scope.loadPrivateClass=function(){
		
		ajaxService.ajax('getUserCourse',{
			
			type	:	3
			
		},function(json){
			
			if(json.code==200)	
				$scope.privateClassList=json.data;
		})
		
	}

	
	//日期选择
	$scope.clickDateMenu=function(time,ix){
		
		v=$('.date-menu-li:eq('+ix+')').offset().left;
		
		$scope.nowMap=$('.date-menu-li:eq('+ix+')').text();
		//$scope.nowDay=$filter('zeroFill')(formatDate.get(new Date(time)).d);
		$scope.nowDay=$('.date-menu-li:eq('+ix+')').attr('nowDay');
		$scope.nowDate=time;
		
		if(ix==0)
			angular.element('.date-menu-active').css('left','1.2rem')
		else
			angular.element('.date-menu-active').css('left',v+'px')

		if($scope.times)
			$scope.nowTimes=$scope.times[time];

	}
	
	//预约
	$scope.makeCk=function(item){
		$('.make-mode').css('bottom','0');
		$('.make-bg').show();
		
		//获取场馆ID
		if(item.shops.length>0){
			$scope.shopList=item.shops;
			$scope.make.shopId=$scope.shopList[0].shop_id
		}else{
			$scope.shopList=[];
			$scope.make.shopId=0;
		}
		
		//获取所有时间
		$scope.times=item.plan_time;
		
		//获取当前时间
		$scope.nowTimes=$scope.times[$scope.nowDate];
		
		//重置时间段ID
		$scope.make.planId=0;
		
		//获取课程ID
		$scope.make.courseId=item.sold_course_id;
	}

	$scope.checkClass=function(){
		$location.path('users/groupCourse-list')
	}

	//关闭预约弹窗
	$scope.cancel=function(){
		
		$timeout(function(){
			$('.make-bg').hide()			
		},500);
		$('.make-mode').css('bottom',-($('.make-mode').height()+50)+'px')

	}
	
	//预约
	$scope.go=function(){
		
		if($scope.make.planId==0 || $scope.make.planId==''){
			$popup.alert('尊敬的用户','','您还未选择时间段呢');
			return
		}
		$ionicLoading.show(HX_CONFIG.loadingBase);
		ajaxService.ajax('make',{
			
			shop_id				:	$scope.make.shopId,
			plan_id				:	$scope.make.planId,
			sold_course_id		:	$scope.make.courseId
			
		},function(json){
			
			$ionicLoading.hide();
			
			if(json.code==200){
				
				$popup.alert('尊敬的用户','','预约成功');
				$location.path('users/appt/0')
				
			}else{
				
				$popup.alert('尊敬的用户','',json.message);
				
			}
			
		})
		
	}
	
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.loadGroupClass();
		$scope.loadPrivateClass();

	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
		$('.make-mode').css('bottom',-($('.make-mode').height()+50)+'px')
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);


//公共课列表
app.controller("groupCourseListCtrl", ["$scope","$ionicLoading","ajaxService","formatDate","$filter","$timeout","$location",
				   			 function ($scope,$ionicLoading,ajaxService,formatDate,$filter,$timeout,$location) {

	$scope.courseList=[];
	$scope.nowCourseList=[];
	
	//日期选择
	$scope.clickDateMenu=function(time,ix){
		
		v=$('.date-menu-li:eq('+ix+')').offset().left;
		
		$scope.nowMap=$('.date-menu-li:eq('+ix+')').text();
		
		//$scope.nowDay=$filter('zeroFill')(formatDate.get(new Date(time)).d);
		$scope.nowDay=$('.date-menu-li:eq('+ix+')').attr('nowDay');
		
		if(ix==0)
			angular.element('.date-menu-active').css('left','1.2rem')
		else
			angular.element('.date-menu-active').css('left',v+'px')
		
		if($scope.courseList)
			$scope.nowCourseList=$scope.courseList[time]

	}
	
	//加载
	$scope.load=function(){
		ajaxService.ajax('getCourseList',{
				
			province	:	window.userLoc.province,
			city		:	window.userLoc.city,
			longitude	:	window.userLoc.longitude,
			latitude	:	window.userLoc.latitude,
			shop_id		:	window.shop.id
			
		},function(json){

			if(json.code==200){
				$scope.courseList=json.data;
				$scope.clickDateMenu($scope.nowTime(),0)
				//$scope.nowCourseList=$scope.courseList[$scope.nowTime()];
			}
			
		})
		
	}
	
	//获取当天时间
	$scope.nowTime=function(){
		var time=new Date();
		return time.getFullYear()+'-'+$filter('zeroFill')(time.getMonth()+1)+'-'+$filter('zeroFill')(time.getDate())
	}
	
	//获取年份
	$scope.getYear=function(item){
		
		return item=item.substr(0,10)
		
	}
	
	//懒得解释了
	$scope.getTime=function(item){
		
		return item=item.substr(item.indexOf(' '))
		
	}
	
	//获取进度宽度
	$scope.bar=function(ix,curN,total){
		$timeout(function(){
			angular.element('.appt-two:eq('+ix+')').find('.appt-mode-barMv').css('width',curN/total*100+'%')
		},500)
	}
	
	
	$scope.go=function(id){
		$location.path('users/groupCourse-dtl/'+id)
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){

	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//团课详情
app.controller("groupCourseDtlCtrl", ["$scope","$ionicLoading","ajaxService","$popup","$location","$stateParams","$ionicPopup","$ionicSlideBoxDelegate","$timeout","infoService",
				   			function ($scope,$ionicLoading,ajaxService,$popup,$location,$stateParams,$ionicPopup,$ionicSlideBoxDelegate,$timeout,infoService) {

	
	$scope.load=function(){
		
		ajaxService.ajax('getPlanInfo',{
			
			plan_id		:	$stateParams.planId
			
		},function(json){
			
			if(json.code==200){
				
				$scope.info=json.data;
				
				if($scope.info.coach.intro)	
					$('.lod-dtl-coach-lcd').html($scope.info.coach.intro)
					
				if($scope.info.course)	
					$('.course-ide-cont').html($scope.info.course.intro)
					
/*				$scope.info.coach.speciality=$scope.info.coach.speciality.split(',');*/
				$scope.info.coach.speciality.pop();
				$ionicSlideBoxDelegate.update()

				$timeout(function(){
					angular.element('.bar-mv').css('width',$scope.info.user_count/$scope.info.max_count*100+'%')
				},600)
				
			}
			
		})
		
	}

	//约课
	$scope.save=function(){
		
		if(!window.member){
			
			var a=$ionicPopup.confirm({
						
				title			:	'尊敬的用户',
				template		: 	'您还未注册账号呢',
				cancelText		:	'再看看',
				okText			:	'立即注册',
				cssClass		:	'tc'
				
			});
			
			a.then(function(res) {
				
			    if(res) {
			       
			       $location.path('reg')
			       
			    } 
			})
			
		}else{
			$ionicLoading.show();
			ajaxService.ajax('make',{

				plan_id			:	$stateParams.planId
				
			},function(json){				
				if(json.code==200){
					
					$popup.alert('尊敬的用户','','预约成功');
					$location.path('users/appt/0')
					
				}else{
					
					if(json.code==10019){
						
						$scope.go('您还未购买会员卡呢',1,null)

					}else if(json.code==0 && json.message.substr(0,7)=='你的累计旷课已达'){

                        nullCourse(json.message)

                    }else if(json.code==10010){

                        $scope.go('您还未购买，或是课程已过期了呢',2,null)

                    }else if(json.code==10017 && json.message.substr(0,5)=='课程已用完'){

						$scope.go('您的课程已用完，是否立即续课？',2,null)
						
					}else if(json.code==2){
						
						$scope.go('您没有该类有效课程，是否用更高级的'+json.course_name+'（剩余'+json.num+'节）预约？',3,json)
						
					}else{
						
						$popup.alert('尊敬的用户','',json.message);
						
					}
					
				}
				
				$ionicLoading.hide();
				
			})
			
		}

	}


	//确认弹窗
	$scope.go=function(txt,type,data){
		
		if(type==1 || type ==2){
			
			var a=$ionicPopup.confirm({		
				title			:	'尊敬的用户',
				template		: 	txt,
				cancelText		:	'不用了',
				okText			:	'立即购买',
				cssClass		:	'tc'
			});
			
			a.then(function(res) {
			    
			    if(res) {
			       
			       if(type==1){
			       		$location.path('users/card-list')
			       }else{
			       		infoService.setForm('coachItem',$scope.info.course);
						$location.path('users/coach-pay/'+$stateParams.id)
			       }
	
			    }
			    
			})
			
		}else{
			
			var a=$ionicPopup.confirm({		
				title			:	'尊敬的用户',
				template		: 	txt,
				cancelText		:	'再想想',
				okText			:	'我确定',
				cssClass		:	'tc'
			});
			
			a.then(function(res) {

			    if(res) {
			       ajaxService.ajax('seniorMake',{
			
						data		:	data
						
					},function(json){
						
						if(json.code==200){
							
							$popup.alert('尊敬的用户','','预约成功');
							$location.path('users/appt/0')
							
						}else{
						
							$popup.alert('尊敬的用户','',json.message);
						
						}
						
					})
	
			    }
			    
			})
		}
			
		
	}

	//旷课上限
	function nullCourse(txt){

        var a=$ionicPopup.confirm({

            title			:	'尊敬的用户',
            template		: 	txt,
            cancelText		:	'不用了',
            okText			:	'立即前往',
            cssClass		:	'tc'
        });

        a.then(function(res) {
            if(res) {

                $location.path('users/appt/1')

            }
        });

	}


	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//我的会员卡
app.controller("myCardCtrl", ["$scope","$ionicLoading","ajaxService","$stateParams","$ionicPopup","$popup","$location",
				   function ($scope,$ionicLoading,ajaxService,$stateParams,$ionicPopup,$popup,$location) {

	$scope.memberList	=	[];
	
	//$scope.master=false;
	
	//加载
	$scope.load=function(){
			
		ajaxService.ajax('userGetcardinfo',{
			
			sold_card_id		:	$stateParams.id
			
		},function(json){
			
			if(json.code==200){
				
				$scope.cardInfo=json.data;
				
				//有效期
				$scope.cardInfo.create_time=$scope.getYear($scope.cardInfo.start_time);
				$scope.cardInfo.expire_time=$scope.getYear($scope.cardInfo.expire_time);

				//描述
				$('#description').html($scope.cardInfo.description);

			}
			
		})
			
	}
	
	//添加
	$scope.getIpt=function(){
		
		//计算
		if(($scope.cardInfo.other_users.length+1+angular.element('.setipt').length)<$scope.cardInfo.max_use){
			
			//累计添加
			$scope.memberList.push(1);
		
			angular.element('.add-ipt').after(
				'<div><input class="setipt" type="tel" maxlength="11" /></div>'
			)
			
		}else{
			
			if($scope.cardInfo.addMbr_status == 0){
				var a=$ionicPopup.confirm({

		            title			:	'尊敬的用户',
		            template		: 	'您的会员卡家庭成员已达到上限，是否增加人数？（增加一名按购买会员卡金额的20%收取）',
		            cancelText		:	'不用了',
		            okText			:	'立即前往',
		            cssClass		:	'tc'
		        });
		
		        a.then(function(res) {
		            if(res) {
		
		                $scope.createOrder()
		
		            }
		        });
			}else{
				$popup.alert('尊敬的用户','','您的成员添加已达到上限。');
			}

		}

	}
	
	
	//下单
	$scope.createOrder=function(){
		
		ajaxService.ajax('createorder',{
			
			type			:	6,	//1会员卡、2小团课、3私教课、4储值、5取消旷课、6成员添加
			product_num		:	1,
			product_id		:	$scope.cardInfo.sold_card_id,
			shop_id			:	window.shop.id
			
		},function(json){
			
			if(json.code==200){

				window.location.href=window.base_url+'/pay.html?order_id='+json.data.order_id
				
			}
			
		})
		
	}
	
	var phones="";
	$scope.member=function(){
		
		phones="";
			
		for(var i=0;i<angular.element('.setipt').length;i++){
			
			if(angular.element('.setipt:eq('+i+')').val()==''){
				$popup.alert('尊敬的用户',null,'您还有手机号未填写！');
				return;
			}
				
			phones+=(angular.element('.setipt:eq('+i+')').val()+',')
			
		}
		
		phones=phones.substring(0,phones.length-1); 
		var confirmPopup = $ionicPopup.confirm({
		     title: '请注意',
		     template: '一旦保存成功，成员将不可更改。请您仔细核对，确认无误后保存',
		     cancelText: '取消', 
			 okText: '我确认', 				 
		});
		 
		confirmPopup.then(function(res) {
			
		    if(res) {
			
				$scope.set()
		       
		    }
		    
		});
			
	}
	
	
	//设置子成员
	$scope.set=function(){
			
		ajaxService.ajax('bindCardUser',{
			
			sold_card_id		:	$stateParams.id,
			phone				:	phones	
			
		},function(json){
			
			if(json.code==200){
				
				$popup.alert('恭喜你','','设置成功！');
				location.reload();
				
			}else{
				
				$popup.alert('不好意思','',json.message)
				
			}
			
		})
			
	}
	
	//只要年份
	$scope.getYear=function(item){

		return item=item.substr(0,10)
		
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//场馆列表
app.controller("clubListCtrl", ["$scope","$location",
				   function ($scope,$location) {

	//放起好耍
	$scope.load=function(){}
	
	$scope.go=function(id){
		$location.path('users/club-dtl/'+id)
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){

	});

	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//场馆详情
app.controller("clubDtlCtrl", ["$scope","$ionicLoading","ajaxService","$location","$stateParams","$ionicSlideBoxDelegate","$filter","formatDate",
				   function ($scope,$ionicLoading,ajaxService,$location,$stateParams,$ionicSlideBoxDelegate,$filter,formatDate) {
	
	$scope.courseList=[];
	$scope.nowCourseList=[];

	//日期选择
	$scope.clickDateMenu=function(time,ix){
		
		v=$('.date-menu-li:eq('+ix+')').offset().left;
		
		$scope.nowMap=$('.date-menu-li:eq('+ix+')').text();
		
		//$scope.nowDay=$filter('zeroFill')(formatDate.get(new Date(time)).d);
		$scope.nowDay=$('.date-menu-li:eq('+ix+')').attr('nowDay');

		if(ix==0)
			angular.element('.date-menu-active').css('left','1.2rem')
		else
			angular.element('.date-menu-active').css('left',v+'px')
		
		if($scope.info)
			$scope.nowCourseList=$scope.courseList[time]
		
	}
	
	
	//获取当天时间
	$scope.nowTime=function(){
		var time=new Date();
		return time.getFullYear()+'-'+$filter('zeroFill')(time.getMonth()+1)+'-'+$filter('zeroFill')(time.getDate())
	}
	
	$scope.getYear=function(item){
		
		return item=item.substr(0,10)
		
	}
	
	$scope.getTime=function(item){
		
		return item=item.substr(item.indexOf(' '))
		
	}
	
	$scope.go=function(id){
		$location.path('users/groupCourse-dtl/'+id)
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		
		//场馆详情加载
		$scope.load=function(){
	
			ajaxService.ajax('shopDetail',{
				
				shop_id		:	$stateParams.id
				
			},function(json){
				
				if(json.code==200){
					
					$scope.info=json.data;
					$ionicSlideBoxDelegate.update();
					$scope.courseList=$scope.info.plan;
					$scope.nowCourseList=$scope.courseList[$scope.nowTime()]
					
				}
				
			})
			
		}
		$scope.load()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//优惠劵
app.controller("myCouponCtrl", ["$scope","$ionicLoading","ajaxService","$ionicPopup","$popup","$ionicScrollDelegate","$ionicSlideBoxDelegate",
				   function ($scope,$ionicLoading,ajaxService,$ionicPopup,$popup,$ionicScrollDelegate,$ionicSlideBoxDelegate) {

	$scope.give={
		
		phone	:	'',
		show	:	false
	}
	
	//优惠劵加载
	$scope.load=function(){

		ajaxService.ajax('getCoupon',{},function(json){
			
			if(json.code==200){
				
				$scope.info=json.data;
				$scope.coupon=$scope.info[0];
				$ionicSlideBoxDelegate.update();
				
				
			}
			
		})
		
	}
	
	
	
	//获取值
	$scope.getId=function(ix){
		$scope.coupon=$scope.info[ix]
	}
	
	//赠送
	$scope.save=function(){
		
		var a=$ionicPopup.confirm({
						
			title			:	'尊敬的用户',
			subTitle		:	'优惠券',
			template		: 	'请确认手机号输入无误，赠送后对方将立即收到',
			cancelText		:	'再想想',
			cancelType		:	'button-default',
			okText			:	'立即赠送',
			okType			:	'button-positive',
			cssClass		:	'tc'
			
		});
		
		a.then(function(res) {

		    if(res) {
		       
		       ajaxService.ajax('giveCoupon',{
			
				coupon_user_id		:	$scope.coupon.coupon_user_id,
				phone				:	$scope.give.phone
			
				},function(json){
					
					if(json.code==200){
						$popup.alert('尊敬的用户',null,'赠送成功！');
						$scope.load();
						$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
					}else{
						$popup.alert('尊敬的用户',null,json.message)
						
					}
					
				})
		       
		    } 
		})

	}
	
			
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		$ionicLoading.hide()
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);


//招募
app.controller("coachRecruitCtrl", ["$scope","$ionicLoading","ajaxService",
				   function ($scope,$ionicLoading,ajaxService) {
	
	
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		$ionicLoading.show(HX_CONFIG.loadingBase);
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//私教招募信息填写
app.controller("coachRecruitSubCtrl", ["$scope","$ionicLoading","ajaxService","$popup","$filter","$timeout","$location",
				   function ($scope,$ionicLoading,ajaxService,$popup,$filter,$timeout,$location) {
	
	$scope.coach={
		
		id_card		:	'',
		type		:	1,
		speciality	:	'',
		intro		:	'',
		seniority	:	'',
		birthday	:	'',
		address		:	'',
		channel		:	'倾城运动公众号/官网',
		certs		:	{
			
			str		:	[],
			bases	:	[]
			
		},
		sex			:	1,
		
	}

	//初始化
	$scope.list={

		sex		:	[
				{
					name	:	'男士',
					val		:	1
				},
				{
					name	:	'女士',
					val		:	2
				}
		],
		type	:	[
				{
					name	:	'全职',
					val		:	1
				},
				{
					name	:	'兼职',
					val		:	2
				}
		],
		years	:	loopNb(1,30),
		
	};
	
	//循环体
	function loopNb(f,v){
		
		$scope.sum=[];
		for(var i=0;i<v;i++){
			$scope.sum.push(f+i)
		}
		
		return $scope.sum
	}

	//删除
	$scope.del=function(ix){
		$scope.coach.certs.str.splice(ix,1);
		$scope.coach.certs.bases.splice(ix,1)
	}
	
	//弹窗
	$scope.makeCk=function(){
		$('.make-mode').css('bottom','0');
		$('.make-bg').show();
	}
	
	//关闭擅长弹窗
	$scope.cancel=function(){
		$scope.getSpy();
		
		$timeout(function(){
			$('.make-bg').hide()			
		},500);
		
		$('.make-mode').css('bottom',-($('.make-mode').height()+50)+'px')
	}

	//获取擅长
	$scope.getSpy=function(){
		$scope.coach.speciality='';
		for(var i=0;i<angular.element('.spy-ipt').length;i++){
			if(angular.element('.spy-ipt:eq('+i+')').prop('checked'))
				$scope.coach.speciality+=angular.element('.spy-ipt:eq('+i+')').parent().attr('title')+','
		}
		
		$scope.coach.speciality=$scope.coach.speciality.substr(0,$scope.coach.speciality.lastIndexOf(','))
	}
	
	
	//提交
	$scope.save=function(){
		
		if($scope.coach.id_card=='' || ($scope.coach.id_card.length!=15 && $scope.coach.id_card.length!=18)){
			$popup.alert('尊敬的申请人',null,'请正确填写身份证！');
			return
		}
		
		if($scope.coach.address==''){
			$popup.alert('尊敬的申请人',null,'联系地址未填写！');
			return
		}
		
		if($scope.coach.birthday==''){
			$popup.alert('尊敬的申请人',null,'出生日期未填写！');
			return
		}
		
		if($scope.coach.speciality==''){
			$popup.alert('尊敬的申请人',null,'至少得填写一种擅长！');
			return
		}
		
		if($scope.coach.seniority==''){
			$popup.alert('尊敬的申请人',null,'从业年限未填写！');
			return
		}
		
		if($scope.coach.certs.str.length==0){
			$popup.alert('尊敬的申请人',null,'至少得上传一张专业证书！');
			return
		}
		
		if($scope.coach.intro==''){
			$popup.alert('尊敬的申请人',null,'自我介绍未填写！');
			return
		}
		
		$ionicLoading.show();
		
		ajaxService.ajax('coachApply' , {

				id_card 	:	$scope.coach.id_card,
				type 		:	$scope.coach.type,
				speciality	:	$scope.coach.speciality,
				intro 		:	$scope.coach.intro,
				seniority 	:	$scope.coach.seniority,
				birthday 	:	$scope.coach.birthday,
				address 	:	$scope.coach.address,
				channel 	:	$scope.coach.channel,
				certs 		:	$scope.coach.certs.str,
				sex			:	$scope.coach.sex
    		
    	} , function(json){
			
			$ionicLoading.hide();
			
    		if(json.code==200){
    			$popup.alert('尊敬的申请人',null,'恭喜您！提交成功，我们会在几个工作日后跟您联系，请保持电话畅通。');
    			$location.path('users')
    		}else{
    			$popup.alert('尊敬的申请人',null,json.message)
    		}
    			

		})
		
	}




	//上传图片
	var gmMain = $(".photo-up");
    gmMain.DM({
            beforeFun: function () {
                $ionicLoading.show(HX_CONFIG.loadingBase);
            },
            completeFun: function (result) {
            	ajaxService.ajax('uploadByString' , {
            		
            		filename	:	result.file.name,
            		data		:	result.clearBase64
            		
            	} , function(json){
	    		
		    		if(json.code==200){
		    			
		    			$ionicLoading.hide();
		    			$scope.coach.certs.str.push(json.data);
		    			$scope.coach.certs.bases.push(result.base64);
		    			
		    		}
	    		
	    		})

            },errorFun: function (file) {
            	$popup.alert('尊敬的申请人',null,'无法上传照片，请稍后再试！');
            }
    });
	
	//加载图片
	$scope.loadImg=function(){
		
		$ionicLoading.show(HX_CONFIG.loadingBase);
		
		setTimeout(function(){
			
			$ionicLoading.hide()
			
		},2000)
		
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


//加盟
app.controller("joinCtrl", ["$scope","$ionicLoading","ajaxService",
				   function ($scope,$ionicLoading,ajaxService) {
	
	
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		$ionicLoading.show(HX_CONFIG.loadingBase);
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);

//签到记录
app.controller("signRecordCtrl", ["$scope","$ionicLoading","ajaxService","$compile","$stateParams",
				   		function ($scope,$ionicLoading,ajaxService,$compile,$stateParams) {
	
	$scope.giveList=[];
	
	$scope.userId = $stateParams.userId;
	$scope.cardId = $stateParams.cardId;
	
	var calUtil = {
	
	    //时间过滤
	    zeroFill:function(num){
	        now = parseInt(num, 10);
	        if (now < 10) now = "0" + now;
	        return now;
	    },
	    //当前日历显示的年份
	    showYear:new Date().getFullYear(),
	    //当前日历显示的月份
	    showMonth:new Date().getMonth()+1,
	    //当前日历显示的天数
	    showDays:1,
	    //默认加载方式
	    eventName:"load",
	    //获取数据
	    getData:function(data){
	    	var signList=new Array();//新建一个数组
            for(var i=0;i<data.length;i++){
                var month=data[i].sign_time.substring(5,7);
                if(month==calUtil.zeroFill(calUtil.showMonth)){
                    var signDay=data[i].sign_time.substring(8,10);
                    signList.push({signDay});
                }
            }

	        calUtil.draw(signList);
	    },
	    //初始化日历
	    init:function(){
			$scope.load()
	    },
	    draw:function(signList){
	        //绑定日历
	        var str = calUtil.drawCal(calUtil.showYear,calUtil.showMonth,signList);
	        
	        $("#signLayer").html(str);
	        $('#signLayer').replaceWith($compile($("#signLayer")[0].outerHTML)($scope));
	        
	        //绑定日历表头
	        var calendarName=calUtil.showYear+"年"+calUtil.showMonth+"月";
	        $(".month-span").html(calendarName);
	    },
	    bindPrev:function(){
	    	calUtil.eventName="prev";
	    	calUtil.setMonthAndDay()
	    },
	    bindNext:function(){
	    	calUtil.eventName="next";
	    	calUtil.setMonthAndDay()
	    },
	    //获取当前选择的年月
	    setMonthAndDay:function(){
	    	
	        switch(calUtil.eventName){
	        	
		        case "load":
		            var current = new Date();
		            calUtil.showYear=current.getFullYear();
		            calUtil.showMonth=current.getMonth() + 1;
		            break;
		            
		        case "prev":
		            calUtil.showMonth=parseInt(calUtil.showMonth)-1;
		            if(calUtil.showMonth==0)
		            {
		                calUtil.showMonth=12;
		                calUtil.showYear-=1;
		            }
		            break;
		            
		        case "next":
		            calUtil.showMonth=parseInt(calUtil.showMonth)+1;
		            if(calUtil.showMonth==13)
		            {
		                calUtil.showMonth=1;
		                calUtil.showYear+=1;
		            }
		            break;
		        
	        }
	        
	        $scope.load()
	        
	    },
	    getDaysInmonth : function(iMonth, iYear){
	       var dPrevDate = new Date(iYear, iMonth, 0);
	       return dPrevDate.getDate();
	    },
	    bulidCal : function(iYear, iMonth) {
	       var aMonth = new Array();
	       aMonth[0] = new Array(7);
	       aMonth[1] = new Array(7);
	       aMonth[2] = new Array(7);
	       aMonth[3] = new Array(7);
	       aMonth[4] = new Array(7);
	       aMonth[5] = new Array(7);
	       aMonth[6] = new Array(7);
	       var dCalDate = new Date(iYear, iMonth - 1, 1);
	       var iDayOfFirst = dCalDate.getDay();
	       var iDaysInMonth = calUtil.getDaysInmonth(iMonth, iYear);
	       var iVarDate = 1;
	       var d, w;
	       aMonth[0][0] = "日";
	       aMonth[0][1] = "一";
	       aMonth[0][2] = "二";
	       aMonth[0][3] = "三";
	       aMonth[0][4] = "四";
	       aMonth[0][5] = "五";
	       aMonth[0][6] = "六";
	       for (d = iDayOfFirst; d < 7; d++) {
	            aMonth[1][d] = iVarDate;
	            iVarDate++;
	       }
	        for (w = 2; w < 7; w++) {
	            for (d = 0; d < 7; d++) {
	                if (iVarDate <= iDaysInMonth) {
	                    aMonth[w][d] = iVarDate;
	                    iVarDate++;
	                }
	            }
	    }
	    return aMonth;
	    },
	    ifHasSigned : function(signList,day){
	        var signed = false;
	        $.each(signList,function(index,item){
	            if(item.signDay == day) {
	                signed = true;
	                return false;
	            }
	        });
	        return signed ;
	    },
	    drawCal : function(iYear, iMonth ,signList) {
	        var myMonth = calUtil.bulidCal(iYear, iMonth);
	        var htmls = new Array();
	        htmls.push("<div class='sign'>");
	        htmls.push("<div class='sign-tit'>");
	        htmls.push("<div>" + myMonth[0][0] + "</div>");
	        htmls.push("<div>" + myMonth[0][1] + "</div>");
	        htmls.push("<div>" + myMonth[0][2] + "</div>");
	        htmls.push("<div>" + myMonth[0][3] + "</div>");
	        htmls.push("<div>" + myMonth[0][4] + "</div>");
	        htmls.push("<div>" + myMonth[0][5] + "</div>");
	        htmls.push("<div>" + myMonth[0][6] + "</div>");
	        htmls.push("</div>");
	        var d, w;
	        for (w = 1; w < 7; w++) {
	            htmls.push("<div class='sign-li'>");
	            for (d = 0; d < 7; d++) {
	                var ifHasSigned = calUtil.ifHasSigned(signList,myMonth[w][d]);
	                if(ifHasSigned){
	                	htmls.push("<div><span class='on' tit='"+myMonth[w][d]+"' ng-click='toDay("+myMonth[w][d]+")'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</span></div>");
	                }else {
	                    htmls.push("<div>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div>");
	                }
	            }
	            htmls.push("</div>");
	        }
	        htmls.push("</div>");
	        return htmls.join('');
	    }
	    
	};
	
	//上个月
	$scope.prev=function(){
		calUtil.bindPrev()
	}
	
	//下个月
	$scope.next=function(){
		calUtil.bindNext()
	}
	
	//今日锻炼
	$scope.toDay=function(ix){
		
		$('.sign-li .on').css('background','none');
		$('.sign-li .on[tit='+ix+']').css('background-color','#f28019');
		
		$scope.giveList=[];
		
		for(var i=0;i<$scope.list.length;i++){
			
			if($scope.list[i].sign_time.substr(8,2)==calUtil.zeroFill(ix)){
				
				$scope.giveList.push({
					
					startTime	:	$scope.list[i].sign_time.substr(11),
					endTime		:	$scope.list[i].out_time.substr(11)=='00:00:00'?'未签离场':$scope.list[i].out_time.substr(11)
					
				})
				
			}
			
		}

	}
	
	$scope.load=function(){
		
		$ionicLoading.show();
		
		ajaxService.ajax('signRecord',{
					
			page_no			:	1,
			page_size		:	3100,
			start_time		:	calUtil.showYear+'-'+calUtil.zeroFill(calUtil.showMonth)+'-'+'01',
			end_time		:	calUtil.showYear+'-'+calUtil.zeroFill(calUtil.showMonth)+'-'+'31',
			shop_id			:	window.shop.id,
			user_id			:	$scope.userId,
			sold_card_id	:	$scope.cardId
			
		},function(json){
	
			if(json.code==200){
				
				$scope.list=json.data.list;
		       	calUtil.getData(json.data.list);
		       	$scope.giveList=[];
				$ionicLoading.hide();
				
				angular.element('.record-num .record-day').text(angular.element('.on').length)
				angular.element('.record-num .record-time').text($scope.list.length);
			}
			
		})
		
	}

	//初始化
	calUtil.init();


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

app.controller("memberCardCtrl", ["$scope","$ionicLoading","ajaxService","$stateParams",
				   function ($scope,$ionicLoading,ajaxService,$stateParams) {
	
	//会员卡成员加载
	$scope.load=function(){

		ajaxService.ajax('memberCard',{
			
			sold_card_id	:	$stateParams.id
			
		},function(json){
			
			if(json.code==200){
				
				$scope.list=json.data;
				
			}
			
		})
		
	}
	
	//页面刚加载			   
	$scope.$on('$ionicView.beforeEnter',function(){
		//$ionicLoading.show(HX_CONFIG.loadingBase);
		$scope.load()
	});
	
	//页面加载完成
	$scope.$on('$ionicView.afterEnter',function(){
		//$ionicLoading.hide();
	});
	
	//页面离开之前
	$scope.$on('$ionicView.beforeLeave',function(){
		
	});
	
}]);


app.controller("userHomeCtrl", ["$scope","$ionicLoading","ajaxService","$ionicScrollDelegate","$timeout","$ionicActionSheet","$popup","$ionicPopup","$location","$stateParams",
				  function ($scope,$ionicLoading,ajaxService,$ionicScrollDelegate,$timeout,$ionicActionSheet,$popup,$ionicPopup,$location,$stateParams) {



}]);
