<?php

namespace app\common\model;

/**
 * 用户的优惠券
 */
class CouponUser extends Base {

    protected $table = 'mch_coupon_user';
    protected $insert = ['create_time'];

    const STATUS_UNUSED = 0;        //未使用
    const STATUS_USED   = 1;        //已使用
    const STATUS_GIVED  = 2;        //已赠送
    const TYPE_DISCOUNT  = 1;       //折扣优惠劵
    const TYPE_CASH  = 2;           //现金优惠劵

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

}
