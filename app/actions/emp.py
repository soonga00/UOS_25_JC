from flask import current_app
from sqlalchemy import and_, select, join
from app import db

def get_worker_no_now(branch_code):
    WorkRecord = current_app.tables.get('work_record')
    EmpBranch = current_app.tables.get('emp_branch')

    # 현재 지점에 대한 work record를 조회 -> 그 중에 end date가 널인 직원.
    select_q = (select(EmpBranch.c.emp_no)
                .where(and_(EmpBranch.c.branch_code == branch_code,
                            WorkRecord.c.work_end_date == None,))
                .select_from(join(EmpBranch, WorkRecord, EmpBranch.c.emp_branch_no == WorkRecord.c.emp_branch_no)))
    emp_no = db.session.execute(select_q).fetchone().emp_no

    return emp_no