'use strict';

app.controller('userController', ['$scope', '$state','userFactory','$location','infoService','$filter','$http','permissionsFactory',
                             function($scope, $state,userFactory,$location,infoService,$filter,$http,permissionsFactory) {

    $scope.txt='用户管理';

    $scope.parmList={

        username            :       '',        //string 名字
        phone               :       '',        //string 电话
        // status              :       '',        //int 状态
        page_no     :       '1',                //int 当前页
        page_size   :       10,                  //int 每页显示条数
    }

    //分页
    $scope.maxSize=5;
    $scope.pages=function(){
        $scope.loadUser();
    }

    //加载
    $scope.loadUser=function(){

        $http({
            method: 'POST',
            url:window.base_url+'/manager/auth/userlist',
            data: {

                username            :       $scope.parmList.username,
                phone               :       $scope.parmList.phone,
                // status              :       $scope.parmList.status,
                page_no             :       $scope.parmList.page_no,
                page_size           :       $scope.parmList.page_size,

            }
        }).success(function(data){

            if(data.code==200){

                   $scope.newUserList=data.data;

            }else{

                  layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    }

    $scope.loadUser();

    permissionsFactory.get().then(function(data){
        $scope.groupList=data.data.group;
    })

    $scope.delete = function (item) {

        layer.msg('此操作不可逆，您确定删除该用户吗？', {
            time: 0 //不自动关闭
            ,btn: ['确定', '取消']
            ,yes: function(index){
                layer.close(index);
                $http({
                    method: 'POST',
                    url:window.base_url+'/manager/auth/usersave',
                    data: {

                        user_id           :  item.user_id,
                        real_name         :  item.real_name,
                        username          :  item.username,
                        phone             :  item.phone,
                        password          :  item.password,
                        repassword        :  item.repassword,
                        group             :  item.group,
                        avatar            :  item.avatar,
                        status            :  -1,
                    }
                }).success(function(data){

                    if(data.code==200){

                        layer.msg('删除成功', {icon: 1});
                        $scope.loadUser();
                        $location.path('app/user');

                    }else{
                        layer.msg(data.message, {icon: 2});

                    }

                }).error( function(data){

                    layer.msg('服务器访问失败！', {icon: 2});

                });
            }
        });
    };



        //加载权限节点
    //获取所有节点
    $scope.sum=[];
    $scope.load=function(){

        permissionsFactory.get().then(function(data){

            for(var i=0;i<data.data.group.length;i++){

                $scope.sum.push(data.data.group[i].id)
            }

            $scope.groupList=data.data.group;
        })
    }

    //保存遍历
    $scope.keep=function(){

        var count=[];

        for(var i=0;i<$('.my-ipt').length;i++){

            if($('.my-ipt:eq('+i+')').prop('checked'))
                count.push($('.my-ipt:eq('+i+')').val())
        }

        return count;
    }
    //教练编辑模态框
    $scope.editUserModal_open = function(item){
        $('#editUserModal').modal('show');
        if(item!=0){
            $scope.info={

                user_id             :       item.user_id,
                real_name           :       item.real_name,
                username            :       item.username,
                phone               :       item.phone,
                newPassword         :       item.newPassword,
                newRepassword       :       item.newRepassword,
                group               :       item.group,
                avatar              :       item.avatar,
                status              :       item.status,
            }
            $('.upload-img').prop('style',' background: url('+window.static_domain+$scope.info.avatar+')'+'50% 50% / cover no-repeat');


            var sumGroup=[];
            for(var i=0;i<$scope.info.group.length;i++){
                sumGroup.push(parseInt($scope.info.group[i].group_id))
            }

            for(var i=0;i<sumGroup.length;i++){
                $('input[value='+sumGroup[i]+']').prop('checked',true)
            }

        }else{
            $scope.info={

                user_id             :       0,                      //新增为0，修改为用户的id
                real_name           :       '',                     //用户名称
                username            :       '',                     //登录名
                phone               :       '',                     //手机号码
                newPassword         :       '',                     //新密码
                newRepassword       :       '',                     //确认新密码
                group               :       [],                     //所属用户组的id
                avatar              :       '',                     //用户头像
                status              :       1,                      //状态
            }
            $('.upload-img').prop('style',' background: url('+'./static/manager/img/addimg.jpg'+')'+'50% 50% / cover no-repeat');
        }
    }
    $scope.editUserModal_close = function(){
        $('#editUserModal').modal('hide');
        $scope.load();
    }
    //上传头像模态框
    $scope.imgModal_open = function(){
        $('#avatar-modal2').modal('show');
    }
    $scope.imgModal_close = function(){
        $('#avatar-modal2').modal('hide');
    }

    //回调图片
    $scope.getImg=function(urll){

        $('.upload-img').prop('src',urll)

    }

    //提交函数
    $scope.save = function () {
        if($scope.info.newPassword==''){
            delete $scope.info.newPassword;
            delete $scope.info.newRepassword;
        }

        $http({
            method: 'POST',
            url:window.base_url+'/manager/auth/usersave',
            data: {

                user_id             :  $scope.info.user_id,
                real_name           :  $scope.info.real_name,
                username            :  $scope.info.username,
                phone               :  $scope.info.phone,
                password            :  $scope.info.newPassword,
                repassword          :  $scope.info.newRepassword,
                group               :  $scope.keep(),
                avatar              :  $scope.info.avatar,
                status              :  $scope.info.status,
            }
        }).success(function(data){

            if(data.code==200){
                $('#editUserModal').modal('hide');
                $scope.loadUser();
                $scope.load();

            }else{

                  layer.msg(data.message, {icon: 2});

            }

        }).error( function(data){

            layer.msg('服务器访问失败！', {icon: 2});
        });
    };

}]);


