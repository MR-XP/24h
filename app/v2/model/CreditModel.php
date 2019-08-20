<?php

namespace app\v2\model;

class CreditModel extends \app\common\model\UserCredit {

    public function get_user_credit($where) {
        $field = "sum(num) as num";
        $count = model($this->table)->field($field)->where($where)->find();
        return $count['num'];
    }

}
