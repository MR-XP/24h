<?php

namespace app\common\model;

use think\Log;
use think\Exception;
use app\common\component;
use GatewayClient\Gateway;

class Device extends Base {

    protected $table    = 'mch_device';
    protected $insert   = ['create_time','update_time' =>'0000-00-00 00:00:00','status' => 1];
    protected $update   = ['update_time'];


    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {

        if(!empty($value)){
            return "0000-00-00 00:00:00";
        }else{
            return get_now_time('Y-m-d H:i:s');
        }

    }

    //自己的服务器
    public function selfStart($merchant, $shop, $data, $member, $code) {

        //微信推送
        $wechat = component\WeChat::instance($merchant);

        //验证是否有卡
        $soldCard = new SoldCardUser();
        if(!($soldCard->searchCard($merchant->mch_id,$member))){
            $baseUrl = 'http://' . $merchant->sub_domain . '.' . config('url_domain_root');
            $url = $baseUrl . '/#/users/card-list';
            $text   = "您还未购买会员卡，现在有多种会员卡活动优惠，快去抢购哟！";
            $rel    = "\n<a href='" . $url . "'>立即了解</a>";
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], $text.$rel);
        }

        Gateway::$registerAddress = '127.0.0.1:1238';
        $device = self::get(['mac' => $code['action_attach'], 'status' => self::STATUS_ENABLE]);
        if ($device) {
            $message = [
                'msg_id'    => generate_number_order(),
                'msg_type'  => 'set',
                'user'      => $data['FromUserName'],
                'data'      => [
                    'device_id'     =>  $device['wx_device_id']
                ],
                'client_id' => $device['client_id'],
                'services'  => [
                    'operation_status' => ['status' => 0],
                    'power_switch' => ['on_off' => true]
                ],
                'sports'    => [
                    'speed'         =>  2,
                    'slope'         =>  0,
                    'heart_rate'    =>  50
                ],
                'config'    => [
                    'base_url'          =>  'http://qcyd.24h.51dong.cc',
                    'device_timeout'    =>  300             //五分钟后回到扫码界面
                ]
            ];

            try {
               Gateway::sendToClient($device['client_id'], base64_encode(json_encode($message, JSON_UNESCAPED_UNICODE)));
               return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], "启动设备");
            } catch (Exception $e) {
                Log::record($e->getMessage(), 'lot');
            }
        }
    }

    /**
     * 启动设备
     * @param type $merchant
     * @param type $shop
     * @param type $data
     * @param type $member
     * @param type $code
     */
    public function start($merchant, $shop, $data, $member, $code) {
        $welot = component\WeLot::instance($merchant);
        $req = [
            'device_type' => $data['ToUserName'],
            'device_id' => $code['action_attach'],
            'user' => $data['FromUserName'],
            'data' => $data['FromUserName'],
            'services' => [
                'operation_status' => [
                    'status' => 1
                ],
            ],
        ];
        $result = $welot->ctrlDevice($req);
        if ($result['code'] != component\Code::SUCCESS) {
            \think\Log::record($result, 'lot');
        }
    }

}
