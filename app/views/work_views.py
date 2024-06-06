from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert

from app import db
from datetime import datetime

###   근무관리  api    ###
bp_work = Blueprint('work', __name__, url_prefix='/work')

@bp_work.route('/',methods=['POST'])
@jwt_required()
def start():
    try:
        data = request.get_json()
        emp_no = data.get('emp_no')

        current_branch = get_jwt_identity()

        EmpBranch = current_app.tables.get('emp_branch')
        query = (
           db.select(EmpBranch)
           .where(EmpBranch.c.branch_code == current_branch, EmpBranch.c.emp_no == emp_no)
        )
        emp_branch_no = db.session.execute(query).fetchone().emp_branch_no

        WorkRecord = current_app.tables.get('work_record')
        work_query = (
           db.select(WorkRecord)
           .where(WorkRecord.c.emp_branch_no == emp_branch_no, WorkRecord.c.work_end_date == None)
        )
        record = db.session.execute(work_query).fetchone()

        if record is None: #end_date가 비어있는 레코드가 없으면 출근
            curr_time = datetime.now()

            if curr_time.hour >= 22 or curr_time.hour < 6:
                wage = 17000 # 야간 근무 시급
            else:
                wage = 12000

            insert_stmt = insert(WorkRecord).values(
                emp_branch_no=emp_branch_no,
                work_start_date=curr_time,
                wage=wage
            )
            db.session.execute(insert_stmt)
            db.session.commit()
            return jsonify({"msg": f"[{curr_time}] {emp_no}번 직원 출근 처리"})

        else: # 퇴근
            curr_time = datetime.now()

            update_stmt = (
                db.update(WorkRecord)
                .where(WorkRecord.c.emp_branch_no == emp_branch_no, WorkRecord.c.work_start_date == record.work_start_date)
                .values(work_end_date=curr_time)
            )
            db.session.execute(update_stmt)
            db.session.commit()
            return jsonify({"msg": f"[{curr_time}] {emp_no}번 직원 퇴근 처리"})

    except Exception as e:
        print(e)
        return jsonify({"msg": str(e)}), 400



    # 만약 직원 번호가 직원지점 목록에 존재한다면, where branch_code == 로그인한 지점
    # 근무기록 INSERT
