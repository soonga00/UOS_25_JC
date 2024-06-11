from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, func, extract, and_, Sequence, insert, join
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


@bp_charge.route('/labor_cost', methods=['GET']) # 인건비 지출
@jwt_required()
def get_charge_emp():

    branch_code = get_jwt_identity()
    Charge = current_app.tables.get('charge')
    Emp = current_app.tables.get('emp')

    curr_emp_no = get_worker_no_now(branch_code)
    manager_no = get_branch_manager(branch_code)
    if curr_emp_no != manager_no: # 지점장이 아닌 경우 return
        print(f"지점장이 아닌 근무자 {curr_emp_no} 의 지출 접근")
        return jsonify({"msg": f"지출 관리는 지점장만 가능합니다. 현재 근무자: {curr_emp_no}번"})

    if already_charged_by_type(branch_code, charge_type="0"):
        print("이미 이번 달 로열티 지급이 이미 완료되었습니다.")
        return jsonify({"msg": "이미 이번 달 로열티 지급이 이미 완료되었습니다."})

    emp_list = get_emp_list(branch_code)
    total_cost = 0
    rst = []
    for emp_no in emp_list:
        if emp_no == manager_no: # 지점장은 인건비 안 줌
            continue
        cost = get_work_cost(branch_code, emp_no)
        emp = db.session.execute(select(Emp).where(Emp.c.emp_no == emp_no)).fetchone()
        rst.append(f"{emp_no}번 사원 {emp.emp_nm} {emp.bank_nm} {emp.acct_no}로 {cost:,}원 지급")
        total_cost += cost

    charge_no_seq = Sequence('charge_no_seq')
    stmt = insert(Charge).values(
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


@bp_charge.route('/maintenance', methods=['POST']) # 유지비 지출
@jwt_required()
def get_maintenance():
    """
    req = {
        "cost': 314500 # 유지비
    }
    :return:
    """
    branch_code = get_jwt_identity()
    data = request.get_json()
    curr_emp_no = get_worker_no_now(branch_code)
    manager_no = get_branch_manager(branch_code)
    if curr_emp_no != manager_no:
        print(f"지점장 {manager_no}이 아닌 근무자 {curr_emp_no} 의 지출 접근")
        return jsonify({"msg": f"지출 관리는 지점장만 가능합니다. 현재 근무자: {curr_emp_no}번"})

    if already_charged_by_type(branch_code, charge_type="1"):
        print("이미 이번 달 유지비 지급이 이미 완료되었습니다.")
        return jsonify({"msg": "이미 이번 달 유지비 지급이 이미 완료되었습니다."})

    Charge = current_app.tables.get('charge')
    charge_no_seq = Sequence('charge_no_seq')
    try:
        stmt = insert(Charge).values(
            charge_no=db.session.execute(charge_no_seq.next_value()).scalar(),
            charge_date=func.current_date(),
            charge_amt=data['cost'],
            branch_code=branch_code,
            charge_type="1" # 유지비 "1"
        )
        db.session.execute(stmt)
        db.session.commit()
        return jsonify({"msg": f"유지비 {data['cost']:,}원 지출 처리 완료되었습니다."}), 200
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "유지비 지출 처리에 실패했습니다. 다시 시도해 주세요."})


@bp_charge.route('/royalty', methods=['GET']) # 로열티
@jwt_required()
def get_royalty():
    branch_code = get_jwt_identity()

    curr_emp_no = get_worker_no_now(branch_code)
    manager_no = get_branch_manager(branch_code)
    if curr_emp_no != manager_no:
        print(f"지점장 {manager_no}이 아닌 근무자 {curr_emp_no} 의 지출 접근")
        return jsonify({"msg": f"지출 관리는 지점장만 가능합니다. 현재 근무자: {curr_emp_no}번"})

    if already_charged_by_type(branch_code, charge_type="2"):
        print("이미 이번 달 로열티 지급이 이미 완료되었습니다.")
        return jsonify({"msg": "이미 이번 달 로열티 지급이 이미 완료되었습니다."})


    total_margin = get_total_margin(branch_code)
    payment_ratio = get_pyment_ratio(branch_code)
    royalty_cost = int(total_margin * payment_ratio // 100)

    Charge = current_app.tables.get('charge')
    charge_no_seq = Sequence('charge_no_seq')
    stmt = insert(Charge).values(
        charge_no=db.session.execute(charge_no_seq.next_value()).scalar(),
        charge_date=func.current_date(),
        branch_code=branch_code,
        charge_amt=royalty_cost,
        charge_type="2" # 로열티
    )
    try:
        db.session.execute(stmt)
        db.session.commit()
        print(f"{branch_code} 지점: 이번 달 총 판매 마진 {total_margin:,}원에 따른 로열티 {royalty_cost:,} 지불")
        return jsonify({"msg": f"{branch_code} 지점: 이번 달 총 판매 마진 {total_margin:,}원에 따른 로열티 {royalty_cost:,} 지불 완료"})
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "로열티 지급에 실패했습니다. 다시 시도해 주세요."})


@bp_charge.route('/order', methods=['GET']) # 판대 대금
@jwt_required()
def get_sale():
    branch_code = get_jwt_identity()

    curr_emp_no = get_worker_no_now(branch_code)
    manager_no = get_branch_manager(branch_code)
    if curr_emp_no != manager_no:
        print(f"지점장 {manager_no}이 아닌 근무자 {curr_emp_no} 의 지출 접근")
        return jsonify({"msg": f"지출 관리는 지점장만 가능합니다. 현재 근무자: {curr_emp_no}번"})

    if already_charged_by_type(branch_code, charge_type="3"):
        print("이미 이번 달 물품 대금 지급이 이미 완료되었습니다.")
        return jsonify({"msg": "이미 이번 달 물품 대금 지급이 이미 완료되었습니다."})

    order_no_list = get_orders_by_branch(branch_code)  # 해당 지점의 이번달 발주 번호 들
    order_list_no_list = get_order_list_by_order(order_no_list)  # 해당 지점의 이번달 발주 목록 번호들
    total_order_cost = get_total_order_cost(order_list_no_list)

    Charge = current_app.tables.get('charge')
    charge_no_seq = Sequence('charge_no_seq')
    stmt = insert(Charge).values(
        charge_no=db.session.execute(charge_no_seq.next_value()).scalar(),
        charge_date=func.current_date(),
        branch_code=branch_code,
        charge_amt=total_order_cost,
        charge_type="3" # 물품 대금
    )
    try:
        db.session.execute(stmt)
        db.session.commit()
        print(f"{branch_code} 지점: 이번 달 발주 {order_no_list}번에 대한 물품 대금 {total_order_cost:,}원 지불")
        return jsonify({"msg": f"{branch_code} 지점: 이번 달 발주 {order_no_list}번에 대한 물품 대금 총 {total_order_cost:,} 지불"})
    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "물품 대금 지급에 실패했습니다. 다시 시도해 주세요."})

def get_orders_by_branch(branch_code):
    Orders = current_app.tables.get('orders')

    # 현재 날짜와 시간 가져오기
    current_date = func.current_date()
    # 현재 년도와 월 추출
    current_year = extract('YEAR', current_date)
    current_month = extract('MONTH', current_date)

    q = select(Orders.c.order_no).where(and_(
        Orders.c.branch_code == branch_code,
        extract('YEAR', Orders.c.order_date) == current_year,  # 이번 달 입고
        extract('MONTH', Orders.c.order_date) == current_month
    ))
    orders = db.session.execute(q).fetchall()
    order_no_list = [order.order_no for order in orders]
    return order_no_list

def get_order_list_by_order(order_no_list):
    OrderList = current_app.tables.get('order_list')
    q = select(OrderList.c.order_list_no).where(OrderList.c.order_no.in_(order_no_list))
    order_lists= db.session.execute(q).fetchall()
    order_list_no_list = [order_list.order_list_no for order_list in order_lists]
    return order_list_no_list

def get_total_order_cost(order_list_no_list):
    ReceiveList = current_app.tables.get('receive_item')
    Item = current_app.tables.get('item')

    # receive_item의 order_list의 order_no의 branch_code가 현재 지점인 애들
    # 현재 지점의 receive_item 들 중 이상 없는 애들 속하는 item_no , actual_qty, 그리고 해당 item_no의 deliv_price
    received_list = (select(ReceiveList.c.actual_qty, Item.c.deliv_price)
                    .select_from(join(ReceiveList, Item, ReceiveList.c.item_no == Item.c.item_no))
                    .where(and_(
                        ReceiveList.c.order_list_no.in_(order_list_no_list), # 현재 지점의 이번달 입고 상품 중
                        ReceiveList.c.check_result == "0", # 이상 없는 것들
                    )
            )
    )
    q = db.session.execute(received_list).fetchall()
    total_order_cost = 0
    for order in q:
        total_order_cost += (order.actual_qty * order.deliv_price)

    return total_order_cost



def get_pyment_ratio(branch_code):
    BranchList = current_app.tables.get('branch_list')
    q = select(BranchList.c.payment_ratio).where(BranchList.c.branch_code == branch_code)
    branch = db.session.execute(q).fetchone()
    return branch.payment_ratio

def get_total_margin(branch_code):
    Sales = current_app.tables.get('sales')

    # 현재 날짜와 시간 가져오기
    current_date = func.current_date()

    # 현재 년도와 월 추출
    current_year = extract('YEAR', current_date)
    current_month = extract('MONTH', current_date)

    # 특정 datetime 컬럼이 이번 달에 속하는 레코드를 선택하는 쿼리 생성
    query = (
        select(func.sum(Sales.c.sell_margin).label('total_margin'))
        .where(
            and_(Sales.c.branch_code == branch_code,
                 extract('YEAR', Sales.c.sales_date) == current_year,
                 extract('MONTH', Sales.c.sales_date) == current_month
                )
        )
        .group_by(Sales.c.branch_code)
    )

    total_margin = db.session.execute(query).fetchone().total_margin
    return total_margin


def get_branch_manager(branch_code):
    BranchList = current_app.tables.get('branch_list')
    manager_no = db.session.execute(
        select(BranchList.c.manager_no).where(BranchList.c.branch_code == branch_code)).fetchone()
    return manager_no.manager_no


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


def already_charged_by_type(branch_code, charge_type):
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
                 Charge.c.charge_type == charge_type,
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