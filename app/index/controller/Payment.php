<?php

namespace app\index\controller;

use app\index\controller\Base;
use app\common\component\Code;
use app\common\model\Order;
use app\common\model\Member;
use app\common\payment\WxPay;
use app\common\payment\Alipay;
use think\Request;
use think\Log;

class Payment extends Base {

    //微信支付回调
    public function wxNotify() {
        $xml = file_get_contents('php://input');
        Log::record($xml, 'payment'); //记录推送日志
        $wxpay = WxPay::instance([
                    'app_id' => $this->merchant->detail->wx_pay_app_id,
                    'secret' => $this->merchant->app_secret,
                    'wx_mch_id' => $this->merchant->detail->wx_pay_mch_id,
                    'app_key' => $this->merchant->detail->wx_pay_app_key,
        ]);
        $result = $wxpay->notify();
        if ($result['return_code'] == 'SUCCESS' && $result['data']['result_code'] == 'SUCCESS') {
            $order = Order::get(['order_id' => $result['data']['attach']]);
            if ($order && $order['pay_status'] == Order::PAY_STATUS_WAIT) {
                $order['transaction_id'] = $result['data']['transaction_id'];
                $order->paySuccess($order, Order::WXPAY);
            }
        }
    }

    //js 支付调用示例
    public function wxpay() {
        $orderId = input('order_id');
        $request = Request::instance();
        $wxpay = WxPay::instance([
                    'app_id' => $this->merchant->detail->wx_pay_app_id,
                    'secret' => $this->merchant->app_secret,
                    'wx_mch_id' => $this->merchant->detail->wx_pay_mch_id,
                    'app_key' => $this->merchant->detail->wx_pay_app_key,
        ]);
        $notifyUrl = $request->domain() . "/payment/wxnotify";
        $openId = ''; //微信用户的openid
        $result = $wxpay->unifiedOrder($orderId, $openId, $notifyUrl);
        dump($result);
        if ($result['code'] == Code::SUCCESS) {
            $jsParams = $wxpay->buildJsApiParameters($result['data']);
            echo $jsParams;
        }
    }

    //支付宝通知页面
    public function alipayNotify() {
        $request = Request::instance();
        $data = $request->post();
        Log::record($data, 'payment'); //记录推送日志
        $alipay = Alipay::instance([
                    'app_id' => $this->merchant->detail->alipay_app_id,
                    'private_key' => $this->merchant->detail->alipay_private_key,
                    'public_key' => $this->merchant->detail->alipay_public_key,
        ]);
        if ($alipay->checkSign($data)) { //验证签名
            if ($data['trade_status'] == 'TRADE_SUCCESS') {
                $order = Order::get(['order_id' => $data['passback_params']]);
                if ($order && $order['pay_status'] == Order::PAY_STATUS_WAIT) {
                    $order['transaction_id'] = $result['trade_no'];
                    $order->paySuccess($order, Order::ALIPAY);
                }
            }
            echo 'success'; //通知支付宝处理完成
        } else {
            die('error!');
        }
    }

    //支付宝前台跳转页面
    public function alipaySuccess() {
        $return = '/index/index';
        $request = Request::instance();
        $alipay = Alipay::instance([
                    'app_id' => $this->merchant->detail->alipay_app_id,
                    'private_key' => $this->merchant->detail->alipay_private_key,
                    'public_key' => $this->merchant->detail->alipay_public_key,
        ]);
        $data = $request->param();
        if ($alipay->checkSign($data)) { //验证签名
            $data['total_amount']; //总金额
            $data['trade_no']; //支付宝流水号
            $data['out_trade_no']; //商户订单号
            $data['timestamp']; //时间，eg.2016-08-11 19:36:01
        } else {
            die('error!');
        }
    }

    //支付宝调用示例
    public function alipay() {
        $orderId = input('order_id');
        $alipay = Alipay::instance([
                    'app_id' => $this->merchant->detail->alipay_app_id,
                    'private_key' => $this->merchant->detail->alipay_private_key,
                    'public_key' => $this->merchant->detail->alipay_public_key,
        ]);
        $request = Request::instance();
        $notifyUrl = $request->domain() . "/payment/alipaynotify";
        $returnUrl = $request->domain() . "/payment/alipaysuccess";
        $result = $alipay->tradeWapPay($orderId, $notifyUrl, $notifyUrl);
        if ($result['code'] != Code::SUCCESS) {
            die('error');
        } else {
            dump($result['data']);
        }
    }

}
