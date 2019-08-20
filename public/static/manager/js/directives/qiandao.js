var calUtil = {
    //获取用户ID
    getID:function(){

        // urll=window.location.href.substring(window.location.href.lastIndexOf('/')+1);
        return window.memberID;
    },

    //时间过滤
    zeroFill:function(num){
        now = parseInt(num, 10);
        if (now < 10) now = "0" + now;
        return now;
    },
    //当前日历显示的年份
    showYear:new Date().getFullYear(),
    //当前日历显示的月份
    showMonth:new Date().getMonth()+1,
    //当前日历显示的天数
    showDays:1,
    //默认加载方式
    eventName:"load",
    //获取数据
    getData:function(data){
        var signList=new Array();//新建一个数组
        for(var i=0;i<data.length;i++){
            var month=data[i].sign_time.substring(5,7);

            if(month==calUtil.zeroFill(calUtil.showMonth)){

                var signDay=data[i].sign_time.substring(8,10);
                signList.push({signDay});
            }
        }

        calUtil.draw(signList);
    },
    //初始化日历
    init:function(){
        load()
    },
    draw:function(signList){
        //绑定日历
        var str = calUtil.drawCal(calUtil.showYear,calUtil.showMonth,signList);
        $("#signLayer").html(str);
        //绑定日历表头
        calUtil.showMonth = (calUtil.showMonth<10 ? "0"+calUtil.showMonth:calUtil.showMonth);
        var calendarName=calUtil.showYear+"年"+calUtil.showMonth+"月";
        $(".month-span").html(calendarName);
    },
    bindPrev:function(){
        calUtil.eventName="prev";
        calUtil.setMonthAndDay()
    },
    bindNext:function(){
        calUtil.eventName="next";
        calUtil.setMonthAndDay()
    },
    //获取当前选择的年月
    setMonthAndDay:function(){

        switch(calUtil.eventName){

            case "load":
                var current = new Date();
                calUtil.showYear=current.getFullYear();
                calUtil.showMonth=current.getMonth() + 1;
                break;

            case "prev":
                calUtil.showMonth=parseInt(calUtil.showMonth)-1;
                if(calUtil.showMonth==0)
                {
                    calUtil.showMonth=12;
                    calUtil.showYear-=1;
                }
                break;

            case "next":
                calUtil.showMonth=parseInt(calUtil.showMonth)+1;
                if(calUtil.showMonth==13)
                {
                    calUtil.showMonth=1;
                    calUtil.showYear+=1;
                }
                break;

        }

        load()

    },
    getDaysInmonth : function(iMonth, iYear){
       var dPrevDate = new Date(iYear, iMonth, 0);
       return dPrevDate.getDate();
    },
    bulidCal : function(iYear, iMonth) {
       var aMonth = new Array();
       aMonth[0] = new Array(7);
       aMonth[1] = new Array(7);
       aMonth[2] = new Array(7);
       aMonth[3] = new Array(7);
       aMonth[4] = new Array(7);
       aMonth[5] = new Array(7);
       aMonth[6] = new Array(7);
       var dCalDate = new Date(iYear, iMonth - 1, 1);
       var iDayOfFirst = dCalDate.getDay();
       var iDaysInMonth = calUtil.getDaysInmonth(iMonth, iYear);
       var iVarDate = 1;
       var d, w;
       aMonth[0][0] = "日";
       aMonth[0][1] = "一";
       aMonth[0][2] = "二";
       aMonth[0][3] = "三";
       aMonth[0][4] = "四";
       aMonth[0][5] = "五";
       aMonth[0][6] = "六";
       for (d = iDayOfFirst; d < 7; d++) {
            aMonth[1][d] = iVarDate;
            iVarDate++;
       }
        for (w = 2; w < 7; w++) {
            for (d = 0; d < 7; d++) {
                if (iVarDate <= iDaysInMonth) {
                    aMonth[w][d] = iVarDate;
                    iVarDate++;
                }
            }
    }
    return aMonth;
    },
    ifHasSigned : function(signList,day){
        var signed = false;
        $.each(signList,function(index,item){
            if(item.signDay == day) {
                signed = true;
                return false;
            }
        });
        return signed ;
    },
    drawCal : function(iYear, iMonth ,signList) {
        var myMonth = calUtil.bulidCal(iYear, iMonth);
        var htmls = new Array();
        htmls.push("<div class='sign'>");
        htmls.push("<div class='sign-tit'>");
        htmls.push("<div>" + myMonth[0][0] + "</div>");
        htmls.push("<div>" + myMonth[0][1] + "</div>");
        htmls.push("<div>" + myMonth[0][2] + "</div>");
        htmls.push("<div>" + myMonth[0][3] + "</div>");
        htmls.push("<div>" + myMonth[0][4] + "</div>");
        htmls.push("<div>" + myMonth[0][5] + "</div>");
        htmls.push("<div>" + myMonth[0][6] + "</div>");
        htmls.push("</div>");
        var d, w;
        for (w = 1; w < 7; w++) {
            htmls.push("<div class='sign-li'>");
            for (d = 0; d < 7; d++) {
                var ifHasSigned = calUtil.ifHasSigned(signList,myMonth[w][d]);
                if(ifHasSigned){
                htmls.push("<div><span class='on' onclick='showOtherDiv($(this).text())'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</span></div>");
                }else {
                    htmls.push("<div>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div>");
                }
            }
            htmls.push("</div>");
        }
        htmls.push("</div>");
        return htmls.join('');
    }
};

//上个月
function prev(){
    calUtil.bindPrev()
}

//下个月
function next(){
    calUtil.bindNext()
}
var signList = [];
//加载
function load(){

    $.ajax({
        type:'post',
        dataType:'json',
        url:window.base_url+'/manager/sign/getlist',
        data:{
            user_id     :   calUtil.getID(),
            page_no     :   1,
            page_size   :   3100,
            start_time  :   calUtil.showYear+'-'+calUtil.zeroFill(calUtil.showMonth)+'-'+'01',
            end_time    :   calUtil.showYear+'-'+calUtil.zeroFill(calUtil.showMonth)+'-'+'31'
        },
        success:function(data){
            if(data.code==200){
                calUtil.getData(data.data.list);
                angular.element('.record-num span').text(angular.element('.on').length);
                signList = data.data.list;
            }
        },
        error: function (){

        },
    })

}
//初始化
calUtil.init();

function showOtherDiv(num){
    if(num<10){ num='0'+num; }
    var signTimeS = calUtil.showYear+'-'+calUtil.showMonth+'-'+num+' '+'00:00:00';
    var signTimeE = calUtil.showYear+'-'+calUtil.showMonth+'-'+num+' '+'23:59:59';
    $('#signModal').modal('show');
    var sign_list = [];
    $("#signModalLabel").append(" ");
    // $("#signModalLabel").append(" "+"<span>"+calUtil.showYear+'-'+calUtil.showMonth+'-'+num+"</span>");
    for(var i=0;i<signList.length;i++){
        var time_stampS =new Date(signList[i].sign_time.replace(/-/gi,'/'));//开始时间戳
        var time_stampE =new Date(signList[i].out_time.replace(/-/gi,'/'));//开始时间戳
        if(signList[i].sign_time.substring(0,10)==signTimeS.substring(0,10)){
            if(signList[i].out_time=='0000-00-00 00:00:00'){
                $(".sign_content").append(
                    "<div class='col-md-4 col-xs-4 text-center' >"+signList[i].sign_time+"</div>"+
                    "<div class='col-md-4 col-xs-4 text-center' >"+signList[i].out_time+"</div>"+
                    "<div class='col-md-4 col-xs-4 text-center' >"+"未扫离场码"+"</div>"
                );
            }else{
                var time_difference = (time_stampE-time_stampS)/1000/60;
                $(".sign_content").append(
                    "<div class='col-md-4 col-xs-4 text-center' >"+signList[i].sign_time+"</div>"+
                    "<div class='col-md-4 col-xs-4 text-center' >"+signList[i].out_time+"</div>"+
                    "<div class='col-md-4 col-xs-4 text-center' >"+Math.round(time_difference)+"分钟"+"</div>"
                );
            }
        }
    }
}
// 关闭弹窗清除数据
$('#signModal').on('hidden.bs.modal', function () {
    $('#signModalLabel span').remove();
    $('.sign_content div').remove();
})


