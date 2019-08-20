<?php

namespace app\v1\controller;

use app\v1\model;
use app\v1\model\CardModel;
use app\common\component\Code;
use app\v1\validate;

class Card extends Base {

    /**
     * 获取商品卡列表
     */
    public function getCardList() {
        $model = new model\Card();
        $shopId = input('shop_id', 0);
        $seller_id=input('id',0);
        $list = $model->getList($this->merchant['mch_id'], $shopId);
        return success($list);
    }

    /**
     * 获取商品卡详情
     */
    public function getCardInfo() {
        $Card = new CardModel();
        $card_id = input('post.card_id');
        if (!$card_id) {
            return error(0, '参数错误');
        }
        $cardinfo = $Card->get_card_info($this->merchant['mch_id'], $card_id);
        if (!$cardinfo) {
            return error(Code::RECORD_NOT_FOUND);
        }
        return success($cardinfo);
    }

}
