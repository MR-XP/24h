<?php

namespace app\common\model;

/**
 * 店铺分组
 */
class ShopGroup extends Base {

    protected $table = 'mch_shop_group';

    public function setShopsAttr($value) {
        return implode(",", $value);
    }

    public function getShopsAttr($value) {
        if (empty($value)) {
            return [];
        } else {
            return explode(",", $value);
        }
    }

}
