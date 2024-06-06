from flask import Blueprint, jsonify, current_app, request

###   근무관리  api    ###
bp_work = Blueprint('work', __name__, url_prefix='/work')

@bp_work.route('/start',methods=['GET'])
def start():
   '''
   출근 -> 근무 기록 생성
   :return:
   '''

    # 만약 직원 번호가 직원지점 목록에 존재한다면, where branch_code == 로그인한 지점
    # 근무기록 INSERT
