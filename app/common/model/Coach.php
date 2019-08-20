<?php

namespace app\common\model;

/**
 * 教练表
 */
class Coach extends Base {

    protected $table = 'mch_coach';
    protected $type = [
        'images' => 'array'
    ];
    protected $insert = ['create_time'];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function user() {
        return $this->belongsTo('User', 'user_id');
    }

    public function setTagAttr($value) {
        return implode(',', $value);
    }

    public function getTagAttr($value) {
        return explode(',', $value);
    }

    public function setShopsAttr($value) {
        return implode(',', $value);
    }

    public function getShopsAttr($value, $data) {
        if (empty($value)) {
            return [];
        } else {
            $value = explode(',', $value);
            $where = ['status' => Shop::STATUS_ENABLE, 'mch_id' => $data['mch_id']];
            $where['shop_id'] = ['in', $value];
            return Shop::all($where);
        }
    }

    public function getShopNameAttr($value,$data){
        if (empty($value)) {
            return '无场馆';
        } else {
            return Shop::where("shop_id = ".$value)->value('shop_name');
        }
    }

}
