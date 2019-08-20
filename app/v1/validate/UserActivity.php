<?php

namespace app\v1\validate;

use think\Validate;
use app\v1\model;

class UserActivity extends Validate {

    protected $rule = [
        'data' => 'require',
        'values' => 'require',

    ];
    protected $message = [
        'data.require' => '请填写活动数据',
        'values.require' => '请填写活动有效数据',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        return true;
        $where = [];
        $where[$rule] = $value;
        $where['mch_id'] = $data['mch_id'];
        if (isset($data['id']) && $data['id'] > 0) {
            $where['id'] = array('neq', $data['id']);
        }
        return model\UserActivity::where($where)->count() === 0;
    }

}
