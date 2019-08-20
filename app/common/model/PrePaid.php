<?php

namespace app\common\model;

/**
 * 豆豆使用记录
 */
class PrePaid extends Base {

    protected $table = 'log_pre_paid';
    protected $insert = ['create_time'];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

}
