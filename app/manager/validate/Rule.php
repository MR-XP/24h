<?php

namespace app\manager\validate;

use think\Validate;

/**
 * 节点验证
 */
class Rule extends Validate {

    protected $rule = [
        'name' => 'require|unique:Rule',
        'title' => 'require|max:20',
    ];
    protected $message = [
        'name.require' => '节点地址必填',
        'name.unique' => '节点地址已存在',
        'title.require' => '节点名称必填',
        'title.max' => '节点名称20个字符以内',
    ];
    protected $scene = [];

}
