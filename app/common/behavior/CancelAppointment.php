<?php

namespace app\common\behavior;

use think\Log;
use \app\common\model;
use \app\common\component;

/**
 * 取消预约
 */
class CancelAppointment {

    //参数为appointment实体，匆进行写操作
    public function run(&$params) {
        $plan = model\ClassPlan::get($params['plan_id']);
        if ($plan) {
            $course = model\Course::get($plan['course_id']);
            $coach = model\Member::get(['user_id' => $plan['coach_user_id']]);
            $member = model\Member::get(['user_id' => $params['user_id']]);
            $merchant = model\Merchant::get($plan['mch_id']);
            $wechat = component\WeChat::instance($merchant);
            $sender = component\sms\Sender::instance();
            $sResult = $wResult = [];
            $planTime = date('Y-m-d H:i', strtotime($plan['start_time']));
            switch ($course['type']) {
                case model\Course::TYPE_PRIVATE://私教课
                    //短信通知
                    $sResult = $sender->sendSms($coach['phone'], [$planTime], 208712);
                    //公众号通知
                    $wResult = $wechat->send($coach['open_id'], "您于{$planTime}待上课程已被用户单方面取消");
                    break;
               default :
                    if ($course['min_user'] > $plan['user_count']) { //人数达到上课人数

                    }
                    break;
            }
            Log::write('cancel appointment id ' . $params['appointment_id'] . ':' . json_encode($sResult) . ',' . json_encode($wResult));
        }
    }

}
