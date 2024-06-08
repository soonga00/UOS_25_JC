from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert, and_, Sequence, select, update, join, text, delete
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
@jwt_required()
def err():
    """
    검품 결과, 오배송
    req = {
        "order_list_no": 3,
        "actual_qty": 300,
    }

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

            insert_stmt = (insert(ReceiveItem)
                           .values(receive_item_no=db.session.execute(receive_item_seq.next_value()).scalar(),
                                   actual_qty=item['actual_qty'],
                                   receive_date=curr_date,
                                   order_list_no=item['order_list_no'],
                                   item_no=item_no,
                                   check_manager_no=manager_no,
                                   check_result="1"))  # 오배송으로 기록
            db.session.execute(insert_stmt)
            print(f"발주({item['order_list_no']}번)의 {item_no}번 상품 오배송 처리.")

        db.session.commit()
        return jsonify({'msg': '입고 상품 오배송 처리되었습니다.'})

    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({'msg': "오배송 처리에 실패했습니다. 다시 시도해주세요."}), 500


@bp_stock.route('/get', methods=['GET'])
@jwt_required()
def get_stock():
    branch_code = get_jwt_identity()
    Stock = current_app.tables.get('stock')
    Item = current_app.tables.get('item')
    q = (select(Stock, Item.c.item_nm).where(Stock.c.branch_code == branch_code)
         .select_from(join(Item, Stock, Stock.c.item_no == Item.c.item_no)))
    stock_list = db.session.execute(q).fetchall()

    res = []
    for stock in stock_list:
        s = {
            "item_no": stock.item_no,
            "exp_date": stock.exp_date,
            "total_qty": stock.total_qty,
            "arrangement_qty": stock.arrangement_qty,
            "item_nm": stock.item_nm
        }
        res.append(s)

    return jsonify({"stock_list": res})


@bp_stock.route('/update', methods=['POST'])
@jwt_required()
def update_stock():
    """
    req = {
        "item_no": 1,
        "exp_date": "2024-09-80 00:00:00",
        "arrangement_qty": 300,
    }
    :return:
    """
    data = request.get_json()
    branch_code = get_jwt_identity()
    Stock = current_app.tables.get('stock')
    exp_date = datetime.strptime(data['exp_date'], '%Y-%m-%d %H:%M:%S')
    q = (update(Stock).where(and_(Stock.c.branch_code == branch_code,
                             Stock.c.item_no == data['item_no'],
                             Stock.c.exp_date == exp_date))
         .values(arrangement_qty=data['arrangement_qty']))
    try:
        db.session.execute(q)
        db.session.commit()

        return jsonify({"msg": "재고 수정이 정상적으로 처리되었습니다. "})
    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({"msg": "재고 수정이 제대로 이루지지 않았습니다. 다시 시도해 주세요."})


@bp_stock.route('/delete', methods=['POST'])
@jwt_required()
def delete_stock():
    """
    req = {
        "item_no": 1,
        "exp_date": "2024-09-80 00:00:00"
    }
    :return:
    """
    data = request.get_json()
    Stock = current_app.tables.get('stock')
    branch_code = get_jwt_identity()
    exp_date = datetime.strptime(data['exp_date'], '%Y-%m-%d %H:%M:%S')

    q = delete(Stock).where(and_(Stock.c.branch_code == branch_code,
                                 Stock.c.item_no == data['item_no'],
                                 Stock.c.exp_date == exp_date))

    try:
        db.session.execute(q)
        print(f"{branch_code} 지점의 재고가 삭제되었습니다.")
    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({"msg": "재고 삭제가 이루어지지 않았습니다. 다시 시도해 주세요."}), 400

    # 폐기 생성
    Return = current_app.tables.get('return_dispose_list')
    return_list_no_seq = Sequence('retrun_list_no_seq')
    return_no = db.session.execute(return_list_no_seq.next_value()).scalar()
    curr_date = datetime.now()
    q = insert(Return).values(return_list_no=return_no,
                              return_date=curr_date,
                              return_flag="x",
                              branch_code=branch_code,
                              return_reason="유통기한 지난 재고 폐기")

    try:
        db.session.execute(q)
        db.session.commit()
        print(f"{branch_code}의 재고 폐기 처분")
        return jsonify({"msg": "재고 폐기 처분이 정상적으로 등록되었습니다."})
    except Exception as e:
        db.session.rollback()
        print(str(e))
        return jsonify({"msg": "재고 삭제가 이루어지지 않았습니다. 다시 시도해 주세요."}), 400


def get_item_no_from_order_list(order_list_no):
    OrderList = current_app.tables.get('order_list')
    q = select(OrderList.c.item_no).where(OrderList.c.order_list_no == order_list_no)
    return db.session.execute(q).fetchone().item_no






