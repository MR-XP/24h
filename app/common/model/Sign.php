<?php

namespace app\common\model;

use app\common\component\WeChat;
use think\Db;
use think\Log;
use app\common\component\Code;
/**
 * 签到记录
 */
class Sign extends Base {

    protected $table = 'log_sign';

    const TYPE_CARD = 1; //会员卡入场
    const TYPE_COURSE = 2; //课程入场
    const STATUS_IN = 1; //已入场
    const STATUS_OUT = 2; //已出场

    protected $_type = [
        1 => '会员卡',
        2 => '课程',
    ];
    protected $_status = [
        1 => '入场',
        2 => '出场',
    ];

    public function getTypeTextAttr($value, $data) {
        return get_format_state($data['type'], $this->_type);
    }

    public function getStatusTextAttr($value, $data) {
        return get_format_state($data['status'], $this->_status);
    }

    //签到，进门
    public function sign($merchant, $shop, $data, $member, $code) {
        $wechat = WeChat::instance($merchant);
        $device = ShopDevice::get(['shop_id' => $shop['shop_id'], 'device_alias' => $code['action_attach']]);

        if(!$device){
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '门禁遥控器故障，请联系工作人员');
        }

        //进门判断是否过期,附加20秒网络迟延，为0表示永久二维码
        if($device['qrcode_type'] != Qrcode::TYPE_PERMANENT  && $code['action'] == 'SIGN' && strtotime($code['create_time']) + ($device['qrcode_interval']) + 20 < get_now_time()){
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '二维码已过期，请等待刷新');
        }

        //查询教练
        $planModel=new ClassPlan();
        $planWhere=[];
        $planWhere['mch_id']=$merchant['mch_id'];
        $planWhere['coach_user_id']=$member['user_id'];
        $planWhere['coach_sign_time']='0000-00-00 00:00:00';
        $planWhere['start_time']=array('elt', date('Y-m-d H:i:s',time()+60*60));
        $planWhere['end_time']=array('gt', get_now_time('Y-m-d H:i:s'));
        $planWhere['status']=ClassPlan::STATUS_ENABLE;
        $plan=$planModel->where($planWhere)->order('start_time','asc')->find();

        //教练扫码并且课程成团，教练签到
        $course = Course::get($plan['course_id']);
        if ($plan && $course['min_user'] <= $plan['user_count']) {
            return $this->coachIn($wechat, $plan, $shop, $data, $device);
        }
        //会员签到
        return $this->memberIn($wechat, $shop, $data, $member, $device);
    }

    public function memberIn($wechat, $shop, $data, $member, $device) {

        //查询预约
        $appointment = Appointment::get([
            'mch_id'    => $shop['mch_id'],
            'shop_id'   => $shop['shop_id'],
            'user_id'   => $member['user_id'],
            'status'    => Appointment::STATUS_ENABLE,
            'start_time'=> [['EGT', date('Y-m-d 00:00:00')],['ELT', date('Y-m-d 23:59:59')],'AND'],
            'sign'      => 0
        ]);

        //如果是付费团课或者私教课，直接保存记录并开门
        if($appointment && $appointment['plan_type'] != Course::TYPE_PUBLIC){
            Db::startTrans();
            $openRecord = new OpenRecord();
            try{
                //更新预约
                $appointment->sign_time = get_now_time('Y-m-d H:i:s');
                $appointment->sign = 1; //标记为已签到
                $result = $appointment->save();
                if (!$result) {
                    Db::rollback();
                    return '';
                }

                //增加签到记录
                $result = $this->data([
                    'mch_id' => $shop['mch_id'],
                    'shop_id' => $shop['shop_id'],
                    'user_id' => $member['user_id'],
                    'type' => self::TYPE_COURSE,
                    'sign_time' => get_now_time('Y-m-d H:i:s'),
                    'status' => self::STATUS_IN,
                    'relation_id' => $appointment->appointment_id,
                ])->save();
                if (!$result) {
                    Db::rollback();
                    return '';
                }

                //开门并推送
                if ($openRecord->open($shop, $member['user_id'], OpenRecord::TYPE_IN, OpenRecord::OPEN_TYPE_MEMBER, $device, $this->sign_id)) {
                    Db::commit();
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], "欢迎光临！ \n\n明明可以靠脸 偏偏身材那么棒");
                } else {
                    Db::rollback();
                    return '';
                }

            } catch (\Exception $e) {
                Log::record('Sign.php,line 101.' . $e->getMessage(), 'error');
                Db::rollback();
                return '';
            }

        } else { //会员卡开门
            Db::startTrans();
            $openRecord = new OpenRecord();
            try {
                $cardModel = new SoldCard();
                $result = $cardModel->getDefaultCard($shop['mch_id'],$shop['shop_id'],$member['user_id']); //获取可用会员卡
                if ($result['code'] == \app\common\component\Code::VALIDATE_ERROR) {
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '没有可用的会员卡，请先购买！');
                }
                if ($result['code'] == \app\common\component\Code::CARD_LOW_GRADE) {
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '您的会员卡不支持该场馆使用');
                }
                if ($result['code'] == \app\common\component\Code::CARD_LOCK) {
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '您的会员卡已被主卡人锁定，无法使用');
                }

                $card = $result['data'];
                if ($card['active'] == 0) { //激活该卡
                    $result = $cardModel->isUpdate(true)->save([
                        'sold_card_id' => $card['sold_card_id'],
                        'active' => 1,
                        'active_shop_id' => $shop['shop_id'],
                        'start_time' => get_now_time('Y-m-d H:i:s'),
                        'expire_time' => date('Y-m-d H:i:s', get_now_time() + 86400 * $card['days']),
                    ]);
                    if (!$result) {
                        Db::rollback();
                        return '';
                    }
                }

                if ($card['type'] == Card::TYPE_COUNT) { //次卡
                    $result = $cardModel->isUpdate(true)->save([
                        'sold_card_id' => $card['sold_card_id'],
                        'use_times' => ['exp', 'use_times+1'],
                    ]);
                    if (!$result) {
                        Db::rollback();
                        return '';
                    }
                } else {
                    //时间卡不能多次开门
                    $sign = $this->where([
                                'mch_id' => $shop['mch_id'],
                                'shop_id' => $shop['shop_id'],
                                'user_id' => $member['user_id'],
                                'status' => self::STATUS_IN,
                            ])->find();
                    if ($sign) {
                        if (strtotime($sign['sign_time']) < get_now_time() - 3600 * 4) { //超过4小时的开门，自动签出
                            $sign['out_time'] = get_now_time('Y-m-d H:i:s');
                            $sign['status'] = self::STATUS_OUT;
                            $sign->save();
                        } else {
                            Db::rollback();
                            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '你已开过门！');
                        }
                    }
                }

                //有公开课记录，更新预约
                if ($appointment) {
                    $appointment->sign_time = get_now_time('Y-m-d H:i:s');
                    $appointment->sign = 1; //标记为已签到
                    $result = $appointment->save();
                    if (!$result) {
                        Db::rollback();
                        return '';
                    }
                }

                //增加签到记录
                $result = $this->data([
                            'mch_id' => $shop['mch_id'],
                            'shop_id' => $shop['shop_id'],
                            'user_id' => $member['user_id'],
                            'type' => self::TYPE_CARD,
                            'sign_time' => get_now_time('Y-m-d H:i:s'),
                            'status' => self::STATUS_IN,
                            'relation_id' => $card['sold_card_id'],
                        ])->save();
                if (!$result) {
                    Db::rollback();
                    return '';
                }

                $openResult = $openRecord->open($shop, $member['user_id'], OpenRecord::TYPE_IN, OpenRecord::OPEN_TYPE_MEMBER, $device, $this->sign_id);
                if ($openResult) {
                    Db::commit();
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'],  "欢迎光临！ \n\n明明可以靠脸 偏偏身材那么棒");
                } else {
                    Db::rollback();
                    return '';
                }
                
            } catch (\Exception $e) {
                Log::record('Sign.php,line 154.' . $e->getMessage(), 'error');
                Db::rollback();
                return '';
            }
        }


    }

    //教练签到
    public function coachIn($wechat, $plan, $shop, $data, $device) {
        Db::startTrans();
        $openRecord = new OpenRecord();
        try {
            $plan->coach_sign_time = get_now_time('Y-m-d H:i:s');
            if ($plan->save()) {
                if ($openRecord->open($shop, $plan['coach_user_id'], OpenRecord::TYPE_IN, OpenRecord::OPEN_TYPE_COACH, $device)) {
                    Db::commit();
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '欢迎光临,' . $plan['coach_name'] . '教练！');
                } else {
                    Db::rollback();
                    return '';
                }
            } else {
                Db::rollback();
                return '';
            }
        } catch (\Exception $e) {
            Log::record('Sign.php,line 179.' . $e->getMessage(), 'error');
            Db::rollback();
            return '';
        }
    }

    //签退，出门
    public function signOut($merchant, $shop, $data, $member, $code) {
        $wechat = WeChat::instance($merchant);
        $device = ShopDevice::get(['shop_id' => $shop['shop_id'], 'device_alias' => $code['action_attach']]);
        if (!$device || ($code['action'] == 'SIGN' && strtotime($code['create_time']) + ($device['qrcode_interval']) + 20 < get_now_time())) { //进门判断是否过期,附加20秒网络迟延
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], Code::$codes[Code::QRCODE_DISABLE]);
        }

        //查询教练
        $planModel=new ClassPlan();
        $planWhere=[];
        $planWhere['mch_id']=$merchant['mch_id'];
        $planWhere['coach_user_id']=$member['user_id'];
        $planWhere['coach_sign_time']=array('neq','0000-00-00 00:00:00');
        $planWhere['start_time']=[['gt', get_now_time('Y-m-d 00:00:00')], ['lt', 'Y-m-d 23:59:59']];
        $planWhere['coach_sign_out_time']=array('lt', get_now_time('Y-m-d 00:00:00'));
        $planWhere['status']=ClassPlan::STATUS_ENABLE;
        $plan=$planModel->where($planWhere)->order('end_time','desc')->find();
        if ($plan) { //教练出门
            return $this->coachOut($wechat, $plan, $shop, $data, $device);
        }
        $sign = $this->where(['mch_id' => $merchant['mch_id'], 'shop_id' => $shop['shop_id'], 'user_id' => $member['user_id'], 'status' => self::STATUS_IN])->find();
        if (!$sign) {
            return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '未找到进门记录，请联系客服人员！');
        }
        //会员出门
        return $this->memberOut($wechat, $sign, $shop, $data, $device);
    }

    //会员出门
    private function memberOut($wechat, $sign, $shop, $data, $device) {
        Db::startTrans();
        $openRecord = new OpenRecord();
        try {
            $sign->out_time = get_now_time('Y-m-d H:i:s');
            $sign->status = self::STATUS_OUT;
            if ($sign['type'] == self::TYPE_COURSE) { //如果是预约进门，保存签退时间
                $appointment = Appointment::get($sign->relation_id);
            } else {
                $appointment = Appointment::get([
                            'mch_id'        => $sign['mch_id'],
                            'shop_id'       => $sign['shop_id'],
                            'user_id'       => $sign['user_id'],
                            'status'        => Appointment::STATUS_ENABLE,
                            'start_time'    => [['EGT', date('Y-m-d 00:00:00')],['ELT', date('Y-m-d 23:59:59')],'AND'],
                            'sign_time'     => ['NEQ','0000-00-00 00:00:00'],
                            'sign_out_time' => '0000-00-00 00:00:00',
                            'sign'          => 1
                ]);
            }
            //保存预约的签退时间
            if ($appointment) {
                $appointment['sign_out_time'] = get_now_time('Y-m-d H:i:s');
                $appointment->save();
            }
            if ($sign->save()) {
                if ($openRecord->open($shop, $sign['user_id'], OpenRecord::TYPE_OUT, OpenRecord::OPEN_TYPE_MEMBER, $device, $sign['sign_id'])) {
                    Db::commit();
                    $message = $this->getMemberOutMessage($sign);
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], $message.$this->pushText($sign));
                } else {
                    Db::rollback();
                    return '';
                }
            } else {
                Db::rollback();
                return '';
            }
        } catch (\Exception $e) {
            Log::record('Sign.php,line 228.' . $e->getMessage(), 'error');
            Db::rollback();
            return '';
        }
    }

    //教练出门
    public function coachOut($wechat, $plan, $shop, $data, $device) {
        Db::startTrans();
        $openRecord = new OpenRecord();
        try {
            $plan->coach_sign_out_time = get_now_time('Y-m-d H:i:s');
            if ($plan->save()) {
                if ($openRecord->open($shop, $plan['coach_user_id'], OpenRecord::TYPE_OUT, OpenRecord::OPEN_TYPE_COACH, $device)) {
                    Db::commit();
                    return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], '欢迎再次光临,' . $plan['coach_name'] . '教练！');
                } else {
                    Db::rollback();
                    return '';
                }
            } else {
                Db::rollback();
                return '';
            }
        } catch (\Exception $e) {
            Log::record('Sign.php,line 252.' . $e->getMessage(), 'error');
            Db::rollback();
            return '';
        }
    }

    //获取出门回复信息
    private function getMemberOutMessage($sign) {
        if ($sign['type'] == self::TYPE_CARD) {
            $soldCard = SoldCard::get($sign['relation_id']);
            $days = ceil((strtotime($soldCard['expire_time']) - get_now_time()) / 86400);
            $times = $soldCard['times'] - $soldCard['use_times'];
            $merchant = Merchant::get($sign['mch_id']);
            $baseUrl = 'http://' . $merchant->sub_domain . '.' . config('url_domain_root');
            $url = $baseUrl . '/#/users/my-card/' . $soldCard['sold_card_id'];
            $link = "<a href='" . $url . "'>进入</a>";
            if($soldCard['card_id']==8){
                $message = "欢迎再次光临";
            }
            elseif ($days < 30) {
                $message = "欢迎再次光临,您当前会员卡剩余有效时间不足30天, 是否立即续费:" . $link;
            } elseif ($soldCard['type'] == Card::TYPE_COUNT && $times < 2) {
                $message = "欢迎再次光临,您当前会员卡剩余不足两次,是否立即续费:" . $link;
            } else {
                
                if($soldCard['type'] == Card::TYPE_TIME){
                    $message = "欢迎再次光临,您当前会员卡剩余天数为{$days}天。";
                }
                
                if($soldCard['type'] == Card::TYPE_COUNT){
                    $message = "欢迎再次光临,您当前会员卡剩余次数还有{$times}次，还有{$days}天到期。";
                }
                
            }
        } elseif ($sign['type'] == self::TYPE_COURSE) { //课程出门
            $message = '欢迎再次光临!';
            $appointment = Appointment::get($sign['relation_id']);
            if ($appointment) {
                $soldCourse = SoldCourse::get($appointment->sold_course_id);
                if ($soldCourse) {
                    if ($soldCourse['buy_num'] - $soldCourse['use_num'] <= 1) { //还剩1节
                        $message = "欢迎再次光临,您购买的《{$soldCourse['course_name']}》课程,总共{$soldCourse['buy_num']}节,已使用{$soldCourse['use_num']}节,本次课程将在5小时后自动确认。";
                    } else {
                        $message = "欢迎再次光临,您购买的《{$soldCourse['course_name']}》课程,总共{$soldCourse['buy_num']}节,已使用{$soldCourse['use_num']}节,有效期至" . date('Y-m-d', strtotime($soldCourse['expire_time'])) . ",本次课程将在5小时后自动确认。";
                    }
                }
            }
        }
        return $message;
    }

    //活动文章推送
    public function pushText($sign){
        $merchant = Merchant::get($sign['mch_id']);
        $baseUrl = 'http://' . $merchant->sub_domain . '.' . config('url_domain_root');
        $url = $baseUrl . '/#/users/card-list';
        $text   = "\n\n你还记得,最早与他们见面的样子吗?倾城运动·家推出 '企业健身房共享计划'， 一家人  一家企业  一张卡就够了!  陪伴就是最好的超能力,做家人/同事身边的超级英雄!";
        $rel    = "\n<a href='" . $url . "'>立即购买</a>";

        return  $text.$rel;

    }

}
