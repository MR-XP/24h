<?php

namespace app\manager\model;

/**
 * 验证规则表
 */
class Rule extends \app\common\model\Rule {

    /**
     * 获取所有节点列表，子节点以child方式在父节点
     * @param type $superRule -1 所有
     * @param type $parentId
     * @return type
     */
    public function getList($superRule = 0, $parentId = 0) {
        $where = [];
        $where['parent_id'] = $parentId;
        if ($superRule !== -1) {
            $where['is_super_rule'] = $superRule;
        }
        $result = $this->all(function($query) use ($where) {
            $query->where($where)->order('sort', 'desc');
        });
        foreach ($result as &$value) {
            $value['child'] = $this->getList($superRule,$value['id']);
        }
        return $result;
    }

    public function getMenu($nodes, $parentId = 8) {
        $result = $this->where(['name' => ['in', $nodes], 'parent_id' => $parentId, 'is_display' => 1])->order('sort desc')->select();
        foreach ($result as &$value) {
            $value=$value->toArray();
            $value['child'] = $this->getMenu($nodes,$value['id']);
        }
        return $result;
    }

}
