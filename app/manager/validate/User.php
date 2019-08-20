<?php

namespace app\manager\validate;

use think\Validate;

/**
 * 用户验证
 */
class User extends Validate {

    protected $rule = [
        'username' => 'require|alphaDash|checkUnique:username',
        'password' => 'require',
        'repassword' => 'require|confirm:password',
        'real_name' => 'require',
        'phone' => 'require|regex:/1[34578]{1}\d{9}$/|checkUnique:phone',
        'old_password' => '',
    ];
    protected $message = [
        'username.require' => '用户名必埴',
        'username.checkUnique' => '登录名称已存在',
        'username.checkUsername' => '登录名称已存在',
        'password.require' => '密码必填',
        'repassword.require' => '确认密码必填',
        'repassword.confirm' => '两次输入的密码不一至',
        'real_name.require' => '姓名必填',
        'phone.require' => '手机号必填',
        'phone.regex' => '错误的手机号',
        'phone.checkUnique' => '手机号已存在',
        'old_password.require' => '原密码必填写',
        'old_password.checkPassword' => '原密码错误',
    ];
    protected $scene = [
        'edit' => ['real_name', 'phone', 'repassword' => 'confirm:password', 'username' => 'checkUsername'],
        'change' => ['old_password' => 'require|checkPassword', 'password', 'repassword'],
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        $where = [];
        $where[$rule] = $value;
        if (isset($data['user_id']) && $data['user_id'] > 0) {
            $where['user_id'] = array('neq', $data['user_id']);
        }
        return \app\manager\model\User::where($where)->count() === 0;
    }

    protected function checkUsername($value, $rule, $data) {
        $user = \app\manager\model\User::get($data['user_id']);
        if (!empty($user['username']) && $user['username'] != $value) {
            return false;
        }
        return $this->checkUnique($value, 'username', $data);
    }

    protected function checkPassword($value) {
        $user = session('admin');
        return password($value) == $user['password'];
    }

}
