<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 场馆
 */

class Shop extends Base {

    //获取列表
    public function getList() {
        $model = new model\Shop();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //查询
    public function search() {
        $model = new model\Shop();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->search($this->mchId, $data, $limit));
    }
    
    public function searchTwo() {
        $model = new model\Shop();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->searchTwo($this->mchId, $data, $limit));
    }
    
    //添加保存
    public function save() {
        $model = new model\Shop();
        $validate = new validate\Shop();
        $shopDevice = new model\ShopDevice();
        $data = $this->request->param();
        $data['mch_id'] = $this->mchId;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data['shop_id'] > 0 && $model->isUpdate(true);
        $model->allowField(true)->data($data, true);
        $result = $model->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        foreach ($data['devices'] as &$value) {
            $value['shop_id'] = $data['shop_id'];
        }
        $shopDevice->where('shop_id=' . $data['shop_id'])->delete();
        $shopDevice->saveAll($data['devices']);
        return success($model->getData());
    }

    public function online() {
        $shopId = $this->request->param('shop_id');
        $model = new model\User();
        return success($model->getUserByShop($this->mchId, $shopId, 1, ['return' => 'list']));
    }

}
