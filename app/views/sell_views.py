from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert, and_, Sequence, select, update, join, text
from app import db
from ..actions.emp import get_worker_now

###   판매  api    ###
bp_sell = Blueprint('sell', __name__, url_prefix='/sell')

@bp_sell.route('', methods=['GET'])
@jwt_required()
def create_sell():
    Sell = current_app.tables.get('sell')
    branch_code = get_jwt_identity()
    sell_no_seq = Sequence('sell_no_seq')
    sell_no = db.session.execute(sell_no_seq.next_value()).scalar()
    seller_no = get_worker_now(branch_code)

    q = insert(Sell).values(branch_code=branch_code, sell_no=sell_no, seller_no=seller_no, buy_abandon_flag="x")
    try:
        db.session.execute(q)
        db.session.commit()
        print(f"판매 {sell_no}번 생성")
        return jsonify({'sell_no': sell_no})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({'error': str(e)})




