<?php

namespace app\v2\controller;

use app\v2\model;
use app\common\component\Code;

/*
 * 场馆分组
 */

class Shopgroup extends Base {

    //获取列表
    public function getList() {
        $model = new model\ShopGroup();
        $list = $model->getList($this->merchant['mch_id']);
        return success($list);
    }
}
