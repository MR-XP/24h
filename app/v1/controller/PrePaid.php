<?php

namespace app\v1\controller;

use app\common\component\Code;
use app\v1\validate;

class PrePaid extends Base {

    /**
     * 充值
     */
    public function addPrePaid() {
        $data = input('');
        $validate = new validate\PrePaid();
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $order = [
            'mch_id' => $this->merchant['mch_id'],
            'user_id' => $this->user['user_id'],
            'price' => $data['price'],
            'sale_price' => $data['price'],
            'product_info' => '金豆',
            'product_num' => $data['num'],
            'origin_price' => 1,
            'trade_no' => generate_number_order(),
            'status' => 1,
            'pay_status' => 0,
            'create_time' => get_now_time('Y-m-d H:i:s'),
//            'pay_type' => $data['pay_type'],
            'type' => 4
        ];
        //豆豆支付
        if ($data['pay_type'] == 'SITEPAY') {
            return error(0, '该订单不支持该支付方式');
        }
        $validate = new validate\Order();
        if (!$validate->check($order)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $order_id = (new \app\v1\model\OrderModel())->add_order($order);
        if (!$order_id) {
            return error(0, '创建订单失败');
        }
        $Pay = new Pay();
        if ($data['pay_type'] == 'WXPAY') {
//            $result = $Pay->wxpay($order_id, $this->member['open_id']);
//            if ($result['code'] == Code::SUCCESS) {
            return success($order_id);
//            }
        }
        if ($data['pay_type'] == 'ALIPAY') {
            $result = $Pay->alipay($order_id);
            if ($result['code'] == Code::SUCCESS) {
                return success($result['data']);
            }
        }
        //豆豆支付
        if ($data['pay_type'] == 'SITEPAY') {
            $result = (new \app\common\payment\SitePay())->doPay($order_id);
            if ($result['code'] != Code::SUCCESS) {
                return error(0, $result['message']);
            }
            return error(10028, '支付成功');
        }
    }

}
