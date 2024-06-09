from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from app import db

###   지출  api    ###
bp_charge = Blueprint('charge', __name__, url_prefix='/charge')

@bp_charge.route('/status', methods=['GET'])
@jwt_required()
def get_charge_status():
    branch_code = get_jwt_identity()
    Charges = current_app.tables.get('charge')
    BranchList = current_app.tables.get('branch_list')
    Emp = current_app.tables.get('emp')

    try:
        branch_info = db.session.execute(
            select(
                BranchList.c.branch_nm,
                BranchList.c.branch_code,
                BranchList.c.manager_no,
                BranchList.c.payment_ratio
            ).where(BranchList.c.branch_code == branch_code)
        ).fetchone()

        if not branch_info:
            return jsonify({"msg": "지점 정보를 찾을 수 없습니다."}), 404

        manager_name = db.session.execute(
            select(Emp.c.nm).where(Emp.c.emp_no == branch_info.manager_no)
        ).fetchone().nm

        charge_data = db.session.execute(
            select(
                Charges.c.charge_no,
                Charges.c.charge_date,
                Charges.c.charge_amt,
                Charges.c.charge_type
            ).where(Charges.c.branch_code == branch_code).order_by(Charges.c.charge_date)
        ).fetchall()

        charge_list = [{
            "charge_no": row.charge_no,
            "charge_date": row.charge_date,
            "charge_amt": row.charge_amt,
            "charge_type": row.charge_type
        } for row in charge_data]

        response_data = {
            "branch_nm": branch_info.branch_nm,
            "branch_code": branch_info.branch_code,
            "manager_nm": manager_name,
            "payment_ratio": branch_info.payment_ratio,
            "charges": charge_list
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(e)
        return jsonify({"msg": "지출 데이터를 가져오는 데 실패했습니다."}), 500
