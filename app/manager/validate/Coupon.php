<?php

namespace app\manager\validate;

use think\Validate;
use app\manager\model;

class Coupon extends Validate {

    protected $rule = [
        'cover' => 'require',
        'coupon_name' => 'require|checkUnique:coupon_name',
        'type' => 'require|in:1,2',
        'discount_value' => 'require|gt:0',
        'send_type' => 'require',
        'expire_time' => 'require',
    ];
    protected $message = [
        'cover.require' => '请上传封面',
        'coupon_name.require' => '请填写优惠券名称',
        'coupon_name.checkUnique' => '优惠券名称已存在',
        'type.require' => '请选择优惠券类型',
        'discount_value.require' => '请填写折扣值',
        'send_type.require' => '请填写发送方式',
        'expire_time.require' => '请填写过期时间',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        return true;
        $where = [];
        $where[$rule] = $value;
        $where['mch_id'] = $data['mch_id'];
        if ($data['coupon_id'] > 0) {
            $where['coupon_id'] = array('neq', $data['coupon_id']);
        }
        return model\Coupon::where($where)->count() === 0;
    }

}
