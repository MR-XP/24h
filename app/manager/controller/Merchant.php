<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;
use app\common\component\WeChat;
use app\v1\model\FeedBackModel;

/*
 * 课程
 */

class Merchant extends Base {

    //添加保存
    public function save() {
        $model = new model\Merchant();
        $validate = new validate\Merchant();
        if ($this->request->isAjax()) {
            $data = $this->request->param();
            $data['mch_id'] = $this->mchId;
            if (!$validate->check($data)) {
                return error(Code::VALIDATE_ERROR, $validate->getError());
            }
            $data[$model->getPk()] > 0 && $model->isUpdate(true);
            $result = $model->data($data)->save();
            $model->detail->save($data['detail']);
            if ($result === false) {
                return error(Code::SAVE_DATA_ERROR);
            }
            return success($model->getData());
        } else {
            $result = $model->with('detail')->find($this->mchId);
            return success($result);
        }
    }

    /**
     * 自定义菜单 
     * @return type
     */
    public function menu() {
        $model = new model\Merchant();
        $wechat = WeChat::instance($model->with('detail')->find($this->mchId));
        if ($this->request->isPost()) {
            $data = input('');
            $data = json_encode($data['data']['menu'],JSON_UNESCAPED_UNICODE);
            return $wechat->setMenu($data);
        } else {
            return $wechat->getMenu();
        }
    }
    /**
     * 返回反馈信息
     */
    public function showFeedBack(){

        $model = new model\FeedBack();

        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->showFeedBack($this->mchId, $data, $pageNo, $pageSize);
    }

}
