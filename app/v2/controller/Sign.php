<?php

namespace app\v2\controller;

use app\v2\model;

class Sign extends Base {

    //获取列表
    public function getList() {
        $model = new model\Sign();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size',100000);

        //没有传userId,默认当前userId
        empty($data['user_id']) && $data['user_id']= $this->user['user_id'];
        //没有传shopId,默认为空
        empty($data['sold_card_id']) && $data['sold_card_id']= '';

        return $model->getList($this->merchant['mch_id'], $data, $pageNo, $pageSize);
    }

}
