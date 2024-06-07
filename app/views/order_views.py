from flask import Blueprint, jsonify, current_app
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError

from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

###   발주  api    ###
bp_order = Blueprint('order', __name__, url_prefix='/order')


# @bp_order.route('/category', methods=['GET'])
# # def get_categories():


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
