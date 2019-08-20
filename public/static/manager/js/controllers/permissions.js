'use strict';

app.controller('permissionsController', ['$scope', '$state','permissionsFactory','$location','infoService','$filter',
                             function($scope, $state,permissionsFactory,$location,infoService,$filter) {

    $scope.txt='权限管理';

    $scope.go=function(item){

        if(item==0){
        	$location.path('app/edit-permissions/0')
        }
        else{
            infoService.setForm('permissionsDtl',item);
            $location.path('app/edit-permissions/1')
        }
    };

	//加载权限列表
    permissionsFactory.get().then(function(data){

        $scope.newgroupList=data.data;

    },function(data){

    });

}]);


app.controller('editpermissionsController', ['$scope', '$state', 'permissionsFactory', '$http', '$location', '$stateParams', 'infoService',
                            function($scope, $state, permissionsFactory, $http, $location, $stateParams, infoService) {
	
	//加载
    $scope.load=function(){
		
		//获取所有节点
		$scope.sum=[];
			
		//节点加载
		permissionsFactory.get().then(function(data){
			
			for(var i=0;i<data.data.rule.length;i++){

	    		for(var j=0;j<data.data.rule[i].child.length;j++){

					$scope.sum.push(data.data.rule[i].child[j].id)

	    			for(var k=0;k<data.data.rule[i].child[j].child.length;k++){

	    				$scope.sum.push(data.data.rule[i].child[j].child[k].id)

	    			}
	    		}

    	    }

		    $scope.ruleList=data.data.rule

		})
		
		
		//场馆加载
		$http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {
					limit	:	0
                }
            }).success(function(data){

                if(data.code==200){
					
					for(var i=0;i<data.data.length;i++){

						$scope.sum.push(data.data[i].shop_id)
		
    	   			}

                    $scope.shopList=data.data;

                }else{
                    layer.msg(data.message, {icon: 2});
                }

            }).error( function(data){
                layer.msg('服务器访问失败', {icon: 2});
        })
		
		
		
    }

	//获取到传值
	if($stateParams.item!=0){

        if(infoService.getForm('permissionsDtl')){
        	$scope.info=infoService.getForm('permissionsDtl');

			var rules=[],
				shops=[];
				
		    for(var i=0;i<$scope.info.rules.length;i++){
		    	rules.push(parseInt($scope.info.rules[i]))
		    }
		    
		    for(var i=0;i<$scope.info.shops.length;i++){
		    	shops.push(parseInt($scope.info.shops[i]))
		    }

			//转换一遍数值
			$scope.info.rules=rules;
			
			$scope.info.shops=shops;

			$scope.load()
			
        }else{
			$location.path('app/permissions')
		}

    }else{

        $scope.info={

	        id          :       0,
	        title       :       '',                      //用户组名称
	        rules       :       [],                      //可操作的节点id
			shops		:		[]
			
    	}

        $scope.load()

    }


	
    //遍历权限
    $scope.ego=function(){

    	//一级权限
    	for(var i=0;i<$scope.ruleList.length;i++){

    		//二级权限
    		for(var j=0;j<$scope.ruleList[i].child.length;j++){

				if($.inArray($scope.ruleList[i].child[j].id,$scope.info.rules)!=-1){

    				$('.rule-ipt[value='+$scope.ruleList[i].child[j].id+']').prop('checked',true)

    			}

    			//三级权限
    			for(var k=0;k<$scope.ruleList[i].child[j].child.length;k++){

    				if($.inArray($scope.ruleList[i].child[j].child[k].id,$scope.info.rules)!=-1){
    					$('.rule-ipt[value='+$scope.ruleList[i].child[j].child[k].id+']').prop('checked',true)
    				}

    			}
    		}

    	}
    	
    	//关联场馆
    	for(var i=0;i<$scope.shopList.length;i++){

    		if($.inArray($scope.shopList[i].shop_id,$scope.info.shops)!=-1){
    			$('.shop-ipt[value='+$scope.shopList[i].shop_id+']').prop('checked',true)
    		}

    	}
    	
    }
	
	
	
	//保存权限节点遍历
	$scope.keepRule=function(){

		var sum=[];

		for(var i=0;i<$('.rule-ipt').length;i++){

			if($('.rule-ipt:eq('+i+')').prop('checked'))
				sum.push($('.rule-ipt:eq('+i+')').val())
		}

		return sum;
	}
	
	//保存场馆节点遍历
	$scope.keepShop=function(){

		var sum=[];

		for(var i=0;i<$('.shop-ipt').length;i++){

			if($('.shop-ipt:eq('+i+')').prop('checked'))
				sum.push($('.shop-ipt:eq('+i+')').val())
		}

		return sum;
	}

    //提交函数
    $scope.save = function () {

        $http({
            method: 'POST',
            url:window.base_url+'/manager/auth/groupsave',
            data: {
            	id		:	$scope.info.id,
            	title	:	$scope.info.title,
            	rules	:	$scope.keepRule(),
            	shops	:	$scope.keepShop()
            }
        }).success(function(data){

            if(data.code==200){

                layer.msg('保存成功！', {icon: 1});
                $location.path('app/permissions')

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});

        });
    };


}]);
