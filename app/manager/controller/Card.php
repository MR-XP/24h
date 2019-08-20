<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 会员卡
 */

class Card extends Base {

    //获取列表
    public function getList() {
        $model = new model\Card();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //已出售的卡列表
    public function soldCardList() {
        $model = new model\SoldCard();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        isset($data['order']) || $data['order'] = 'a.start_time desc';
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //查询
    public function search() {
        $model = new model\Card();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->search($this->mchId, $data, $limit));
    }

    //添加保存
    public function save() {
        $model = new model\Card();
        $validate = new validate\Card();
        $data = input('post.');
        $data['mch_id'] = $this->mchId;
        isset($data['card_id']) || $data['card_id'] = 0;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data['card_id'] > 0 && $model->isUpdate(true);
        $result = $model->data($data, true)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }

}
