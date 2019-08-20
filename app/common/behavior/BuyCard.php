<?php

namespace app\common\behavior;

use think\Log;
use \app\common\model;
use \app\common\component;

/**
 * 购卡成功
 */
class BuyCard {

    public function run(&$params) {
        $order = $params;
        $this->sendCoupon($order);
    }

    //送优惠券
    protected function sendCoupon($order) {
        $model = new model\Coupon();
        $coupon = $model->getSendCoupon($order);
        if ($coupon) { //有优惠券
            $count = model\CouponUser::where(['order_id' => $order['order_id']])->count();//使用了优惠券的订单，不发放优惠券
            $count == 0 && $model->sendCoupon($coupon, $order['user_id']); //发放优惠券
        }
    }

}
