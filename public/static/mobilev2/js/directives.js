var app = angular.module('App.directives', []);

app.directive('dateMenu', ["$compile","$filter", "formatDate", function($compile,$filter, formatDate) {
	return {
		restrict: 'E',
		template: '<div class="hx-pd date-menu"></div>',
		replace: true,
		link: function(scope, element, attr) {

			var temp = 1000 * 60 * 60 * 24;
			
			var dayMap = {
				0: "周日",
				1: "周一",
				2: "周二",
				3: "周三", 
				4: "周四",
				5: "周五",
				6: "周六"
			};
			var html = "";
			var cd = new Date();			//获取当前日期
			var cdt = cd.getTime();			//获取时间戳
			
			for(var i = 0; i < 7; i++) {
				
				c = cdt + temp * i;			//获取近七天时间戳
				nd = new Date(c);			//转换为日期
				day = nd.getDay();			//获取星期几
				f = formatDate.get(nd);
				format = f.y + "-" + f.m + "-" + f.d;
					
				html+='<a href="javascript:;" class="date-menu-li" nowDay="'+$filter('zeroFill')(f.d)+'" ng-click="'+attr.click+'(\''+ f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d)+'\','+i+')">'+
								// dayMap[day]+
								'<div class="no-choose">'+
									'<div class="myWeek">'+
										dayMap[day]+
									'</div>'+
									'<div>'+
										+$filter('zeroFill')(f.d)+
									'</div>'+
								'</div>'+
							'</a>';
				
			}
			
			var btn='<div class="date-menu-active anime-ease">'+
								'<div class="choose">'+
									'<div>{{nowMap}}</div>'+
									'<div>{{nowDay}}</div>'+
								'</div>'+
							'</div>';
			
			element.append(html+btn);										//赋予值
			element.replaceWith($compile(element[0].outerHTML)(scope));		//用粗文本替换
			
			//默认加载第一个
			var t = formatDate.get(cd);		
			scope.$eval(attr.click + "('" + t.y + "-" + $filter('zeroFill')(t.m) + "-" + $filter('zeroFill')(t.d) + "',0)");

		}
	}
}]);

app.directive('weekDate', ["$compile", "$filter", "formatDate", "$timeout", "$ionicLoading", function($compile, $filter, formatDate, $timeout, $ionicLoading) {
	return {
		restrict	: 'E',
		template	: '<div class="date-menu"></div>',
		replace		: true,
		link: function($scope, element, attr) {
			
			//切换
			$scope.newWeek=function(num){
				
				$scope.loadTime($scope.getWeek(num))
		
			}

			//开始结束时间
			$scope.weekTime={
				
				startTime		:		'',
				endTime			:		''
				
			}
			
			var dayMap = {
				0: "周日",
				1: "周一",
				2: "周二",
				3: "周三",
				4: "周四",
				5: "周五",
				6: "周六"
			}

			var cd = new Date(); //获取当前日期

			$scope.getWeek = function(num) {

				//本周日期
				weekDay = cd.getDay();

				//本月第几天
				monthDay = cd.getDate();

				//计算本周第一天
				cd.setDate((monthDay - weekDay) + 1);

				num ? cd.setDate(cd.getDate() + num) : '';

				return cd
			}

			var html = '';

			var temp = 1000 * 60 * 60 * 24;

			$scope.loadTime = function(cd) {

				html = '';
				$('.date-menu').html('');
				$scope.nowWeek=[];
				
				var cdt = cd.getTime(); 				  //获取时间戳
	
				for(var i = 0; i < 7; i++) {

					c = cdt + temp * i; 				  //获取近七天时间戳

					nd = new Date(c); 					  //转换为日期

					f = formatDate.get(nd);

					format = f.y + "-" + f.m + "-" + f.d; //转换为字符串

					day = nd.getDay(); //获取星期几
					
					html+='<a href="javascript:;" class="date-menu-li" nowmap="'+dayMap[day]+'" nowDay="'+$filter('zeroFill')(f.d)+'" ng-click="'+attr.click+'(\''+ f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d)+'\','+i+')">'+$filter('zeroFill')(f.m)+'-'+$filter('zeroFill')(f.d)+'</a>';

					//保存一周
					$scope.nowWeek.push(f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d));
					
					if(i == 0) {
						$scope.weekTime.startTime = f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d);
					}

					if(i == 6) {
						$scope.weekTime.endTime = f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d);
						$scope.load($scope.weekTime.startTime,$scope.weekTime.endTime)
					}

				}

				var btn='<div class="date-menu-active anime-ease"><div>{{nowMap}}</div><div>{{nowDay}}</div></div>';
				$('.date-menu').append(html+btn);
				$('.date-menu').replaceWith($compile($('.date-menu')[0].outerHTML)($scope));
				
			}
			
			//默认加载
			$scope.loadTime($scope.getWeek())
		}
	}
}]);


//柱状图
app.directive('echartbar', [function() {
	return {
		restrict: 'A',
		template: '',
		replace: true,
		link: function($scope, element, attrs, controller) {

			$scope.$watch('historyData.id', function() {
				
				//动态获取日期
				item 	= 	$scope.historyData.item;
				//动态获取数值
				data 	= 	$scope.historyData.data;
				//动态提示语
				legend	= 	$scope.historyData.legend;	
				//渲染的类
				id		= 	$scope.historyData.id;
				//颜色
				color	= 	$scope.historyData.color;
				
				line(item,data,legend,id,color)

			});

			function line(item,data,legend,id,color) {

				var option = {
					
					// 提示框，鼠标悬浮交互时的信息提示
					tooltip: {
						trigger: 'axis',
						axisPointer : {           
				            type : 'shadow'        
				        }
					},
					// 图例
					legend: {
				        data: legend
				   },
					// 横轴坐标轴
					xAxis: [{
						type: 'category',
						data: item,
						axisLabel: {
						    interval:0
						}
					}],
					// 纵轴坐标轴
/*					yAxis: [{
						type: 'value',
						axisLabel: {
						    interval:0,
						    rotate:60
						}
					}],*/
					yAxis	:	{
						show	: false
					},

					//内容
					series: function() {
						
						var serie = [];
			 			for(var i=0;i<legend.length;i++){
							 var item = {
								 name 		: 	legend[i],
								 type		: 	'bar',
								 data		: 	data[i],
								 barGap		:	0,
								 
								 itemStyle: {
								 	
									normal: {
										
										color: color[i]
										
									}
								 }
							 }							
							 
							 serie.push(item);
						} 

						
						return serie;
					}()
				};
				var myChart = echarts.init(document.getElementById(id), 'macarons');
				myChart.setOption(option);
			}
		}
	};
}]);

//图片缩放
app.directive('imgzoom', ['$timeout','$ionicLoading',function($timeout,$ionicLoading) {
	return {
		restrict: 'A',
		template: '',
		replace: true,
		link: function($scope, element, attr, controller) {

			var srcList = [],
				imgs	= [];

			element.click(function () {
				
				$ionicLoading.show();
				srcList= [];
				
				imgs=$('[clsname='+attr.clsname+']').length;
				
				for (var i = 0; i < imgs; i++)
					srcList.push(window.base_url+'/'+$('[clsname='+attr.clsname+']:eq('+i+')').attr('zoomurl'));

				$timeout(function(){
					
					$ionicLoading.hide();
					imagePreview(window.base_url+'/'+attr.zoomurl, srcList);
					
				},500)

			});
			
			function imagePreview(curSrc, srcList) {
			  if (!curSrc || !srcList || srcList.length == 0) {
			    return;
			  }
			  WeixinJSBridge.invoke('imagePreview', {
			    'current': curSrc,
			    'urls': srcList
			  });
			}
			
		}
	};
}]);

//城市加载
app.directive('loadcity', ['$interval','$ionicLoading','ajaxService',function($interval,$ionicLoading,ajaxService) {
	return {
		restrict: 'A',
		template: '',
		replace: true,
		link: function($scope, element, attr, controller) {
			
			$scope.shop=window.shop;
			
			$ionicLoading.show(HX_CONFIG.loadingBase);
			
			//场馆加载
			$scope.shopLoad=function(show,cb){
		
				ajaxService.ajax('shopList',{
					
					province	:		window.userLoc.province,			//省级
					city		:		window.userLoc.city,		   		//市级
					longitude	:		window.userLoc.longitude,			//no
					latitude	:		window.userLoc.latitude				//no
					
				},function(json){
					
					if(json.code==200){
						
						window.shop.list	=	json.data;
						$scope.shop.list	=	json.data;
						if((window.shop.id==0 || show) && json.data.length>0){
							window.shop.name	=	$scope.shop.list[0].shop_name;
							$scope.shop.name	=	$scope.shop.list[0].shop_name;
							window.shop.county	=	$scope.shop.list[0].county;
							$scope.shop.county	=	$scope.shop.list[0].county;
							window.shop.id		=	$scope.shop.list[0].shop_id;
							$scope.shop.id		=	$scope.shop.list[0].shop_id;
						}
						
						if(cb)
							cb()
					}
		
				})
				
			}
			
			//城市加载
			if(window.userLoc.province==''){
				
				var timer=setInterval(function(){

					if(window.userLoc.province!=''){
						
						$scope.citys	=	window.citys;
						$scope.userLoc	=	window.userLoc;
						
						clearInterval(timer);
						
						if(window.shop.id==0){
							$scope.shopLoad(false,function(){
								$scope.load()
							})
						}else{
							$scope.load()
						}
						
						$ionicLoading.hide()
					}
					
				},1000)

			}else{   
				
				$scope.citys	=	window.citys;
				$scope.userLoc	=	window.userLoc;
				
				if(window.shop.id==0){
					$scope.shopLoad(false,function(){
						$scope.load()
					})
				}else{
					$scope.load()
				}
				
				$ionicLoading.hide()
			}
			
			//获取省级
			$scope.getProvince=function(name,ix,sname){

				//懒得解释
				if(window.userLoc.province!=name){
					
					window.userLoc.province=name;
					$scope.userLoc.province=name;
					
					//获取第一个城市
					window.userLoc.city=sname;
					$scope.userLoc.city=sname;
					
					$scope.shopLoad(true,function(){
						$scope.load()
					})
					
				}

				//懒得解释
				if($('.region-nav:eq('+ix+')').attr('type')==0){
					
					$('.region-nav').css('height','1.067rem').attr('type',0);
					$('.region-nav:eq('+ix+')').attr('type',1);
					var myHg=$('.region-nav:eq('+ix+')').height();
					var hg=$('.region-nav:eq('+ix+')').children('.region-snav').height();
					$('.region-nav:eq('+ix+')').css('height',hg + myHg+'px');
					
				}else{
					$('.region-nav:eq('+ix+')').css('height','1.067rem').attr('type',0);
				}

			}
			
			//获取市级
			$scope.getCity=function(name,shop){
				
				//阻止个卵
				stopPropagation();
				
				//关闭
				if(shop)
					$('.region-mode').css('left','-110%')

				//阻止重复加载	
				if(window.userLoc.city!=name){	
					
					window.userLoc.city=name;
					$scope.userLoc.city=name;
					
					$scope.shopLoad(true,function(){
						$scope.load()
					})
					
				}
				
			}


			//获取场馆
			$scope.getShopId=function(item,shop){			
				if(window.shop.name!=item.shop_name){
					window.shop.name	=	item.shop_name;
					$scope.shop.name	=	item.shop_name;
					window.shop.id		=	item.shop_id;
					$scope.shop.id		=	item.shop_id;
					window.shop.county	=	item.county;
					$scope.shop.county	=	item.county;
					
					if(shop)
						$scope.load()

				}
				
				$('.region-mode').css('left','-110%');

			}
				
			//展开城市
			$scope.showCity=function(){
				$('.region-mode').css('left','0')
			}
			
			//关闭城市
			$scope.closeCity=function(){
				$('.region-mode').css('left','-110%')
			}
			
			//you know
			function stopPropagation(e) {  
			    e = e || window.event;  
			    if(e.stopPropagation) { 
			        e.stopPropagation();  
			    } else {  
			        e.cancelBubble = true
			    }  
			}
			
			
		}
	};
}]);
