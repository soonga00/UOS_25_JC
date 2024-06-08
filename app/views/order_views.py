from flask import Blueprint, jsonify, current_app, request
from sqlalchemy import and_, Sequence, insert, func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

###   발주  api    ###
bp_order = Blueprint('order', __name__, url_prefix='/order')


# @bp_order.route('/category', methods=['GET'])
# # def get_categories():
@bp_order.route('/req', methods=['POST'])
@jwt_required()
def req_order():
    # 요청 포맷
    # req = { "order_list": [
    #         {"item_no": 3, "order_qty": 100},
    #         {"item_no": 2, "order_qty": 250},
    #         {"item_no": 1, "order_qty": 400},
    #     ]}
    data = request.get_json()
    branch_code = get_jwt_identity()

    Orders = current_app.tables.get('orders')
    OrderList = current_app.tables.get('order_list')

    try:
        order_no_seq = Sequence('order_no_seq')
        order_no = db.session.execute(order_no_seq.next_value()).scalar()
        insert_stmt = insert(Orders).values(
            order_no= order_no,
            order_date=datetime.now(),
            state="신청",
            branch_code=branch_code,
        )
        db.session.execute(insert_stmt) # 발주 생성

        order_list_no_seq = Sequence('order_list_no_seq')
        for item in data['order_list']: # 발주 목록 생성
            insert_stmt = insert(OrderList).values(
                order_no=order_no,
                order_list_no=db.session.execute(order_list_no_seq.next_value()).scalar(),
                order_qty=item['order_qty'],
                item_no=item['item_no']
            )
            db.session.execute(insert_stmt)

        db.session.commit()
        return jsonify({'msg': f'{branch_code} 지점의 {order_no} 번 발주 신청이 완료되었습니다.'})

    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "발주 신청에 실패했습니다."}), 500



@bp_order.route('/list', methods=['GET'])
@jwt_required()
def get_order_list():
    # 토큰으로 지점 조회
    branch = get_branch_by_branch_code(get_jwt_identity())

    if branch is None:
        return jsonify({"msg": "지점 정보를 찾을 수 없습니다."}), 404

    orders = get_orders_by_branch_code(branch.branch_code)

    order_list = []
    for order in orders:
        order_details = get_order_detail_by_order_no(order.order_no)
        items = []
        for detail in order_details:
            item = get_item_by_item_no(detail.item_no)
            item_dict = {
                'item_nm': item.item_nm,
                'order_qty': detail.order_qty,
                'deliv_price': item.deliv_price
            }
            items.append(item_dict)
        order_dict = {
            'order_no': order.order_no,
            'state': order.state,
            'items': items
        }
        order_list.append(order_dict)

    return jsonify(order_list), 200


def get_item_by_item_no(item_no):
    item = current_app.tables['item']
    query = db.select(item).where(item.c.item_no == item_no)
    return db.session.execute(query).fetchone()


def get_order_detail_by_order_no(order_no):
    order_list = current_app.tables['order_list']
    query = db.select(order_list).where(order_list.c.order_no == order_no)
    return db.session.execute(query).fetchall()


def get_orders_by_branch_code(branch_code):
    order = current_app.tables['orders']
    query = db.select(order).where(order.c.branch_code == branch_code)
    return db.session.execute(query).fetchall()


def get_branch_by_branch_code(branch_code):
    # BranchList 테이블 참조
    branch_list = current_app.tables['branch_list']

    # 지점장 ID와 일치하는 지점 코드 조회
    query = db.select(branch_list).where(branch_list.c.branch_code == branch_code)
    branch = db.session.execute(query).fetchone()
    return branch
