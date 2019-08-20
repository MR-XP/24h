<?php

namespace app\manager\validate;

use think\Validate;
use \app\manager\model\User;

/**
 * 用户登录验证
 */
class UserLogin extends Validate {

    protected $rule = [
        'username' => 'require',
        'password' => 'require|checkPassword',
        'verify_code' => 'require|captcha',
    ];
    protected $message = [
        'username.require' => '用户名必埴',
        'password.require' => '密码必填',
        'password.checkPassword' => '用户名或密码错误',
        'verify_code.require' => '验证码必填',
        'verify_code.captcha' => '验证码错误',
    ];

    protected function checkPassword($value, $rule, $data) {
        $user = User::get(['username' => $data['username'],'status'=> User::STATUS_ENABLE]);
        if (!$user) {
            return false;
        }
        return password_check($value, $user['password']);
    }

}
