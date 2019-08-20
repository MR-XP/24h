<?php

namespace app\v2\model;

class PaidModel extends \app\common\model\PrePaid {

    // 获取储值数
    public function get_user_paid($user_id) {
        $where = ['user_id' => $user_id];
        $field = " sum(num) as num ";
        $result = $this->field($field)->where($where)->find();

        if (empty($result['num'])) {
            $num = 0.00;
        } else {
            $num = $result['num'];
        }
        return $num;
    }

}
