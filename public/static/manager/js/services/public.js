
app.factory('infoService' , [function(){

	var service = {};
	var data = {}

	service.setForm = function(key , val){
		data[key] = val;
	}
	service.getForm = function(key){
		return data[key];
	}
	return service;
}]);

app.service('formatDate',[function(){
	
	return {
		
		get	: function (date){
			
			y = date.getFullYear();
	        m = date.getMonth() + 1;
	        d = date.getDate();
			return {y: y, m: m, d: d}
		}
	}

}]);


app.service('getNowTime',[function(){

	return {

		get	: function (startTime,endTime){

			var time1=startTime;
			var time2=endTime;

			if(time1>time2){
				/*layer.msg("开始时间不能大于结束时间！");*/
			   	return '未扫离场码';
			}
			//截取字符串，得到日期部分"2009-12-02",用split把字符串分隔成数组
			var begin1=time1.substr(0,10).split("-");
			var end1=time2.substr(0,10).split("-");

			//将拆分的数组重新组合，并实例成化新的日期对象
			var date1=new Date(begin1[1] + - + begin1[2] + - + begin1[0]);
			var date2=new Date(end1[1] + - + end1[2] + - + end1[0]);

			//得到两个日期之间的差值m，以分钟为单位
			var m=parseInt(Math.abs(date2-date1)/1000/60);

			//小时数和分钟数相加得到总的分钟数
			var min1=parseInt(time1.substr(11,2))*60+parseInt(time1.substr(14,2));
			var min2=parseInt(time2.substr(11,2))*60+parseInt(time2.substr(14,2));

			//两个分钟数相减得到时间部分的差值，以分钟为单位
			var n=min2-min1;

			//将日期和时间两个部分计算出来的差值相加，即得到两个时间相减后的分钟数
			var minutes=m+n;
			var a=minutes/60>>0;
			var b=minutes%60;

			return a+'小时'+b+'分钟'
		}
	}

}]);

/*app.service('arrDate', ["$compile","$filter", "formatDate", function($compile,$filter, formatDate) {

	return get:function(type){

			if(type==1){//当天

			}

			if(type==2){//本周

			}


			if(type==3){//本月

			}

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

				html+='<a href="javascript:;" class="date-menu-li" ng-click="'+attr.click+'(\''+ f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d)+'\','+i+')">'+dayMap[day]+'</a>';

			}

			var btn='<div class="date-menu-active anime-ease"><div>{{nowMap}}</div><div>{{nowDay}}</div></div>';

			element.append(html+btn);										//赋予值
			element.replaceWith($compile(element[0].outerHTML)(scope));		//用粗文本替换

			//默认加载第一个
			var t = formatDate.get(cd);
			scope.$eval(attr.click + "('" + t.y + "-" + $filter('zeroFill')(t.m) + "-" + $filter('zeroFill')(t.d) + "',0)");

		}

}]);
*/

app.service('arrDate', ["$compile", "$filter", "formatDate", "$filter","infoService", function($compile, $filter, formatDate, $filter,infoService) {
	var now =new Date();
	var nowDayOfWeek = now.getDay(); //今天本周的第几天//今天本周的第几天
    nowDayOfWeek = nowDayOfWeek==0?7:nowDayOfWeek; // 如果是周日，就变成周七

	var dayStartDate;//当日开始时间
	var dayEndDate;//当日结束时间

	var weekStartDate;//本周开始时间
	var weekEndDate;//本周结束时间

	var monthStartDate;//本月开始时间
	var monthEndDate;//本月结束时间

	var yearStartDate;//本年开始时间
	var yearEndDate;//本年结束时间

	// dayStartDate=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+'00:00:00';//今日开始时间
	// dayEndDate = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+'23:59:59';//今日结束时间

	var MyMonthD = now.getMonth()+1;
	var MyDayD = now.getDate();
	MyMonthD =(MyMonthD<10 ? "0"+MyMonthD:MyMonthD);
	MyDayD   =(MyDayD<10 ? "0"+MyDayD:MyDayD);
	dayStartDate = now.getFullYear()+'-'+MyMonthD+'-'+MyDayD+' '+'00:00:00';//今日开始时间
	dayEndDate   = now.getFullYear()+'-'+MyMonthD+'-'+MyDayD+' '+'23:59:59';//今日结束时间



	// var weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - nowDayOfWeek+1); //本周的开始日期
	// weekStartDate = weekStart.getFullYear()+'-'+(weekStart.getMonth()+1)+'-'+weekStart.getDate()+' '+'00:00:00';
 	// var weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - nowDayOfWeek+1));//本周的结束日期
 	// weekEndDate = weekEnd.getFullYear()+'-'+(weekEnd.getMonth()+1)+'-'+weekEnd.getDate()+' '+'23:59:59';
 	var weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - nowDayOfWeek+1); //本周的开始日期
 	var weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - nowDayOfWeek+1));//本周的结束日期
	var MyMonthWS = weekStart.getMonth()+1;
	var MyDayS    = weekStart.getDate();
	var MyMonthWE = weekEnd.getMonth()+1;
	var MyDayE    = weekEnd.getDate();
	MyMonthWS = (MyMonthWS<10 ? "0"+MyMonthWS:MyMonthWS);
	MyDayS    = (MyDayS<10 ? "0"+MyDayS:MyDayS);
	MyMonthWE = (MyMonthWE<10 ? "0"+MyMonthWE:MyMonthWE);
	MyDayE    = (MyDayE<10 ? "0"+MyDayE:MyDayE);
	weekStartDate = weekStart.getFullYear()+'-'+MyMonthWS+'-'+MyDayS+' '+'00:00:00';
	weekEndDate = weekEnd.getFullYear()+'-'+MyMonthWE+'-'+MyDayE+' '+'23:59:59';


	var monthStart=now;
    monthStart.setDate(1); //当月第一天
    var start = formatDate.get(monthStart);
    monthStartDate=start.y+'-'+$filter('zeroFill')(start.m)+'-'+$filter('zeroFill')(start.d)+' '+'00:00:00';

    var monthEnd = now;
    monthEnd.setMonth(now.getMonth()+1);
    monthEnd.setDate(0);//当月最后一天
    var end = formatDate.get(monthEnd);
    monthEndDate=end.y+'-'+$filter('zeroFill')(end.m)+'-'+$filter('zeroFill')(end.d)+' '+'23:59:59';

    yearStartDate = now.getFullYear()+'-'+'01'+'-'+'01'+' '+'00:00:00';//本年开始时间
    yearEndDate   = now.getFullYear()+'-'+'12'+'-'+'31'+' '+'23:59:59';//本年结束时间

	return {

		get:function(type){
			if(type==1){//当天
				return dayStartDate+' '+dayEndDate;

			}

			if(type==2){//本周
				return weekStartDate+' '+weekEndDate;

			}

			if(type==3){//本月
				return monthStartDate+' '+monthEndDate;

			}

			if(type==4){//本年
				return yearStartDate+' '+yearEndDate;

			}
		}
	}
}]);