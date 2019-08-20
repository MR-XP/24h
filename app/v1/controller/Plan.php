<?php

namespace app\v1\controller;

use app\v1\model;
use app\common\component\Code;

class Plan extends Base {

    /**
     * 可预约课程
     */
    public function search() {
        $model = new model\ClassPlan();
        $data = $this->request->param();
        isset($data['type']) || $data['type'] = ['neq',3];
        return success($model->search($this->merchant['mch_id'], $data, 0));
    }

    /**
     * 课程详情
     */
    public function getPlanInfo() {
        $planId=$this->request->param('plan_id');
        $plan = model\ClassPlan::get(['plan_id'=>$planId,'status'=> model\ClassPlan::STATUS_ENABLE,'mch_id'=> $this->merchant['mch_id']]);
        if (!$plan) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        $plan->shop;
        $plan['course'] = model\Course::get($plan['course_id']);
        $plan['coach'] = model\Coach::get(['user_id'=>$plan['coach_user_id'],'mch_id'=> $this->merchant['mch_id']]);
        $plan['coach']['speciality'] = explode(",", $plan['coach']['speciality']);
        $plan['coach']['avatar']=$plan['coach']->user->avatar;
        return success($plan);
        
    }

}
