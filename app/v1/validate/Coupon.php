<?php

namespace app\v1\validate;

use think\Validate;
use app\v1\model;

class Coupon extends Validate {

    protected $rule = [
        'coupon_user_id' => 'require|checkCoupon',
        'phone' => 'require|regex:/1[34578]{1}\d{9}$/|checkPhone',
    ];
    protected $message = [
        'coupon_user_id.require' => '请选择一个可用优惠券',
        'coupon_user_id.checkCoupon' => '请选择一个可用优惠券',
        'phone.require' => '请填写对方手机号',
        'phone.checkPhone' => '未找到该用户',
    ];
    protected $scene = [
        'give' => ['coupon_user_id', 'phone'],
    ];

    protected function checkCoupon($value, $rule, $data) {
        $where = [];
        $where['mch_id'] = $data['mch_id'];
        $where['user_id'] = $data['user_id'];
        $where['coupon_user_id'] = $value;
        $where['status'] = model\CouponUser::STATUS_UNUSED;
        $where['expire_time'] = ['gt', get_now_time('Y-m-d H:i:s')];
        return model\CouponUser::where($where)->count() > 0;
    }

    protected function checkPhone($value, $rule, $data) {
        $where = [];
        $where['phone'] = $value;
        $where['mch_id'] = $data['mch_id'];
        $where['status'] = model\Member::STATUS_ENABLE;
        return model\Member::where($where)->count() > 0;
    }

}
