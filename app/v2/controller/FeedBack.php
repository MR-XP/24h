<?php

namespace app\v2\controller;

use app\v2\model;
use app\common\component\Code;
use think\Db;

class FeedBack extends Base {

    public function addFeedBack() {
        $data = input('');
        if (empty($content)) {
            return error(0, '信息不能为空');
        }
        Db::startTrans();
        try{
            $data['mch_id']         = $this->merchant['mch_id'];
            $data['user_id']        = $this->user['user_id'];
            $data['create_time']    = get_now_time();
            $result = model\FeedBack::create($data,true);
            if ($result) {
                Db::commit();
                return success('反馈已提交');
            }else {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
        }catch (\Exception $e){
            Db::rollback();
            return error(0,'反馈提交失败！');
        }
    }

    public function getFeedBackList(){
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        $model = new model\FeedBack();
        return $model->getFeedBackList($this->merchant['mch_id'],$this->user['user_id'],$pageNo,$pageSize);
    }

}


