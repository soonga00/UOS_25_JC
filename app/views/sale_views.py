from datetime import datetime

from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, func, Sequence, insert, and_
from sqlalchemy.orm import aliased
from app import db

bp_sale = Blueprint('sale', __name__, url_prefix='/sales')


@bp_sale.route('/status', methods=['GET'])
@jwt_required()
def get_sales_status():
    branch_code = get_jwt_identity()
    Sales = current_app.tables.get('sales')
    BranchList = current_app.tables.get('branch_list')
    Emp = current_app.tables.get('emp')  # Assuming the employee table is named 'emp'

    try:
        branch_info = db.session.execute(
            select(
                BranchList.c.branch_nm,
                BranchList.c.branch_code,
                BranchList.c.manager_no,
                BranchList.c.payment_ratio
            ).where(BranchList.c.branch_code == branch_code)
        ).fetchone()

        manager_name = db.session.execute(
            select(Emp.c.nm).where(Emp.c.emp_no == branch_info.manager_no)
        ).fetchone().nm

        sales_data = db.session.execute(
            select(
                Sales.c.sales_no,
                Sales.c.sales_date,
                Sales.c.sales_amt,
                Sales.c.sell_margin
            ).where(Sales.c.branch_code == branch_code)
            .order_by(Sales.c.sales_date)
        ).fetchall()

        sales_list = [{
            "sales_no": row.sales_no,
            "sales_date": row.sales_date,
            "sales_amt": row.sales_amt,
            "sell_margin": row.sell_margin
        } for row in sales_data]

        response_data = {
            "branch_nm": branch_info.branch_nm,
            "branch_code": branch_info.branch_code,
            "manager_nm": manager_name,
            "payment_ratio": branch_info.payment_ratio,
            "sales": sales_list
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(e)
        return jsonify({"msg": "매출 데이터를 가져오는 데 실패했습니다."}), 500


@bp_sale.route('/daily-settlement', methods=['POST'])
@jwt_required()
def daily_settlement():
    branch_code = get_jwt_identity()
    Sales = current_app.tables.get('sales')
    SellList = current_app.tables.get('sell_list')
    Sell = current_app.tables.get('sell')
    BranchList = current_app.tables.get('branch_list')
    Item = current_app.tables.get('item')

    try:
        # Calculate sales amount, margin, and other data for the day
        sales_data = db.session.execute(
            select(
                func.sum(SellList.c.sell_qty * (SellList.c.item_price - Item.c.deliv_price)).label('total_margin'),
                func.sum(SellList.c.sell_qty * SellList.c.item_price).label('total_amount')
            )
            .where(SellList.c.return_flag == 'X')
            .select_from(
                SellList
                .join(Sell, and_(
                    Sell.c.sell_no == SellList.c.sell_no,
                    Sell.c.branch_code == branch_code,
                    func.trunc(Sell.c.sell_date) == func.trunc(func.current_date()),
                    Sell.c.buy_abandon_flag == 'x'                ))
                .join(Item, SellList.c.item_no == Item.c.item_no)
            )
        ).one_or_none()

        if not sales_data or not sales_data.total_margin and not sales_data.total_amount:
            return jsonify({"msg": "일일 정산할 판매가 없습니다."}), 400

        total_margin = sales_data.total_margin if sales_data.total_margin else 0
        total_amount = sales_data.total_amount if sales_data.total_amount else 0

        manager_no = db.session.execute(
            select(BranchList.c.manager_no).where(BranchList.c.branch_code == branch_code)
        ).one_or_none().manager_no

        # Check if today's settlement already exists
        existing_settlement = db.session.execute(
            select(Sales).where(
                Sales.c.branch_code == branch_code,
                func.trunc(Sales.c.sales_date) == func.trunc(func.current_date())
            )
        ).one_or_none()

        if existing_settlement:
            # Update existing settlement
            update_stmt = (
                Sales.update()
                .where(Sales.c.sales_no == existing_settlement.sales_no)
                .values(
                    sales_amt=total_amount,
                    sell_margin=total_margin,
                )
            )
            db.session.execute(update_stmt)
            db.session.commit()
            return jsonify({"msg": "일일 정산이 업데이트되었습니다."}), 201
        else:
            # Insert new settlement
            sales_no_seq = Sequence('sales_no_seq')
            sales_no = db.session.execute(sales_no_seq.next_value()).scalar()

            insert_stmt = insert(Sales).values(
                sales_no=sales_no,
                sales_date=datetime.now(),
                sales_amt=total_amount,
                sell_margin=total_margin,
                branch_code=branch_code
            )
            db.session.execute(insert_stmt)
            db.session.commit()

            return jsonify({"msg": "일일 정산이 완료되었습니다."}), 200

    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "일일 정산에 실패했습니다."}), 500


@bp_sale.route('/current-cash', methods=['GET'])
@jwt_required()
def get_current_cash_register():
    branch_code = get_jwt_identity()
    Cash = current_app.tables.get('cash')

    try:
        current_cash = db.session.execute(
            select(Cash.c.total_amt)
            .where(Cash.c.branch_code == branch_code)
        ).scalar()

        if current_cash is None:
            # If current_cash is None, insert 0 total_amt for this branch
            insert_stmt = insert(Cash).values(
                total_amt=0,
                branch_code=branch_code,
            )
            db.session.execute(insert_stmt)
            db.session.commit()
            current_cash = 0

        return jsonify({"current_cash_register": current_cash}), 200

    except Exception as e:
        print(e)
        return jsonify({"msg": "현금 시제를 조회하는 데 실패했습니다."}), 500


@bp_sale.route('/update', methods=['POST'])
@jwt_required()
def update_cash_register():
    branch_code = get_jwt_identity()
    now_cash_amt = request.json.get('now_cash_amt')
    Cash = current_app.tables.get('cash')

    if now_cash_amt is None:
        return jsonify({"msg": "새로운 현금 시제를 입력해 주세요."}), 400

    try:
        # Check if the cash register for the branch already exists
        current_cash = db.session.execute(
            select(Cash.c.total_amt)
            .where(Cash.c.branch_code == branch_code)
        ).scalar()

        update_stmt = (
            Cash.update()
            .where(Cash.c.branch_code == branch_code)
            .values(
                total_amt=now_cash_amt
            )
        )
        db.session.execute(update_stmt)

        db.session.commit()
        return jsonify({"msg": "현금 시제가 성공적으로 업데이트되었습니다."}), 200

    except Exception as e:
        db.session.rollback()
        print(e)
        return jsonify({"msg": "현금 시제를 업데이트하는 데 실패했습니다."}), 500