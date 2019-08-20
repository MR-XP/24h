<?php

namespace app\v1\controller;

use app\v1\model\MemberCardModel;
use app\v1\model\UserModel;
use app\v1\model\MemberCards;

class Member extends Base {

    public function getUserInfo() {
        $User = new UserModel();
        //用户信息
        $userinfo = $User->get_user_info($this->user['user_id']);
        return success($userinfo);
    }
    /**
     * 获取用户的会员卡
     */
    public function getCardList() {
        $model = new MemberCardModel();
        $list = $model->get_cards($this->merchant['mch_id'], $this->user['user_id']);
        return success($list);
    }


    public function getUserCourse() {
        $data = $this->request->param();
        isset($data['type']) || $data['type'] = 2;
        $data['user_id'] = $this->user['user_id'];
        $list = (new \app\v1\model\MemberCourseModel())->get_my_course_list($this->merchant['mch_id'],$data);
        return success($list);
    }
    /**
     * 用户的会员卡详情
     */
    public function getCardInfo() {
        $sold_card_id = input('post.sold_card_id');
        
        if (!$sold_card_id) {
            return error(0, '参数错误');
        }
        $model = new MemberCardModel();
        $card_info = $model->get_card_info($this->merchant['mch_id'], $this->user['user_id'], $sold_card_id);
        if (!$card_info) {
            return error(0, '参数错误');
        }
        return success($card_info);
    }
    /**
     * 绑定用户
     */
    public function bindCardUser() {
        $sold_card_id   = input('sold_card_id');
        $phones         = input('phone/a');

        if (!$sold_card_id || !$phones) {
            return error(0, '参数错误');
        }
        $User = new \app\v1\model\UserModel();
        $sold_card = (new \app\common\model\SoldCard())->where(['sold_card_id' => $sold_card_id])->find();
        $max_use = $sold_card->max_use;
        $add_use = $sold_card->add_use;
        $card_use_count = (new \app\common\model\SoldCardUser())->where(['sold_card_id' => $sold_card_id])->count();
        $is_use = ($max_use + $add_use) - $card_use_count;
        if ($is_use < 1) {
            return error(0, '该卡绑定已到限制');
        }
        if (count($phones) > $is_use) {
            return error(0, '绑定已超限');
        }

        $data = [];
        foreach ($phones as $v) {
            if (!empty($v['phone'])) {
                if (!preg_match("/1[23456789]{1}\d{9}$/", $v['phone'])) {
                        return error(0, '手机号码错误');
                }
                $is_user = $User->check_user(['phone' => $v['phone']]);
                if (!$is_user) {
                    $is_user['user_id'] = $User->add_user(['phone' => $v['phone'], 'username' => $v['phone'], 'status' => 1]);
                }
                $check = (new MemberCardModel())->check_card_user($sold_card_id, $is_user['user_id']);
                if (!$check) {
                    return error(0, $v['phone'] . '绑定失败');
                }
                $data[] = ['sold_card_id' => $sold_card_id, 'user_id' => $is_user['user_id'], 'mch_id' => $this->merchant['mch_id'], 'is_default' => 0, 'free' => $v['free']];
            }
        }
        $res = (new \app\common\model\SoldCardUser())->saveAll($data);
        if (!$res) {
            return error(0, '绑定失败');
        }
        return success($res);
    }

}
