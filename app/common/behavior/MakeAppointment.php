<?php

namespace app\common\behavior;

use think\Log;
use \app\common\model;
use \app\common\component;

/**
 * 预约成功
 */
class MakeAppointment {

    //参数为appointment实体，匆进行写操作
    public function run(&$params) {
        $plan = model\ClassPlan::get($params['plan_id']);
        if ($plan) {
            $course = model\Course::get($plan['course_id']);
            $coach = model\Member::get(['user_id' => $plan['coach_user_id']]);
            $merchant = model\Merchant::get($plan['mch_id']);
            $wechat = component\WeChat::instance($merchant);
            $sender = component\sms\Sender::instance();
            $sResult = $wResult = [];
            switch ($course['type']) {
                case model\Course::TYPE_PRIVATE://私教课
                    //短信通知
                    $sResult = $sender->sendSms($coach['phone'], [], 208508);
                    //公众号通知
                    $wResult = $wechat->send($coach['open_id'], '您有一条新的预约记录，请及时进入微信公众号查看。');
                    break;
                default :
                    if ($course['min_user'] <= $plan['user_count']) { //人数达到上课人数
//                        $sResult = $sender->sendSms($coach['phone'], [], 208508);
//                        $wResult = $wechat->send($coach['open_id'], '您有一条新的预约记录，请及时进入微信公众号查看。');
                    }
                break;
            }
            Log::write('make appointment id ' . $params['appointment_id'] . ':' . json_encode($sResult) . ',' . json_encode($wResult));
        }
    }

}
