'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {

        $urlRouterProvider.when('/app', '/users/index');
	    $urlRouterProvider.otherwise('/app/index');

        $stateProvider
        .state('app', {
            abstract: true,
            url: '/app',
            templateUrl: '/static/manager/tpl/app.html'
        })
        //首页
        .state('app.index', {
            url: '/index',
            templateUrl: '/static/manager/tpl/index.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/index.js']);
              }]
            }
        })
        .state('app.financial', {//财务统计
            url: '/financial',
            templateUrl: '/static/manager/tpl/financial.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/financial.js']);
              }]
            }
        })
        .state('app.statistica-card', {//会员卡销量统计
            url: '/statistica-card/:type',
            templateUrl: '/static/manager/tpl/statistica-card.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-card.js']);
              }]
            }
        })
        .state('app.statistica-bean', {//金豆充值统计
            url: '/statistica-bean/:type',
            templateUrl: '/static/manager/tpl/statistica-bean.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-bean.js']);
              }]
            }
        })
        .state('app.statistica-bound', {//新增绑定统计
            url: '/statistica-bound/:type',
            templateUrl: '/static/manager/tpl/statistica-bound.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-bound.js']);
              }]
            }
        })
        .state('app.statistica-eliminate', {//新增绑定统计
            url: '/statistica-eliminate/:type',
            templateUrl: '/static/manager/tpl/statistica-eliminate.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-eliminate.js']);
              }]
            }
        })
        .state('app.statistica-salesmonth', {//本月销量统计列表（所有店铺）
            url: '/statistica-salesmonth/:type',
            templateUrl: '/static/manager/tpl/statistica-salesmonth.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-salesmonth.js']);
              }]
            }
        })
        .state('app.statistica-commission', {//员工提成列表
            url: '/statistica-commission/:item',
            templateUrl: '/static/manager/tpl/statistica-commission.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-commission.js']);
              }]
            }
        })
        .state('app.statistica-salesyear', {//年销量统计列表（所有店铺）
            url: '/statistica-salesyear/:type',
            templateUrl: '/static/manager/tpl/statistica-salesyear.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-salesyear.js']);
              }]
            }
        })
        .state('app.statistica-member', {//会员统计
            url: '/statistica-member/:type/:id',
            templateUrl: '/static/manager/tpl/statistica-member.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-member.js']);
              }]
            }
        })
        .state('app.statistica-sign', {//签到统计
            url: '/statistica-sign/:type',
            templateUrl: '/static/manager/tpl/statistica-sign.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-sign.js']);
              }]
            }
        })
        .state('app.statistica-private', {//私教购买统计
            url: '/statistica-private/:type',
            templateUrl: '/static/manager/tpl/statistica-private.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-private.js']);
              }]
            }
        })
        .state('app.statistica-group', {//小团课购买统计
            url: '/statistica-group/:type',
            templateUrl: '/static/manager/tpl/statistica-group.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-group.js']);
              }]
            }
        })
        .state('app.statistica-appointment', {//课程预约统计
            url: '/statistica-appointment/:type/:id',
            templateUrl: '/static/manager/tpl/statistica-appointment.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-appointment.js']);
              }]
            }
        })
        .state('app.statistica-feedback', {//反馈统计
            url: '/statistica-feedback',
            templateUrl: '/static/manager/tpl/statistica-feedback.html',
            resolve: {
              deps: ['$ocLazyLoad',
                function( $ocLazyLoad ){
                  return $ocLazyLoad.load(['/static/manager/js/controllers/statistica-feedback.js']);
              }]
            }
        })

        //商铺设置
        .state('app.store', {//店铺列表
          url: '/store',
          templateUrl: '/static/manager/tpl/store.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/store.js']);
            }]
          }
        })
        .state('app.new-store', {//新建店铺
          url: '/new-store/:item',
          templateUrl: '/static/manager/tpl/new-store.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/store.js']);
            }]
          }
        })
        .state('app.up-img', {//新建店铺
          url: '/up-img',
          templateUrl: '/static/manager/tpl/up-img.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/store.js']);
            }]
          }
        })
        .state('app.partition', {//区域设置
          url: '/partition',
          templateUrl: '/static/manager/tpl/partition.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/partition.js']);
            }]
          }
        })
        .state('app.new-partition', {//新增分区
          url: '/new-partition/:item',
          templateUrl: '/static/manager/tpl/new-partition.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/partition.js']);
            }]
          }
        })

        //订单管理
        .state('app.order', {//订单列表
          url: '/order',
          templateUrl: '/static/manager/tpl/order.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/order.js']);
            }]
          }
        })

        //会员卡管理
        .state('app.clubcard', {//会员卡列表
          url: '/clubcard',
          templateUrl: '/static/manager/tpl/clubcard.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/clubcard.js']);
            }]
          }
        })
        .state('app.new-card', {//新建会员卡
          url: '/new-card/:item',
          templateUrl: '/static/manager/tpl/new-card.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/clubcard.js']);
            }]
          }
        })

        //教练管理
        .state('app.coach', {//教练列表
          url: '/coach',
          templateUrl: '/static/manager/tpl/coach.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/coach.js']);
            }]
          }
        })
        .state('app.new-coach', {//新建教练
          url: '/new-coach/:item',
          templateUrl: '/static/manager/tpl/new-coach.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/coach.js']);
            }]
          }
        })
        .state('app.apply', {//教练申请
          url: '/apply',
          templateUrl: '/static/manager/tpl/apply.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/apply.js']);
            }]
          }
        })
        .state('app.certificate-photos', {//教练申请
          url: '/certificate-photos/:item',
          templateUrl: '/static/manager/tpl/certificate-photos.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/apply.js']);
            }]
          }
        })
        //课程管理
        .state('app.course', {//课程管理主页
          url: '/course/:item',
          templateUrl: '/static/manager/tpl/course.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/course.js']),
                	   $ocLazyLoad.load(['/static/manager/js/plugin/jasny/jasny-bootstrap.min.js']);
            }]
          }
        })
        .state('app.courses-arranging', {//排课管理
          url: '/courses-arranging/:item',
          templateUrl: '/static/manager/tpl/courses-arranging.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/course.js']);
            }]
          }
        })
        .state('app.new-commoncourse', {//新建公共课
          url: '/new-commoncourse/:item',
          templateUrl: '/static/manager/tpl/new-commoncourse.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/commoncourse.js']);
            }]
          }
        })
        .state('app.new-privatecourse', {//新建私教课

          url: '/new-privatecourse/:id',
          templateUrl: '/static/manager/tpl/new-privatecourse.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/privatecourse.js']);
            }]
          }
        })
        .state('app.new-groupcourse', {//新建小团课

          url: '/new-groupcourse/:id',
          templateUrl: '/static/manager/tpl/new-groupcourse.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/groupcourse.js']);
            }]
          }
        })

		//排课管理
        .state('app.plan', {//会员列表
          url: '/plan',
          templateUrl: '/static/manager/tpl/plan.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/plan.js']);
            }]
          }
        })
        //会员管理
        .state('app.member', {//会员列表
          url: '/member',
          templateUrl: '/static/manager/tpl/member.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/member.js']);
            }]
          }
        })
        .state('app.member-information', {//会员详情
          url: '/member-information/:id',
          templateUrl: '/static/manager/tpl/member-information.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/member.js']);
            }]
          }
        })

        //审核管理
        .state('app.audit', {
          url: '/audit',
          templateUrl: '/static/manager/tpl/audit.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/audit.js']);
            }]
          }
        })

        //用户管理
        .state('app.user', {//用户列表
          url: '/user',
          templateUrl: '/static/manager/tpl/user.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/user.js']);
            }]
          }
        })
        .state('app.new-user', {//新建用户
          url: '/new-user/:item',
          templateUrl: '/static/manager/tpl/new-user.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/user.js']);
            }]
          }
        })
        .state('app.expire-member', {//
          url: '/expire-member/:type',
          templateUrl: '/static/manager/tpl/expire-member.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/member.js']);
            }]
          }
        })
        //优惠券管理
        .state('app.coupon', {//优惠券列表
          url: '/coupon',
          templateUrl: '/static/manager/tpl/coupon.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/coupon.js']);
            }]
          }
        })
        .state('app.new-coupon', {//新建会员卡
          url: '/new-coupon/:item',
          templateUrl: '/static/manager/tpl/new-coupon.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/coupon.js']);
            }]
          }
        })

        //权限管理
        .state('app.permissions', {//权限列表
          url: '/permissions',
          templateUrl: '/static/manager/tpl/permissions.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/permissions.js']);
            }]
          }
        })

        .state('app.edit-permissions', {//权限编辑
          url: '/edit-permissions/:item',
          templateUrl: '/static/manager/tpl/edit-permissions.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/permissions.js']);
            }]
          }
        })

        //销售人员管理
        .state('app.sales', {//销售人员列表
          url: '/sales',
          templateUrl: '/static/manager/tpl/sales.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/sales.js']);
            }]
          }
        })
        //活动竞猜
        .state('app.activity', {//销售人员列表
          url: '/activity',
          templateUrl: '/static/manager/tpl/activity.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/activity.js']);
            }]
          }
        })

		//菜单配置
		.state('app.menu', {
          url: '/menu',
          templateUrl: '/static/manager/tpl/menu.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/menu.js']);
            }]
          }
        })

        //修改密码
        .state('app.changepassword', {
          url: '/changepassword',
          templateUrl: '/static/manager/tpl/changepassword.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function( $ocLazyLoad ){
                return $ocLazyLoad.load(['/static/manager/js/controllers/changepassword.js']);
            }]
          }
        })

        //登录/注销
        .state('access', {
            url: '/access',
            /*template: '<div ui-view class="fade-in-right-big smooth"></div>'*/
            template: '<div ui-view></div>'
        })
        .state('access.signin', {
            url: '/signin',
            templateUrl: '/static/manager/tpl/access_signin.html',
            resolve: {
                deps: ['$ocLazyLoad',
                  function( $ocLazyLoad ){
                    return $ocLazyLoad.load( ['/static/manager/js/controllers/signin.js'] );
                }]
            }
        })
        .state('access.404', {
            url: '/404',
            templateUrl: 'tpl/access_404.html'
        })
      }
    ]
  );