<?php

namespace app\v1\controller;

use app\v1\model;
use app\common\component\Code;

class Course extends Base {
    /**
     * 私教课程详情
     * @return type
     */
    public function getCourseInfo() {
        $courseId = $this->request->param('course_id');
        $course = model\Course::get(['course_id' => $courseId, 'status' => model\Course::STATUS_ENABLE]);
        if (!$course) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        return success($course->append(['type_text', 'level_text'])->toArray());
    }
}
