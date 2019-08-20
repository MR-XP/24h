'use strict';

app.controller('partitionController', ['$scope', '$state', '$location', 'infoService', '$filter', '$log', '$http', 'partitionFactory',
    function ($scope, $state, $location, infoService, $filter, $log, $http, partitionFactory) {

        //加载三级联动
        $scope.area = app.area;

        $scope.txt = '获取分区';

        $scope.shops = {};

        $scope.go = function (item) {

            if (item == 0) {
                $location.path('app/new-partition/0')
            } else {
                infoService.setForm('partitionDtl', item);
                $location.path('app/new-partition/1')
            }
        };

        //加载分区列表
        partitionFactory.get().then(function (data) {

            $scope.newgroupList = data.data;
            $scope.shops = {};
            for (var i in data.data.shop) {
                $scope.shops[data.data.shop[i]['shop_id']] = data.data.shop[i]['shop_name'];
            }
        }, function (data) {

        });

    }]);

app.controller('newpartitionController', ['$scope', '$state', 'partitionFactory', '$http', '$location', '$stateParams', 'infoService',
    function ($scope, $state, partitionFactory, $http, $location, $stateParams, infoService) {


        //加载节点
        $scope.load = function () {

            partitionFactory.get().then(function (data) {

                //获取所有节点
                $scope.sum = [];

                for (var i = 0; i < data.data.shop.length; i++) {

                    $scope.sum.push(data.data.shop[i].shop_id);
                }

                $scope.shopList = data.data.shop

            })
        }


        //遍历
        $scope.ego = function () {

            for (var i = 0; i < $scope.info.shops.length; i++) {
                $('input[value=' + $scope.info.shops[i] + ']').prop('checked', true)

            }
        }

        //保存遍历
        $scope.keep = function () {

            sum = [];

            for (var i = 0; i < $('.my-ipt').length; i++) {

                if ($('.my-ipt:eq(' + i + ')').prop('checked'))
                    sum.push($('.my-ipt:eq(' + i + ')').val())
            }

            return sum;
        }

        //获取到传值
        if ($stateParams.item != 0) {

            if (infoService.getForm('partitionDtl')) {
                $scope.info = infoService.getForm('partitionDtl');

                var sum = [];
                for (var i = 0; i < $scope.info.shops.length; i++) {
                    sum.push(parseInt($scope.info.shops[i]))
                }

                $scope.info.shops = sum;
                $scope.load()
            } else {
                $location.path('app/partition')
            }

        } else {

            $scope.info = {

                group_id: 0, //int 0新增，大于0编辑
                title: '', //string 分区名称
                shops: [], //array 包含的场馆，数组。

            }

            $scope.load()

        }



        //提交函数
        $scope.save = function () {

            $http({
                method: 'POST',
                url: window.base_url + '/manager/shopgroup/save',
                data: {

                    group_id: $scope.info.group_id,
                    title: $scope.info.title,
                    shops: $scope.keep(),
                }
            }).success(function (data) {

                if (data.code == 200) {

                    layer.msg('保存成功！', {icon: 1});
                    $location.path('app/partition')

                } else {
                    layer.msg(data.message, {icon: 2});
                }

            }).error(function (data) {

                layer.msg('服务器访问失败！', {icon: 2});

            });
        };
    }]);