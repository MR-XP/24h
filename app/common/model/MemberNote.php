<?php

namespace app\common\model;

use app\common\component\Code;

/**
 * 会员备注
 */
class MemberNote extends Base {

    protected $table = 'mch_member_note';
    protected $insert = ['create_time', 'status' => 1];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

}
