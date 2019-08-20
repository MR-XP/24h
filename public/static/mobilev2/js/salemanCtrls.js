var app = angular.module('App', []);

app.controller("memberIndexCtrl", ["$scope", "$ionicLoading", "$timeout", "$ionicPopup","$location","ajaxService","$local","$session","$filter",
				  function($scope, $ionicLoading, $timeout, $ionicPopup,$location,ajaxService,$local,$session,$filter) {

		//返回个人中心
		$scope.go=function(){
			window.location.href=window.base_url;
		}

		//加载会籍信息
		$scope.memberLoad=function(){
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
					$scope.loadCode(window.shop.id);
				}
			})
		}

		//加载二维码
		$scope.loadCode=function(){

			ajaxService.ajax('memberCode',{

				shop_id  :	window.shop.id

			},function(json){

				if(json.code==200){
					$scope.dataCode=json.data;
				}
			})
		}
		//加载会籍名下的会员
		$scope.loadUser=function(){

			ajaxService.ajax('memberUser',{
				keyword  : ''
			},function(json){

				if(json.code==200){
					$scope.userList=json.data;
					$scope.userNum = $scope.userList.list.length;
				}
			})
		}

		//页面刚加载
		$scope.$on('$ionicView.beforeEnter', function() {
			//验证是否有账户
			if(!window.member)
				$location.path('reg')
			//加载用户信息
			$scope.memberLoad()
			$scope.loadUser()
		});

		//页面加载完成
		$scope.$on('$ionicView.afterEnter', function() {

			$ionicLoading.hide()

		});

		//页面离开之前
		$scope.$on('$ionicView.beforeLeave', function() {

		});

	}
]);

app.controller("userListCtrl", ["$scope", "$ionicLoading", "$timeout", "$ionicPopup","$location","ajaxService","$local","$session","$filter","infoService","$ionicScrollDelegate",
				  						 function($scope, $ionicLoading, $timeout, $ionicPopup,$location,ajaxService,$local,$session,$filter,infoService,$ionicScrollDelegate) {

		$scope.search = {

      keyword  :   '',
      
    };
		
		//默认加载注册会员
		$scope.active=0;
		
		$scope.toggleActive=function(v){
			
			$scope.active=v;
			$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
			$scope.search.keyword = "";
			$scope.loadUser();
			
			if(v==0)
				angular.element('.tab-nav-look').css({'left':'0','margin-left':'0'});
			else
				angular.element('.tab-nav-look').css({'left':'15%','margin-left':angular.element('.tab-nav-look').width()+2+'px'});
				
		};

		
		$scope.go = function(item){
			infoService.setForm('userItem' , item);
			$location.path('saleman/user-dtl');
		}

		//加载销售名下的会员
		$scope.loadUser=function(){
				ajaxService.ajax('salemanUser',{
					keyword  : $scope.search.keyword
				},function(json){
					if(json.code==200){
						$scope.user=json.data;
					}
				})
		}

		//页面刚加载
		$scope.$on('$ionicView.beforeEnter', function() {
			$scope.loadUser();
		});

		//页面加载完成
		$scope.$on('$ionicView.afterEnter', function() {

			$ionicLoading.hide()

		});

		//页面离开之前
		$scope.$on('$ionicView.beforeLeave', function() {

		});

	}
]);

app.controller("userDtlCtrl", ["$scope", "$ionicLoading", "$timeout", "$ionicPopup","$location","ajaxService","$local","$session","$filter","$stateParams","infoService",
				  function($scope, $ionicLoading, $timeout, $ionicPopup,$location,ajaxService,$local,$session,$filter,$stateParams,infoService) {


		$scope.info = infoService.getForm('userItem');

		if($scope.info=='' || $scope.info==undefined || $scope.info=='undefined'){
			$location.path('saleman/user-list');
		}

		//页面刚加载
		$scope.$on('$ionicView.beforeEnter', function() {
			// $scope.load()

		});

		//页面加载完成
		$scope.$on('$ionicView.afterEnter', function() {

			$ionicLoading.hide()

		});

		//页面离开之前
		$scope.$on('$ionicView.beforeLeave', function() {

		});

	}
]);