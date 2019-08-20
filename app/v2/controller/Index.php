<?php

namespace app\v2\controller;

use app\v2\model\ClassPlan;
use app\v2\model\MemberModel;
use app\v2\model\CardModel;

/*
 * 会员 卡
 */

class Index extends Base {

    /**
     * 获取用户的会员卡
     */
    public function getMyCardList() {
        $model = new \app\v1\model\MemberCardModel();
        $user_id = input("post.user_id");
        $list = $model->getcards($this->mchId, $user_id);
        return $list;
    }

    /**
     * 用户的会员卡详情
     */
    public function getMyCardInfo() {
        $sold_card_id = input('post.sold_card_id');
        $user_id = input("post.user_id");
        if (!$sold_card_id) {
            $this->error(0, '参数错误');
        }
        $model = new \app\v1\model\MemberCardModel();
        $card_info = $model->get_my_card_info($this->mchId, $user_id, $sold_card_id);
        return $card_info;
    }

    /**
     * 获取我的预约
     */

    /**
     * 取消预约
     */
    public function removeCourse($param) {
        
    }

    /**
     * 获取我的课程
     */
    public function getMyCourseList() {
        
    }

    /**
     * 获取我得个人资料
     */

    /**
     * @desc 可预约的公开课
     */
    public function appointmentOpenClass()
    {
        $shop_id = input('post.shop_id');
        $start_time = input("post.start_time");
        $end_time = input("post.end_time");

        $params['start_time'] = $start_time;
        $params['end_time'] = $end_time;
        $params['shop_id'] = $shop_id;
        $params['type'] = \app\common\model\ClassPlan::TYPE_BUY_CARD; //公开课
        $ClassPlan = new ClassPlan();
        $ClassPlan->appointmentClassPlan($params);
    }
}
