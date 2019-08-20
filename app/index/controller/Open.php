<?php

namespace app\index\controller;

use app\index\controller\Base;
use app\common\component\WeChat;
use app\common\component\Code;
use think\Log;
use think\Cache;
use think\Db;

class Open extends Base {

    /**
     * 微信授权回调页面
     */
    public function wxauth() {
//        $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxdc6e2f01451a467f&redirect_uri=". urlencode('http://ucenter.test.51dong.cc/platform/wx/response/')."&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";
//        dump($url);
//        die();
        $code = input('get.code');
        $state = input('get.state');
        if (empty($code)) {
            die('您需要授权登陆后才能进行此操作');
        }
        $wechat = WeChat::instance($this->merchant);
        $result = $wechat->getUserAccessToken($code);
        if ($result['code'] != Code::SUCCESS) {
            die($result['message'] . ',step 1,请刷新页面');
        }
        /** { 
          "access_token":"ACCESS_TOKEN",
          "expires_in":7200,
          "refresh_token":"REFRESH_TOKEN",
          "openid":"OPENID",
          "scope":"SCOPE"
          }
         */
        $token = $result['data'];
        $result = $wechat->getMpUserInfo($token['openid']);
        if ($result['code'] != Code::SUCCESS) {
            die($result['message'] . ',step 2,请刷新页面');
        }
        session('wx_user', $result['data']);
//        $token['expires_time'] = get_now_time() + $token['expires_in'] - 200;
//        $token['refresh_expires_time'] = get_now_time() + 86400 * 29; //由于用户已经关注了公众号，不用考虑刷新，都是静默授权
//        session('wx_token', $token);
        $returnUrl = session('return_url');
        if ($returnUrl) {
            $this->redirect($returnUrl);
        } else {
            $this->redirect(\think\Request::instance()->domain());
        }
    }

    /**
     * 公众号推送接收页面
     */
    public function wechat() {

        $wechat = WeChat::instance($this->merchant);
        $echostr = input('get.echostr');
        if ($echostr && $wechat->checkSignature(input('get.signature'), input('get.timestamp'), input('get.nonce'))) {
            exit($echostr);
        }
        $xml = file_get_contents('php://input');
        $data = xml2array($xml);
        if (!isset($data['MsgType'])) {
            die('step 1.error');
        }
        if (!$wechat->checkSignature(input('get.signature'), input('get.timestamp'), input('get.nonce'))) {
            die('step 2.error');
        }
        $result = '';
        switch ($data['MsgType']) {
            case 'text': //文本消息
                break;
            case 'event': //事件推送
                $qrcode = new \app\common\model\Qrcode();
                $user   = new \app\common\model\User();
                $key = $data['FromUserName'] . $data['CreateTime'];
                $lock = Cache::get($key);
                if ($lock) { //判断重复通知
                    die('');
                }
                Cache::set($key, $xml, 3600);
                switch ($data['Event']) {
                    case 'subscribe': //关注
                        Log::record($xml, 'wechat');
                        $result = $user->follow($this->merchant, $data);
                        break;
                    case 'unsubscribe': //取消关注
                        break;
                    case 'SCAN': //已关注的扫码事件
                        Log::record($xml, 'wechat');
                        $result = $qrcode->scan($this->merchant, $data);
                        break;
                    case 'LOCATION': //上报地理位置
                        break;
                    case 'CLICK': //点自定义菜单
                        break;
                    case 'VIEW': //点菜单跳转链接
                        break;
                }
                break;
        }
        echo $result;
    }

    /**
     * 跑步机设备消息接收
     */
    public function lot() {
        $wechat = WeChat::instance($this->merchant);
        $data = file_get_contents('php://input');
        Log::record($data, 'lot');
        $echostr = input('get.echostr');
        if ($echostr && $wechat->checkSignature(input('get.signature'), input('get.timestamp'), input('get.nonce'))) {
            exit($echostr);
        }
        if (!$wechat->checkSignature(input('get.signature'), input('get.timestamp'), input('get.nonce'))) {
            die('step 2.error');
        }
        $result = '';
        echo $result;
    }

    public function deviceNotify() {
        $data = file_get_contents('php://input');
        $data = json_decode($data,true);
        if(empty($data)){
            $data = $this->request->param();
        }
        Log::record($data);

        $device = \app\common\model\Device::get(['mac' => $data['mac']]);

        if (!empty($device)) {
            $device->client_id      =   $data['client_id'];
            $device->save();
        } else {
            $device = new \app\common\model\Device();

            $device->client_id      =   $data['client_id'];
            $device->mch_id         =   $this->merchant->mch_id;
            $device->device_name    =   $data['device_type']==2?'跑步机':'体脂秤';
            $device->type           =   $data['device_type'];
            $device->wx_device_id   =   $data['device_id'];
            $device->mac            =   $data['mac'];
            $device->save();
        }

        $result = success([
            'version' => '1.0.0',
            'url' => 'http://',
            'force' => 0,
        ]);

        return json($result);

    }

    /**
     * 跑步机设备二维码
     */
    public function qrcode() {
        $mac = $this->request->param('mac');
        if (!empty($mac)) {
            $result = (new \app\common\model\Qrcode())->getDeviceQrcode($this->merchant, $mac, 'DEVICE_START');
        } else {
            $result = error(Code::VALIDATE_ERROR, '未知设备');
        }
        return json($result);
    }

    /**
     * 跑步机设备数据接收
     */
    public function deviceData() {
        $data = file_get_contents('php://input');
        $data = json_decode($data,true);
        if(empty($data)){
            $data = $this->request->param();
        }
        Log::record($data, 'lot');
        $member = \app\common\model\Member::get(['open_id' => $data['user']]);
        if(!empty($member)){
            $devRecord =new \app\common\model\DeviceRecord();
            $devRecord->mch_id               =   $this->merchant->mch_id;
            $devRecord->user_id              =   $member['user_id'];
            $devRecord->type                 =   $data['device_type'];
            $devRecord->msg_id               =   $data['msg_id'];
            $devRecord->step                 =   $data['step'];
            $devRecord->distance             =   $data['distance'];
            $devRecord->energy_consumption   =   $data['energy_consumption'];
            $devRecord->time_duration        =   $data['time_duration'];
            $devRecord->avg_speed            =   $data['avg_speed'];
            $devRecord->avg_slope            =   $data['avg_slope'];
            $devRecord->heart_rate           =   $data['heart_rate'];
            $devRecord->device_id            =   $data['device_id'];
            $devRecord->device_name          =   $data['device_type']==2?'跑步机':'体脂秤';
            $devRecord->save();
            $result= success('');
        }else{
            $result = error(Code::VALIDATE_ERROR,'未查到该用户');
        }
        return json($result);

    }

    /**
     * 美丽云体测仪设备数据接收
     */
    public function beautifulCloudData(){
        $params = $this->request->param();
        //记录日志
        Log::record($params, 'beautifulCloud');
        $data = json_decode($params['data'],true);

        Db::startTrans();
        try{
            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            return error(Code::VALIDATE_ERROR,'数据保存失败');
        }
        $member = \app\common\model\Member::get(['open_id' => $data['open_id']]);
        //只有注册过的会员才进行体测记录
        if($member){

        }
    }

    public function getPackage() {
        $result = WeChat::instance($this->merchant)->getSignPackage();
        if ($result['code'] != Code::SUCCESS) {
        }
        $sign_package = $result['data'];
        echo json_encode($sign_package);
    }

}
