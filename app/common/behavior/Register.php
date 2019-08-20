<?php

namespace app\common\behavior;

use think\Log;
use \app\common\model;
use \app\common\component;

/**
 * 注册成功
 */
class Register {

    public function run(&$member) {

        //送卡
        $productId = 8;//送次卡
        if(get_now_time('Y-m-d') >= '2018-04-10' && get_now_time('Y-m-d') < '2018-04-16'){
            $productId = 45;//送周卡
        }
        $onecard = [
            'order_id' => 0,
            'origin_price' => 0,
            'type' => model\Order::TYPE_BUY_CARD,
            'price' => 0,
            'sale_price' => 0,
            'mch_id' => $member['mch_id'],
            'user_id' => $member['user_id'],
            'product_id' => $productId,
        ];
        $result = (new model\SoldCard())->buyCard($onecard);
        Log::write('Register' . json_encode($member) . '---' . json_encode($result));
    }

}
