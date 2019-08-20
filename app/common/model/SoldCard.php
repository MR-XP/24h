<?php

namespace app\common\model;

use app\common\component\Code;
use think\Db;
use think\Hook;

/**
 * 已售出的卡
 */
class SoldCard extends Base {

    protected $table = 'mch_sold_card';
    protected $insert = ['status' => 1, 'create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];

    const ACTIVE_ENABLE = 1;
    const ACTIVE_DISABLE = 0;

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    //购卡处理
    public function buyCard($order) {
        Db::startTrans();
        try {
            $card = Card::get($order['product_id']);
            //增加售卡
            $data = [
                'mch_id' => $order['mch_id'],
                'user_id' => $order['user_id'],
                'order_id' => $order['order_id'],
                'card_id' => $card['card_id'],
                'card_name' => $card['card_name'],
                'description' => $card['description'],
                'type' => $card['type'],
                'origin_price' => $order['origin_price'],
                'price' => $order['sale_price'],
                'image' => $card['image'],
                'days' => $card['days'],
                'times' => $card['times'],
                'max_use' => $card['max_use'],
                'groups' => $card->getData('groups'),
                'addMbr_status' => $card['addMbr_status'],
            ];
            $result = $this->data($data)->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //添加关联
            $cardUserModel = new SoldCardUser();
            $result = $cardUserModel->save([
                'mch_id' => $order['mch_id'],
                'sold_card_id' => $this->sold_card_id,
                'user_id' => $order['user_id']
            ]);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //保存销售购买业绩
            if(!empty($order['seller_id'])){
                $result = SalemanAchv::create([
                    'mch_id'          =>  $order['mch_id'],
                    'saleman_id'      =>  $order['seller_id'],
                    'user_id'         =>  $order['user_id'],
                    'user_type'       =>  SalemanAchv::USERTYPE_BUY,
                    'order_id'        =>  $order['order_id']
                ]);
                if($result === false){
                    Db::rollback();
                    return error(0, '销售业绩保存失败');
                }
            }
            Db::commit();
            Hook::listen('buy_card', $order);
            return success($this);
        } catch (\Exception $e) {
            \think\Log::write('buy card' . $e->getMessage());
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    /**
     * 获得可以使用的卡
     * @param type $mchId
     * @param type $userId
     * @param type $params
     * @return type
     */
    public function getDefaultCard($mchId, $shopId, $userId, $params = []) {

        $where = [
            'a.user_id'     => $userId,
            'a.mch_id'      => $mchId
        ];
        $field = "b.*,a.status";
        $cardUserModel = new SoldCardUser();

        //查找用户默认使用的卡
        $soldCard = $cardUserModel
            ->alias('a')
            ->join($this->table . ' b', 'a.sold_card_id=b.sold_card_id')
            ->where($where)
            ->where('a.is_default = 1')
            ->field($field)
            ->find();

        if(
            $soldCard
                &&
            //未被锁定的卡
            $soldCard['status'] == SoldCardUser::STATUS_NORMAL
                &&
            //有效卡
            (
                ($soldCard['type'] == Card::TYPE_TIME && strtotime($soldCard['expire_time']) > get_now_time())
                    ||
                ($soldCard['type'] == Card::TYPE_COUNT && $soldCard['times'] > $soldCard['use_times'] && strtotime($soldCard['expire_time']) > get_now_time())
            )
        ){

            //通用卡，直接返回成功
            if(!$soldCard['groups']){
                return success($soldCard);
            }

            //验证会员卡是否包含该场馆
            $groups = explode(',',$soldCard['groups']);
            $num = 0;
            foreach($groups as $val){
                ++$num;
                $shops = ShopGroup::where('group_id = '.$val)->value('shops');
                $shops = explode(',',$shops);
                foreach($shops as $shop){
                    if(intval($shopId) === intval($shop)){
                        return success($soldCard);
                    }
                }
                if($num == count($shops)){
                    return $this->getArrCard($cardUserModel,$where,$field,$shopId,$mchId,$userId);
                }
            }

        }else{
            return $this->getArrCard($cardUserModel,$where,$field,$shopId,$mchId,$userId);
        }

    }


    //查找用户全部有效的会员卡
    public function getArrCard($cardUserModel,$where,$field,$shopId,$mchId,$userId){

        //查找用户所有可用的卡
        $soldCardAll = $cardUserModel
            ->alias('a')
            ->join('mch_sold_card b', 'a.sold_card_id=b.sold_card_id')
            ->where($where)
            ->field($field)
            ->select();
        if($soldCardAll){

            //次数统计
            $num = 0;
            //不支持卡种统计
            $notNum = 0;
            //锁定统计
            $lockNum = 0;
            foreach($soldCardAll as $soldCard){
                ++$num;
                if(
                    ($soldCard['active'] == self::ACTIVE_ENABLE && $soldCard['type'] == Card::TYPE_TIME && strtotime($soldCard['expire_time']) > get_now_time())
                        ||
                    ($soldCard['active'] == self::ACTIVE_ENABLE && $soldCard['times'] > $soldCard['use_times'] && strtotime($soldCard['expire_time']) > get_now_time())
                        ||
                    ($soldCard['active'] == self::ACTIVE_DISABLE && $soldCard['start_time'] == '0000-00-00 00:00:00')

                ){

                    //通用卡正常，直接返回成功
                    if(!$soldCard['groups'] && $soldCard['status'] == SoldCardUser::STATUS_NORMAL){
                        return success($soldCard);
                    }
                    //通用卡被锁定，统计锁定记录
                    if(!$soldCard['groups'] && $soldCard['status'] == SoldCardUser::STATUS_LOCK){
                        ++$lockNum;
                        continue;
                    }

                    $groups = explode(',',$soldCard['groups']);
                    foreach($groups as $val){
                        $shops = ShopGroup::where('group_id = '.$val)->value('shops');
                        $shops = explode(',',$shops);
                        foreach($shops as $shop){
                            //有效，返回成功，修改默认卡
                            if(intval($shopId) === intval($shop) && $soldCard['status'] == SoldCardUser::STATUS_NORMAL){
                                $cardUserModel->save(['is_default' => 0], ['mch_id' => $mchId, 'user_id' => $userId]);
                                $cardUserModel->save(['is_default' => 1], ['mch_id' => $mchId, 'user_id' => $userId, 'sold_card_id' => $soldCard['sold_card_id']]);
                                return success($soldCard);
                            }
                            //有效，但被锁定，统计锁定记录
                            if(intval($shopId) === intval($shop) && $soldCard['status'] == SoldCardUser::STATUS_LOCK){
                                ++$lockNum;
                            }
                            //有效，但不支持该场馆，统计不支持记录
                            if(intval($shopId) != intval($shop) && $soldCard['status'] == SoldCardUser::STATUS_NORMAL){
                                ++$notNum;
                            }
                        }
                    }
                }

                if($num == count($soldCardAll)){
                    //被锁定的卡
                    if($lockNum!=0){
                        return error(Code::CARD_LOCK);
                    }
                    //不支持该场馆的卡
                    if($lockNum==0 && $notNum!=0){
                        return error(Code::CARD_LOW_GRADE);
                    }
                    //没有有效会员卡
                    if($lockNum==0 && $notNum==0){
                        return error(Code::VALIDATE_ERROR,'没有可用的会员卡，请先购买！');
                    }
                }
            }
        }

        //没有会员卡，返回失败
        return error(Code::VALIDATE_ERROR,'没有可用的会员卡，请先购买！');

    }

    /**
     * 获取用户的会员卡
     * @param type $mchId
     * @param type $userId
     * @param type $params
     * @return type
     */
    public function getUserCards($mchId, $userId, $params = []) {
        $cardUserModel = new SoldCardUser();
        $result = $cardUserModel->alias('a')
                                ->join($this->table . ' b', 'a.sold_card_id=b.sold_card_id')
                                ->where("a.user_id=$userId and a.mch_id = $mchId")
                                ->order('a.is_default desc,b.active desc,b.expire_time asc')->field('b.*,(a.user_id) as master_id')->select();
        if (!$result) {
            return [];
        } else {
            foreach ($result as &$value) {
                $value['expire_day']= $this->getExpireDay($value);
            }
            return $result;
        }
    }

    protected function getExpireDay($data) {
        if ($data['active'] == 0) {
            return $data['days'];
        }
        return ceil((strtotime($data['expire_time']) - get_now_time()) / 86400);
    }

    //添加成员
    public function addUser($order) {
        Db::startTrans();
        try {
            $soldCard = self::get($order['product_id']);
            $soldCard->add_use = $soldCard->add_use+abs($order['product_num']);
            $result = $soldCard->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            Hook::listen('add_user', $order);
            return success($this);

        } catch (\Exception $e) {
            \think\Log::write('add user' . $e->getMessage());
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

}
