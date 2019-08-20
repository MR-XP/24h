<?php

namespace app\v2\validate;

use think\Validate;

class UserSign extends Validate {

    protected $rule = [
        'real_name' => 'require',
        //'password' => 'require',
//        'repassword' => 'require|confirm:password',
        'phone' => 'require|regex:/1[23456789]{1}\d{9}$/',
        'code' => 'require',
    ];
    protected $message = [
        'real_name.require' => '姓名不能为空',
        'password.require' => '密码必填',
//        'repassword.require' => '确认密码必填',
//        'repassword.confirm' => '两次输入的密码不一至',
        'phone.require' => '手机号不能为空',
        'phone.regex' => '错误的手机号',
//        'phone.checkUnique' => '手机号已存在',
        'code.require' => '验证码不能为空',
    ];
    protected $scene = [];

    // 验证唯一性
//    protected function checkUnique($value, $rule, $data) {
//        $where = [];
//        $where[$rule] = $value;
//        $model = new \app\v1\model\UserModel();
//        $res = $model->check_user($where);
//        if ($res) {
//            return false;
//        } else {
//            return true;
//        }
//    }

}
