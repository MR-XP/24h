<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/26
 * Time: 16:53
 */

namespace app\manager\model;

use app\common\component\WeChat;

class Reply extends \app\common\model\Reply
{

    //添加回复记录
    public function add($params){

        if(empty($params['to_id'])){
            return error(0,'请选择要回复的人是谁');
        }
        if(empty($params['content'])){
            return error(0,'请输入回复的内容');
        }
        if(empty($params['feed_id'])){
            return error(0,'没有选择回复哪条消息');
        }

        $res = $this->save($params);
        if (!isset($res)) {
            return error(0,'回复失败');
        }
        return success('回复成功！');
    }

}