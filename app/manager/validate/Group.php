<?php

namespace app\manager\validate;

use think\Validate;

/**
 * 用户组验证
 */
class Group extends Validate {

    protected $rule = [
        'rules' => 'require',
        'title' => 'require|max:100|checkUnique',
    ];
    protected $message = [
        'rules.require' => '至少选择一项权限',
        'title.require' => '用户组名称必填',
        'title.max' => '用户组名称100个字符以内',
        'title.checkUnique' => '用户组已存在',
    ];
    protected $scene = [];

    // 验证用户组唯一性
    protected function checkUnique($value, $rule, $data) {
        $where = [];
        $where['title'] = $value;
        $where['mch_id'] = $data['mch_id'];
        if (isset($data['id']) && $data['id'] > 0) {
            $where['id'] = array('neq', $data['id']);
        }
        return \app\manager\model\Group::where($where)->count() === 0;
    }

}
