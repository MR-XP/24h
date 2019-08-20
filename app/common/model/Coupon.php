<?php

namespace app\common\model;

use app\common\component\Code;

/**
 * 优惠券
 */
class Coupon extends Base {

    protected $table = 'mch_coupon';
    protected $insert = ['create_time'];
    protected $append = ['type_text'];

    const TYPE_DISCOUNT = 1; //折扣 
    const TYPE_CASH = 2; //现金

    protected $_type = [
        1 => '折扣',
        2 => '现金'
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getTypeTextAttr($value, $data) {
        return get_format_state($data['type'], $this->_type);
    }

    //根据订单获取需要发放的优惠券
    public function getSendCoupon($order) {
        $where = [
            'send_type' => $order['type'] == Order::TYPE_BUY_CARD ? 'BUY_CARD' : '--',
            'relation_id' => $order['product_id'],
            'status' => Coupon::STATUS_ENABLE,
            'expire_time' => ['gt', get_now_time('Y-m-d H:i:s')]
        ];
        return $this->where($where)->find();
    }

    //发放优惠券
    public function sendCoupon($coupon, $userId) {
        $coupon['user_id'] = $userId;
        $coupon['status'] = CouponUser::STATUS_UNUSED;
        unset($coupon['create_time']);
        $model = new CouponUser();
        $result = $model->allowField(true)->data($coupon->toArray(), true)->save();
        if ($result) {
            return success($model);
        } else {
            return error(Code::VALIDATE_ERROR, $model->getError());
        }
    }

}
