<?php

namespace app\manager\validate;

use think\Validate;
use app\manager\model;

class Approval extends Validate {

    protected $rule = [
        'approval_id' => 'require|checkId',
        'product_id' => 'require|number',
        'type' => 'require|number|gt:0',
        'user_id' => 'require|checkUser',
        'buy_num' => 'require|number|gt:0',
        'status' => 'require|in:1,2',
    ];
    protected $message = [
        'approval_id.require' => '请选择代购申请',
        'approval_id.checkId' => '代购申请不存在',
        'product_id.require' => '请选择代购的产品',
        'user_id.require' => '请选择会员',
        'user_id.checkUser' => '会员不存在',
        'buy_num.require' => '购买数量必填',
    ];
    protected $scene = [
        'add' => ['product_id', 'type', 'user_id', 'buy_num'],
        'dispose' => ['approval_id', 'status'],
    ];

    protected function checkId($value, $rule, $data) {
        $where = [];
        $where['approval_id'] = $value;
        $where['mch_id'] = $data['mch_id'];
        $where['status'] = model\Approval::STATUS_WAITING;
        return model\Approval::where($where)->count() > 0;
    }

    protected function checkUser($value, $rule, $data) {
        $where = [];
        $where['user_id'] = $value;
        $where['mch_id'] = $data['mch_id'];
        $where['status'] = model\Member::STATUS_ENABLE;
        return model\Member::where($where)->count() > 0;
    }

}
