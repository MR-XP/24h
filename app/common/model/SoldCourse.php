<?php

namespace app\common\model;

use app\common\component\Code;
use think\Db;

/**
 * 已出售的课程
 */
class SoldCourse extends Base {

    protected $table = 'mch_sold_course';
    protected $insert = ['status' => 1, 'create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];
    protected $type = [
        'groups'    =>  'array'
    ];

    /**
     * 普通课
     */
    const TYPE_ORDINARY = 1;
    
    /*
     * 高级课（大约小）
     */
    const TYPE_SENIOR = 2;
    
    /*
     * 过期课
     */
    const TYPE_EXPIRE = 3;
    
    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    //购课处理
    public function buyCourse($order) {
        Db::startTrans();
        try {
            $course = Course::get($order['product_id']);
            //增加售课
            $data = [
                'mch_id' => $order['mch_id'],
                'user_id' => $order['user_id'],
                'order_id' => $order['order_id'],
                'course_id' => $course['course_id'],
                'course_name' => $course['course_name'],
                'coach_user_id' => $course['coach_user_id'],
                'type' => $course['type'],
                'intro' => $course['intro'],
                'image' => $course['cover'],
                'time' => $course['time'],
                'min_user' => $course['min_user'],
                'max_user' => $course['max_user'],
                'origin_price' => $order['origin_price'],
                'price' => $order['sale_price'],
                'min_buy' => $course['min_buy'],
                'max_buy' => $course['max_buy'],
                'buy_num' => $order['product_num'],
                'expire_day' => $course['expire_day'],
                'expire_time' => date('Y-m-d H:i:s', get_now_time() + 86400 * $course['expire_day']),
                'groups'    =>  $course->getData('groups')
            ];
            $result = $this->data($data)->save();
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
            return success($this);
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

}
