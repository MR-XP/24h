<?php

namespace app\manager\validate;

use think\Validate;

/**
 * 教练验证
 */
class Coach extends Validate {

    protected $rule = [
        'user_id' => 'require|checkUser',
    ];
    protected $message = [
        'user_id.require' => '请选择一个用户',
        'user_id.checkUser' => '请选择正确的用户',
        'phone.require' => '手机号必填',
        'phone.regex' => '错误的手机号',
    ];

    protected function checkUser($value, $rule, $data) {
        $user = \app\manager\model\User::get($value);
        if (!$user) {
            return false;
        }
        $where = [];
        $where['user_id'] = $value;
        if (isset($data['coach_id']) && $data['coach_id'] > 0) {
            $where['coach_id'] = array('neq', $data['coach_id']);
        }
        return \app\manager\model\Coach::where($where)->count() === 0;
    }

}
