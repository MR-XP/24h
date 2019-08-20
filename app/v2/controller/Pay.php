<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\v2\controller;

use think\Request;
use app\common\payment\WxPay;
use app\common\component\Code;
use app\common\payment\Alipay;
use app\v2\model\OrderModel;

/**
 * Description of Pay
 *
 * @author Administrator
 */
class Pay extends Base {

    public function pay() {
        $orderId = input('order_id');
        $order = OrderModel::get(['order_id' => $orderId, 'status' => OrderModel::STATUS_ENABLE, 'pay_status' => OrderModel::PAY_STATUS_WAIT]);
        if (!$order) {
            die('未获取到订单');
        }
        $this->assign('order', $order);
        $this->assign('base_url', Request::instance()->domain());
        config('default_return_type', 'html');
        return $this->fetch(ROOT_PATH . 'public/pay.html');
    }

    /**
     * 
     * 支付调用
     * @param type $orderId
     * @param type $openId
     * @return type 
     */
    public function wxpay($orderId, $openId, $prePaid = 0) {
        if (!$orderId || !$openId) {
            return error(0, '参数错误');
        }
        $request = Request::instance();
        $wxpay = WxPay::instance([
                    'app_id' => $this->merchant->detail->wx_pay_app_id,
                    'secret' => $this->merchant->app_secret,
                    'wx_mch_id' => $this->merchant->detail->wx_pay_mch_id,
                    'app_key' => $this->merchant->detail->wx_pay_app_key,
        ]);
        $notifyUrl = $request->domain() . "/index/payment/wxnotify";
        $result = $wxpay->unifiedOrder($orderId, $prePaid, $openId, $notifyUrl);
        if ($result['code'] != Code::SUCCESS) {
            return error(0, '支付参数生成失败');
        }
        $jsParams = $wxpay->buildJsApiParameters($result['data']);
        return success(json_decode($jsParams, true));
    }

    /**
     * 支付宝调用示例
     */
    public function alipay($orderId) {
        if (!$orderId) {
            return error(0, '订单不存在');
        }
        $alipay = Alipay::instance([
                    'app_id' => $this->merchant->detail->alipay_app_id,
                    'private_key' => $this->merchant->detail->alipay_private_key,
                    'public_key' => $this->merchant->detail->alipay_public_key,
        ]);
        $request = Request::instance();
        $notifyUrl = $request->domain() . "/index/payment/alipayNotify";
        $returnUrl = $request->domain() . "/index/payment/alipaysuccess";
        $result = $alipay->tradeWapPay($orderId, $notifyUrl, $returnUrl);
        if ($result['code'] != Code::SUCCESS) {
            return error(0, 'error');
        } else {
            return success($result['data']);
        }
    }

    /**
     * 豆豆支付
     */
    public function paidpay($orderId) {
        if (!$orderId) {
            return error(0, '订单不存在');
        }
        $order = \app\common\model\Order::get($orderId);
        if (!$order || $order['pay_status'] != 0) {
            return error(0, '订单错误');
        }
        //判断余额 是否满足
        $paid = (new \app\v1\model\PaidModel())->get_user_paid($this->user['user_id']);
        if ($paid - $order['price'] >= 0) {
            $order['transaction_id'] = $order['trade_no'];
            $Order = new \app\v1\model\OrderModel();
            $reslut = $Order->paySuccess($order, \app\common\model\Order::SITEPAY);
            return success($reslut);
        } else {
            return error(0, '支付失败,余额不足');
        }
    }

}
