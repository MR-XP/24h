<?php

namespace app\v1\model;

use app\common\model\SoldCard;

//用户的会员卡
class MemberCardModel extends \app\common\model\SoldCard {

    protected $mch_sold_card_user = 'mch_sold_card_user';
    protected $sys_card = "sys_card";

    /**
     * 我的会员卡列表
     */
    public function get_cards($mchId, $userId) {
        $time = get_now_time('Y-m-d H:i:s');
        $field = ' c.sold_card_id,c.card_name,c.type,c.start_time,c.expire_time,c.active,u.is_default,c.image ';
        //未激活
        $card_tive = "c.active = 0 ";
        //年卡未过期
        $year_expire = "(c.type = 1 and c.expire_time > '{$time}' and  c.active = 1) ";
        //次卡未过期
        $time_expire = "(c.type = 2 and c.use_times < times  and c.expire_time > '{$time}' and  c.active = 1)";
        $order = "u.is_default DESC ,c.active DESC,c.expire_time ASC,c.sold_card_id ASC";
        $where = "u.user_id = {$userId} AND c.status = 1 AND u.mch_id = {$mchId} AND ({$card_tive} or {$year_expire} or {$time_expire})";
//        $where = "u.user_id = 1 AND c.status = 1 AND u.mch_id = 1 AND ({$card_tive} or {$year_expire} or {$time_expire})";

        $list = $this->alias('c')
                    ->join($this->mch_sold_card_user . ' u', ' c.sold_card_id = u.sold_card_id ')
                    ->field($field)
                    ->where($where)
                    ->order($order)
                    ->select();
        return $list;
    }

    /**
     * 我的会员卡详情
     * @param type $sold_card_id 会员卡id
     * @return type
     */
    public function get_card_info($mchId, $userId, $sold_card_id) {
        $field = 'sc.*,c.status as card_status ';
        $where = ['sc.sold_card_id' => $sold_card_id, 'cu.user_id' => $userId, 'sc.mch_id' => $mchId, 'sc.status' => 1];

        $info = $this->alias('sc')
                ->join($this->mch_sold_card_user . ' cu', 'sc.sold_card_id = cu.sold_card_id')
                ->join($this->sys_card . ' c', 'sc.card_id = c.card_id')
                ->field($field)
                ->where($where)
                ->find();
        $info['other_users'] = db($this->mch_sold_card_user)->alias('cu')
                        ->join('sys_user u', 'cu.user_id = u.user_id')
                        ->field('u.phone,u.real_name')
                        ->where(['cu.sold_card_id' => $sold_card_id])->select();

        !empty(SoldCard::get(['user_id' => $userId,'sold_card_id' => $sold_card_id]))?$info['master'] = true:$info['master'] = false;
        return $info;
    }

    /**
     * 设置默认卡
     */
    public function set_card_default($user_id, $sold_card_id) {
        $where = ['user_id' => $user_id, 'sold_card_id' => $sold_card_id];
        $drop = db('mch_sold_card_user')->where(['user_id' => $user_id])->update(['is_default' => 0]);
        $is_default = db('mch_sold_card_user')->where($where)->update(['is_default' => 1]);
        if (!$drop && !$is_default) {
            return error(0, '编辑失败');
        }
    }

    public function get_card_user($mch_id, $user_id, $sold_card_id) {
        $where = ['mch_id' => $mch_id, 'sold_card_id' => $sold_card_id, 'user_id' => ['NEQ', $user_id]];
        $result = db($this->mch_sold_card_user)->where($where)->select();
        $card_user = [];
        if (!empty($result)) {
            $User = new UserModel();
            foreach ($result as $v) {
                $card_user[] = $User->get_user_info($v['user_id']);
            }
        }
        return $card_user;
    }

    public function get_card_user_count($mch_id, $user_id, $sold_card_id) {
        $where = ['mch_id' => $mch_id, 'sold_card_id' => $sold_card_id];
        return db($this->mch_sold_card_user)->where($where)->count();
    }

    public function add_card_user($mch_id, $sold_card_id, $user_id) {
        $data = ['mch_id' => $mch_id, 'sold_card_id' => $sold_card_id, 'user_id' => $user_id, 'is_default' => 0];
        return db($this->mch_sold_card_user)->insert($data);
    }

    public function check_card_user($sold_card_id, $user_id) {
        $where = ['sold_card_id' => $sold_card_id, 'user_id' => $user_id];
        return db($this->mch_sold_card_user)->where($where)->count() === 0;
    }

}
