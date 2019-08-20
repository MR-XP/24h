<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/5/17
 * Time: 9:46
 */

namespace app\common\model;


class SalemanAchv extends Base
{
    protected $table = "mch_saleman_achv";
    protected $insert = ['create_time','update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];

    /**
     * 注册会员
     */
    const USERTYPE_REG = 1;

    /**
     * 购卡会员
     */
    const USERTYPE_BUY = 2;

    public function setCreateTimeAttr($val){
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($val){
        if(empty($val))
            return get_now_time('Y-m-d H:i:s');
        else
            return "0000-00-00 00:00:00";
    }

}