<?php

namespace app\v1\controller;

use app\v1\model;
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
