<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 代购模型
 */
class Approval extends \app\common\model\Approval {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = [];
        !empty($params['type']) && $where['a.type'] = $params['type'];
        isset($params['status']) && $where['a.status'] = $params['status'];
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        !empty($params['phone']) && $where['b.phone'] = ['like',"%{$params['phone']}%"];
        !empty($params['name']) && $where['b.real_name'] = ['like',"%{$params['name']}%"];
        $where['mch_id'] = $mchId;
        $totalResults = $this->alias('a')
                        ->join('sys_user b', 'b.user_id=a.user_id')
                        ->join('sys_user c', ' c.user_id=a.create_at')
                        ->field('a.*,b.real_name,b.phone,c.real_name as create_user')
                        ->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->append(['status_text'])->alias('a')
                        ->join('sys_user b', 'b.user_id=a.user_id')
                        ->join('sys_user c', ' c.user_id=a.create_at')
                        ->field('a.*,b.real_name,b.phone,c.real_name as create_user')
                        ->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //处理代购申请
    public function dispose($data) {
        $model = self::get($data['approval_id']);
        $data = array_merge($model->toArray(),$data);
        $result = $model->data($data)->save();
        if ($result === false) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
        //申请通过，处理订单
        if ($model->status == Approval::STATUS_ACCEPT) {
            $order = new Order();
            return $order->disposeApproval($model);
        }
        return success('');
    }

}
