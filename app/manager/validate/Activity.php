<?php

namespace app\manager\validate;

use think\Validate;
use app\manager\model;

class Activity extends Validate {

    protected $rule = [
        'name' => 'require|checkUnique:name',
        'data' => 'require',
        'values' => 'require',

    ];
    protected $message = [
        'name.require' => '请填写活动名',
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
        return model\Activity::where($where)->count() === 0;
    }

}
