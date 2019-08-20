<?php

namespace app\v2\controller;

use app\common\component\Code;
use app\common\model\Qrcode;
use app\v2\model;
use Extend\wx\wechat;
use Extend\wx\weixin;
use function Composer\Autoload\includeFile;

class Saleman extends Base {


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
    //下载二维码
    function createQrcode(){
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

    public function saveCode(){
        $userTd=$this->user['user_id'];
        $shopId=input('shop_id');
        $_SESSION['seller_id']=$this->user['user_id'];
        $_SESSION['shop_id']=input('shop_id');
        $jupUrl=$_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/#/users/card-list?id='.$userTd.'&shop_id='.$shopId;
        $path='/v1/saleman/qrcode?url='.base64_encode($jupUrl);
        return success($path);
    }

    /**
     * 生成图片
     */
    function qrcode(){
        $input=input();
        include ROOT_PATH.'/public/phpqrcode/qrlib.php';
        $url=base64_decode($input['url']);
        \QRcode::png($url,false,'L',4,2);
    }

    /**
     *获取销售名下的会员
     */
    public function getUser(){
        $model=new model\SalemanAchv();
        $data=input('');
        return success($model->getUsers($this->merchant['mch_id'],$this->user['user_id'],$data));
    }

}
