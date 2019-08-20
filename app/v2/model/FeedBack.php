<?php

namespace app\v2\model;

class FeedBack extends \app\common\model\FeedBack {

    /*
     * 查看反馈回复
     */
    public function getFeedBackList($mchId,$userId,$pageNo,$pageSize){
        $where = [
            'a.user_id'   =>  $userId,
            'a.mch_id'    =>  $mchId,
            'b.to_id'     =>  $userId
        ];
        $field = [
            'a.feed_id,a.content as from_content,a.user_id as user,a.create_time as from_time',
            'b.reply_id,b.content as to_content,b.create_time as to_time'
        ];
        $order = [
            'b.create_time' =>  'desc'
        ];
        $this->alias('a')
             ->join('mch_reply b','b.feed_id = a.feed_id')
             ->where($where)
             ->order($order)
             ->field($field);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }
    
}
