<?php

namespace app\v1\controller;

use app\v1\model\CoachApplication;
use app\v1\model\CoachModel;
use app\v1\model;

class Coach extends Base {

    public function getCoachList() {
        $data = $this->request->param();
        $model = new model\Coach();
        $list = $model->getCoachList($this->merchant['mch_id'], $data);
        return success($list);
    }

    public function getCoachInfo() {
        $coach_id = input('post.coach_id');
        $Coach = new CoachModel();
        $info = $Coach->get_coach_info($this->merchant['mch_id'], $coach_id);
        return success($info);
    }

    //教练申请资料
    public function createCoachApplication() {
        $validate = new \app\v1\validate\CoachApplication();
        $model = new CoachApplication();
        $data = input('');
        $data['user_id'] = $this->user['user_id'];
        $data['mch_id'] = $this->merchant['mch_id'];
        if (!array_key_exists('application_id', $data)) {
            $data['application_id'] = 0;
        }
        $coachApplication = $model->checkStatus($data['mch_id'], $data['user_id'], 2);
        if ($coachApplication) {
            $data['application_id'] = $coachApplication['application_id'];
            $data['status'] = 0;
        }
        if (!$validate->check($data)) {
            return error(0, $validate->getError());
        }
        if (isset($data['application_id']) && $data['application_id'] > 0) {
            $model->isUpdate(true);
        }
        $model->data($data,true);
        $result = $model->save();
        if ($result === false) {
            return error(0);
        }
        return success($model->getData());
    }

}
