angular.module('app')
    .filter('adaptBg', [function () {
        return function (address) {
            if (!address) return "";
            return {
                'background': 'url(' + address + ') 50% 50% / cover no-repeat'
            }
        }
    }]);

angular.module('app')
    .filter('allBg', [function () {
        return function (address) {
            if (!address) return "";
            return {
                'background': 'url(' + address + ') 50% 50% / 100% 100% no-repeat'
            }
        }
    }]);

app.filter('zeroFill', [function () {
    return function (input) {
        input = parseInt(input, 10);
        if (input < 10) input = "0" + input;
        return input;
    }
}]);

//会员卡卡类别
angular.module('app')
    .filter('cardType',function(){

        var types = {
                1   :   '时效卡',
                2   :   '计次卡',
        };
        return function(type){
            return types[type]  ||  '--';
        };

    });

//会员卡卡提示
angular.module('app')
    .filter('cardMi',function(){
        var types = {
                1   :   '天',
                2   :   '次',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//会员卡状态
angular.module('app')
    .filter('cardStatus',function(){
        var types = {
                1   :   '正常',
                0   :   '下架',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//店铺状态
angular.module('app')
    .filter('storeStatus',function(){
        var types = {
                1   :   '启用',
                0   :   '禁用',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//教练性别
angular.module('app')
    .filter('sexTpye',function(){
        var types = {
                1   :   '男',
                2   :   '女',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//教练执教方式
angular.module('app')
    .filter('wayTpye',function(){
        var types = {
                1   :   '全职',
                2   :   '兼职',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//教练状态
angular.module('app')
    .filter('coachTpye',function(){
        var types = {
                1   :   '正常',
                0   :   '锁定',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//用户状态（账户管理）
angular.module('app')
    .filter('userTpye',function(){
        var types = {
                1   :   '正常',
                0   :   '锁定',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });


//训练难度(课程管理)
angular.module('app')
    .filter('levelTpye',function(){
        var types = {
                1   :   '一般',
                2   :   '进阶',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//状态(课程管理)
angular.module('app')
    .filter('courseStatus',function(){
        var types = {
                1   :   '正常',
                0   :   '锁定',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//订单支付状态
angular.module('app')
    .filter('payStatus',function(){
        var types = {
                0   :   '未支付',
                1   :   '已支付',
                2   :   '已退款',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });
//订单状态
angular.module('app')
    .filter('orderStatus',function(){
        var types = {
                1   :   '正常',
                0   :   '取消',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//订单类型
angular.module('app')
    .filter('orderType',function(){
        var types = {
                1   :   '购卡',
                2   :   '购小团课',
                3   :   '购私教课',
                4   :   '储值',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//审核状态
angular.module('app')
    .filter('passType',function(){
        var types = {
                0   :   '未处理',
                1   :   '通过',
                2   :   '拒绝',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });
//优惠券是否可赠送
angular.module('app')
    .filter('giveType',function(){
        var types = {
                1   :   '可以赠送',
                0   :   '不可赠送',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });

//优惠券类型
angular.module('app')
    .filter('couponType',function(){
        var types = {
                1   :   '打折',
                2   :   '直减现金',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });
//优惠券状态
angular.module('app')
    .filter('couponStatus',function(){
        var types = {
                1   :   '正常',
                0   :   '下架',
        };
        return function(type){
            return types[type]  ||  '--';
        };
    });


angular.module('app')
.filter('zeroFill', [function () {
    return function (input) {
        input = parseInt(input, 10);
        if (input < 10) input = "0" + input;
        return input;
    }
}]);

angular.module('app')
    .filter('formatState', [function () {
    return function (key,list) {
        return typeof (list[key]) == 'undefined' ? '' : list[key];
    }
}]);

angular.module('app')
.filter('courseFilter',[function(){
    return function(inputArray,id){
        var array = [];
        for(var i=0;i<inputArray.list.length;i++){
            if(id==inputArray.list[i].coach_user_id){
                array.push(inputArray.list[i]);
            }
        }

        return array;
    }
}]);
// 图片居中显示
angular.module('app')
.filter('adaptBg', [function () {
    return function (address) {
        if (!address) return "";
        return {
            'background': 'url(' + address + ') 50% 50% / cover no-repeat'
        }
    }
}]);