<?php

namespace app\v1\model;

/**
 * 场馆
 */
class ShopGroup extends \app\common\model\ShopGroup {
    public function getList($mchId) {
        $list = $this->where(['mch_id'=>$mchId,'status'=>self::STATUS_ENABLE])->select();
        return $list;
    }
}
