<?php

namespace app\v1\controller;

use app\common\component\Code;
use app\v1\model\Appointment;
use app\v1\model\ClassPlan;
use think\Session;

class Coachinfo extends Base {
    /**
     * 教练个人中心
     */
    public function coachInfo(){
        $model=new \app\v1\model\CoachInfo();
        $info=$model->isCoach($this->user['user_id'],$this->merchant['mch_id']);
        return $info;
    }
    /**
     *私教课程
     */
    public function coachCourse(){
        $model=new \app\v1\model\Course();
        $user_id=$this->user['user_id'];
        $mch_id=$this->merchant['mch_id'];
        $course=$model->getCoachCourse($mch_id,$user_id);
        return $course;
    }
    /**
     * 私教我的预约
     */
    public function coachOrder(){
        $model=new ClassPlan();
        $data=input('');
        isset($data['appointment_status']) || $data['appointment_status'] = 0;
        $user_id=$this->user['user_id'];
        $mch_id=$this->merchant['mch_id'];
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        $coachOrder=$model->getCoachCourse($mch_id,$user_id,$data,$pageNo, $pageSize);
        return $coachOrder;
    }
   /**
     * 私教预约人数
     */
    public function courseMake(){
        
        $model = new ClassPlan();
        $data = input('');
        isset($data['plan_id']) || $data['plan_id'] = '';
        $mchId=$this->merchant['mch_id'];
        $courseMake=$model->getMakeUser($mchId,$data);
        return $courseMake;

    }
    
    /**
     * 教练约课时间
     */
    public function orderTime(){
        $mchId=$this->merchant['mch_id'];
        $userId=$this->user['user_id'];
        $userCount=input('user_count');
        if(!empty(input('start_time'))){
            $start_time=input('start_time');
        }else{
            $start_time='';
        }
        if(!empty(input('end_time'))){
            $end_time=input('end_time');
        }else{
            $end_time='';
        }
        $model=new \app\v1\model\ClassPlan();
        $list=$model->getCourseTime($mchId,$userId,$userCount,$start_time,$end_time);
        if(!$list){
            return error('0','未查询到约课时间');
        }
        return success($list);
    }
    /**
     * 教练的我的相册
     */
    public function coachImage(){
        $userId=$this->user['user_id'];
        $mchId=$this->merchant['mch_id'];
        $model=new \app\v1\model\CoachInfo();
        $list=$model->getcoachImage($mchId,$userId);
//        if(!$list){
//            return error('0','未查询到相册信息');
//        }
        return success($list);
    }
    /**
     * 上传相片
     */
    public function uplodeimages(){
        $data=input('');
        $userId=$this->user['user_id'];
        $mchId=$this->merchant['mch_id'];
        $model=new \app\v1\model\CoachInfo();
        $list=$model->getcoachImage($mchId,$userId);
        $data['coach_id']=0;
        if($list){
            $data['coach_id']=$list['coach_id'];
        }
        $data['user_id']=$userId;
        $data['mch_id']=$mchId;
        $data['status']=\app\v1\model\Order::STATUS_ENABLE;
        $data['coach_id'] > 0 && $model->isUpdate(true);
        $result = $model->data($data, true)->save();

        if ($result == false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($data);
    }
    /**
     * 教练添加时间段
     */
    public function createTime(){
        $userModel=new \app\v1\model\User();
        $model=new ClassPlan();
        $validate=new \app\v1\validate\ClassPlan();
        $data['start_time']=input('start_time');
        $data['end_time']=input('end_time');
        $data['plan_id']=input('plan_id');
        $data['mch_id']=$this->merchant['mch_id'];
        $data['coach_user_id']=$this->user['user_id'];
        $data['type']=3;
        $data['status']=input('status');
        if(!isset($data['plan_id'])){
            $data['plan_id']=0;
        }
        if(!isset($data['status'])){
            $data['status']=1;
        }
        if(!isset($data['is_lock'])){
            $data['is_lock']=0;
        }
        if(!isset($data['is_open'])){
            $data['is_open']=1;
        }
        $userInfo=$userModel->getUserInfo($data['mch_id'],$data['coach_user_id']);
        $data['coach_name']=$userInfo['real_name'];
        $data['min_count']=1;
        $data['max_count']=1;
        $data['create_time']=get_now_time('Y-m-d H:i:s');
        if(!$validate->check($data)){
            return error(0, $validate->getError());
        }
        $data['plan_id'] > 0 && $model->isUpdate(true);
        $result = $model->data($data, true)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($data);
    }
    /**
     * 私教详情
     */
    public function courseDetail(){
        $courseModel=new \app\v1\model\Course();

        $mchId=$this->merchant['mch_id'];
        $longitude = input('longitude'); //经度
        $latitude = input('latitude'); //纬度
        $courseId=input('course_id');
        $planId=input('plan_id');
        if(empty($courseId)){
            return error('0','参数出错了哦');
        }
        if (empty($longitude) || empty($latitude)) {//获取经纬度
            $longitude = Session::get('longitude');
            $latitude = Session::get('latitude');
        }
        $courseDetail=$courseModel->getCourseSign($courseId);
        return $courseDetail;
    }
    /**
     * 复制私教排课
     */
    public function copy() {
        $model = new ClassPlan();
        $data = $this->request->param();
        !isset($data['shop_id']) && $data['shop_id'] = 0;
        !isset($data['plan_id']) && $data['plan_id'] = 0;
        !isset($data['type']) && $data['type'] = 3;
        !isset($data['copy_type']) && $data['copy_type'] = 'day';
        $data['coach_user_id']=$this->user['user_id'];
        return $model->copyPlan($this->merchant['mch_id'], $data['shop_id'], $data['type'], $data['coach_user_id'], $data['plan_id'], $data['day'], $data['copy_type']);
    }
    /**
     * 私教确认上课
     */
    public function sureclass(){
        $appointmentId = $this->request->param('appointment_id');
        $appointment = Appointment::get([
            'appointment_id' => $appointmentId,
            'status' => Appointment::STATUS_ENABLE]);
        if (!$appointment) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        if (strtotime($appointment['end_time']) > get_now_time()) {
            return error(Code::VALIDATE_ERROR, '课程还未结束！');
        }
        $appointment['sign']= 2;
        $result = $appointment->save();
        if($result===false){
            return error(Code::SAVE_DATA_ERROR);
        }else{
            return success($appointment);
        }
    }
}
