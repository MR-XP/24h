<?php

require_once 'WxPay.Api.php';
require_once 'WxPay.Notify.php';

/**
 * 支付回调
 */
class NotifyCallback extends WxPayNotify {

    public  $data;
    protected $appId;
    protected $wxPayMchId;
    protected $wxPayAppKey;

    public function __construct($appId, $wxPayMchId, $wxPayAppKey) {
        $this->appId = $appId;
        $this->wxPayMchId = $wxPayMchId;
        $this->wxPayAppKey = $wxPayAppKey;
    }

    //查询订单
    public function Queryorder($transaction_id) {
        $input = new WxPayOrderQuery();
        $input->SetTransaction_id($transaction_id);
        $result = WxPayApi::orderQuery($this->appId,$this->wxPayMchId,$this->wxPayAppKey, $input);
        if (array_key_exists("return_code", $result) && array_key_exists("result_code", $result) && $result["return_code"] == "SUCCESS" && $result["result_code"] == "SUCCESS") {
            return true;
        }
        return false;
    }

    //重写回调处理函数
    public function NotifyProcess($data, &$msg) {
        $this->data = $data;
        if (!array_key_exists("transaction_id", $data)) {
            return false;
        }
        //查询订单，判断订单真实性
        if (!$this->Queryorder($data["transaction_id"])) {
            return false;
        }
        return true;
    }

}
