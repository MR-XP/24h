'use strict';

app.controller('statisticaFeedbackController', ['$scope', '$http', '$state','$location','$filter','$stateParams','infoService','formatDate',
									function($scope, $http, $state,$location,$filter,$stateParams,infoService,formatDate) {

    $("#dtBox").DateTimePicker({

        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"

    });

    $scope.txt='反馈统计';
    $scope.go=function(){
    	$location.path('app/index');
    };

    //加载会员反馈
    $scope.parmList={

    	/*mch_id        :     '',*/
        start_time    :     '',           // 反馈开始时间
        end_time      :     '',           // 反馈结束时间
        page_no       :     1,            //当前页
        page_size     :     12,           //每页显示条数

	}

	//分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.load();
    }
	//加载
	$scope.load=function(){

       	if($scope.parmList.start_time==''){
            delete $scope.parmList.start_time;
       	}
       	if($scope.parmList.end_time==''){
            delete $scope.parmList.end_time;
       	}
		$http({
	        method: 'POST',
	        url:window.base_url+'/manager/merchant/showfeedback',
	        data: {

	        	/*mch_id        :     $scope.parmList.mch_id,*/
                start_time    :     $scope.parmList.start_time,
                end_time      :     $scope.parmList.end_time,
                page_no       :     $scope.parmList.page_no,
                page_size     :     $scope.parmList.page_size,
	        }
	        }).success(function(data){

	            if(data.code==200){
	                  $scope.feedBackList=data.data;
	            }else{
	                  layer.msg(data.message, {icon: 2});
	            }

	        }).error( function(data){
	            layer.msg('服务器访问失败！', {icon: 2});
	        });
		}

		$scope.load();

		//加载回复
		$scope.info = {
			content      :    '',      // 富文本框内容
			to_id        :    '',      // 会员的user_id
			feed_id      :    '',     //会员反馈列表id
		}
		$scope.goReply = function(item){
			$scope.info.to_id = item.user_id;
			$scope.info.feed_id = item.feed_id;
		}
		$scope.saveReply = function(){
			$scope.info.content = $('.summernote').summernote('code');
			$http({
					method: 'POST',
					url:window.base_url+'/manager/reply/index',
					data: {
						to_id     :  $scope.info.to_id,
						content   :  $scope.info.content,
						feed_id   :  $scope.info.feed_id,
					}
			}).success(function(data){

					if(data.code==200){
							$scope.replyContent=data.data;
							layer.msg($scope.replyContent, {icon: 1});
							setTimeout(
								function(){
									$('#myModal').modal('hide');
								}
							,500);
							setTimeout(
								function(){
									$('.summernote').summernote('code', '<p><br></p>');
								}
							,600);

							$scope.load();

					}else{
								layer.msg(data.message, {icon: 2});
					}

			}).error( function(data){
					layer.msg('服务器访问失败！', {icon: 2});
			});
		}
		$scope.cancelReply = function(){
			$('.summernote').summernote('code', '<p><br></p>');
		}

		$scope.checkReply = function(item){
			$scope.replyContent={
				details  :   [],
				time     :   [],
				operator :   [],
			}
			$scope.replyList = item.replyList;
			for(var i=0;i<$scope.replyList.length;i++){
				String.prototype.stripHTML = function() {
			    var reTag = /<(?:.|\s)*?>/g;
			    return this.replace(reTag," ");
			  }
				$scope.replyList[i].content = $scope.replyList[i].content.stripHTML();
			}
		}

}]);
