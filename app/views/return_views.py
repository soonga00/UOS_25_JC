from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, insert, join, Sequence, func
from app import db


###   반품 폐기  api    ###
bp_return = Blueprint('return', __name__, url_prefix='/return')


@bp_return.route('/rule/<int:sell_list_no>', methods=['GET'])
def get_return_rule(sell_list_no: int):
    SellList = current_app.tables.get('sell_list')
    Item = current_app.tables.get('item')
    DetailCode = current_app.tables.get('detail_code')

    q = (select(DetailCode.c.return_rule)
         .where(SellList.c.sell_list_no == sell_list_no)
         .select_from(join(Item, SellList, SellList.c.item_no == Item.c.item_no)
                      .join(DetailCode, (DetailCode.c.code == Item.c.code )
                            & (DetailCode.c.code_type == Item.c.code_type))))
    try:
        rule = db.session.execute(q).fetchone()
        print(rule)
        print(f"{sell_list_no} 판매 목록에 대한 반품 규정 조회: {rule.return_rule}")
        return jsonify({"rule": rule.return_rule})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({"msg": "반품 규정 조회에 실패했습니다. 다시 시도해 주세요."})

@bp_return.route('', methods=['POST'])
@jwt_required()
def return_item():
    """
    req = {
        "return_reason": "품질 이상으로 반품 요청 들어옴",
        "sell_list_no": 20,
    }
    :return:
    """
    data = request.get_json()
    ReturnList = current_app.tables.get('return_dispose_list')
    return_list_no_seq = Sequence('retrun_list_no_seq')
    branch_code = get_jwt_identity()
    curr_time = func.current_timestamp()

    # Check if the sell_list_no is already returned
    check_q = select(ReturnList).where(ReturnList.c.sell_list_no == data['sell_list_no'])
    existing_return = db.session.execute(check_q).fetchone()

    if existing_return:
        return jsonify({"msg": "반품이 이미 된 항목입니다."}), 400

    return_list_no = db.session.execute(return_list_no_seq.next_value()).scalar()

    stmt = insert(ReturnList).values(
        return_list_no=return_list_no,
        return_reason=data['return_reason'],
        return_date=curr_time,
        branch_code=branch_code,
        sell_list_no=data['sell_list_no'],
        return_flag="O"
    )

    try:
        db.session.execute(stmt)
        db.session.commit()
        return jsonify({"msg": f"{data['sell_list_no']} 반품 신청 완료: 반품 {return_list_no} 번"})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({"msg": "반품 신청에 실패했습니다. 다시 시도해 주세요."})
