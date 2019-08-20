<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/1/21
 * Time: 15:15
 */
namespace app\v2\controller;

use Extend\wx\wechat;
use Extend\wx\weixin;

class Qing extends Base{
    //对接维修服务器配置
    function index(){

        @$nonce = $_GET['nonce'];
        $token = 'jxs';
        @$timestamp = $_GET['timestamp'];
        @$echostr = $_GET['echostr'];  //第一次传入
        @$signature = $_GET['signature'];

        //2、形成数组，然后字典排序
        $array = array();
        $array = array($nonce,$timestamp,$token);
        sort($array);

        //3、拼接字符串，然后与signature校验
        $str = sha1(implode($array));
        if($str == $signature && $echostr){
            //第一次接入weixin api接口的时候
            echo $echostr;
            exit;
        }else{
            $_GET['data']=input();
            $openid='';
            $appsecret='';
            $wechat=new wechat($openid,$appsecret);
            $wechat->reponseMsg();
        }
    }
    //下载维修二维码
    function qrcode(){
        //用户id
        $id='';
        //1表示永久二维码。0表示临时二维码（有效日期30天）
        $status=1;
        $openid='';
        $appsecret='';
        $wx=new weixin($openid,$appsecret);
        //获取二维码保存地址，$result返回二维码地址
        $result=$wx->getDownload($id,$status);
        if(!$result){
            //二维码获取失败；
        }else{
            //二维码获取成功，处理逻辑程序；
        }


    }

}