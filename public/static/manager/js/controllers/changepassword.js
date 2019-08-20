'use strict';

app.controller('changepasswordController', ['$scope', '$state','orderFactory','$filter','$http', function($scope, $state,orderFactory,$filter,$http) {
    $scope.txt='修改密码';

	$scope.info={

        old_password 			: 		'',	//旧密码
		password 				: 		'',	//新密码
		repassword 				: 		'',	//确认新密码
    }

    //提交函数
    $scope.save = function () {

        $http({
            method: 'POST',
            url:window.base_url+'/manager/auth/changepassword',
            data: {

            	old_password 			: 			$scope.info.old_password,
				password 				: 			$scope.info.password,
				repassword 				: 			$scope.info.repassword,

            }
        }).success(function(data){

            if(data.code==200){

                var a=location.href.substr(0,location.href.indexOf('#'));
      			window.location.href=a

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    };

}]);