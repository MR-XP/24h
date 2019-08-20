<?php

namespace app\v1\controller;

use app\v1\model\MemberModel;
use app\v1\model\CardModel;

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
}
