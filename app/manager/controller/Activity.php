<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

class Activity extends Base {

    /**
     * 获取球队列表
     */
    public function getTeamList() {
        $model = new model\ActivityTeam();
        $shopId = input('shop_id', 0);
        $list = $model->getList(1, $shopId);
        if ($list) {
            return success($list);
        }
        else{
            return error(0,'没有球队');
        }

    }

    /**
     * @desc 编辑活动
     * @return array
     */
    public function save()
    {
        $model = new model\Activity();
        $validate = new validate\Activity();
        $data = input('post.');
        $data['mch_id'] = $this->mchId;
        isset($data['id']) || $data['id'] = 0;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data['id'] > 0 && $model->isUpdate(true);
        $result = $model->data($data, true)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }

    /**
     * @desc 获取活动列表
     * @return array
     */
    public function getList() {
        $model = new model\Activity();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    /**
     * @desc 获取用户参与的活动列表
     * @return array
     */
    public function getUserList() {
        $model = new model\UserActivity();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

}
