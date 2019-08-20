<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 课程
 */

class Course extends Base {

    //获取列表
    public function getList() {
        $model = new model\Course();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //查询
    public function search() {
        $model = new model\Course();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->search($this->mchId, $data, $limit));
    }

    //添加保存
    public function save() {
        $model = new model\Course();
        $validate = new validate\Course();
        $data = $this->request->param();
        $data['mch_id'] = $this->mchId;
        if (!$validate->check($data)) { 
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data[$model->getPk()] > 0 && $model->isUpdate(true);
        $model->data($data);
        $model->images = $data['images'];
        $model->groups = $data['groups'];
        $result = $model->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }

}
