<?php

/**
 * 计划任务
 */

namespace app\index\controller;

use app\common\component;
use app\common\model;
use app\common\component\Code;
use think\Db;

class Crontab extends \think\Controller {

    protected function _initialize() {
        $token = input('token');
        if ($token != 'qcyd2017') {
            die('');
        }
    }

    //刷新微信accesstoken
    public function refreshAccessToken() {
        $model = new model\Merchant();
        $where = [];
        $where['access_expire_time'] = ['lt', date('Y-m-d H:i:s', get_now_time() + 600)];
        $where['status'] = model\Merchant::STATUS_ENABLE;
        $list = $model->where($where)->select();
        foreach ($list as $merchant) {
            Db::startTrans();
            try {
                $wechat = component\WeChat::instance($merchant);
                $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$merchant['app_id']}&secret={$merchant['app_secret']}";
                $result = $wechat->execute($url);
                if ($result['code'] != Code::SUCCESS) {
                    Db::rollback();
                    continue;
                }
                $data = $result['data'];
                $record = $model->where('mch_id=' . $merchant['mch_id'])->lock(true)->find();
                $record->access_token = $data['access_token'];
                $record->access_expire_time = date('Y-m-d H:i:s', get_now_time() + $data['expires_in'] - 200);
                $record->save();
                Db::commit();
            } catch (\Exception $e) {
                echo $e->getMessage();
                Db::rollback();
            }
        }
        die(get_now_time('Y-m-d H:i:s'));
    }

    //刷新js ticket
    public function refreshJsTicket() {
        $model = new model\Merchant();
        $where = [];
        $where['js_ticket_expire_time'] = ['lt', date('Y-m-d H:i:s', get_now_time() + 600)];
        $where['status'] = model\Merchant::STATUS_ENABLE;
        $list = $model->where($where)->select();
        foreach ($list as $merchant) {
            Db::startTrans();
            try {
                $wechat = component\WeChat::instance($merchant);
                $url = $url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={accessToken}&type=jsapi";
                $result = $wechat->execute($url);
                if ($result['code'] != Code::SUCCESS) {
                    Db::rollback();
                    continue;
                }
                $data = $result['data'];
                $record = $model->where('mch_id=' . $merchant['mch_id'])->lock(true)->find();
                $record->js_ticket = $data['ticket'];
                $record->js_ticket_expire_time = date('Y-m-d H:i:s', get_now_time() + $data['expires_in'] - 200);
                $record->save();
                Db::commit();
            } catch (\Exception $e) {
                Db::rollback();
            }
        }
        die(get_now_time('Y-m-d H:i:s'));
    }

    //删除一周后过期二维码
    public function cleanQrcode() {
        $model = new model\Qrcode();
        $result = $model->where('type = 2 and UNIX_TIMESTAMP(create_time)+expire_seconds<' . get_now_time())->delete();
        die('count' . $result);
    }

    //删除过期金豆
    public function cleanExpirePrepaid() {
        $where = [];
        $where['num'] = ['gt', 0];
        $where['expire_time'] = [['gt', '2000-01-01 00:00:00'], ['lt', get_now_time('Y-m-d H:i:s')]];
        $where['is_expire'] = 0;
        $model = new model\PrePaid();
        $memberModel = new model\Member();
        $record = $model->where($where)->select();
        foreach ($record as $value) {
            Db::startTrans();
            try {
                $prePaid = $memberModel->where("mch_id={$value['mch_id']} and user_id={$value['user_id']}")->lock(true)->value('pre_paid');
                $prePaid - $value['num'] < 0 && $value['num'] = $prePaid;
                $result = $memberModel->where("mch_id={$value['mch_id']} and user_id={$value['user_id']}")->update(['pre_paid' => ['exp', 'pre_paid-' . $value['num']]]);
                if (!$result) {
                    Db::rollback();
                    continue;
                }
                $log = [
                    'mch_id' => $value['mch_id'],
                    'user_id' => $value['user_id'],
                    'num' => -$value['num'],
                    'create_by' => -1,
                    'note' => '过期',
                ];
                $result = model\PrePaid::create($log);
                if (!$result) {
                    Db::rollback();
                    continue;
                }
                $value->is_expire = 1;
                $result = $value->save();
                if (!$result) {
                    Db::rollback();
                    continue;
                }
                Db::commit();
            } catch (\Exception $e) {
                Db::rollback();
                continue;
            }
        }
        die(get_now_time('Y-m-d H:i:s'));
    }
    
    //定时处理排课
    public function manageCoursePlan() {
        $where = [];
        $where['start_time'] = ['lt', date('Y-m-d H:i:s', get_now_time() + 60 * 60 )]; //1小时
        $where['is_lock'] = 0;
        $where['status'] = 1;
        $planModel = new model\ClassPlan();
        $record = $planModel->where($where)->select();
        $soldCourse = new model\SoldCourse();
        $message = [];
        foreach ($record as $value) {
            Db::startTrans();
            try {
                $merchant = model\Merchant::get($value['mch_id']);
                $wechat = component\WeChat::instance($merchant);
                $sender = component\sms\Sender::instance();
                $plan = $planModel->where('plan_id=' . $value['plan_id'])->lock(true)->find();
                $course = model\Course::get($plan->course_id);
                $planTime = date('Y-m-d H:i', strtotime($plan['start_time']));
                $coach = model\Member::get(['user_id' => $plan['coach_user_id']]);
                
                if ($course['min_user'] <= $plan['user_count']) { //人数达到
                    
                    //通知私教
                    $sender->sendSms($coach['phone'], [$planTime, $course['course_name']], 231863);
                    $wechat->send($coach['open_id'], "您于{$planTime}的<<{$course['course_name']}>>课程还有一个小时就要开课了，请您及时到现场。");
                    
                    //通知付费会员
                    if($plan['type'] != model\Course::TYPE_PUBLIC){
                        
                        $appointmets = model\Appointment::all(['plan_id' => $plan['plan_id'],'status' => model\Appointment::STATUS_ENABLE]);
                        foreach ($appointmets as $appointmet){
                            
                            $member = model\Member::get(['user_id' => $appointmet->user_id]);
                            $sender->sendSms($member['phone'], [$planTime, $course['course_name']], 231863);
                            $wechat->send($member['open_id'], "您于{$planTime}的<<{$course['course_name']}>>课程还有一个小时就要开课了，请您及时到现场。");
                            
                        }
                        
                    }
                    
                } else { 

                    if ($plan['type'] != model\Course::TYPE_PRIVATE) {//未达到,不开课
                        
                        //通知私教
                        $sender->sendSms($coach['phone'], [$planTime,$course['course_name']], 237554);
                        $wechat->send($coach['phone'], "因预约的人数没有达到指标，于{$planTime}待开的<<{$course['course_name']}>>课程现已取消！");

                        //通知所有会员
                        $appointmets = model\Appointment::all(['plan_id' => $plan['plan_id'], 'status' => model\Appointment::STATUS_ENABLE]);
                        foreach ($appointmets as $appointmet) {
                            $member = model\Member::get(['user_id' => $appointmet->user_id]);
                            $sender->sendSms($member['phone'], [$planTime,$course['course_name']], 237554);
                            $wechat->send($member['open_id'], "因预约的人数没有达到指标，于{$planTime}待开的<<{$course['course_name']}>>课程现已取消！");
                            $appointmet->status = model\Appointment::STATUS_DELETED;
                            $appointmet->cancel_type = model\Appointment::CANCEL_TYPE_NORMAL;
                            $appointmet->cancel_from = model\Appointment::CANCEL_BY_MASTER;
                            $appointmet->cancel_time = get_now_time('Y-m-d H:i:s');
                            $appointmet->save();                            
                        }

                        //小团课返还节数
                        if($plan['type'] == model\Course::TYPE_GROUP && !empty($plan['sold_course_id'])){
                            $arr = explode(',',$plan['sold_course_id']);                            
                            foreach($arr as $key=>$val){
                                $userCourse = $soldCourse->where('sold_course_id='.$val)->lock(true)->find();
                                if(!empty($userCourse)){
                                    $userCourse->use_num=$userCourse->use_num-1;
                                    $courseResult = $userCourse->save();
                                    if ($courseResult === false) {
                                        Db::rollback();
                                        return error(Code::SAVE_DATA_ERROR);
                                    }
                                }
                                unset($arr[$key]);           
                            }
                            $plan->sold_course_id=implode(',',$arr);
                        }
                        
                    }
                    
                    $plan->status = 0;
                    
                }

                $plan->is_lock = 1;
                $result = $plan->save();
                if (!$result) {
                    Db::rollback();
                    continue;
                }
                Db::commit();
            } catch (\Exception $e) {
                $message[] = $e->getMessage();
                Db::rollback();
                continue;
            }
        }
        echo implode(',', $message);
        die(get_now_time('Y-m-d H:i:s'));
    }

    //自动确认上课
    public function autoConfirmPlan() {
        $where = [];
        $where['end_time'] = ['lt', date('Y-m-d H:i:s', get_now_time() - 60 * 60 * 5)]; //上课结束5小时后
        $where['status'] = 1;
        $where['plan_type'] = ['neq', model\Course::TYPE_GROUP];
        $appointmentModel = new model\Appointment();
        $list = $appointmentModel->where($where)->where("(plan_type = 1 and sign=1) or (plan_type = 3 and sign=2)")->select(); //公开课教练不用确认上课，私教需要
        $message = [];
        foreach ($list as $value) {
            Db::startTrans();
            try {
                $value['sign'] = 3;
                $result = $value->save();
                if ($result === false) {
                    Db::rollback();
                    continue;
                }
                $value->classPlan['status'] = 2;
                $result = $value->classPlan->save();
                if ($result === false) {
                    Db::rollback();
                    continue;
                }
                Db::commit();
            } catch (\Exception $e) {
                $message[] = $e->getMessage();
                Db::rollback();
            }
        }
        echo implode(',', $message);
        die(get_now_time('Y-m-d H:i:s'));
    }

}
