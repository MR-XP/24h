<?php

namespace app\common\model;

use app\common\component\Code;

/**
 * 用户组
 */
class Group extends Base {

    protected $table = 'auth_group';

    public function getRulesAttr($value) {
        return explode(",", $value);
    }

    public function setRulesAttr($value) {
        return implode(",", $value);
    }

    public function getShopsAttr($value) {
        return explode(",", $value);
    }

    public function setShopsAttr($value) {
        return implode(",", $value);
    }

    /**
     * 权限验证
     * @param type $name
     * @return type
     */
    public function check($mchId, $uid, $name) {
        $count = Rule::where('name', $name)->count();
        if ($count > 0) { //有这个节点才验证
            $auth = new \app\common\auth\Auth();
            if (!$auth->check($name, $mchId, $uid)) {
                return error(Code::DISALLOW);
            }
        }
        return success('');
    }

}
