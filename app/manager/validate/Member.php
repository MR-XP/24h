<?php

namespace app\manager\validate;

use think\Validate;

/**
 * 添加会员验证
 */
class Member extends Validate {

    protected $rule = [
        'real_name' => 'require',
        'phone' => 'require|regex:/1[23456789]{1}\d{9}$/',
    ];
    protected $message = [
        'real_name.require' => '姓名必填',
        'phone.require' => '手机号必填',
        'phone.regex' => '错误的手机号',
        //'phone.checkUnique' => '手机号已存在',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        return true;
        $where = [];
        $where[$rule] = $value;
        if (isset($data['user_id']) && $data['user_id'] >= 0) {
            $where['user_id'] = array('neq', $data['user_id']);
        }
        return \app\manager\model\User::where($where)->count() === 0;
    }

}
