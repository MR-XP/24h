<?php

namespace app\v1\model;

use app\common\component\Code;

class Card extends \app\common\model\Card {

    
    public function getList($mchId, $shopId) {
        $where = ['mch_id' => $mchId, 'status' => self::STATUS_ENABLE];
        $list = $this->where($where)->order('sort','desc')->select();
        if ($shopId > 0) {
            foreach ($list as $key => &$value) {
                if (empty($value['groups'])) { //通卡
                    break;
                }
                $shops = $this->getShopsByCard($value);
                if (!in_array($shopId, $shops)) {
                    unset($list[$key]);
                }
            }
        }
        return $list;
    }
    /**
     * 取出会员卡能使用的店铺
     * @param type $card
     * @return type
     */
    private function getShopsByCard($card) {
        $groups = ShopGroup::where(['group_id' => ['in', $card['groups'], 'status' => ShopGroup::STATUS_ENABLE]])->select();
        $result = [];
        foreach ($groups as $value) {
            $result = array_merge($result, $value['shops']);
        }
        $result = array_unique($result);
        return $result;
    }

}
