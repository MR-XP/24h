<?php

namespace app\v1\model;

class CodeModel extends \think\Model {

    protected $table = 'sms_verify_code';

    //验证数据
    public function check_code($phone) {
        $where = ['phone' => $phone];
        return db($this->table)->where($where)->order('create_time desc')->find();
    }

    //保存验证码
    public function add_code($phone, $code) {
        $data = ['phone' => $phone, 'code' => $code, 'create_time' => get_now_time('Y-m-d H:i:s')];
        return db($this->table)->insert($data);
    }

    //更新验证码
    public function update_code($phone, $data) {
        $where = ['phone' => $phone];
        return db($this->table)->where($where)->update($data);
    }

    public function get_time_count($phone) {
        $start = get_now_time('Y-m-d');
        $end = date('Y-m-d', strtotime('+1 day'));
        $where = ['phone' => $phone, 'create_time' => ['between', [$start, $end]]];
        return db($this->table)->where($where)->count();
    }

}
