from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select, func
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



# @bp_sales.route('/daily-settlement', methods=['POST'])
# @jwt_required()
# def daily_settlement():
#     branch_code = get_jwt_identity()
#     Sales = current_app.tables.get('sales')
#     OrderList = current_app.tables.get('order_list')
#     Orders = current_app.tables.get('orders')
#     Branch = current_app.tables.get('branch')
#
#     try:
#         # Calculate sales amount, margin, and other data for the day
#         sales_data = db.session.execute(
#             select([
#                 func.sum(OrderList.c.order_qty * (Item.c.consumer_price - Item.c.deliv_price)).label('total_margin'),
#                 func.sum(OrderList.c.order_qty * Item.c.consumer_price).label('total_amount')
#             ])
#             .select_from(OrderList.join(Item, OrderList.c.item_no == Item.c.item_no))
#             .where(OrderList.c.order_date == func.current_date())
#         ).fetchone()
#
#         total_margin = sales_data.total_margin
#         total_amount = sales_data.total_amount
#
#         manager_no = db.session.execute(
#             select(Branch.c.manager_no).where(Branch.c.branch_code == branch_code)
#         ).fetchone().manager_no
#
#         pay_rate = 0.05  # Example value, replace with actual logic if necessary
#
#         sales_no_seq = Sequence('sales_no_seq')
#         sales_no = db.session.execute(sales_no_seq.next_value()).scalar()
#
#         insert_stmt = insert(Sales).values(
#             sales_no=sales_no,
#             date=datetime.now(),
#             amount=total_amount,
#             margin=total_margin,
#             manager_no=manager_no,
#             branch_code=branch_code,
#             pay_rate=pay_rate
#         )
#         db.session.execute(insert_stmt)
#         db.session.commit()
#
#         return jsonify({"msg": "일일 정산이 완료되었습니다."}), 200
#
#     except Exception as e:
#         db.session.rollback()
#         print(e)
#         return jsonify({"msg": "일일 정산에 실패했습니다."}), 500
