from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, func, extract, and_, Sequence, insert
from app import db
from ..actions.emp import get_worker_no_now

###   지출  api    ###
bp_charge = Blueprint('charge', __name__, url_prefix='/charge')

@bp_charge.route('/status', methods=['GET'])
@jwt_required()
def get_charge_status():
    branch_code = get_jwt_identity()
    Charges = current_app.tables.get('charge')
    BranchList = current_app.tables.get('branch_list')
    Emp = current_app.tables.get('emp')

    try:
        branch_info = db.session.execute(
            select(
                BranchList.c.branch_nm,
                BranchList.c.branch_code,
                BranchList.c.manager_no,
                BranchList.c.payment_ratio
            ).where(BranchList.c.branch_code == branch_code)
        ).fetchone()

        if not branch_info:
            return jsonify({"msg": "지점 정보를 찾을 수 없습니다."}), 404

        manager_name = db.session.execute(
            select(Emp.c.nm).where(Emp.c.emp_no == branch_info.manager_no)
        ).fetchone().nm

        charge_data = db.session.execute(
            select(
                Charges.c.charge_no,
                Charges.c.charge_date,
                Charges.c.charge_amt,
                Charges.c.charge_type
            ).where(Charges.c.branch_code == branch_code).order_by(Charges.c.charge_date)
        ).fetchall()

        charge_list = [{
            "charge_no": row.charge_no,
            "charge_date": row.charge_date,
            "charge_amt": row.charge_amt,
            "charge_type": row.charge_type
        } for row in charge_data]

        response_data = {
            "branch_nm": branch_info.branch_nm,
            "branch_code": branch_info.branch_code,
            "manager_nm": manager_name,
            "payment_ratio": branch_info.payment_ratio,
            "charges": charge_list
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(e)
        return jsonify({"msg": "지출 데이터를 가져오는 데 실패했습니다."}), 500


@bp_charge.route('/labor_cost', methods=['GET'])
@jwt_required()
def get_charge_emp():

    branch_code = get_jwt_identity()
    Charges = current_app.tables.get('charge')
    Emp = current_app.tables.get('emp')

    curr_emp_no = get_worker_no_now(branch_code)
    BranchList = current_app.tables.get('branch_list')
    manager = db.session.execute(select(BranchList.c.manager_no).where(BranchList.c.branch_code == branch_code)).fetchone()
    if curr_emp_no != manager.manager_no: # 지점장이 아닌 경우 return
        print(f"지점장이 아닌 근무자 {curr_emp_no} 의 지출 접근")
        return jsonify({"msg": f"지출 관리는 지점장만 가능합니다. 현재 근무자: {curr_emp_no}번"})

    if already_charged_labor_cost(branch_code): # 인건비 지급을 이미 한 경우 return
        print("이미 이번 달 인건비 지급이 이미 완료되었습니다.")
        return jsonify({"msg": "이미 이번 달 인건비 지급이 이미 완료되었습니다."})

    emp_list = get_emp_list(branch_code)
    total_cost = 0
    rst = []
    for emp_no in emp_list:
        cost = get_work_cost(branch_code, emp_no)
        emp = db.session.execute(select(Emp).where(Emp.c.emp_no == emp_no)).fetchone()
        rst.append(f"{emp_no}번 사원 {emp.emp_nm} {emp.bank_nm} {emp.acct_no}로 {cost}원 지급")
        total_cost += cost

    charge_no_seq = Sequence('charge_no_seq')
    stmt = insert(Charges).values(
        charge_no=db.session.execute(charge_no_seq.next_value()).scalar(),
        charge_date=func.current_date(),
        charge_amt=total_cost,
        branch_code=branch_code,
        charge_type="0" # 인건비 "0"
    )
    db.session.execute(stmt)
    db.session.commit()

    print(rst)
    return jsonify({"msg": rst, "total_cost": total_cost}), 200


def get_work_cost(branch_code, emp_no):
    WorkRecord = current_app.tables.get('work_record')
    emp_branch_no = get_emp_branch_no(branch_code, emp_no)
    # 현재 날짜와 시간 가져오기
    current_date = func.current_date()

    # 현재 년도와 월 추출
    current_year = extract('YEAR', current_date)
    current_month = extract('MONTH', current_date)

    # 특정 datetime 컬럼이 이번 달에 속하는 레코드를 선택하는 쿼리 생성
    query = (
        select(WorkRecord.c.wage, (func.round((WorkRecord.c.work_end_date - WorkRecord.c.work_start_date) * 24 * 60, 2)).label('work_duration_minutes'))
        .where(
            and_(WorkRecord.c.emp_branch_no == emp_branch_no,
                extract('YEAR', WorkRecord.c.work_start_date) == current_year,
                extract('MONTH', WorkRecord.c.work_start_date) == current_month,
                 WorkRecord.c.work_end_date != None
            )
        )
    )

    records = db.session.execute(query).fetchall()
    cost = 0
    for record in records:
        cost += record.work_duration_minutes * record.wage // 60
    return cost


def get_emp_branch_no(branch_code, emp_no):
    EmpBranch = current_app.tables.get('emp_branch')
    b = db.session.execute(select(EmpBranch.c.emp_branch_no)
                           .where(and_(EmpBranch.c.branch_code == branch_code,
                                       EmpBranch.c.emp_no == emp_no))).fetchone()
    return b.emp_branch_no

def already_charged_labor_cost(branch_code):
    Charge = current_app.tables.get('charge')
    current_date = func.current_date()

    # 현재 년도와 월 추출
    current_year = extract('YEAR', current_date)
    current_month = extract('MONTH', current_date)

    # 특정 datetime 컬럼이 이번 달에 속하는 레코드를 선택하는 쿼리 생성
    query = (
        select(Charge)
        .where(
            and_(Charge.c.branch_code == branch_code,
                 Charge.c.charge_type == "0",
                 extract('YEAR', Charge.c.charge_date) == current_year,
                 extract('MONTH', Charge.c.charge_date) == current_month
                 )
        )
    )

    records = db.session.execute(query).fetchone()
    if records :
        return True
    else:
        return False

def get_emp_list(branch_code):
    EmpBranch = current_app.tables.get('emp_branch')
    q = select(EmpBranch.c.emp_no).where(EmpBranch.c.branch_code == branch_code)
    records = db.session.execute(q).fetchall()
    emp_list = [record.emp_no for record in records]
    return emp_list