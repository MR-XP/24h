<?php

namespace app\common\model;

use think\Db;
use app\common\component\Code;

/**
 * 商户模型
 */
class Merchant extends Base {

    protected $table = 'sys_merchant';
    protected $insert = ['create_time', 'status' => 1, 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function detail() {
        return $this->hasOne('MerchantDetail', 'mch_id', 'mch_id');
    }

}
