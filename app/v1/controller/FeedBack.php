<?php

namespace app\v1\controller;

use app\v1\model;
use app\common\component\Code;

class FeedBack extends Base {

    public function addFeedBack() {
        $content = input('post.content');
        if (!$content) {
            return error(0, '信息不能为空');
        }
        $result = model\FeedBack::create([
                    'mch_id' => $this->merchant['mch_id'],
                    'user_id' => $this->user['user_id'],
                    'content' => $content,
                    'create_time'=>get_now_time(),
        ]);
        if ($result) {
            return success('反馈已提交');
        } else {
            return error(Code::SAVE_DATA_ERROR);
        }
    }

}
