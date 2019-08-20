<?php

namespace app\v1\controller;

use app\manager\model\ActivityTeam;
use app\v1\model;
use app\v1\validate;
use app\common\component\Code;

class Activity extends Base {

    /**
     * @desc 编辑活动
     * @return array
     */
    public function save()
    {
        $model = new model\UserActivity();
        $validate = new validate\UserActivity();

        $user_id = $this->user['user_id'];
        $user_id = intval($user_id);
        $data = input('post.');
        $data['mch_id'] = 1; //后期可以区分平台
        isset($data['id']) || $data['id'] = 0;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data['id'] > 0 && $model->isUpdate(true);
        $data['user_id'] = $user_id;
        $result = $model->data($data, true)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->getData());
    }

    /**
     * @desc 获取用户的活动
     * @return array
     */
    public function getUserActivity()
    {
        //$user_id = input('post.user_id');
        $user_id = $this->user['user_id'];
        $UserActivity = new model\UserActivity();

        $lists = $UserActivity->getList(1,1, $user_id);
        if ($lists) {
            return success($lists);
        }
        else{
            return error(0, '无用户活动');
        }

    }

    //当前时段的活动
    public function getCurrentActivity()
    {
        $time = input('post.time');
        $Activity = new model\Activity();
        $data = $Activity->getCurrentTimeActivity($time);
        if ($data) {
            return success($data);
        }
        else{
            return error(0, '无该时段活动');
        }
    }

    //活动球队信息
    public function getActivityTeam()
    {
        $team_id = input('post.team_id');
        $model = new ActivityTeam();
        $item = $model->getTeamInfo($team_id);
        if ($item) {
            return success($item);
        }
        else{
            return error(0, '无信息');
        }
    }

    //用户是否参与同类竞猜
    public function checkMemberOnlyActivity()
    {
        $type = input('post.type');
        $user_id = $this->user['user_id'];
        $model = new model\UserActivity();
        $re = $model->checkUserActivity($type, $user_id);
        if ($re) {
            return error(0, '已经参与同类竞猜');
        }
        else{
            return success([]);
        }
    }
}
