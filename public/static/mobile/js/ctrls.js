var app = angular.module('App.ctrls', []);

app.controller("regCtrl", ["$scope", "$ionicLoading", "$timeout", "$ionicPopup","$location",
				  function($scope, $ionicLoading, $timeout, $ionicPopup,$location) {


		//页面刚加载			   
		$scope.$on('$ionicView.beforeEnter', function() {
	
		});

		//页面加载完成
		$scope.$on('$ionicView.afterEnter', function() {
			$ionicLoading.hide();

			if(window.member){
				
				var a=$ionicPopup.alert({
	       	  title    : '尊敬的用户', 
	       	  subTitle : null,
	       	  template : '您已经注册过，即将跳转个人中心...',
	       	  cssClass : 'tc',
	       	  okText   : '确定', 
	       	  okType   : '',
        });

				$timeout(function(){
					$location.path('users/index');
					a.close()
				},500)
				
			}
			
		});

		//页面离开之前
		$scope.$on('$ionicView.beforeLeave', function() {

		});

	}
]);

app.controller("regDataCtrl", ["$scope", "$ionicLoading", "ajaxService", "$timeout", "$ionicPopup","$location","$popup",
				  function($scope, $ionicLoading, ajaxService, $timeout, $ionicPopup,$location,$popup) {
		
		//you know
		$scope.user = {

			name			: 	'',
			phone			:		'',
			code			: 	'',
			salemanId	:		''
		
		}

		//点击短信验证码
		var countdown = 60;
		$scope.ck = function() {

			if($scope.user.phone && $scope.user.phone.length == 11) {

				$scope.settime()

			} else {

				$popup.alert('尊敬的用户', null, '请正确填写手机号')

			}

		}

		//倒计时
		$scope.settime = function() {

			//倒计时
			if(countdown == 0) {
				$('.ipt-code').prop("disabled", false);
				$('.ipt-code').val('发送手机验证码');
				countdown = 60;
				return;
			} else {

				//请求短信
				if(countdown == 60)
					$scope.getCode()

				$('.ipt-code').prop("disabled", true);
				$('.ipt-code').val('重新发送(' + countdown + ')')
				countdown--;

			}

			$timeout(function() {
				$scope.settime()
			}, 1000)

		}

		//获取验证码
		$scope.getCode = function() {

			ajaxService.ajax('sendcode', {
				
				phone	:	$scope.user.phone
			
			}, function(json) {

				if(json.code == 200) {

					//$popup.alert('尊敬的用户', null, '发送成功');

				} else {

					$popup.alert('尊敬的用户', null, json.message);

					countdown = 0;
				}

			})

		}

		//提交
		$scope.save = function() {
			
			ajaxService.ajax('sign', {

				real_name			:		$scope.user.name,
				phone					:		$scope.user.phone,
				code					:		$scope.user.code,
				saleman_id		:		$scope.user.salemanId

			}, function(json) {

				if(json.code == 200) {

					//获得卡
					if(json.data.register){
						
						$('.bean-mode').show();
							$timeout(function(){
								$('.bean-div').css({'height':'100%','width':'100%'})
						},800)
							
					}else{
						
							var a=$ionicPopup.alert({
			       	  title    : '尊敬的用户', 
			       	  subTitle : null,
			       	  template : '注册成功！即将跳转...',
			       	  cssClass : 'tc',
			       	  okText   : '确定', 
			       	  okType   : '',
	        		});
	
							$timeout(function(){
								a.close();
								window.location.reload()								
							},500)
						
					}

				} else {
					$popup.alert('尊敬的用户', null, json.message);
				}

			})

		}

		//关闭卡弹窗
		$scope.close=function(){
			$('.bean-div').css({'height':'0','width':'0'})
			$timeout(function(){
				$('.bean-mode').hide();
				window.location.reload()
			},800)
		}
		
		//替换多余非汉字
		$scope.relEn=function(txt){
			
			$scope.user.name=txt.replace(/[^\u4E00-\u9FA5]/g,'');
			
		}
		
		//替换多余非数字
		$scope.relCn=function(txt){
			
			$scope.user.code=txt.replace(/\D/gi,'');
			
		}
		
		//销售人员加载
		$scope.loadSale=function(){
			
			ajaxService.ajax('salemanList', {}, function(json) {

				if(json.code == 200) {
					
						$scope.salemanList = json.data;
						
						var nullSaleman = {
									saleman_id	:	0,
									real_name		:	"选择您的推荐人（可以不填）"
						};
						
						$scope.salemanList.unshift(nullSaleman);
						$scope.user.salemanId = 0;
						
				} else {
					$popup.alert('尊敬的用户', null, json.message);
				}

			})
			
		}

		//页面刚加载			   
		$scope.$on('$ionicView.beforeEnter', function() {
			
			$ionicLoading.hide();
			$scope.loadSale();
			
			if(window.member)
				$location.path('users/index')				
			
		});

		//页面加载完成
		$scope.$on('$ionicView.afterEnter', function() {
    
    
		});

		//页面离开之前
		$scope.$on('$ionicView.beforeLeave', function() {

		});

	}
]);

