<?php

namespace app\v2\model;

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
        $order = "u.is_default DESC,c.active DESC,c.expire_time ASC,c.sold_card_id ASC";
        $where = "u.user_id = {$userId} AND c.status = 1 AND u.mch_id = {$mchId} AND ({$card_tive} or {$year_expire} or {$time_expire})";

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
    public function get_card_info($mchId, $userId, $params,$limit = 0) {
        $field = [
                'a.*',
                'b.is_default',
                'c.status as card_status'
        ];
        $where = [
            'b.user_id'        => $userId,      //会员的ID
            'a.mch_id'         => $mchId,
            'a.status'         => 1             //会员卡状态正常
        ];
        !empty($params['sold_card_id']) && $where['a.sold_card_id'] = $params['sold_card_id'];
        $order = [
            'b.is_default' => 'desc'
        ];

        $this->alias('a')
            ->join('mch_sold_card_user b', 'a.sold_card_id = b.sold_card_id')
            ->join('sys_card c', 'a.card_id = c.card_id')
            ->field($field)
            ->order($order)
            ->where($where);
        
        if($limit == 0){
            $list = $this->select();
        }else{
            $list = $this->limit($limit)->select();
        }

        foreach($list as $val){
            $usersId = SoldCardUser::where(['sold_card_id' => $val['sold_card_id']])->column('user_id');
            $val['users'] = User::where(['user_id' => ['IN',$usersId]])->field("phone,real_name,sex,user_id")->select();
            $val['user_id'] == $userId ? $val['master'] =true : $val['master'] =false;
        }
        return $list;
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
