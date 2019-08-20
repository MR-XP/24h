<?php

namespace app\manager\validate;

use think\Validate;

/**
 * 店铺组验证
 */
class ShopGroup extends Validate {

    protected $rule = [
        'shops' => 'require',
        'title' => 'require|max:50|checkUnique',
    ];
    protected $message = [
        'shops.require' => '至少选择一家场馆',
        'title.require' => '分组名称必填',
        'title.max' => '分组名称50个字符以内',
        'title.checkUnique' => '分组已存在',
    ];

    // 验证唯一性
    protected function checkUnique($value, $rule, $data) {
        $where = [];
        $where['title'] = $value;
        $where['mch_id'] = $data['mch_id'];
        if ($data['group_id'] > 0) {
            $where['group_id'] = array('neq', $data['group_id']);
        }
        return \app\manager\model\ShopGroup::where($where)->count() === 0;
    }

}
