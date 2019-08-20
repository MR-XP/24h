'use strict';
app.controller('memberController', ['$scope', '$state','$location','$filter','$http','$timeout','partitionFactory',
                     function($scope, $state,$location,$filter,$http,$timeout,partitionFactory) {

    $scope.f_name="";
    $scope.maxSize=5;
    $scope.txt='会员管理';
    $scope.memberID = '';
    $scope.mainUser = '';
    $("#dtBox").DateTimePicker({
        language:'zh-CN',
        defaultDate: new Date(),
        animationDuration:200,
        buttonsToDisplay: [ "SetButton", "ClearButton"],
        clearButtonContent: "取消"
    });
	
	//加载会员卡参数
    $scope.parmListCard={
        card_name    :    '',
        //group_id     :    '',   // 分区id(不传为空)
        limit        :     0,     //返回条数，0为所有
    }
    
    //加载会员参数
    $scope.parmListMember={
        username        :     '',     				//姓名
        phone           :     '',    				//电话
        //card_id       :     '',                 	//会员卡id
        page_no         :     1,    				//当前页
        page_size       :     16,                   //每页显示条数
		status			:	  1						//会员类型
    }
    
    // 加载分区列表
    $scope.groups = [];
    partitionFactory.get().then(function (data) {
        $scope.groups = data.data.group;
        $scope.groups.unshift({
        	group_id	:	'',
        	title		:	'所有分区'
        });
        $scope.parmListCard.group_id  = '';
        $scope.loadCardList();
    }, function (data) {});

    $scope.loadCardList=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/card/search',
            data: {
                card_name    :    $scope.parmListCard.card_name,
                group_id     :    $scope.parmListCard.group_id,
                limit        :    $scope.parmListCard.limit,
            }
        }).success(function(data){
            if(data.code==200){
               $scope.cardList=data.data;               
               $scope.cardList.unshift({
                	card_id		:	'',
                	card_name	:	'所有会员卡'
               });
               $scope.parmListMember.card_id = '';
               $scope.loadMemberList();
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败', {icon: 2});
        });
    }
    
    //再次加载
    $scope.againLoad=function(){
    	$scope.parmListMember.page_no 	= 1;
    	$scope.parmListMember.page_size = 16;
    }
    
    $scope.loadMemberList=function(){
        $('#loading').modal('show');
        
        if($scope.parmListMember.status == 3){
        	$('#groups').prop('disabled',true).css('opacity',.5);
        	$('#cards').prop('disabled',true).css({'opacity':.5});
        	$scope.parmListCard.group_id  = '';
        	$scope.parmListMember.card_id = '';
        }else{
        	$('#groups').prop('disabled',false).css('opacity',1);
        	$('#cards').prop('disabled',false).css({'opacity':1});
        }
        
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/getListTwo',
            data: {
                username        :           $scope.parmListMember.username,
                phone           :           $scope.parmListMember.phone,
                card_id         :           $scope.parmListMember.card_id,
                page_no         :           $scope.parmListMember.page_no,
                page_size       :           $scope.parmListMember.page_size,
                status			:			$scope.parmListMember.status,
                group_id		:			$scope.parmListCard.group_id
            }
        }).success(function(data){
            if(data.code==200){
                $scope.newMemberList=data.data;
                $('#loading').modal('hide');
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败', {icon: 2});
        });
    }
    
    //分页
    $scope.pagesMember=function(){
        $scope.loadMemberList();
    }
    $scope.search_N = function(){
        $scope.loadMemberList();
    }
    $scope.search_P = function(){
        $scope.loadMemberList();
    }

    $scope.getFamily = function(item){
        if(item.length == 0){
            return 0;
        }else{
            $scope.getFamilyList =[];
            $scope.getCardList =[];
            for(var j in item){
                $scope.getCardList.push(j);
            }
            for(var i=0;i<$scope.getCardList.length;i++){
                if(item[$scope.getCardList[i]].length>0){
                    $scope.getFamilyList.push(item[$scope.getCardList[i]])
                }
            }
            if($scope.getFamilyList.length == 0){
                return 0;
            }else{
                return 1;
            }
        }
    }
	
	//导出
	$scope.dwp=function(){
		
		$('#loading').modal('show');
		$http({
            method: 'POST',
            url:window.base_url+'/manager/user/exportUserData',
            data: {
                username        :           $scope.parmListMember.username,
                phone           :           $scope.parmListMember.phone,
                card_id         :           $scope.parmListMember.card_id,
                status			:			$scope.parmListMember.status,
                group_id		:			$scope.parmListCard.group_id,
                address			:			'getListTwo'
            }
        }).success(function(data){
            if(data.code==200){
            	window.location.href=window.base_url+'/manager/user/exportUser?name='+$scope.txt+'导出';
            	$('#loading').modal('hide');
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败', {icon: 2});
        });
		
	}
	
    //上传
    var html1='';
    var html2='';
	$scope.upload=function(){
		var fileObj=document.getElementById("file").files[0];
		if (typeof (fileObj) == "undefined" || fileObj.size <= 0) {
            layer.msg('您还未选择文件', {icon: 2});
            return;
       	}
		//注入form元素
        var formFile = new FormData();
        formFile.append("action", "UploadVMKImagePath");
        formFile.append("file", fileObj);

 		$.ajax({
            url				:	window.base_url+"/manager/user/importUser",
            type			:	"post",
            data			:	formFile,
            processData		:	false,
            contentType		:	false,
            success:function(data){
                if(data.code==200){
                    for(var i=0;i<data.data.success.length;i++){
                        html1+= '<div class="row" style="padding:4px 0;">'+
                                    '<div class="col-md-12 col-xs-12 no-padder text-center">'+
                                        data.data.success[i]+
                                    '</div>'+
                                '</div>';
                    }
                    for(var j=0;j<data.data.error.length;j++){
                        html2+= '<div class="row" style="padding:4px 0;">'+
                                    '<div class="col-md-12 col-xs-12 no-padder text-center">'+
                                        data.data.error[j]+
                                    '</div>'+
                                '</div>';
                    }
                    layer.open({
                        type: 1,
                        skin: 'layui-layer-demo', //样式类名
                        closeBtn: 1, //不显示关闭按钮
                        anim: 2,
                        area: ['740px', '450px'],
                        shadeClose: true, //开启遮罩关闭
                        content:'<div class="row" style="padding: 5px 20px;">'+
                                    '<div class="col-md-6 col-xs-6 no-padder">'+
                                        '<div class="col-md-12 col-xs-12 no-padder text-center" style="color:green;">'+
                                            '成功列表'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="col-md-6 col-xs-6 no-padder">'+
                                        '<div class="col-md-12 col-xs-12 no-padder text-center" style="color:red;">'+
                                            '失败列表'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="row" style="padding: 5px 20px;">'+
                                    '<div class="col-md-6 col-xs-6 no-padder" style="background-color:#d5dee6; border-right:1px solid #fff;">'+
                                        '<div class="col-md-12 col-xs-12 no-padder text-center">'+
                                            '姓名、电话、原因'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="col-md-6 col-xs-6 no-padder" style="background-color:#d5dee6;">'+
                                        '<div class="col-md-12 col-xs-12 no-padder text-center">'+
                                            '姓名、电话、原因'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="row" style="padding: 5px 20px;">'+
                                    '<div class="col-md-6 col-xs-6 no-padder text-center" style="border-right:1px solid #d5dee6;">'+
                                        html1+
                                    '</div>'+
                                    '<div class="col-md-6 col-xs-6 no-padder text-center" style="border-left:1px solid #d5dee6;">'+
                                        html2+
                                    '</div>'+
                                '</div>',
                    });
                }else{
                     layer.msg(data.message, {icon: 2});
                }
            },
            error:function(e){
                layer.msg('错误！！', {icon: 2});
            }
        })
	}
    //加载会员详情
    $scope.loadMemberDetails = function () {
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/info',
            data: {
                user_id             :   $scope.memberID,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.memberInfo=data.data;
                $('.userStatus:eq('+$scope.memberInfo.detail.status+')').prop('checked',true)
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    };
    //会员详情模态框
    $scope.memberD_open = function(item){
        $('#memberDetails').modal('show');
        $scope.memberID = item;
        $scope.loadMemberDetails();
        $scope.loadCoachCourse(2);
        $scope.loadCoachCourse(3);
        $scope.loadAppointment();
        $scope.loadRemarks();
        var new_date=new Date($scope.showYear,$scope.showMonth,0); 
        $scope.time_S = $scope.showYear+'-'+$scope.showMonth+'-'+'01'+' '+'00:00:00';
        $scope.time_E = $scope.showYear+'-'+$scope.showMonth+'-'+new_date.getDate()+' '+'23:59:59';
        window.memberID = item;
        //打开弹窗加载js文件
        jQuery.getScript("./static/manager/js/directives/qiandao.js", function() {});
    }
    $scope.memberD_close = function(num){
        $('#memberDetails').modal('hide');
        $("#userDetails input.choice_icon").eq(num).prop("checked",true);
    }
    //加载店铺
    $scope.loadShop=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {
                status  :    1,     //int 1 为正常,不传查所有
                limit   :    0,     //返回条数，0为所有
            }
        }).success(function(data){
            if(data.code==200){
                $scope.shopList=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    $scope.loadShop();
    //编辑类（激活会员卡）
    $scope.actCard={
        sold_card_id    :  '',
        shop_id         :  '',              // 场馆id
    }
    $scope.activateCard=function(item){
        $('#activateCard').modal('show');
        $scope.type=item.type;
        $scope.actCard.sold_card_id       =   item.sold_card_id;
        $scope.actCard.shop_id            =   item.shop_id;
    }
    $scope.activateCard_C = function(){
        $('#activateCard').modal('hide');
    }
    $scope.saveActivateCard=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/activeCard',
            data: {
                sold_card_id         :   $scope.actCard.sold_card_id,
                shop_id              :   $scope.actCard.shop_id,
            }
        }).success(function(data){
            if(data.code==200){
                layer.msg('激活成功！', {icon: 1});
                $('#activateCard').modal('hide');
                $scope.loadMemberDetails();
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    }

    //编辑按钮（会员卡有效期）
    $scope.rowDtl={
        sold_card_id    :   '',
        expire_time     :   '',              //过期时间 eg.2017-10-10
        use_times       :   '',              //已经使用的次数，次卡才传
        times           :   '',              //总次数
    }
    $scope.editCard=function(item){
        $('#editCard').modal('show');
        $scope.type=item.type;
        $scope.rowDtl.sold_card_id       =   item.sold_card_id;
        $scope.rowDtl.expire_time        =   item.expire_time;
        $scope.rowDtl.use_times          =   item.use_times;
        $scope.rowDtl.times              =   item.times;
    }
    $scope.editCard_C = function(){
        $('#editCard').modal('hide');
    }
    $scope.saveDtlCard=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/changeCardTime',
            data: {
                sold_card_id         :   $scope.rowDtl.sold_card_id,
                expire_time          :   $scope.rowDtl.expire_time,
                use_times            :   $scope.rowDtl.use_times,
                times                :   $scope.rowDtl.times,
            }
        }).success(function(data){
            if(data.code==200){
                layer.msg('修改成功！', {icon: 1});
                $('#editCard').modal('hide');
                $scope.loadMemberDetails();
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    }
    //加载会员购买的小团课和私教课
    $scope.loadCoachCourse=function(type){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/soldCourseList',
            data: {
                user_id         :   $scope.memberID,
                type            :   type,
                page_no         :   1,           //当前页
                page_size       :   10000,       //每页显示条数
            }
        }).success(function(data){
            $scope.load=data.code;
            if(data.code==200){
                if(type==2){//小团课
                    $scope.groupCourse=data.data;
                }
                if(type==3){//私教课
                    $scope.privateCourse=data.data;
                }
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    //编辑类（私教/小团课）
    $scope.rowPri={
        sold_course_id  :       '',
        expire_time     :       '',               //过期时间
        buy_num         :       '',               //购买节数
        use_num         :       '',               //使用节数
    }
    $scope.editCourse=function(item){
        $('#editCourse').modal('show');
        $scope.type=item.type;
        $scope.rowPri.sold_course_id     =   item.sold_course_id;
        $scope.rowPri.expire_time        =   item.expire_time;
        $scope.rowPri.buy_num            =   item.buy_num;
        $scope.rowPri.use_num            =   item.use_num;
    }
    $scope.editCourse_C=function(){
        $('#editCourse').modal('hide');
    }
    $scope.saveDtlCourse=function(type){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/manageSoldCourse',
            data: {

                sold_course_id     :   $scope.rowPri.sold_course_id,
                expire_time        :   $scope.rowPri.expire_time,
                buy_num            :   $scope.rowPri.buy_num,
                use_num            :   $scope.rowPri.use_num,
            }
        }).success(function(data){

            if(data.code==200){

                layer.msg('编辑成功！', {icon: 1});
                $('#editCourse').modal('hide');
                $scope.loadMemberDetails();
                $scope.loadCoachCourse(2);
                $scope.loadCoachCourse(3);

            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })

    }
    //加载预约列表
    $scope.appointmentsPage={
        page_no   :    1,       //当前页
        page_size :    3,       //每页显示条数
    }
    $scope.maxSize=5;
    $scope.pagesApp=function(){
        $scope.loadAppointment();
    }
    $scope.loadAppointment = function () {
        $http({
            method: 'POST',
            url:window.base_url+'/manager/appointment/getlist',
            data: {
                user_id         :   $scope.memberID,
                page_no         :   $scope.appointmentsPage.page_no,
                page_size       :   $scope.appointmentsPage.page_size,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.appointments=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    };
    $scope.getTimeE = function(timeE){
        $scope.newTimes     = new Date();//当前时间
        $scope.course_end   = new Date(timeE.replace(/-/gi,'/'));//课程结束时间
        if($scope.newTimes>=$scope.course_end){
            return 1;//课程结束
        }
        if($scope.newTimes<$scope.course_end){
            return 0;//课程还未结束
        }
    }
    //加载备注列表
    $scope.remarksPage={
        page_no   :    1,       //当前页
        page_size :    3,       //每页显示条数
    }
    $scope.maxSize=5;
    $scope.pagesRem=function(){
        $scope.loadRemarks();
    }
    $scope.loadRemarks = function () {
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/notelist',
            data: {
                user_id         :   $scope.memberID,
                page_no         :   $scope.remarksPage.page_no,
                page_size       :   $scope.remarksPage.page_size,
            }
        }).success(function(data){
            if(data.code==200){
                $scope.remarks=data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    };

    // 设置会员状态
    $scope.set = function (type) {
        $scope.memberInfo.detail.status=type;
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/changestatus',
            data: {
                user_id     :   $scope.memberID,
                status      :   $scope.memberInfo.detail.status
            }
        }).success(function(data){
            if(data.code==200){
                layer.msg('设置成功!',{icon:1})
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    //提交
    $scope.saveRemark = function () {

        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/notesave',
            data: {
                user_id             :   $scope.memberID,
                content             :   $scope.memberInfo.cont,
            }
        }).success(function(data){
            if(data.code==200){
               layer.msg('添加成功！',{icon:1});
               $scope.memberInfo.cont = '';
               $scope.loadRemarks();

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    };

    $scope.getSubUser = function(item){
        $scope.getAllkey =[];
        $scope.mainUser = item.real_name;
        $scope.getAll = item.subUser;
        for(var i in item.subUser){
            $scope.getAllkey.push(i);
        }
        $scope.memberShipList = $scope.getAll[$scope.getAllkey[0]];
        setTimeout(function() {
            $("#userDetails input.choice_icon").eq(0).prop("checked",true);
            $('#userDetails').modal('show');
        }, 500);
    }
    $scope.getSelected = function(item){
        $scope.memberShipList = $scope.getAll[item];
        for(var i=0;i<$("#userDetails input.choice_icon").length;i++){
            if($("#userDetails input.choice_icon").eq(i).is(':checked')){
                $scope.checkNum = i;
                return $scope.checkNum;
            }
        }
    }
    $scope.getSubUser_C = function(){
        $('#userDetails').modal('hide');
    }
    
    //子成员类
    $scope.member = {
    	sold_card_id	:	'',
    	phone			:	'',
    	user_id			:	''		//主卡人的user_id
    }
    
    //子成员列表模态框
    $scope.subMemberOpen = function(item){
        $('#subMembers').modal('show');
        $scope.memberList 			= [];
        $scope.member.sold_card_id 	= item.sold_card_id;
        $scope.member.user_id 		= item.user_id;
        $scope.loadMember();
    }
    $scope.subMemberClose = function(){
        $('#subMembers').modal('hide');
    }
    $scope.loadMember=function(){
    	$http({
            method: 'POST',
            url:window.base_url+'/manager/user/getSubMember',
            data: {
               sold_card_id		:	$scope.member.sold_card_id,
               user_id			:	$scope.member.user_id
            }
        }).success(function(data){
            if(data.code==200){
                $scope.memberList = data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败', {icon: 2});
        });
    }
    
    //子成员添加模态框
    $scope.memberAddOpen = function(item){
        $('#memberAdd').modal('show');
    }
    $scope.memberSave = function(){
    	$http({
            method: 'POST',
            url:window.base_url+'/manager/user/addMember',
            data: {
               phone			:	$scope.member.phone,
               sold_card_id		:	$scope.member.sold_card_id
            }
        }).success(function(data){
            if(data.code==200){
                layer.msg('添加成功！', {icon: 1});
                $('#memberAdd').modal('hide');
                $scope.loadMember();
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败', {icon: 2});
        });
    }
    $scope.memberAddClose = function(){
        $('#memberAdd').modal('hide');
    }
    
    //删除子成员
    $scope.delUser=function(userId){
    	layer.confirm('您确定要删除吗？此操作不能撤回', {
		  btn: ['删除','算了'] //按钮
		}, function(){
		    $http({
	            method: 'POST',
	            url:window.base_url+'/manager/user/delSoldCardUser',
	            data: {
	               user_id			:	userId,
	               sold_card_id		:	$scope.member.sold_card_id
	            }
	        }).success(function(data){
	            if(data.code==200){
	                layer.msg('删除成功！', {icon: 1});
	                $scope.loadMember();
	            }else{
	                layer.msg(data.message, {icon: 2});
	            }
	        }).error( function(data){
	            layer.msg('服务器访问失败', {icon: 2});
	        });
		}, function(){
		  
		});
    }
    
    
    //过期会员统计
    $scope.goExpire = function(type){
    	$location.path('app/expire-member/'+type+'');
    }
}]);


app.controller('daigouController', ['$scope', '$state','daigouFactory','$http','$location','$stateParams','infoService','$timeout','$filter',
                            function($scope, $state,daigouFactory,$http,$location,$stateParams,infoService,$timeout,$filter) {

    $scope.loadCardType=0;
    $scope.loadCoachType=0

    //初始化
    $scope.info={
        type                    :           '',                     //int 1购卡，2购小团课，3购私教课，4储值
        price                   :           0,                      //float 实付现金
        origin_price            :           0,                      //float 原价 注意储值会按原价数量储值，price为实付金额，这样实现折扣
        product_id              :           '',                     //int 相应的产品id
        user_id                 :           '',        				//int 购买的用户id
        buy_num                 :           1,                      //int 购买数量
        attach                  :           '',                     //附加数据
        sum                     :           '',
        coachUserId             :           '',
        cardId                  :           '',
        courseId                :           '',
        shop_id                 :           0,
        group_id                :           '',
        discount_money          :           0,
        sumCard                 :           0,
    }
    //代购类型
    $scope.swch=function(num,item){
        $scope.info.product_id	=   '';
        $scope.info.type        =   num;
        $scope.info.user_id     =   item;
		$scope.info.shop_id		=	0;
		
        //会员卡
        if($scope.info.type==1){
            //只执行一次会员卡接口加载
            if($scope.loadCardType==0){
                $scope.loadGroup();
                $scope.loadCardType=1;
            }else{
            	$scope.loadShop();
            }
        //购小团课
        }else if($scope.info.type==2){
            //只执行一次教练接口加载
            if($scope.loadCoachType==0){
                $scope.loadCoach(function(){
                    $scope.loadCourse()
                })
                $scope.loadCoachType=1
            }
        //购私教课
        }else if($scope.info.type==3){
            //只执行一次教练接口加载
            if($scope.loadCoachType==0){
                $scope.loadCoach(function(){
                    $scope.loadCourse()
                })
                $scope.loadCoachType=1
            }
        //储值
        }else if($scope.info.type==4){}
    }
    //加载分区
    $scope.loadGroup=function(){

        $http({
            method: 'post',
            url:window.base_url+'/manager/shopgroup/getlist',
            data: {}
        }).success(function(data){

            if(data.code==200){
                $scope.groupList = data.data;
                $scope.info.group_id = $scope.groupList.group[0].group_id;
                $scope.loadCard();
                $scope.loadShop();
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    //加载会员卡
    $scope.loadCard=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/card/search',
            data: {
                group_id     :     $scope.info.group_id, //分区id(不传为空)
                //status       :     1,       //1为正常
                limit        :     0,       //返回条数，0为所有
            }
        }).success(function(data){
            if(data.code==200){
                $scope.newCardList          =   data.data;
                if($scope.newCardList.length!=0){
                    $scope.info.cardId           =   $scope.newCardList[0].card_id;
                    $scope.info.price            =   $scope.newCardList[0].price;
                    $scope.info.origin_price     =   $scope.newCardList[0].origin_price;
                }else{
                    $scope.info.cardId           =   '';
                    $scope.info.price            =   0;
                    $scope.info.origin_price     =   0;
                }
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    //加载商铺
    $scope.loadShop=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/shop/searchTwo',
            data: {

                group_id  :   $scope.info.group_id,
                limit     :   0
            }
        }).success(function(data){
            if(data.code==200){
                $scope.shopList=data.data;
                if($scope.shopList.length != 0){
                    $scope.info.shop_id=$scope.shopList[0].shop_id;
                }
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error(function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        })
    }

    //加载私教
    $scope.loadCoach=function(cb){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/coach/search',
            data: {

                limit       :   0
            }
        }).success(function(data){
            if(data.code==200){
                $scope.newCoachList=data.data;
                $scope.info.coachUserId=$scope.newCoachList[0].user_id
                if(cb)
                    cb()
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.parmListCourse={
        type            :       3,
        status          :       1,                      //1为正常，0为锁定。不传列出所有
        page_no         :       1,                      //当前页
        page_size       :       100000,                 //每页显示条数
    }
    //加载课程
    $scope.loadCourse=function(){
        $http({
            method: 'POST',
            url:window.base_url+'/manager/course/getlist',
            data: {
                type        :       $scope.info.type,
                status      :       $scope.parmListCourse.status,
                page_no     :       $scope.parmListCourse.page_no,
                page_size   :       $scope.parmListCourse.page_size,
            }
        }).success(function(data){

            if(data.code==200){

                $scope.courseList=data.data;
                $scope.getList();

            }else{
                layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});

        });
    }

    //获取该教练旗下列表
    $scope.getList=function(type){
    	
    	if(type == 1){
    		$scope.info.shop_id = $scope.newCoachList[$('#seleOne option:selected').index()].shop_id;
    	}else{
    		$scope.info.shop_id = $scope.newCoachList[$('#seleTwo option:selected').index()].shop_id;
    	}
        $scope.newCourseList        =   $filter('courseFilter')($scope.courseList,$scope.info.coachUserId);
        
        if($scope.newCourseList.length!=0){
            $scope.info.price           =   $scope.newCourseList[0].price;
            $scope.info.origin_price    =   $scope.newCourseList[0].origin_price;
            $scope.info.courseId        =   $scope.newCourseList[0].course_id;
            $scope.info.buy_num         =   $scope.newCourseList[0].min_buy;
            $scope.info.sum             =   $scope.newCourseList[0].price * $scope.newCourseList[0].min_buy;
        }else{
            $scope.info.price           =   0;
            $scope.info.origin_price    =   0;
            $scope.info.courseId        =   '';
            $scope.info.buy_num         =   0;
            $scope.info.sum             =   0;
        }
    }

    //获取价格
    $scope.getMoney=function(type){

        //会员卡
        if(type==1){

            $scope.info.price           =   $scope.newCardList[$('.buy-card').prop('selectedIndex')].price;
            $scope.info.origin_price    =   $scope.newCardList[$('.buy-card').prop('selectedIndex')].origin_price;
            $scope.info.sumCard         =   $scope.newCardList[$('.buy-card').prop('selectedIndex')].price;

        //私教
        }else{

            for(var i=0;i<$scope.newCourseList.length;i++){

                if($scope.info.courseId==$scope.newCourseList[i].course_id){
                    $scope.info.price           =  $scope.newCourseList[i].price;
                    $scope.info.origin_price    =  $scope.newCourseList[i].origin_price;
                    $scope.info.buy_num         =  $scope.newCourseList[i].min_buy;
                    $scope.info.sum             =  $scope.info.buy_num * $scope.info.price
                }
            }

        }

    }

    //计算总价
    $scope.getSumCard=function(){
        $scope.info.sumCard  =  $scope.info.price - $scope.info.discount_money;
    }
    $scope.getSum=function(){
        $scope.info.sum  =  $scope.info.buy_num * $scope.info.price-$scope.info.discount_money;
    }

    //提交代购
    var submittedInfo = [];
    $scope.save = function () {

        if($scope.info.type==1)
            $scope.info.product_id=$scope.info.cardId

        if($scope.info.type==3)
            $scope.info.product_id=$scope.info.courseId

        if($scope.info.type==2)
            $scope.info.product_id=$scope.info.courseId

        //私教节数
        if($scope.info.type==3 && (!$scope.info.buy_num || $scope.info.buy_num=='' || $scope.info.buy_num==0)){
            layer.msg('你还未设置购买节数！',{icon:2});
            return
        }

        //充值
        if($scope.info.type==4){
            $scope.info.origin_price    =   $scope.info.price;
            $scope.info.product_id      =   0;
            if($scope.info.price==0 || $scope.info.price=='' || !$scope.info.price){
                layer.msg('你还未设置充值金额！',{icon:2});
                return
            }
        }
        if($scope.info.attach==''){
            layer.msg('你还未填写理由呢',{icon:2});
            return
        }
        //代购ID
        if(($scope.info.product_id=='' || $scope.info.product_id==0) && $scope.info.type!=4){
            layer.msg('你还未选择代购产品呢！',{icon:2});
            return
        }
        $http({
            method: 'POST',
            url:window.base_url+'/manager/approval/add',
            data: {
                type                    :           $scope.info.type,
                price                   :           $scope.info.price,
                origin_price            :           $scope.info.origin_price,
                product_id              :           $scope.info.product_id,
                user_id                 :           $scope.info.user_id,
                buy_num                 :           $scope.info.buy_num,
                attach                  :           $scope.info.attach,
                shop_id                 :           $scope.info.shop_id,
                discount_money          :           $scope.info.discount_money,
            }
        }).success(function(data){

            if(data.code==200){
                layer.msg('提交成功，等待审核中', {icon: 1});
                if($scope.info.type == 4){
                    $scope.info.origin_price = 0;
                    $scope.info.price        = 0;
                }
                $scope.info.discount_money  = 0;
                $scope.info.attach = '';

            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    };

}]);


app.controller('expireMemberCtrl', ['$scope', '$state','$http','$location','$stateParams','$timeout','$filter',
                            function($scope, $state,$http,$location,$stateParams,$timeout,$filter) {

	if($stateParams.type == 1){
		$scope.txt = "过期会员统计";
	}
	if($stateParams.type == 2){
		$scope.txt = "即将过期会员统计";
	}
	if($stateParams.type == 3){
		$scope.txt = "用完次卡会员统计";
	}
	if($stateParams.type == 4){
		$scope.txt = "即将用完次卡会员统计";
	}
	
	$scope.search = {
		phone		:	'',
		name		:	'',
		shop_id		:	0,
		page_no		:	1,
		page_size	:	10,
		type		:	$stateParams.type
	}
	
    $scope.load = function () {
        $http({
            method: 'POST',
            url:window.base_url+'/manager/user/expireMember',
            data: {
				page_no		:	$scope.search.page_no,
				page_size	:	$scope.search.page_size,
				shop_id		:	$scope.search.shop_id,
				name		:	$scope.search.name,
				phone		:	$scope.search.phone,
				user_type	:	$scope.search.type
            }
        }).success(function(data){

            if(data.code==200){
            	$scope.members = data.data;
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    };
    
    $scope.getShop=function(){
    	$http({
            method: 'POST',
            url:window.base_url+'/manager/shop/search',
            data: {
            	limit	:	0
            }
        }).success(function(data){

            if(data.code==200){
            	$scope.shops = data.data;
            	$scope.search.shop_id = $scope.shops[0].shop_id;
            	$scope.load();
            }else{
                layer.msg(data.message, {icon: 2});
            }

        }).error( function(data){
            layer.msg('服务器访问失败！', {icon: 2});
        });
    }
    
    //导出
	$scope.dwp=function(){

		$http({
            method: 'POST',
            url:window.base_url+'/manager/user/exportUserData',
            data: {
				shop_id		:	$scope.search.shop_id,
				name		:	$scope.search.name,
				phone		:	$scope.search.phone,
				user_type	:	$scope.search.type,
				address		:	'expireMember'
            }
        }).success(function(data){
            if(data.code==200){
            	window.location.href=window.base_url+'/manager/user/exportUser?name='+$scope.txt+'导出';
            }else{
                layer.msg(data.message, {icon: 2});
            }
        }).error( function(data){
            layer.msg('服务器访问失败', {icon: 2});
        });
		
	}
    
    $scope.again=function(){
    	$scope.search.page_no = 1;
		$scope.search.page_size =10;
    }
    
    $scope.go=function(){
    	history.back();
    }

}]);
