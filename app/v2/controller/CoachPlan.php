<?php

namespace app\v2\controller;

use app\v2\model\CoachPlanModel;

class CoachPlan extends Base {

    /**
     * 可预约课程
     */
    public function getList() {
        $CoachPlan = new CoachPlanModel();
        $shop_id = input('post.shop_id');
        $type = input('post.type') ? input('post.type') : 1;
        $page = input('post.page') ? input('post.page') : 1;
        $res = $CoachPlan->get_paln_list($this->merchant['mch_id'], $type, $shop_id, $page);
        if (is_array($res['data']) !== FALSE) {
            $res['data'] = $this->array_group($res['data']);
        }
        return success($res);
    }

    /**
     * @param $array
     * @return array
     */

    public function array_group($array) {
        $result = [];
        foreach ($array as $k => $v) {
            $result[$v['group_time']][] = $v;
        }
        return $result;
    }

}
