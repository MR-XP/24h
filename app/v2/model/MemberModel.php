<?php

namespace app\v2\model;

use think\Paginator;

class MemberModel extends \app\common\model\Member {

    protected $table = 'mch_member';

    public function getcards($where) {
        return model($this->table)->where($where)->paginate(3);
    }

}
