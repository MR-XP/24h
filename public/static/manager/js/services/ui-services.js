//店铺列表
app.factory('storeFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/shop/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑店铺
app.factory('newstoreFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.post(window.base_url+'/manager/shop/save')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});

//获取分区
app.factory('partitionFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/shopgroup/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});

//会员列表
app.factory('memberFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/user/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//会员详情
app.factory('memberxqFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/user/info')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//代购
app.factory('daigouFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/approval/add')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//会员卡列表
app.factory('clubcardFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/card/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑会员卡
app.factory('newcardFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.post(window.base_url+'/manager/card/save')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//教练列表
app.factory('coachFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/coach/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑教练
app.factory('newcoachFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.post(window.base_url+'/manager/coach/save')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//订单列表
app.factory('orderFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/order/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//用户列表
app.factory('userFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/auth/userlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑用户
app.factory('newuserFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.post(window.base_url+'/manager/auth/usersave')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//权限组列表
app.factory('permissionsFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/auth/grouplist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑权限组
app.factory('editpermissionsFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.post(window.base_url+'/manager/auth/groupsave')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//课程列表
app.factory('kclistFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/course/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑课程
app.factory('kceditFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/course/save')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//排课
app.factory('paikeFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/classplan/save')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//代购列表
app.factory('auditFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/approval/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//用户登录
app.factory('dengluFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/index/login')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//优惠券列表
app.factory('couponFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.get(window.base_url+'/manager/coupon/getlist')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
//新建/编辑优惠券
app.factory('newcouponFactory',function($http,$q){
    return{
        get:function(data){
            var d=$q.defer();
            $http.post(window.base_url+'/manager/coupon/save')
            .success(function(data){
                d.resolve(data);
            })
            .error(function(){
                d.reject("error");
            });
            return d.promise;
        }
    };
});
