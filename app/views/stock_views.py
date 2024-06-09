from typing import List, Dict, Union, Any

from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert, and_, Sequence, select, update, join, text, delete
from sqlalchemy.exc import SQLAlchemyError
import base64
from app import db
from datetime import datetime
from ..actions.emp import get_worker_no_now

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
    manager_no = get_worker_no_now(branch_code)  # 현재 근무 직원이 검품 담당자 번호
    print(f"상품 검품 담당자 (현재 근무 직원): {manager_no}")

    try:
        # 이미 입고 완료된 발주 목록 확인
        already_received = []
        for item in data['receive_list']:
            existing_receive = db.session.execute(
                select(ReceiveItem).where(ReceiveItem.c.order_list_no == item['order_list_no'])
            ).fetchone()

            if existing_receive:
                already_received.append(item['order_list_no'])

        if already_received:
            return jsonify({'msg': f"발주 목록 {already_received}은(는) 이미 입고 완료되었습니다."}), 400

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

        order_no = get_order_no_from_list(data['receive_list'][0]['order_list_no'])
        state = get_order_state(order_no)
        update_order_state(order_no, state)
        print(f"{order_no}번 발주 진행 상태 업데이트: {state}")

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
        "receive_list": [
            { "order_list_no": 3, "actual_qty": 500, "exp_date": "2024-09-80 00:00:00" },
            { "order_list_no": 2, "actual_qty": 10, "exp_date": "2024-09-80 00:00:00" },
        ]
    }

    """
    data = request.get_json()

    ReceiveItem = current_app.tables.get('receive_item')

    branch_code = get_jwt_identity()
    curr_date = datetime.now()
    receive_item_seq = Sequence('receive_item_no_seq')
    manager_no = get_worker_no_now(branch_code)  # 현재 근무 직원이 검품 담당자 번호
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

        order_no = get_order_no_from_list(data['receive_list'][0]['order_list_no'])
        state = get_order_state(order_no)
        update_order_state(order_no, state)
        print(f"{order_no}번 발주 진행 상태 업데이트: {state}")

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
    try:
        categories, sub_categories = get_item_categories()
    except Exception as e:
        return jsonify({"msg": "재고 조회에 실패했습니다. 다시 시도해주세요."})

    class2 = sub_categories.keys()
    for key in class2: # 중분류들
        class3 = sub_categories[key] # 소분류들
        for codes in class3: #소분류 코드들
            code = codes['code']
            code_type = codes['code_type']
            try:
                stocks = get_stock_by_code(branch_code, code_type, code)
            except Exception as e:
                return jsonify({"msg": "재고 조회에 실패했습니다. 다시 시도해주세요."})

            item_list = []
            for stock in stocks: # 각 상세코드별로 아이템 리스트 추가
                if stock.img is not None:
                    img_base64 = base64.b64encode(stock.img).decode('utf-8')
                    is_img = True
                else:
                    img_base64 = None
                    is_img = False
                item_list.append({
                    "item_no": stock.item_no,
                    "item_nm": stock.item_nm,
                    "exp_date": stock.exp_date,
                    "total_qty": stock.total_qty,
                    "arrangement_qty": stock.arrangement_qty,
                    "img": img_base64,
                    "is_img": is_img # 이미지 있는지 여부
                })
            codes['item_list'] = item_list

    res = {
        "categories": categories,
        "sub_categories": sub_categories
    }

    return jsonify(res), 200

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


def get_item_categories():
    # 도미노 -> parent_code_type parent_code 에 따라 group
    # 여기서 parent_code_type = 대분류인 애들 / 중분류인 애들 분류
    # 상세 코드 -> 조회된 모든 노미노의 code_nm 조회

    CodeType = current_app.tables.get('code_type')
    DetailCode = current_app.tables.get('detail_code')
    Domino = current_app.tables.get('domino')

    try:
        codetype_q = db.select(CodeType.c.code_type).select_from(CodeType)
        code_type_list = db.session.execute(codetype_q).fetchall()  # 모든 코드 종류 저장한 배열

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    item_group = []  # 대분류끼리, 중분류끼리
    for i in range(len(code_type_list)):
        query = (select(Domino)
                 .select_from(Domino)
                 .where(Domino.c.parent_code_type == code_type_list[i].code_type))
        try:
            group = db.session.execute(query).fetchall()
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

        item_group.append(group)

    categories = {}  # 대분류: 중분류
    sub_categories = {}  # 중분류: 소분류
    parent = {}

    for group in item_group:
        if not group:
            continue
        c = {}
        for child in group:
            parent_code_type = child.parent_code_type
            parent_code = child.parent_code

            if not (parent_code_type, parent_code) in parent:
                parent_q = (select(DetailCode.c.code_nm)
                .select_from(DetailCode)
                .where(
                    and_(
                        DetailCode.c.code_type == parent_code_type,
                        DetailCode.c.code == parent_code)
                )
                )
                try:
                    parent_nm = db.session.execute(parent_q).fetchone().code_nm
                except SQLAlchemyError as e:
                    db.session.rollback()
                    return jsonify({"error": str(e)}), 500

                parent[(parent_code_type, parent_code)] = parent_nm
            else:
                parent_nm = parent[(parent_code_type, parent_code)]

            child_q = (select(DetailCode)
            .select_from(DetailCode)
            .where(
                and_(
                    DetailCode.c.code_type == child.code_type,
                    DetailCode.c.code == child.code)
            ))
            try:
                child = db.session.execute(child_q).fetchone()
            except SQLAlchemyError as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500

            if parent_code_type in ['CD-001', 'CD-101']:  # 대분류
                if parent_nm in c:
                    c[parent_nm].append(child.code_nm)
                else:
                    c[parent_nm] = [child.code_nm]
            else:  # 중분류
                if parent_nm in c:
                    c[parent_nm].append({"code_nm": child.code_nm,
                                         "code_type": child.code_type,
                                         "code": child.code})
                else:
                    c[parent_nm] = [{"code_nm": child.code_nm,
                                     "code_type": child.code_type,
                                     "code": child.code}]

        if parent_code_type in ['CD-001', 'CD-101']:  # 대분류
            categories.update(c)
        else:
            sub_categories.update(c)

    return categories, sub_categories

def get_stock_by_code(branch_code, code_type, code):
    Stock = current_app.tables.get('stock')
    Item = current_app.tables.get('item')
    ItemImg = current_app.tables.get('item_img')
    q = (select(Stock, Item, ItemImg.c.img)
         .where(and_(Item.c.code_type ==code_type,
                     Item.c.code == code))
         .select_from(join(Stock, Item,
                           (Stock.c.branch_code == branch_code)
                           & (Stock.c.item_no == Item.c.item_no))
                      .join(ItemImg, Item.c.img_no == ItemImg.c.img_no)))

    return db.session.execute(q).fetchall()


def get_order_state(order_no):
    OrderList = current_app.tables.get('order_list')
    ReceiveItem = current_app.tables.get('receive_item')

    q = select(OrderList.c.order_list_no).where(OrderList.c.order_no == order_no)
    order_list = db.session.execute(q).fetchall()
    orders = []
    for o in order_list:
        orders.append(o.order_list_no)

    q = select(ReceiveItem).where(ReceiveItem.c.order_list_no.in_(orders))
    receive_list = db.session.execute(q).fetchall()
    if(len(receive_list) == len(order_list)):
        return "완료"
    elif len(receive_list) > 0:
        return "진행중"

def get_order_no_from_list(order_list_no):
    OrderList = current_app.tables.get('order_list')
    t = db.session.execute(select(OrderList.c.order_no).where(OrderList.c.order_list_no == order_list_no)).fetchone()
    return t.order_no


def update_order_state(order_no, state):
    Order = current_app.tables.get('orders')
    q = update(Order).where(Order.c.order_no == order_no).values(state=state)
    db.session.execute(q)
    db.session.commit()

