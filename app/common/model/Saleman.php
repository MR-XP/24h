<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/5/15
 * Time: 16:04
 */

namespace app\common\model;


class Saleman extends Base
{

    protected $table = "mch_saleman";
    protected $type  = [
      "images"  =>  'array'
    ];

    protected $insert = ['create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];

    /**
     * 正常状态
     */
    const SALEMAN_STATUS_ON = 1;

    /**
     * 锁定状态
     */
    const SALEMAN_STATUS_OFF = 2;

    public function setCreateTimeAttr($val) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($val) {

        if(empty($val))
            return get_now_time('Y-m-d H:i:s');
        else
            return '0000-00-00 00:00:00';
    }


    /*
     * 列表查询
     */
    public function getList($mchId,$params,$pageNo, $pageSize,$search = ['order' => ["a.create_time desc"]]){

        //查询条件
        $where=[];
        $where['a.mch_id'] = $mchId;
        !empty($params['phone']) && $where['b.phone'] = array('like',"%{$params['phone']}%");
        !empty($params['real_name'])  && $where['b.real_name'] = array('like',"%{$params['real_name']}%");
        (isset($params['status']) && $params['status'] != '')  && $where['a.status'] = $params['status'];

        //过滤条件
        $field=["a.*,b.user_id,b.real_name,b.avatar,b.sex,b.phone"];

        //列表
        $list = $this->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->where($where)
            ->field($field)
            ->page($pageNo,$pageSize)
            ->order($search['order'])
            ->select();

        //分页
        $totalResults = $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id')->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);

        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    public function search($mchId,$params,$limit){

        //查询条件
        $where = [];
        $where['a.mch_id'] = $mchId;
        !empty($params['keyword']) && $where['b.real_name|b.phone'] = ['like',"%{$params['keyword']}%"];
        (isset($params['status']) && $params['status'] != '') && $where['a.status'] = $params['status'];

        //列表
        $this->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;

    }

}