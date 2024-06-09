from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import insert, and_, Sequence, select, update, join, text, between, func
from app import db
from ..actions.emp import get_worker_no_now
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
    seller_no = get_worker_no_now(branch_code)

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

@bp_sell.route('/payment', methods=['POST'])
@jwt_required()
def payment():
    """
    판매 목록을 포함하여 결제까지 처리.
    -> 판매 목록 생성, 판매 수정, 재고 수정
    req = {
        "sell_no": 3,
        "item_list":  [
            {"item_no": 1, "sell_qty": 3 }, # 증정품은 X
            {"item_no": 2, "sell_qty": 1 }
        ],
        "sex": "F",
        "age": "20",
        "consumer_no": 1,
        "pay_method": 1
    }
    :return:
    """

    data = request.get_json()
    Sell = current_app.tables.get('sell')

    branch_code = get_jwt_identity()

    age = None
    sex = None
    pay_amt = 0

    if data['age']:
        age = data['age']
    if data['sex']:
        sex = data['sex']

    for item in data['item_list']: # 각 아이템별로 판매 목록 생성 & 재고 수정 
        item_no = item['item_no']
        item_info, event_info = get_item_info(item_no)
        item_price = item_info.consumer_price
        giveaway_list = []

        if event_info:
            for event in event_info:
                if event.event_type == "D":# 할인 행사시 할인 적용된 가격으로 반영
                    item_price -= event.dc_amt
                if event.event_type == "G":# 증정품 리스트 생성
                    giveaway_list.append(event.giveaway_no)
        pay_amt += (item_price * item['sell_qty']) 

        params = {  'sell_no': data['sell_no'],
                    'item_no': item_no,
                    'sell_qty': item['sell_qty'],
                    'item_price': item_price,
                    'age': age,
                    'sex': sex
                }
        try:
            create_sell_list(params) # 판매 목록 생성
            print(f"{branch_code}지점의 {data['sell_no']}번 판매 - 상품 {item_no}에 대한 판매 목록 등록 .")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(e)
            return {"msg": "판매 처리에 실패했습니다. 다시 시도해 주세요."}

        # 증정품 판매 등록
        for give_item_no in giveaway_list:
            try:
                params = {
                    'sell_no': data['sell_no'],
                    'item_no': give_item_no,
                    'sell_qty': item['sell_qty'],
                    'item_price': 0,
                    'age': age,
                    'sex': sex
                }
                create_sell_list(params)
                params = {
                    'branch_code': branch_code,
                    'item_no': give_item_no,
                    'sell_qty': item['sell_qty'],
                }
                update_stock_by_sell(params)
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(e)
                return {"msg": "증정품 처리에 실패했습니다. 다시 시도해 주세요."}

        # 재고 수정
        params = {
            'branch_code': branch_code,
            'item_no': give_item_no,
            'sell_qty': item['sell_qty'],
        }
        try:
            update_stock_by_sell(params)
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(e)
            return jsonify({'msg': "재고 처리에 실패했습니다. 다시 시도해 주세요."})

    # 판매 수정
    curr_time = func.current_timestamp()
    mileage = None
    consumer_no = None 
    if data['consumer_no']: # 소비자 있으면 마일리지 적립
        mileage = (pay_amt * 3) // 100
        consumer_no = data['consumer_no']
        Consumer = current_app.tables.get('consumer')
        q = update(Consumer).where(Consumer.c.consumer_no == consumer_no).values(mileage=Consumer.c.mileage + mileage)
        try:
            db.session.execute(q)
            print(f"{consumer_no}번 소비자 마일리지 {mileage}원 적립")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(e)
            return jsonify({"msg": "소비자 마일리지 적립에 실패했습니다."})

    # 현금일 때 시제 수정
    if data['pay_method'] == "0": # 현금
        Cash = current_app.tables.get('cash')
        q = update(Cash).where(Cash.c.branch_code == branch_code).values(total_amt = Cash.c.total_amt + pay_amt)
        try:
            db.session.execute(q)
            print(f"{branch_code} 지점의 현금 시제 변경")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(e)
            return jsonify({"msg": "현금 시제 처리에 실패했습니다."})
    
    q = (update(Sell).where(Sell.c.sell_no == data['sell_no'])
         .values(
        consumer_no = consumer_no,
        pay_amt = pay_amt,
        pay_method = data['pay_method'],
        sell_date = curr_time,
        mileage =  mileage
    ))
    
    try:
        db.session.execute(q)
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({'msg': "판매 요청에 실패했습니다. 다시 시도해 주세요."})
    
    db.session.commit()
    print(f"판매 번호 {data['sell_no']}번: {pay_amt} 원 결제 완료")
    return jsonify({"msg": f"판매 번호 {data['sell_no']}번: {pay_amt} 원 결제 완료"})


@bp_sell.route('abandon/<int:sell_no>', methods=['GET'])
@jwt_required()
def abandon(sell_no):
    Sell = current_app.tables.get('sell')
    SellList = current_app.tables.get('sell_list')
    sellist_q = select(SellList).where(SellList.c.sell_no == sell_no)
    update_q = update(Sell).where(Sell.c.sell_no == sell_no).values(buy_abandon_flag="O")

    try:
        sellist = db.session.execute(sellist_q).fetchall()
        if sellist: #판매목록이 존재하는 판매 -> 이미 구매처리가 된 판매이므로 취소 불가
            print(f"{sell_no}번 판매는 이미 결제 처리된 판매 이므로 취소 불가")
            return jsonify({"msg": f"{sell_no}번 판매는 이미 결제 처리된 판매 이므로 취소 불가합니다."})
        db.session.execute(update_q)
        db.session.commit()
        return jsonify({"msg": f"{sell_no}번 판매: 구매 포기 처리"})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({"msg": f"{sell_no}번 판매 구매 포기 처리에 실패했습니다."})

def update_stock_by_sell(params):
    Stock = current_app.tables.get('stock')
    curr_time = func.current_timestamp()
    # 유통기한이 가장 임박한 재고라고 임의로 생각함 ~~
    q = (select(Stock).where(and_(Stock.c.item_no == params['item_no'],
                                Stock.c.branch_code == params['branch_code']))
            .order_by(Stock.c.exp_date).limit(1))
    stock = db.session.execute(q).fetchone()

    q = (update(Stock)
            .where(
                and_(
                Stock.c.item_no == params['item_no'],
                Stock.c.branch_code == params['branch_code'],
                Stock.c.exp_date == stock.exp_date))
            .values(arrangement_qty=stock.arrangement_qty - params['sell_qty'],
                total_qty=stock.total_qty - params['sell_qty']))
    db.session.execute(q)


def create_sell_list(params):
    SellList = current_app.tables.get('sell_list')
    sell_list_no_seq = Sequence('sell_list_no_seq')
    stmt = insert(SellList).values(
        sell_list_no=db.session.execute(sell_list_no_seq.next_value()).scalar(),
        sell_no=params['sell_no'],
        item_no=params['item_no'],
        sell_qty=params['sell_qty'],
        item_price=params['item_price'],
        age=params['age'],
        sex=params['sex']
    )

    try:
        db.session.execute(stmt)
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return {'msg': "판매 요청에 실패했습니다. 다시 시도해 주세요."}


def get_item_info(item_no):
    Item = current_app.tables.get('item')
    Event = current_app.tables.get('event')
    ItemEvent = current_app.tables.get('item_event')

    curr_time = func.current_timestamp()
    branch_code = get_jwt_identity()

    q = (
        select(Item, Event)
        .where(
            and_(
                Item.c.item_no == item_no,  # 해당 아이템에 대해
                curr_time.between(Event.c.start_date, Event.c.end_date)  # 현재 진행 중인 이벤트 정보만
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
        return (item_info, event_info)
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(e)
        return jsonify({'msg': "상품 정보 조회에 실패했습니다. 다시 시도해 주세요."})