<?php

namespace app\common\payment;

use think\Db;
use app\common\component\Code;
use \app\common\model\Order;

/**
 * 商户预付金支付
 */
class SitePay {

    use \traits\think\Instance;

    /**
     * 直接支付
     * @param type $order
     * @return type
     */
    public function doPay($order) {
        $mchId = $order['mch_id'];
        $userId = $order['user_id'];
        if (!$order || $order['pay_status'] != Order::PAY_STATUS_WAIT) {
            return error(Code::RECORD_NOT_FOUND);
        }
//        if ($order['user_id'] != $userId) {
//            return error(Code::VALIDATE_ERROR, '只能自己使用！');
//        }
        Db::startTrans();
        try {
            $memberModel = new \app\common\model\Member();
            $prePaid = $memberModel->where("mch_id=$mchId and user_id=$userId")->lock(true)->value('pre_paid');
            if ($prePaid < $order['price']) {
                return error(Code::PRE_PAID_NOT_ENOUGH);
            }
            //减去豆豆
            $result = $memberModel->where("mch_id=$mchId and user_id=$userId")->update(['pre_paid' => ['exp', 'pre_paid-' . $order['price']]]);
            if (!$result) {
                return error(Code::VALIDATE_ERROR, '支付时保存用户信息失败，请重试！');
            }
            $log = new \app\common\model\PrePaid();
            $result = $log->save([
                'mch_id' => $mchId,
                'user_id' => $userId,
                'num' => -$order['price'],
                'note' => '消费',
                'order_id' => $order['order_id'],
            ]);
            if (!$result) {
                Db::rollback();
                return error(Code::VALIDATE_ERROR, '保存豆豆使用记录失败！');
            }
            //更新订单
            $result = ( new Order())->paySuccess($order, Order::SITEPAY);
            if (!$result) {
                Db::rollback();
                return error(Code::VALIDATE_ERROR, '保存订单记录失败！');
            }
            // 提交事务
            Db::commit();
            //成功时要送的优惠券
            $sendCoupon = (new Order())->getSendCoupon($order);
            return success(['send_coupon' => $sendCoupon]);
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::VALIDATE_ERROR, $e->getMessage());
        }
    }

}
