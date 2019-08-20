<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/5/15
 * Time: 16:35
 */

namespace app\manager\validate;

class Saleman extends \think\Validate
{
    protected $rule = [
       'status'  =>  'require|in:1,0',
       'phone' => 'require|regex:/1[23456789]{1}\d{9}$/',
       'user_id' => 'require|checkUser:user_id',
    ];

    protected $message = [
      'status.require'  =>  '请设置销售人员状态',
      'user_id.checkUser' => '该手机号已注册',
      'phone.require' => '手机号必填',
      'phone.regex' => '错误的手机号'
    ];

    //验证唯一性
    protected function checkUser($value, $rule, $data) {
        $user = \app\manager\model\User::get($value);
        if (!$user) {
            return false;
        }
        $where[$rule] = $value;
        if (isset($data['saleman_id']) && $data['saleman_id'] > 0) {
            $where['saleman_id'] = array('neq', $data['saleman_id']);
        }
        return \app\manager\model\Saleman::where($where)->count() === 0;
    }

}