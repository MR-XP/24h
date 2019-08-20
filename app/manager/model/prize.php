<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/23
 * Time: 14:51
 */

namespace app\manager\model;

class prize extends \app\common\model\Prize
{
    /*
     * 列表加载
     */
    public function getList($mchId,$params,$pageNo,$pageSize,$search = ['order' => 'create_time desc']){
        $where = ['mch_id' => $mchId];
        !empty($params['prize_name']) && $where['prize_name'] = ['LIKE',"%{$params['prize_name']}%"];
        !empty($params['type']) && $where['type'] = $params['type'];
        $this->where($where)->order($search['order']);
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)->order($search['order'])->page($pageNo, $pageSize)->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }
}