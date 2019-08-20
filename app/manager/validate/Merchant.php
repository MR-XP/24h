<?php

namespace app\manager\validate;

use think\Validate;

class Merchant extends Validate {

    protected $rule = [

    ];
    protected $message = [

    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        $where = [];
        $where[$rule] = $value;
        if (isset($data['mch_id']) && $data['mch_id'] > 0) {
            $where['mch_id'] = array('neq', $data['mch_id']);
        }
        return \app\manager\model\Merchant::where($where)->count() === 0;
    }

}
