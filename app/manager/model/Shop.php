<?php

namespace app\manager\model;

use app\common\component\Code;
use think\Db;

/**
 * 场馆
 */
class Shop extends \app\common\model\Shop {
    
    //列表
    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = [];
        !empty($params['shop_name']) && $where['shop_name'] = array('like', "%{$params['shop_name']}%");
        !empty($params['province']) && $where['province'] = $params['province'];
        !empty($params['city']) && $where['city'] = $params['city'];
        !empty($params['county']) && $where['county'] = $params['county'];
        isset($params['status']) && $where['status'] = $params['status'];
        $where['mch_id'] = $mchId;
        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();
        $user = new User();
        foreach ($list as &$value) {
            $value['online'] = $user->getUserByShop($mchId, $value['shop_id'], 1);
            $value['total'] = $user->getUserByShop($mchId, $value['shop_id']);
            $value['manager'] = $user->get(['user_id' => $value['manager_user_id']]);
            $value['devices'] = ShopDevice::where("shop_id={$value['shop_id']}")->order('id')->select();
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //查询
    public function search($mchId, $params, $limit) {
        $where = [];
        !empty($params['province']) && $where['province'] = $params['province'];
        !empty($params['city']) && $where['city'] = $params['city'];
        !empty($params['county']) && $where['county'] = $params['county'];
        isset($params['status']) && $where['status'] = $params['status'];
        $where['mch_id'] = $mchId;
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;
    }

    //条件查询
    public function searchTwo($mchId, $params, $limit) {
        $where = [];
        $shopGroup = new ShopGroup();
        $groupId='';
        $where['mch_id'] = $mchId;
        !empty($params['group_id']) && $groupId=$shopGroup->where([
            'group_id'  =>  $params['group_id']
        ])->field('shops')->select();
//        $groupId=Db::table('mch_shop_group')->where([
//            'group_id'  =>  $params['group_id']
//        ])->field('shops')->select();

        $where['shop_id'] = array('IN',$groupId[0]['shops']);
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;
    }

    //获取店铺管家
    public function getManagerIds($mchId, $shopId) {
        $where = ['status' => self::STATUS_ENABLE, 'manager_user_id' => ['gt', 0]];
        $shopId > 0 && $where['shop_id'] = $shopId;
        $list = self::where($where)->column('manager_user_id', 'shop_id');
        return array_unique($list);
    }

    /**
     * @param $mchId
     * @param $params场馆销量
     * @param $pageNo
     * @param $pageSize
     */
    public function shopSalesVolume($mchId, $params, $pageNo, $pageSize){
        $orderModel=new Order();
        $userModel=new User();
        $this->where("status=".self::STATUS_ENABLE);
        $this->where("mch_id={$mchId}");
        !empty($params['shop_id']) &&  $this->where("shop_id={$params['shop_id']}");
        $field=[
          'province','city','county','address','shop_name','shop_id','cover','manager_user_id'
        ];
        $query=clone  $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->field($field)->select();
        $sqlWhere=[];
        $sqlWhere['type'] = Order::TYPE_BUY_CARD;
        $sqlWhere['pay_status'] = Order::PAY_STATUS_COMPLETED;
        $sqlWhere['mch_id']=$mchId;
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $sqlWhere['pay_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        }
        $sort=[];
        if($list){
            foreach ($list as $key=>&$value){
                $value['income']=$orderModel->where($sqlWhere)->where('shop_id',$value['shop_id'])->sum('price');
                if(empty($value['income'])){
                    $value['income']=0;
                }
                if($params['time_type']!='all'){
                    $lastWhere=[];
                    $lastWhere['type'] = Order::TYPE_BUY_CARD;
                    $lastWhere['pay_status'] = Order::PAY_STATUS_COMPLETED;
                    $lastWhere['mch_id']=$mchId;
                    $lastWhere['pay_time'] = [['gt', $params['last_start_time']], ['lt', $params['last_end_time']]];
                  $value['lastIncome']=$orderModel
                                        ->where($lastWhere)
                                        ->where('shop_id',$value['shop_id'])
                                        ->sum('price');
                  if(empty($value['lastIncome'])){
                      $value['lastIncome']=0;
                  }
                  if($value['income']>$value['lastIncome']){
                      $value['float']=1;
                  }elseif($value['income']==$value['lastIncome']){
                      $value['float']=2;
                  }else{
                      $value['float']=3;
                  }
                }
                $value['user']=$userModel->where('user_id',$value['manager_user_id'])->field('real_name,phone,sex')->find();
                $staffing=$userModel->getStaffing($mchId, $value['shop_id'],100,$params['start_time'],$params['end_time'],0, 0);
                $value['staffing']=0;
                if($staffing){
                   foreach ($staffing as $k=>&$v){
                       $value['staffing']+=$v['total_value'];
                   }
                }
                $sort[$key]=$value['income'];
            }
        }
        array_multisort($sort,SORT_DESC,$list);
        return success($list);
//        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }


}
