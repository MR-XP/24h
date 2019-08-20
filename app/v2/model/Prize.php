<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/23
 * Time: 16:39
 */

namespace app\v2\model;
use think\Db;
use app\common\component\Code;

class prize extends \app\common\model\Prize
{

    /*
     * 奖品列表加载
     */
    public function getList($mchId,$params,$search = ['order' => 'create_time desc']){
        $where = [
            'mch_id'    =>  $mchId,
            'status'    =>  self::STATUS_ENABLE
        ];
        $list = $this->where($where)
             ->order($search['order'])
             ->limit($params['limit'])
             ->select();
        return success($list);
    }

    /*
     * 抽奖
     */
    public function luckDraw($mchId,$userId,$params,$search = ['order' => 'create_time desc']){

        function get_rand($proArr) {
            $result = '';
            //概率数组的总概率精度
            $proSum = array_sum($proArr);

            //概率数组循环
            $index = 0;
            foreach ($proArr as $key => $proCur) {
                $randNum = mt_rand(1, $proSum);
                if ($proCur != 0 && $randNum <= $proCur) {
                    $result = $key;
                    break;
                } else {
                    $proSum -= $proCur;
                    ++$index;
                }
            }
            unset ($proArr);
            return $result;
        }

        $where = [
            'mch_id'    =>  $mchId,
            'status'    =>  self::STATUS_ENABLE
        ];

        //验证今日是否抽过奖品
        $prizeUser = new PrizeUser();
        $look = $prizeUser
                ->where($where)
                ->where("user_id = $userId")
                ->where([
                    'create_time'   =>  [['EGT',date('Y-m-d 00:00:00')],['ELT',date('Y-m-d 23:59:59')],'AND']
                ])
                ->find();
        if($look){
            return error(0,'不好意思，今日抽奖次数已经用完，明天再来吧！');
        }

        //查询正常的奖品列表
        $list = $this->where($where)
                    ->order($search['order'])
                    ->limit($params['limit'])
                    ->field("prize_id,type,relation_id,prize_name,prize_num,prize_value,prize_days,prize_image,prize_note,chance")
                    ->select();
        $arr = [];
        foreach ($list as $key => $val) {
            $arr[] = $val['chance'];
        }
        $prize = get_rand($arr);
        $prize = $list[$prize];
        $prize['user_id']     = $userId;
        $prize['start_time']  = date('Y-m-d H:i:s');
        $prize['expire_time'] = date('Y-m-d H:i:s',time()+86400 * intval($prize['prize_days']));

        //中奖后保存至会员中奖表
        Db::startTrans();
        try{
            $result = $prizeUser->save([
                    "prize_id"      =>  $prize['prize_id'],
                    "prize_type"    =>  $prize['type'],
                    "relation_id"   =>  $prize['relation_id'],
                    "prize_name"    =>  $prize['prize_name'],
                    "prize_num"     =>  $prize['prize_num'],
                    "prize_value"   =>  $prize['prize_value'],
                    "prize_days"    =>  $prize['prize_days'],
                    "prize_note"    =>  $prize['prize_note'],
                    "prize_image"   =>  $prize['prize_image'],
                    "start_time"    =>  $prize['start_time'],
                    "expire_time"   =>  $prize['expire_time'],
                    "user_id"       =>  $prize['user_id'],
                    "mch_id"        =>  $mchId
            ]);
            if($result === false){
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }

        //中奖后生成相应数据
        switch ($prize['type']){
            case self::TYPE_CARD:
                $card = Card::get($prize['relation_id']);
                $result = $this->setSoldCard($prize,$card);
                break;
            case self::TYPE_GROUP_COURSE:
                $course = Course::get($prize['relation_id']);
                $result = $this->setSoldCourse($prize,$course);
                break;
            case self::TYPE_COACH_COURSE:
                $course = Course::get($prize['relation_id']);
                $result = $this->setSoldCourse($prize,$course);
                break;
            case self::TYPE_GOLD_BEAN:
                $member = Member::get(['user_id' => $userId,'mch_id' => $mchId]);
                $result = $this->goldBean($prizeUser,$member);
                break;
            case self::TYPE_CARD_DELAY:     //会员卡续时间暂时不用
                break;
            case self::TYPE_ENTITY:         //实物奖品
                break;
            default:
                break;
        }

        return success($prize);

    }

    /*
     * 获得会员卡并自动激活
     */
    public function setSoldCard($prize,$card){
        Db::startTrans();
        try{
            $soldCard = new SoldCard();
            $result = $soldCard->save([
                'mch_id'        => $card['mch_id'],
                'user_id'       => $prize['user_id'],
                'card_id'       => $card['card_id'],
                'card_name'     => $prize['prize_name'],
                'description'   => $prize['prize_note'],
                'type'          => $card['type'],
                'origin_price'  => $prize['prize_value'],
                'price'         => $prize['prize_value'],
                'image'         => $prize['prize_image'],
                'days'          => $prize['prize_days'],
                'times'         => $card['times'],
                'max_use'       => $card['max_use'],
                'groups'        => $card->getData('groups'),
                'addMbr_status' => $card['addMbr_status'],
                'active'        => self::STATUS_ENABLE,      //默认激活
                'start_time'    => $prize['start_time'],
                'expire_time'   => $prize['expire_time']
            ]);
            if($result === false){
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //添加关联
            $cardUserModel = new SoldCardUser();
            $result = $cardUserModel->save([
                'mch_id'        => $card['mch_id'],
                'sold_card_id'  => $soldCard->sold_card_id,
                'user_id'       => $prize['user_id']
            ]);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    /*
     * 获得小团课或者私教课
     */
    public function setSoldCourse($prize,$course){
        Db::startTrans();
        try{
            $soldCourse = new SoldCourse();
            $course['groups'] = implode(',',$course['groups']);
            $result = $soldCourse->save([
                'mch_id'        => $course['mch_id'],
                'user_id'       => $prize['user_id'],
                'course_id'     => $course['course_id'],
                'course_name'   => $prize['prize_name'],
                'coach_user_id' => $course['coach_user_id'],
                'type'          => $course['type'],
                'intro'         => $prize['prize_note'],
                'image'         => $prize['prize_image'],
                'time'          => $course['time'],
                'min_user'      => $course['min_user'],
                'max_user'      => $course['max_user'],
                'origin_price'  => $prize['prize_value'],
                'price'         => $prize['prize_value'],
                'min_buy'       => $course['min_buy'],
                'max_buy'       => $course['max_buy'],
                'buy_num'       => $prize['prize_num'],
                'expire_day'    => $prize['prize_days'],
                'expire_time'   => $prize['expire_time'],
                'groups'        => $course['groups'][0]
            ]);
            if($result === false){
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
        }catch (\Exception $e){
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    /*
     * 金豆充值
     */
    public function goldBean($prizeUser,$member){
        Db::startTrans();
        try{
            $member->pre_paid = $member->pre_paid+intval($prizeUser['prize_num']);
            $member->save();
            if($member === false){
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            //保存日志记录
            $log = new PrePaid();
            $result = $log->save([
                'mch_id'    => $member['mch_id'],
                'user_id'   => $prizeUser['user_id'],
                'num'       => $prizeUser['prize_num'],
                'note'      => '赠送金豆',
                'order_id'  => $prizeUser['prize_user_id'],
            ]);
            if ($result === false) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
            Db::commit();
        }catch(\Exception $e) {
            Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    /*
     * 中奖记录
     */
    public function myPrize($mchId,$userId,$params,$pageNo,$pageSize){
        $where = [
            'user_id'   =>  $userId,
            'mch_id'    =>  $mchId,
            'status'    =>  self::STATUS_ENABLE
        ];
        $prizeUser = new PrizeUser();
        $totalResults = $prizeUser->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $prizeUser->where($where)->order("create_time desc")->page($pageNo, $pageSize)->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}