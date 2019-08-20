<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 优惠券
 */

class Coupon extends Base {

    //获取列表
    public function getList() {
        $model = new model\Coupon();
        $data = $this->request->param();
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //添加保存
    public function save() {
        $model = new model\Coupon();
        $validate = new validate\Coupon();
        $data = $this->request->param();
        $data['mch_id'] = $this->mchId;
        isset($data['coupon_id']) || $data['coupon_id']=0;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data['coupon_id'] > 0 && $model->isUpdate(true);
        $model->allowField(true)->data($data,true);
        $result = $model->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }

}
