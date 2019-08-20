'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http','$location', function($scope, $http, $location) {

	//判断是否已登录过
  if(window.nodes.length>0){history.back()}
	
  $scope.data = {
  	
  		username		:	'',
  		password		:	'',
  		verify_code	:	''
  		
  };
  
  $scope.authError = false;

  $scope.base_url=window.base_url;

  $scope.login = function() {
  	    $http.post(window.base_url+'/manager/index/login', {
    	
    		username			: 	$scope.data.username,
    		password			: 	$scope.data.password,
    		verify_code		:	 	$scope.data.verify_code
    
    })
    .then(function(response) {

      if(response.data.code==200){

      		var a=location.href.substr(0,location.href.indexOf('#'));
      		window.location.href=a

      }else{
      	
        	$scope.authError = response.data.message
        	
      }
    }, function(x) {
      $scope.authError = '服务器访问失败';
    });
  };

}]);

