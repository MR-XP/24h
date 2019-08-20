<?php

namespace app\v2\model;

use app\v2\model\MemberCardModel;
use think\Db;
use app\common\component\Code;

class SignModel extends \app\common\model\Sign {

    /**
     * 获取签到次数
     * @param type $user_id
     * @return type
     */
    public function get_sign_count($user_id) {
        $where = ['user_id' => $user_id];
        return $this->where($where)->count();
    }

    /**
     * 获取场馆运动人数
     * @param type $shop_id
     */
    public function get_shop_user_count($shop_id) {
        $count_man = ['s.shop_id' => $shop_id, 's.status' => 1, 'u.sex' => 1];
        $count_woman = ['s.shop_id' => $shop_id, 's.status' => 1, 'u.sex' => 2];
//        return $this->where($where)->count();
        $res['man'] = $this->alias('s')->join('sys_user u ', 'u.user_id= s.user_id')->where($count_man)->count();
        $res['woman'] = $this->alias('s')->join('sys_user u ', 'u.user_id= s.user_id')->where($count_man)->count();
        return $res;
    }

    /**
     * 获取健身记录
     * 
     */
    public function get_sign_list($user_id) {
        $user_id = input('get.user_id');
    }

    /**
     * 签到 扫码开门
     */
    public function sign_in($mch_id, $user_id, $shop_id, $default_card, $course) {
        $sign = ['mch_id' => $mch_id,
            'shop_id' => $shop_id,
            'user_id' => $user_id,
            'sign_time' => get_now_time('Y-m-d H:i:s'),
            'status' => 1,
        ];
        if (!empty($course)) {
            $sign['type'] = 2;
            $sign['relation_id'] = $course['course_id'];
            Db::startTrans();
            try {
                // 保存打卡信息
                $result = $this->insert($sign);
                if (!$result) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                $plan_sign['sign'] = 1;
                $plan_sign['sign_time'] = $sign['sign_time'];

                //更新使用次数
                if ($course['type'] != 1) {
                    
                }

                // 更新预约信息
                $result = $this->update_plan_sign($course['plan_id'], $course_sign);
                if (!$result) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                Db::commit();
            } catch (Exception $exc) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            return success();
        }

        if (!empty($default_card)) {
            $sign['type'] = 1;
            $sign['relation_id'] = $default_card['sold_card_id'];
            if ($default_card['type'] == 2) {
                if ($default_card['times'] - $default_card['use_times'] < 1) {
                    return error(Code::PRE_PAID_NOT_ENOUGH);
                }
            }
            Db::starttrans();
            try {
                // 保存打卡信息
                $result = $this->insert($sign);
                if (!$result) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                // 未激活 卡  激活
                if ($default_card['active'] == 0) {
                    $card['active'] = 1;
                    $result = $this->update_card_info($default_card['sold_card_id'], $card);
                    if (!$result) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                }
                //次数卡 修改使用次数
                if ($default_card['type'] == 2) {
                    $card['use_times'] = $default_card['use_times'] + 1;
                    $result = $this->update_card_info($default_card['sold_card_id'], $card);
                    if (!$result) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                }
                Db::commit();
            } catch (Exception $exc) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            return true;
        }
    }

    /**
     * 扫码离开
     */
    public function sign_out($sign_id) {
        $where = ['sign_id' => $sign_id];
        $data = ['status' => 2, 'out_time' => get_now_time('Y-m-d H:i:s')];
        $res = $this->where($where)->update($data);
        return $res;
    }

    public function check_sign($mch_id, $user_id, $shop_id) {
        $where = ['mch_id' => $mch_id, 'user_id' => $user_id, 'shop_id' => $shop_id, 'status' => 1];
        return $this->where($where)->find();
    }

    /**
     * 检查今天有预约
     * @param type $mch_id
     * @param type $user_id
     * @param type $shop_id
     */
    public function check_course($mch_id, $user_id, $shop_id) {
        $time = get_now_time();
        $start = strtotime(get_now_time('Y-m-d')) - 1;
        $end = $start + 86400;

        $where = " a.mch_id= {$mch_id} and a.shop_id = {$shop_id} and a.user_id = {$user_id} and UNIX_TIMESTAMP(p.start_time) BETWEEN {$start} AND {$end} and UNIX_TIMESTAMP(p.end_time) > {$time}  and a.sign = 0  and a.status = 1 and p.status = 1 ";
        $sql = "SELECT p.* ,c.buy_num, c.use_num FROM  `mch_appointment` a left join `mch_class_plan`  p on a.plan_id = p.plan_id left join `mch_sold_course` c  on c.sold_course_id = p.course_id WHERE {$where} ";
        return db()->query($sql);
    }

    /**
     * 检查会员卡
     * @param type $mch_id
     * @param type $user_id
     * @return type
     */
    public function check_card($mch_id, $user_id) {
        $time = get_now_time();
        $where = " u.is_default = 1 and u.user_id = {$user_id} and u.mch_id = {$mch_id} and UNIX_TIMESTAMP(c.expire_time) > {$time} and c.status = 1";
        $sql = "SELECT c.active,c.sold_card_id,c.type,c.times,c.use_times,c.expire_time FROM `mch_sold_card_user` u LEFT JOIN `mch_sold_card` c on u.sold_card_id = c.sold_card_id WHERE {$where}";
        $result = db()->query($sql);

        return $result;
    }

    public function update_plan_sign($plan_id, $course_sign) {
        $Plan = new MemberPlanModel();
        $res = $Plan->where(['plan_id' => $plan_id])->update($course_sign);
        return $res;
    }

    public function update_card_info($sold_card_id, $card) {
        $MemberCard = new MemberCardModel();
        $where = ['sold_card_id' => $sold_card_id];
        $res = $MemberCard->where($where)->update($card);
        return $res;
    }

    public function update_course_info($sold_course_id, $use_num) {
        $model = new \app\common\model\SoldCourse();
        $where = ['sold_course_id' => $sold_course_id];
        $res = $model->where($where)->update($use_num);
        return $res;
    }

}
