<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 场馆分组
 */

class Shopgroup extends Base {

    //获取列表
    public function getList() {
        $model = new model\ShopGroup();
        $shopModel = new model\Shop();
        $result = $model->where('mch_id', $this->mchId)->select();
        return success(['group' => $result, 'shop' => $shopModel->search($this->mchId, ['status' => 1], 0)]);
    }

    //查询
    public function search() {
        $model = new model\ShopGroup();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->search($this->mchId, $data, $limit));
    }

    //添加保存
    public function save() {
        $model = new model\ShopGroup();
        $validate = new validate\ShopGroup();
        $data = $this->request->param();
        $data['mch_id'] = $this->mchId;
        isset($data['group_id']) || $data['group_id'] = 0;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data['group_id'] > 0 && $model->isUpdate(true);
        $model->data($data, true);
        $result = $model->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }
}
