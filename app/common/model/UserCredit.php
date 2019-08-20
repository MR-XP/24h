<?php

namespace app\common\model;

/**
 * 积分记录
 */
class UserCredit extends Base {

    protected $table = 'log_user_credit';
    protected $insert = ['status' => 1];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

}
