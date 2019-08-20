<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 会员备注
 */
class MemberNote extends \app\common\model\MemberNote {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = [];
        !empty($params['user_id']) && $where['a.user_id'] = $params['user_id'];
        isset($params['status']) && $where['a.status'] = $params['status'];
        $where['a.mch_id'] = $mchId;
        $totalResults = $this->alias('a')->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->alias('a')->where($where)->join('sys_user b', 'b.user_id=a.create_by','left')
                        ->page($pageNo, $pageSize)
                        ->field('a.*,b.real_name as create_user')
                        ->order($search['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}
