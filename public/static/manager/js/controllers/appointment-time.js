app.controller('appointmentController', ['$scope', '$state','$http','$location','$stateParams','infoService',
                            function($scope, $state,$http,$location,$stateParams,infoService) {

    $scope.txt='预约时间';

    $scope.go=function(item){

        if(item==0)
            $location.path('app/new-time/0')

        else{

            infoService.setForm('coachDtl',item);
            $location.path('app/new-time/1')

        }
    };

}]);

app.controller('timeController', ['$scope', '$state','$http','$location','$stateParams','infoService',
                            function($scope, $state,$http,$location,$stateParams,infoService) {

    $scope.txt='预约时间';

    $scope.go=function(item){

        if(item==0)
            $location.path('app/new-time/0')

        else{

            infoService.setForm('coachDtl',item);
            $location.path('app/new-time/1')

        }
    };

}]);
