<?php

namespace app\v2\controller;

use app\v2\model;
use app\v2\model\MemberPlanModel;
use app\common\component\Code;

class MemberPlan extends Base {

    /**
     * 我的约课
     */
    public function getPlanList() {
        $data = [];
        $data['sign']= input('sign');
        $data['user_id'] = $this->user['user_id'];
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        $model = new model\Appointment();
        return $model->getList($this->merchant['mch_id'], $data, $pageNo, $pageSize);
    }

    /*
     * 新版我的预约
     */
    public function getMyMake(){
        $data = input('');
        $model = new model\Appointment();
        return success($model->getMyMake($this->merchant['mch_id'],$this->user,$data));
    }

    /**
     * 预约
     */
    public function make() {
        $model = new model\Appointment();
        $data = $this->request->param();
        $planId = isset($data['plan_id']) ? $data['plan_id'] : 0;
        $isExper = isset($data['is_exper']) ? $data['is_exper'] : 0;
        $shopId = isset($data['shop_id']) ? $data['shop_id'] : 0;
        $createType = 0; //自己预约
        $plan = model\ClassPlan::get(['plan_id' => $planId, 'status' => model\ClassPlan::STATUS_ENABLE]); //查找排课
        if (!$plan) {
            return error(Code::PLAN_NOT_FOUND);
        }
        
        //检查类型
        $validate = [];
        if ($plan['type'] == model\Course::TYPE_PUBLIC) {
            $validate = ['card', 'exper', 'shop_rule', 'is_open'];
        } elseif ($plan['type'] == model\Course::TYPE_PRIVATE  || $plan['type'] == model\Course::TYPE_GROUP) {
            $validate = ['sold_course', 'shop_rule', 'is_open'];
        }
        
        //检查课程
        $soldCourse = [];
        if(isset($data['sold_course_id'])){
            $soldCourse['sold_course_id'] = $data['sold_course_id'];
        }else{
            $course = new model\SoldCourse();
            $soldCourse = $course->searchSold($this->merchant['mch_id'],$this->user['user_id'],$plan['course_id']);
            
            //大吃小，二次确认
            if($soldCourse['code']==2){
                $soldCourse['shopId']= $shopId;
                $soldCourse['isExper']= $isExper;
                $soldCourse['createType']= $createType;
                $soldCourse['validate']= $validate;
                $soldCourse['planId'] = $planId;
                return $soldCourse;
            }
        }

        return $model->make($this->merchant['mch_id'], $shopId, $planId, $soldCourse['sold_course_id'], $this->user['user_id'], $isExper, $createType, $validate);
    }
    
    /**
     * 高级预约  大吃小
     */
    public function seniorMake() {
        $model = new model\Appointment();
        $data = $this->request->param();
        $data = $data['data'];
        
        if(!empty($data)){
            return $model->make($this->merchant['mch_id'], $data['shopId'], $data['planId'],$data['sold_course_id'] , $this->user['user_id'], $data['isExper'], $data['createType'], $data['validate']);
        }
    }

    public function cancel() {
        $model = new model\Appointment();
        $data = $this->request->param();
        $cancelFrom = 1; //自己取消
        $cancelType = 1; //正常取消
        return $model->cannel($this->merchant['mch_id'], $data['appointment_id'], $cancelFrom, $cancelType);
    }
    /**
     * 确认上课结束
     */
    public function savePlanSign() {
        $appointmentId = $this->request->param('appointment_id');
        $appointment = model\Appointment::get([
                    'appointment_id' => $appointmentId,
                    'user_id' => $this->user['user_id'],
                    'status' => model\Appointment::STATUS_ENABLE]);
        if (!$appointment) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        if (strtotime($appointment['end_time']) > get_now_time()) {
            return error(Code::VALIDATE_ERROR, '课程还未结束！');
        }
        //公开课，签到，未签到状态可以确认
        if ($appointment['plan_type'] == model\Course::TYPE_PUBLIC && $appointment['sign'] > 1) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        //收费课，教练确认后可确认
        if ($appointment['plan_type'] != model\Course::TYPE_PUBLIC && $appointment['sign'] != 2) {
            return error(Code::VALIDATE_ERROR, '请等待教练确认！');
        }
        $appointment['sign']= 3;
        $result = $appointment->save();
        if($result===false){
            return error(Code::SAVE_DATA_ERROR);
        }else{
            return success($appointment);
        }
    }

}
