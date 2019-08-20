<?php

namespace app\manager\validate;

use think\Validate;
use app\manager\model;

class Card extends Validate {

    protected $rule = [
        'card_name' => 'require|checkUnique:card_name',
        'type' => 'require|in:1,2',
        'origin_price' => 'require|float',
        'price' => 'require|float|elt:origin_price',
        'image' => 'require',
        'days' => 'require|number|gt:0',
        'times' => 'checkTimes',
        'max_use' => 'require|number',
        'active_type' => 'require|in:1,2',
    ];
    protected $message = [
        'card_name.require' => '请填写卡名',
        'card_name.checkUnique' => '卡名已存在',
        'type.require' => '请选择卡类型',
        'origin_price.require' => '请填写原价',
        'price.require' => '请填写现价',
        'image.require' => '请上传卡封面',
        'days.require' => '请填写有效天数',
        'max_use.require' => '请填写最大使用人数',
        'active_type.require' => '请选择激活类型',
        'times.checkTimes' => '请填写使用次数',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        return true;
        $where = [];
        $where[$rule] = $value;
        $where['mch_id'] = $data['mch_id'];
        if (isset($data['card_id']) && $data['card_id'] > 0) {
            $where['card_id'] = array('neq', $data['card_id']);
        }
        return model\Card::where($where)->count() === 0;
    }

    //次数卡检查次数
    protected function checkTimes($value, $rule, $data) {
        if ($data['type'] == model\Card::TYPE_COUNT) {
            return $value > 0;
        }
        return true;
    }

}
