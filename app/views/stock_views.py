from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert, and_, Sequence, select, update, join, text
from app import db
from datetime import datetime
from ..actions.emp import get_worker_now

###   재고관리  api    ###
bp_stock = Blueprint('stock', __name__, url_prefix='/stock')

@bp_stock.route('/receive', methods=['POST'])
@jwt_required()
def receive():
    """
    발주 목록들 선택 -> 정상 배송
    -> 입고 목록 생성, 재고 업데이트
    req = {
        "receive_list": [
            { "order_list_no": 3, "actual_qty": 500, "exp_date": "2024-09-80 00:00:00" },
            { "order_list_no": 2, "actual_qty": 10, "exp_date": "2024-09-80 00:00:00" },
        ]
    }
    :return:
    """
    data = request.get_json()

    ReceiveItem = current_app.tables.get('receive_item')

    branch_code = get_jwt_identity()
    curr_date = datetime.now()
    receive_item_seq = Sequence('receive_item_no_seq')
    manager_no = get_worker_now(branch_code)  # 현재 근무 직원이 검품 담당자 번호
    print(f"상품 검품 담당자 (현재 근무 직원): {manager_no}")

    try:
        # 모든 입고에 대해 입고 목록 생성
        for item in data['receive_list']:
            item_no = get_item_no_from_order_list(item['order_list_no'])
            exp_date = datetime.strptime(item['exp_date'], '%Y-%m-%d %H:%M:%S')

            insert_stmt = (insert(ReceiveItem)
                            .values(receive_item_no=db.session.execute(receive_item_seq.next_value()).scalar(),
                                    actual_qty=item['actual_qty'],
                                    receive_date=curr_date,
                                    order_list_no=item['order_list_no'],
                                    item_no=item_no,
                                    check_manager_no=manager_no,
                                    check_result="0")) #문제 없음으로 기록
            db.session.execute(insert_stmt)
            print(f"발주({item['order_list_no']}번)의 {item_no}번 상품 입고 처리.")

            select_q = text(""" SELECT *
                                FROM stock
                                WHERE stock.branch_code = :branch_code 
                                AND stock.item_no = :item_no 
                                AND TO_CHAR(stock.exp_date, 'YYYY-MM-DD HH24:MI:SS') = :exp_date """)
            stock = db.session.execute(select_q, {'branch_code': branch_code, 'item_no': item_no, 'exp_date':item['exp_date'] }).fetchone()

            if stock is None: # 같은 재고 없으면 insert
                select_q = text(""" INSERT INTO stock (branch_code, item_no, total_qty, exp_date, arrangement_qty)
                                    VALUES (:branch_code, :item_no, :actual_qty, :exp_date, 0)""" )
                db.session.execute(select_q, {'branch_code': branch_code,
                                              'item_no': item_no,
                                              'exp_date': exp_date,
                                              'actual_qty': item['actual_qty'],
                                               })
                print(f"{item_no}번 상품 재고: {item['actual_qty']} 개")

            else: # 같은 재고 있으면 개수만 업데이트
                select_q = text(""" UPDATE stock 
                                    SET total_qty =:actual_qty
                                    WHERE (stock.branch_code = :branch_code AND stock.item_no = :item_no AND TO_CHAR(stock.exp_date, 'YYYY-MM-DD HH24:MI:SS') = :exp_date)""")
                db.session.execute(select_q, {'branch_code': branch_code,
                                              'item_no': item_no,
                                              'exp_date': item['exp_date'],
                                              'actual_qty': stock.total_qty +  item['actual_qty']
                                              })
                print(f"{item_no}번 상품 재고: {item['actual_qty']} 개 추가. 총 {stock.total_qty + item['actual_qty']} 개")

        db.session.commit()
        return jsonify({'msg': '입고 요청이 정상적으로 처리되었습니다.'})

    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({'msg': "입고 상품 등록에 실패했습니다. 다시 시도해주세요."}), 500

@bp_stock.route('/error', methods=['POST'])
def err():
    """
    검품 결과, 오배송
    req = {
        "order_list_no": 3,
        "actual_qty": 300,
    }

    """
    data = request.get_json()
    ReturnDisposeList = current_app.tables.get('return_dispose_list')
    item_no = get_item_no_from_order_list(data['receive_list'])

def get_item_no_from_order_list(order_list_no):
    OrderList = current_app.tables.get('order_list')
    q = select(OrderList.c.item_no).where(OrderList.c.order_list_no == order_list_no)
    return db.session.execute(q).fetchone().item_no






