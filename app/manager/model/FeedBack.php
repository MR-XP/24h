<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\manager\model;

/**
 * Description of FeedBack
 *
 * @author Administrator
 */
class FeedBack extends \app\common\model\FeedBack {

    public function showFeedBack($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {

        $where="a.mch_id=".$mchId;

        if (isset($params['start_time']) && isset($params['end_time'])) {
           $where.=" and '".$params['start_time']."'<=a.create_time and a.create_time<='".$params['end_time']."'";
        }
        if(!empty($params['phone'])){
            $where.=" and b.phone like '%".$params['phone']."%'";
        }

        $this->where($where);

        $query = clone $this->getQuery();
        $totalResults = $this->alias('a')->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list =$query->alias('a')
            ->join('sys_user b','b.user_id=a.user_id','left')
            ->field('a.*,b.real_name,b.avatar,b.phone')
            ->page($pageNo, $pageSize)->order($search['order'])->select();

        foreach($list as $val){

            $replyList= [];

            //该会员的回复条数
            $replyFrom = Reply::all(['to_id' => $val['user_id'],'feed_id' => $val['feed_id']]);

            foreach($replyFrom as $from){
                $replyVal=[];
                $replyVal['content']        = $from['content'];
                $replyVal['from_name']      = User::get(['user_id' => $from['from_id']])->value('real_name');
                $replyVal['from_id']        = $from['from_id'];
                $replyVal['create_time']    = $from['create_time'];
                $replyVal['status']         = $from['status'];
                $replyList[]=$replyVal;
            }
            $val['replyList']=$replyList;

        }

        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}
