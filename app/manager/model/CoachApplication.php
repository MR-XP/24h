<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 教练申请
 */
class CoachApplication extends \app\common\model\CoachApplication {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'a.create_time desc']) {
        $where = [];
        (isset($params['status']) && $params['status'] != '') && $where['a.status'] = $params['status'];
        if (!empty($params['application_id'])) {
            $where['a.application_id'] = $params['application_id'];
        }
//        $where['a.application_id']=isset($params['application_id'])?$params['application_id']:'';
        $where['a.mch_id'] = $mchId;
        $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id');
        $this->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->field('a.*,b.real_name,b.avatar,b.sex,b.phone')
                        ->page($pageNo, $pageSize)->order($search['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //处理申请通过
    public function dispose($model) {
        $data = $model->toArray();
        $data['status'] = Coach::STATUS_ENABLE;
        unset($data['create_time']);
        $coachModel = new Coach();
        $coach = $coachModel->where(['user_id' => $data['user_id']])->find();
        if ($coach) {
            return error(Code::VALIDATE_ERROR, '该用户已经是教练');
        } else {
            $result = $coachModel->allowField(true)->data($data, true)->save();
            return success($result);
        }
    }

}
