<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/5/15
 * Time: 16:58
 */

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

class Saleman extends Base
{

    public function getList(){
        $model = new model\Saleman();
        $data = input('');
        $pageNo = input('page_no',1);
        $pageSize = input('page_size',$this->pageSize);
        return $model->getList($this->mchId,$data,$pageNo, $pageSize);
    }

    public function search(){
        $model = new model\Saleman();
        $data = input('');
        $limit = input('limit',0);
        return success($model->search($this->mchId,$data,$limit));
    }

    public function save(){
        //获取数据
        $data = input('');
        $data['mch_id'] = $this->mchId;
        if(empty($data['phone'])){
            return error(0, '未填写手机号');
        }
        if (!preg_match("/1[23456789]{1}\d{9}$/", $data['phone'])) {
            return error(0, '手机号码错误');
        }

        //添加或更新会员
        $userModel       = new model\User();
        $memberValidate  = new validate\Member();
        if(!isset($data['user_id'])){
            $user = model\User::get(['phone' => $data['phone']]);
            if ($user) {
                $data['user_id'] = $user['user_id'];
            }else{
                $data['user_id'] = 0;
            }
        }

        if (!$memberValidate->check($data)) {
            return error(Code::VALIDATE_ERROR, $memberValidate->getError());
        }
        $result = $userModel->addMember($this->mchId,[
            'phone'     => $data['phone'],
            'user_id'   => $data['user_id'],
            'real_name' => $data['real_name'],
            'avatar'    => $data['avatar']
        ]);
        if ($result['code'] != Code::SUCCESS) {
            return $result;
        }
        $data['user_id'] = $result['data']['user_id'];

        //创建或更新销售人员
        $salemanModel    = new model\Saleman();
        $salemanValidate = new Validate\Saleman();
        $salemanId = model\Saleman::where(['user_id' => $data['user_id']])->value('saleman_id');
        !$salemanId && $salemanId = 0;
        $data['saleman_id'] = $salemanId;
        if (!$salemanValidate->check($data)) {
            return error(Code::VALIDATE_ERROR, $salemanValidate->getError());
        }
        $data['saleman_id'] > 0 && $salemanModel->isUpdate(true);
        $salemanModel->allowField(true)->data($data,true);
        $result = $salemanModel->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($salemanModel);
    }

}