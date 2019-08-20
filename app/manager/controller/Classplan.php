<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

class Classplan extends Base {
    //查询
    public function search() {
        $model = new model\ClassPlan();
        $data = input('');
        $limit = input('limit',0);
        return success($model->search($this->mchId, $data, $limit));
    }
    //添加保存
    public function save() {
        $model = new model\ClassPlan();
        $validate = new validate\ClassPlan();
        $data = input('post.');
        isset($data['plan_id']) || $data['plan_id'] = 0;
        $data['mch_id'] = $this->mchId;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        if($data['plan_id']>0){
            $plan = model\ClassPlan::get($data['plan_id']);
            if($plan['end_time']<=get_now_time('Y-m-d H:i:s')){
                return error(Code::VALIDATE_ERROR, '课程已结束，不能编辑');
            }
        }

        if ($data['type'] != model\Course::TYPE_PRIVATE) {
            $course = model\Course::get($data['course_id']);
            $data['course_name'] = $course['course_name'];
            $data['min_count'] = $course['min_user'];
            $data['max_count'] = $course['max_user'];
        } else {
            $data['min_count'] = $data['max_count'] = 1;
        }
        $coach = model\User::get($data['coach_user_id']);
        $data['coach_name'] = $coach['real_name'];
        $data['plan_id'] > 0 && $model->isUpdate(true);
        $result = $model->data($data)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }
    //取消
    public function cancel() {
        $planId = input('plan_id');
        $plan = model\ClassPlan::get($planId);
        if ($plan) {
            $appointments = model\Appointment::all(['status' =>  model\Appointment::STATUS_ENABLE , 'plan_id' => $plan['plan_id']]);
            $count = count($appointments);
            
            //过期课程无法取消
            if($plan['end_time']<=get_now_time('Y-m-d H:i:s')){
                return error(Code::VALIDATE_ERROR, '课程已结束，不能取消');
            }
            
            //有人预约，一并清除会员的预约记录
            if ($count > 0) {
                foreach($appointments as $appt){
                    $appt->save([
                        'cancel_type'   =>  model\Appointment::CANCEL_TYPE_ABNORMAL,
                        'cancel_from'   =>  model\Appointment::CANCEL_BY_MASTER,
                        'status'        =>  model\Appointment::STATUS_DELETED
                    ]);
                }
                $plan->status = model\ClassPlan::STATUS_DISABLE;
            }else{
                $plan->status = model\ClassPlan::STATUS_DELETED;
            }

            return success($plan->save());
            
        } else {
            return error(Code::VALIDATE_ERROR, '未找到排课信息');
        }
    }
    //复制
    public function copy() {
        $model = new model\ClassPlan();
        $data = $this->request->param();
        !isset($data['shop_id']) && $data['shop_id'] = 0;
        !isset($data['plan_id']) && $data['plan_id'] = 0;
        !isset($data['type']) && $data['type'] = 0;
        !isset($data['coach_user_id']) && $data['coach_user_id'] = 0;
        !isset($data['copy_type']) && $data['copy_type'] = 'day';
        return $model->copyPlan($this->mchId, $data['shop_id'], $data['type'], $data['coach_user_id'], $data['plan_id'], $data['day'], $data['copy_type']);
    }
}
