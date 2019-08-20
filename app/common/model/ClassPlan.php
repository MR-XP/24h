<?php

namespace app\common\model;

use think\Db;

/**
 * 排课
 */
class ClassPlan extends Base {

    protected $table = 'mch_class_plan';
    protected $insert = ['create_time', 'status' => 1];

    const TYPE_BUY_CARD = 1;
    const TYPE_BUY_GROUP_COURSE = 2;
    const TYPE_BUY_PRIVATE_COURSE = 3;
    //排课状态  //1正常，2计算业绩（已上课），0取消
    const STATUS_CANCEL=0;
    const STATUS_NORMAL=1;
    const STATUS_COMPLETE=2;

    protected $_type = [
        1 => '会员卡',
        2 => '小团课',
        3 => '私教课'
    ];

    public function shop() {
        return $this->hasOne('Shop', 'shop_id', 'shop_id');
    }

//    public function users() {
//        return $this->hasManyThrough('User', 'Appointment','plan_id','user_id','plan_id');
//    }

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    /**
     * 排课时间重复查询
     * @param type $mchId
     * @param type $coachUserId
     * @param type $startTime
     * @param type $endTime
     * @param type $planId
     */
    public function checkPlanTime($mchId, $coachUserId, $startTime, $endTime, $planId) {
        $where = "mch_id=$mchId and coach_user_id=$coachUserId and status = " . self::STATUS_ENABLE . "
               and ( 
               (start_time<'$startTime' AND end_time>'$startTime') 
                or (start_time>'$startTime' AND start_time<'$endTime')
                or (start_time='$startTime' AND end_time='$endTime')
                )";
        $planId > 0 && $where .= " and plan_id<>$planId";
        //echo($this->where($where)->select(false));die();
        return $this->where($where)->count() === 0;
    }

    /**
     * 复制排课
     * @param type $mchId
     * @param type $shopId 0表示商户所有场馆
     * @param type $type 课程type 1公开，2小团，3私教，0所有
     * @param type $coachUserId 教练的userid,0不限制
     * @param type $planId 排课id,仅复制一个排课
     * @param type $day 开始时间，eg.2017-07-01
     * @param type $copyType day week month
     * @param type $params
     * @return type
     */
    public function copyPlan($mchId, $shopId, $type, $coachUserId, $planId, $day, $copyType, $params = []) {
        $time = $this->get_time_range($day, $copyType);
        $stime = $time[0];
        $etime = $time[1];
        $where = [];
        $where['mch_id'] = $mchId;
        $where['status'] = ["NEQ",self::STATUS_DELETED];
        $shopId > 0 && $where['shop_id'] = $shopId;
        if ($planId > 0) {
            $where['plan_id'] = $planId;
        } else {
            $where['start_time'] = [['egt', date('Y-m-d H:i:s', $stime)], ['elt', date('Y-m-d H:i:s', $etime)]];
            $type > 0 && $where['type'] = $type;
            $coachUserId > 0 && $where['coach_user_id'] = $coachUserId;
        }
        $list = $this->where($where)->select();
        foreach ($list as $value) {
            unset($value['plan_id']);
            unset($value['user_count']);
            unset($value['coach_sign_time']);
            unset($value['coach_sign_out_time']);
            unset($value['create_time']);
            unset($value['is_lock']);
            if ($value['type'] != Course::TYPE_PUBLIC) {
                unset($value['sold_course_id']);
            }
            if ($value['type'] == Course::TYPE_PRIVATE) {
                unset($value['course_id']);
                unset($value['course_name']);
            }
            $oldStart = $value['start_time'];
            $value['start_time'] = date('Y-m-d H:i:s', strtotime("+1 $copyType", strtotime($value['start_time'])));
            $value['end_time'] = date('Y-m-d H:i:s', strtotime("+1 $copyType", strtotime($value['end_time'])));
            if ($copyType == 'month' && date('m', strtotime($oldStart)) + 1 != date('m', strtotime($value['start_time']))) {
                continue; // +1 month 当月有31，下月没有，导致跨两月
            }
            if ($this->checkPlanTime($value['mch_id'], $value['coach_user_id'], $value['start_time'], $value['end_time'], 0) === false) {
                continue; //教练排课时间有冲突
            }
            $model = new self();
            $model->save($value->toArray());
        }
        return success('ok');
    }

    protected function get_time_range($day, $type) {
        $time = strtotime($day . ' 00:00:00');
        switch ($type) {
            case 'week':
                //周的最后一天
                $etime = strtotime(date('Y-m-d 23:59:59', $time) . ' Sunday') + 86399;
                $stime = strtotime(date('Y-m-d 00:00:00', $time) . ' Monday');
                break;
            case 'month':
                $stime = strtotime(date('Y-m-01 00:00:00', $time));
                $etime = strtotime(date('Y-m-t 23:59:59', $time));
                break;
            default :
                $stime = $time;
                $etime = $time + 86399;
                break;
        }
        return [$stime, $etime];
    }

}
