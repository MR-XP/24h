<?php

namespace app\manager\controller;

use app\manager\model;
use app\common\component\Code;

/**
 * 提成
 */
class Commission extends Base {
//提成统计
    public function report() {
        $orderModel=new model\Order();
        $data = $this->request->param();
        isset($data['time_type']) || $data['time_type'] = 'month';
        isset($data['shop_id']) || $data['shop_id'] = 0;
        isset($data['user_type']) || $data['user_type'] = 0;
        $time = get_time_range(get_now_time('Y-m-d'), $data['time_type']);
        $data['start_time'] = $time[0];
        $data['end_time'] = $time[1];
        $users = $this->getUsers($data['shop_id'], $data['user_type'], 0, 0);
        $result=$orderModel->report($this->mchId,$data,$users);
        return $result;
    }
//提成详情
    public function getList() {
        $orderModel=new model\Order();
        $shopModel=new model\Shop();
        $userType = $this->request->param('user_type', 0);
        $month = $this->request->param('month', get_now_time('Y-m'));
        $startTime = $month . '-01 00:00:00';
        $endTime = date('Y-m-t', strtotime($month)) . ' 23:59:59';
        $shopId = $this->request->param('shop_id', 0);
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        $result = $this->getUsers($shopId, $userType, $pageNo, $pageSize);
        $data = $result['data'];
        if($shopId>0){
            $shopWhere=[
                'mch_id'=>$this->mchId,
                'shop_id'=>$shopId,
                'status'=>model\Shop::STATUS_ENABLE
            ];
            $data['shop_name']=$shopModel->where($shopWhere)->field('shop_name')->value('shop_name');
        }else{
            $data['shop_name']=null;
        }
        $rows=$orderModel->getListReport($this->mchId,$data,$startTime,$endTime,$shopId);
        return success($rows);
    }

    //获取需要计算的用户
    public function getUsers($shopId, $userType, $pageNo, $pageSize) {
        $model = new model\User();
        $shopModel = new model\Shop();
        $field = 'a.user_id,a.real_name,a.phone,a.sex,a.avatar,d.course_rate,d.sale_rate,c.title';
        $model->alias('a')
                ->join('auth_group_access b', 'b.user_id=a.user_id', 'left')
                ->join('auth_group c', 'c.id=b.group_id', 'left')
                ->join('mch_coach d', 'd.user_id=a.user_id', 'left')
                ->where('a.status=' . model\User::STATUS_ENABLE);
        if ($userType == 1) { //教练
            $model->where('d.course_rate is not null');
        } elseif ($userType == 2) {//会籍
            $model->where('c.title="会籍"');
        } elseif ($userType == 3) {//管家
            $shopManagers = $shopModel->getManagerIds($this->mchId, $shopId);
            if(!empty($shopManagers)){
                $model->where('a.user_id in (' . implode(',', $shopManagers) . ')');
            }else{
                return array();
            }

        } elseif($userType==0) {
            $shopManagers = $shopModel->getManagerIds($this->mchId, $shopId);
            if(!empty($shopManagers)){
                $model->where('(c.title = "会籍" or a.user_id in (' . implode(',', $shopManagers) . ') or (d.course_rate is not null))');

            }else{
                $model->where('(c.title = "会籍"  or (d.course_rate is not null))');

            }
        }
        if ($pageNo > 0 && $pageSize > 0) {
            $query = clone $model->getQuery();
            $query = $query->group('a.user_id')->field($field)->buildSql();
            $totalResults = \think\Db::table($query . ' a')->count();
            $totalPages = ceil($totalResults / $pageSize);
            $users = $model->group('a.user_id')->field($field)->page($pageNo, $pageSize)->select();
            return page_result($users, $pageNo, $pageSize, $totalResults, $totalPages);
        } else {
            $users = $model->group('a.user_id')->field($field)->select();
        }

        return $users;
    }

    private function getUsedSoldCourse($shopId, $userId) {
        $model = new model\ClassPlan();
        $where = ['a.status' => 2, 'a.coach_user_id' => $userId, 'a.type' => model\Course::TYPE_PRIVATE];
        $shopId > 0 && $where['a.shop_id'] = $shopId;
        $list = $model->alias('a')
                    ->join('mch_sold_course b', 'b.sold_course_id=a.sold_course_id')
                    ->where($where)
                    ->field('a.plan_id,b.*')
                    ->select();
        return $list;
    }

}
