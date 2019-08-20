<?php

namespace app\manager\validate;

use think\Validate;

class Shop extends Validate {

    protected $rule = [
        'shop_name' => 'require|checkUnique:shop_name',
    ];
    protected $message = [
        'shop_name.require' => '请填写场馆名称',
        'shop_name.checkUnique' => '场馆名称已存在',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        $where = [];
        $where[$rule] = $value;
        $where['mch_id'] = $data['mch_id'];
        if (isset($data['shop_id']) && $data['shop_id'] > 0) {
            $where['shop_id'] = array('neq', $data['shop_id']);
        }
        return \app\manager\model\Shop::where($where)->count() === 0;
    }

}
