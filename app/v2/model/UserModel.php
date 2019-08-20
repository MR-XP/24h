<?php

namespace app\v2\model;

class UserModel extends \app\common\model\User {

    /**
     * 检查用户
     * @param array $where
     * @return array
     */
    public function check_user($where) {
        $field = 'user_id,union_id';
        return $this->field($field)->where($where)->find();
    }

    /**
     * 新增用户
     * @param array $data
     * @return int
     */
    public function add_user($data) {
        return $this->insertGetId($data);
    }

    /**
     * 获取用户基本信息
     * @param array $where
     */
    public function get_user_info($user_id) {

        $field = 'user_id,nick_name,real_name,sex,height,weight,birthday,avatar,hope,phone,create_time';
        $where = ['user_id' => $user_id, 'status' => 1];
        return $this->field($field)->where($where)->find();
    }

    /**
     * 更新用户资料
     * @param type $user_id
     * @param type $data
     * @return type
     */
    public function update_user($user_id, $data) {
        $where = ['user_id' => $user_id, 'status' => 1];
        return $this->where($where)->update($data);
    }

}
