<?php

namespace app\common\payment;

require_once 'wxpay/WxPay.JsApiPay.php';

use app\common\component\Code;
use app\common\model\Order;
use think\Env;

/**
 * 微信支付
 */
class WxPay {

    use \traits\think\Instance;

    protected $appId;
    protected $appSecret;
    protected $wxPayMchId;
    protected $wxPayAppKey;
    protected $config;
    protected $gatewayUrl;
    protected $debug = false;

    private function __construct($config) {
        $this->config = $config;
        $this->parseConfig();
        if (Env::get('payment.wxpay_debug')) { //调试支付
            $this->debug(true);
        }
    }

    protected function parseConfig() {
        $this->appId = $this->config['app_id'];
        $this->appSecret = $this->config['secret'];
        $this->wxPayMchId = $this->config['wx_mch_id'];
        $this->wxPayAppKey = $this->config['app_key'];
        $this->gatewayUrl = 'https://api.mch.weixin.qq.com';
    }

    //调试
    public function debug($debug = false) {
        $this->debug = $debug;
        if ($debug === true) {
            $this->appId = 'wxdc6e2f01451a467f';
            $this->appSecret = '9daf4f5023cbe397bdc7c714b2af9eb0';
            $this->wxPayMchId = '1455956902';
            $this->wxPayAppKey = 'qingchengyundongkongjian20170000';
            $this->gatewayUrl = 'https://api.mch.weixin.qq.com/sandboxnew';
        } else {
            $this->parseConfig();
        }
    }

    /**
     * 统一下单接口
     * @param type $order
     * @param type $openId 用户openid
     * @param type $notifyUrl 通知url
     * @param type $appId 公众号appid
     * @param type $appSecret 公众号 secret
     * @param type $wxPayMchId 商户id
     * @param type $wxPayAppKey 商户key
     * @return type
     */
    public function unifiedOrder($order, $prePaid, $openId, $notifyUrl) {
        if (!$order || $order['pay_status'] != Order::PAY_STATUS_WAIT) {
            return error(Code::RECORD_NOT_FOUND);
        }
        try {
            $input = new \WxPayUnifiedOrder();
            $input->SetBody($order['product_info']);
            $input->SetDetail($order['product_detail']);
            $input->SetAttach($order['order_id']);
            $input->SetOut_trade_no($order['trade_no']);
            $input->SetTotal_fee(($order['price'] - abs($prePaid)) * 100);
            $input->SetTime_start(date("YmdHis"));
            $input->SetTime_expire(date("YmdHis", time() + 600));
            //$input->SetGoods_tag("test");
            $input->SetNotify_url($notifyUrl);
            $input->SetTrade_type("JSAPI");
            $input->SetOpenid($openId);
            $input->SetAppid($this->appId);
            $input->SetMch_id($this->wxPayMchId);
            $wxOrder = \WxPayApi::unifiedOrder($input, $this->appId, $this->appSecret, $this->wxPayMchId, $this->wxPayAppKey, $this->gatewayUrl);
            if ($wxOrder['return_code'] == 'SUCCESS' && $wxOrder['result_code'] == 'SUCCESS') {
                return success($wxOrder);
            } else {
                return error(Code::VALIDATE_ERROR, $wxOrder['return_msg']);
            }
        } catch (\WxPayException $e) {
            return error(Code::VALIDATE_ERROR, $e->errorMessage());
        }
    }

    /**
     * 生成js支付的参数
     * @param type $wxOrder 统一下单返回的order
     */
    public function buildJsApiParameters($wxOrder) {
        $tools = new \JsApiPay();
        $result = $tools->GetJsApiParameters($wxOrder, $this->wxPayAppKey);
        return json_decode($result, true);
    }

    /**
     * 支付回调
     * @param array
     */
    public function notify() {
        $notify = new \NotifyCallback($this->appId, $this->wxPayMchId, $this->wxPayAppKey);
        $notify->Handle(false);
        $result = $notify->GetValues();
        $result['data'] = $notify->data;
        return $result;
    }

}
