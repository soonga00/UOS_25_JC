from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert, and_, Sequence, select, update, join, text, between, func
from app import db
from ..actions.emp import get_worker_now
from datetime import datetime

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



@bp_sell.route('/<int:item_no>', methods=['GET'])
def get_sell(item_no:int):
    Item = current_app.tables.get('item')
    Event = current_app.tables.get('event')
    ItemEvent = current_app.tables.get('item_event')
    curr_time = func.current_timestamp()

    q = (
        select(Item, Event)
         .where(
            and_(
                Item.c.item_no == item_no, # 해당 아이템에 대해
                curr_time.between(Event.c.start_date, Event.c.end_date) # 현재 진행 중인 이벤트 정보만
            )
        )
        .select_from(
            ItemEvent.join(Item, ItemEvent.c.item_no == Item.c.item_no)
                     .join(Event, ItemEvent.c.event_no == Event.c.event_no)
        )
    )

    try:
        event_info = db.session.execute(q).fetchall()
        item_info = db.session.execute(select(Item).where(Item.c.item_no == item_no)).fetchone()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({'msg': "상품 정보 조회에 실패했습니다. 다시 시도해 주세요."})

    event_num = len(event_info)

    item_info = {
        'item_no': item_no,
        'item_nm': item_info.item_nm,
        'consumer_price': item_info.consumer_price
    }

    event_list = []

    for event in event_info:
        if event.event_type == "G": # 증정행사
            # 증정 상품 정보도 함께 제공
            q = select(Item).where(Item.c.item_no == event.giveaway_no)
            give = db.session.execute(q).fetchone()
            event_list.append({
                "event_type": event.event_type,
                "giveaway_no": give.item_no,
                "giveaway_nm": give.item_nm
            })
        else: # 할인행사
            event_list.append({
                "event_type": event.event_type,
                "dc_amt": event.dc_amt
            })

    print(event_info)
    print(event_list)
    print(f"{item_no} 상품 정보 조회")
    return  jsonify({
        "item_info": item_info,
        "event_list": event_list,
        "event_num": event_num # 관련 이벤트 개수
    }), 200