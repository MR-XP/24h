<?php

namespace app\manager\validate;

use think\Validate;
use app\manager\model;

class GivePrePaid extends Validate {

    protected $rule = [
        'user_id' => 'require|checkUser',
        'num' => 'require|number',
    ];
    protected $message = [
        'user_id.require' => '请选择会员',
        'user_id.checkUser' => '未找到会员',
        'num.require' => '数量必填',
    ];

    protected function checkUser($value, $rule, $data) {
        $where = [];
        $where['user_id'] = $value;
        $where['mch_id'] = $data['mch_id'];
        $where['status'] = model\Member::STATUS_ENABLE;
        return model\Member::where($where)->count() > 0;
    }

}
