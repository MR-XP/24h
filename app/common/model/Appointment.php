<?php

namespace app\common\model;

use app\common\component\Code;
use think\Db;
use think\Hook;

/**
 * 预约
 */
class Appointment extends Base {

    protected $table = 'mch_appointment';
    protected $insert = ['create_time'];

    public function user() {
        return $this->hasOne('User', 'user_id', 'user_id')->field('user_id,real_name,phone,avatar,sex');
    }

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }
    const SIGN_TYPE_NO=0;//未签到
    const SIGN_TYPE_YES_USER=1;//1签到成功
    const SIGN_TYPE_YES_COACH=2;// 2教练上课确认结束
    const SIGN_TYPE_YES_COVER=3;// 3学员确认结束
    const SIGN_TYPE_YES_EVALUATE=4;// 4：已评价

    const ABSENTEEISM_COUNT=5;//允许旷课条数
    /**
     * 代预约
     */
    const CREATE_BY_MASTER = 1;

    /**
     * 自己取消
     */
    const CANCEL_BY_SELF = 1;
    
    /**
     * 自已预约
     */
    const MAKE_BY_SELF = 1;

    /**
     * 教练取消
     */
    const CANCEL_BY_COACH = 2;

    /**
     * 后台取消
     */
    const CANCEL_BY_MASTER = 3;

    /**
     * 正常取消
     */
    const CANCEL_TYPE_NORMAL = 1;

    /**
     * 异常取消
     */
    const CANCEL_TYPE_ABNORMAL = 2;

    public function classPlan() {
        return $this->hasOne('ClassPlan', 'plan_id', 'plan_id')->field('plan_id,course_name,sold_course_id,course_id,coach_user_id,status,type');
    }

    public function shop() {
        return $this->hasOne('Shop', 'shop_id', 'shop_id','shop_name');
    }

    /**
     * 预约课程
     * @param type $mchId
     * @param type $shopId 私教必选
     * @param type $planId 排课id
     * @param type $soldCourseId 购买的课程id
     * @param type $userId 
     * @param type $isExper 是否体验
     * @param type $createType 0自己预约，1代预约
     * @param type $validate card验证有正常会员卡，exper 体验,sold_course 是否购买课程,shop_rule 场馆高级设置,is_open 开放预约
     * @return type
     */
    public function make($mchId, $shopId, $planId, $soldCourseId, $userId, $isExper, $createType, $validate = ['card', 'exper', 'sold_course', 'shop_rule', 'is_open']) {

        $member = Member::get(['user_id' => $userId, 'mch_id' => $mchId, 'status' => Member::STATUS_ENABLE]);
        if (!$member) {//查找用户
            return error(Code::USER_NOT_FOUND);
        }
        
        //查找排课
        $plan = ClassPlan::get(['plan_id' => $planId, 'status' => ClassPlan::STATUS_ENABLE]); 
        if (!$plan) {
            return error(Code::PLAN_NOT_FOUND);
        }
        //旷课判断
        if($plan['type']==1){
            $absenteeismCount=$this->absenteeism($mchId,$userId);
            if($absenteeismCount>=Appointment::ABSENTEEISM_COUNT){
                return error(Code::VALIDATE_ERROR, '你累计旷课已达'.Appointment::ABSENTEEISM_COUNT.'节，无法再预约免费团课，请前往我的预约消除旷课');
            }
        }
        //重复预约
        if ($this->where(['plan_id' => $plan['plan_id'], 'user_id' => $member['user_id'], 'status' => self::STATUS_ENABLE])->count() > 0) {
            return error(Code::DUPLICATE_APPOINTMENT);
        }
        //时间判断
        $avgTime = time() - strtotime($plan['start_time']);
            //提前预约
            if(strtotime(date('Y-m-d',strtotime($plan['start_time'])))-strtotime(date('Y-m-d'))>60*60*24){
                return error(Code::VALIDATE_ERROR,'课程最多只能提前一天预约哟');
            }
            //成团预约
            if ($plan['user_count']>=$plan['min_count'] && $avgTime >= -3600 && $avgTime < 0 ) {
                return error(Code::VALIDATE_ERROR, '该课程即将开始，不能现在预约，看看其它的课程吧');
            }
            //进行中预约
            if ($plan['user_count']>=$plan['min_count'] && $avgTime >= 0 && $avgTime < 3600) {
                return error(Code::VALIDATE_ERROR, '该课程进行中，不能现在预约，看看其它的课程吧');
            }
            //未成团预约
            if ($plan['user_count']<$plan['min_count'] && $plan['is_lock']==1) {
                return error(Code::VALIDATE_ERROR, '该课程未达到预约人数，已失效！');
            }
            //已结束预约
            if ((time() - strtotime($plan['start_time']))>=3600) {
                return error(Code::VALIDATE_ERROR, '该课程已结束，看看其它课程吧');
            }
        //预约是否已满
        if ($plan['user_count'] >= $plan['max_count']) { 
            return error(Code::PLAN_USER_FULL);
        }
        //非私教预约，更新shopId
        if ($plan['type'] != Course::TYPE_PRIVATE) { 
            $shopId = $plan['shop_id'];
        }
        //检查场馆
        $shop = Shop::get(['shop_id' => $shopId, 'status' => Shop::STATUS_ENABLE]);
        if (!$shop) {
            return error(Code::SHOP_NOT_FOUND);
        }
        //检查购课
        $soldCourse = [];
        if ($plan['type'] != Course::TYPE_PUBLIC) {
            $soldCourse = SoldCourse::get(['sold_course_id' => $soldCourseId, 'user_id' => $userId, 'status' => SoldCourse::STATUS_ENABLE]);
            if (!$soldCourse) {
                return error(Code::SOLD_COURSE_NOT_FOUND);
            }
            
            //私教课预约，更新排课
            if ($plan['type'] == Course::TYPE_PRIVATE) {  
                $plan['course_id'] = $soldCourse['course_id'];
                $plan['course_name'] = $soldCourse['course_name'];
                $plan['shop_id'] = $shopId;
            }
			
        }
        //验证规则
        $result = $this->validateRule($shop, $plan, $member, $soldCourse, $validate);
        if ($result['code'] != Code::SUCCESS) {
            return $result;
        }
        //保存数据
        return $this->saveAppointment($plan, $soldCourse, $member, $createType, $isExper);
    }

    //取消预约
    public function cannel($mchId, $appointmentId, $cancelFrom, $cancelType) {
        Db::startTrans();
        try {
            $appointment = $this->where('appointment_id=' . $appointmentId . ' and status=' . self::STATUS_ENABLE)->lock(true)->find();
            if (!$appointment) {
                return error(Code::APPOINTMENT_NOT_FOUND);
            }
            if (strtotime($appointment['start_time']) < get_now_time()) {
                return error(Code::APPOINTMENT_COURSE_STARTD);
            }
            $plan = ClassPlan::where('plan_id=' . $appointment['plan_id'])->lock(true)->find();
            if ($plan->is_lock) {
                Db::rollback();
                return error(Code::VALIDATE_ERROR, '该课程即将开始,不能取消!');
            }
            $appointment->status = self::STATUS_DELETED;
            $appointment->cancel_type = $cancelType;
            $appointment->cancel_from = $cancelFrom;
            $appointment->cancel_time = get_now_time('Y-m-d H:i:s');
            $result = $appointment->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            $plan->user_count = $plan->user_count - 1;
            if ($plan['type'] == Course::TYPE_PRIVATE) {//私教取消
                $plan->course_id = 0;
                $plan->course_name = '';
                $plan->shop_id = 0;
            }
            $result = $plan->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            if($plan['type'] == Course::TYPE_PRIVATE || $plan['type'] == Course::TYPE_GROUP){
                
                //返还课程
                $soldCourse = SoldCourse::where('sold_course_id='.$appointment->sold_course_id)->lock(true)->find();
                if(isset($soldCourse)){
                    $soldCourse->use_num = $soldCourse->use_num - 1;
                    $result = $soldCourse->save();
                    if ($result === false) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                }
                
                //清除预约的课程ID
                if($plan['type'] == Course::TYPE_GROUP){
                    $arr=explode(',',$plan['sold_course_id']);
                    foreach($arr as $key=>$val){
                        if($val == $appointment->sold_course_id)
                            unset($arr[$key]);                        
                    }
                    $plan->sold_course_id=implode(',',$arr);
                    $result = $plan->save();
                    if ($result === false) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                }
                
            }

            Db::commit();
            Hook::listen('cancel_appointment', $appointment); //取消预约行为
            return success($appointment);
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    //保存预约数据
    public function saveAppointment($plan, $soldCourse, $member, $createType, $isExper) {
        Db::startTrans();
        isset($soldCourse['sold_course_id'])?'':$soldCourse['sold_course_id']=0;
        try {
            $userCount = ClassPlan::where('plan_id=' . $plan['plan_id'])->lock(true)->value('user_count');
            $appointment = new Appointment();
            $result = $appointment->data([
                        'mch_id' => $plan['mch_id'],
                        'shop_id' => $plan['shop_id'],
                        'user_id' => $member['user_id'],
                        'plan_id' => $plan['plan_id'],
                        'plan_type' => $plan['type'],
                        'create_type' => $createType,
                        'start_time' => $plan['start_time'],
                        'end_time' => $plan['end_time'],
                        'is_exper' => $isExper,
                        'status' => self::STATUS_ENABLE,
                        'sold_course_id' => $soldCourse['sold_course_id']
                    ])->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            if ($plan['type'] == Course::TYPE_PRIVATE || $plan['type'] == Course::TYPE_GROUP) { //只有私教课或小团课才扣节数
                $useNum = SoldCourse::where('sold_course_id=' . $soldCourse['sold_course_id'])->lock(true)->value('use_num');
                $result = SoldCourse::where('sold_course_id=' . $soldCourse['sold_course_id'])->update(['use_num' => $useNum + 1]);
                if ($result === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
            }
            $planData = ['user_count' => $userCount + 1];
            $planSoId = ClassPlan::where('plan_id=' . $plan['plan_id'])->lock(true)->value('sold_course_id');
            
            if($plan['type']!=Course::TYPE_PUBLIC){                
                if($plan['type'] == Course::TYPE_GROUP){
                    $planSoId==0?$planData['sold_course_id']= $soldCourse['sold_course_id']:$planData['sold_course_id']= $planSoId.','.$soldCourse['sold_course_id'];
                }else{
                    $planData['sold_course_id'] = $soldCourse['sold_course_id'];
                }
            }
            //$plan['type'] != Course::TYPE_PUBLIC && $planData['sold_course_id'] = $soldCourse['sold_course_id'];            
            if ($plan['type'] == Course::TYPE_PRIVATE) {//私教保存场馆及课程信息
                $planData['course_id'] = $plan['course_id'];
                $planData['course_name'] = $plan['course_name'];
                $planData['shop_id'] = $plan['shop_id'];
            }
            $result = ClassPlan::where('plan_id=' . $plan['plan_id'])->update($planData);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            Hook::listen('make_appointment', $appointment); //预约成功行为
            return success($appointment);
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    //验证预约规则
    protected function validateRule($shop, $plan, $member, $soldCourse, $validate) {
        if (in_array('is_open', $validate) === true) { //开放预约
            if ($plan['is_open'] != 1) {
                return error(Code::PLAN_CLOSED);
            }
        }
        if (in_array('card', $validate) === true) { //会员卡
            $soldCardModel = new SoldCard();
            $result = $soldCardModel->getDefaultCard($plan['mch_id'],$shop['shop_id'],$member['user_id']);
            if ($result['code'] != Code::SUCCESS) {
                return $result;
            }
        }
        if (in_array('exper', $validate) === true) { //体验
            if ($plan['type'] == Course::TYPE_PUBLIC) {
                if ($this->where("mch_id={$plan['mch_id']} and user_id = {$member['user_id']} and is_exper=1 and status=" . self::STATUS_ENABLE)->count() >= 2) {
                    return error(Code::EXPER_USED_UP);
                }
            } else {
                return error(Code::PLAN_PUBLIC_ONLY);
            }
        }
        if (in_array('shop_rule', $validate) === true) { //场馆设置
        }
        if (in_array('sold_course', $validate) === true) { //购课验证
            if ($soldCourse['buy_num'] <= $soldCourse['use_num']) {
                return error(Code::SOLD_COURSE_USED_UP);
            }
            if (strtotime($soldCourse['expire_time']) < get_now_time()) {
                return error(Code::SOLD_COURSE_EXPIRED);
            }
        }

        //同一时间段其他预约
        $where = "mch_id={$plan['mch_id']} and user_id={$member['user_id']} and status=" . self::STATUS_ENABLE . " and (
            (start_time < '{$plan['start_time']}' and end_time > '{$plan['start_time']}')
            or (start_time > '{$plan['start_time']}' and start_time < '{$plan['end_time']}')
            or (start_time = '{$plan['start_time']}' and end_time= '{$plan['end_time']}')
            )";
        if ($this->where($where)->count() > 0) {
            return error(Code::DUPLICATE_OTHER_APPOINTMENT);
        }
        return success('ok');
    }

    /**
     * 付费取消旷课
     * @param type $order
     * @return type
     */
    public function cancelByOrder($order) {
        Db::startTrans();
        try {
            $appointment = self::get(['appointment_id' => $order['product_id']]);
            $appointment['cancel_type'] = self::CANCEL_TYPE_ABNORMAL;
            $appointment['cancel_time'] = get_now_time('Y-m-d H:i:s');
            $appointment['cancel_from'] = self::CANCEL_BY_SELF;
            $appointment['status'] = self::STATUS_DELETED;
            $result = $appointment->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            return success($appointment);
        } catch (\Exception $e) {
            \think\Log::write('cancel appointment' . $e->getMessage());
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }
    /**
     * 计算会员旷课条数
     */
    public function absenteeism($mchId,$userId){
        $where=[];
        $where['user_id']=$userId;
        $where['mch_id']=$mchId;
        $where['plan_type']=Course::TYPE_PUBLIC;
        $where['status']=Appointment::STATUS_ENABLE;
        $result=$this->where($where)->select();
        $count=0;
        $nullTime='0000-00-00 00:00:00';

        if($result){
            foreach ($result as &$v){
                if(($v['sign_time']>=$v['end_time']) || $v['sign_time']==$nullTime && $v['end_time']<get_now_time('Y-m-d H:i:s')){
                    $count+=1;
                }
            }
        }
        return $count;
    }

}
