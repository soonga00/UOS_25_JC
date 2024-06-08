from datetime import datetime

from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, text

from app import db

### 직원 관리 API ###
bp_emp = Blueprint('emp', __name__, url_prefix='/emp')

@bp_emp.route('/', methods=['GET'])
@jwt_required()
def load_emp():
    try:
        # JWT로부터 branch_code를 가져옵니다.
        branch_code = get_jwt_identity()

        # 테이블 객체를 가져옵니다.
        emp_branch = current_app.tables.get('emp_branch')
        emp = current_app.tables.get('emp')
        branch = current_app.tables.get('branch_list')  # branch 테이블도 필요합니다.

        if emp is None or emp_branch is None or branch is None:
            raise Exception('Table mapping failed')

        # 쿼리를 작성합니다.
        query = (
            db.session.query(
                emp.c.emp_no,
                emp.c.rank,
                emp.c.nm,
                emp.c.join_date,
                emp.c.tel_no,
                emp.c.addr,
                emp.c.bank_nm,
                emp.c.acct_no
            )
            .join(emp_branch, emp.c.emp_no == emp_branch.c.emp_no)
            .join(branch, branch.c.branch_code == emp_branch.c.branch_code)
            .filter(branch.c.branch_code == branch_code)
        )

        # 쿼리 실행 및 결과 가져오기
        result = query.all()
        emp_list = [
            {
                'emp_no': row.emp_no,
                'rank': row.rank,
                'nm': row.nm,
                'join_date': row.join_date,
                'tel_no': row.tel_no,
                'addr': row.addr,
                'bank_nm': row.bank_nm,
                'acct_no': row.acct_no
            } for row in result
        ]

        return jsonify(emp_list), 200

    except Exception as e:
        current_app.logger.error(f"Failed to load employees: {str(e)}")
        return jsonify({"error": "Failed to load employees"}), 500


@bp_emp.route('/add', methods=['POST'])
@jwt_required()
def add_employee():
    data = request.get_json()
    emp = current_app.tables.get('emp')
    emp_branch = current_app.tables.get('emp_branch')
    branch_code = get_jwt_identity()

    # Check if employee with the same SID exists
    existing_employee = db.session.execute(db.select(emp).where(emp.c.sid == data['sid'])).fetchone()

    if existing_employee:
        emp_no = existing_employee.emp_no
    else:
        # Insert into EMP table
        new_employee = {
            'emp_no': db.session.execute(text("SELECT EMP_NO_SEQ.NEXTVAL FROM dual")).scalar(),  # Get next value from sequence
            'rank': data['rank'],
            'nm': data['nm'],
            'join_date': datetime.strptime(data['join_date'], '%Y-%m-%d'),
            'tel_no': data['tel_no'],
            'sid': data['sid'],
            'addr': data.get('addr'),
            'bank_nm': data['bank_nm'],
            'acct_no': data['acct_no']
        }
        insert_emp = emp.insert().values(new_employee)
        db.session.execute(insert_emp)
        emp_no = new_employee['emp_no']

    # Insert into EMP_BRANCH table
    new_emp_branch = {
        'emp_branch_no': db.session.execute(text("SELECT EMP_BRANCH_NO_SEQ.NEXTVAL FROM dual")).scalar(),  # Get next value from sequence
        'emp_no': emp_no,
        'branch_code': branch_code
    }
    insert_emp_branch = emp_branch.insert().values(new_emp_branch)
    db.session.execute(insert_emp_branch)
    db.session.commit()

    return jsonify({'message': 'Employee added successfully'}), 201

@bp_emp.route('/<int:emp_no>', methods=['PUT'])
@jwt_required()
def edit_employee(emp_no):
    data = request.get_json()
    emp = current_app.tables.get('emp')
    update = emp.update().where(emp.c.emp_no == emp_no).values(
        rank=data['rank'],
        nm=data['nm'],
        join_date=datetime.strptime(data['join_date'], '%Y-%m-%d'),
        tel_no=data['tel_no'],
        addr=data.get('addr'),
        bank_nm=data['bank_nm'],
        acct_no=data['acct_no']
    )
    result = db.session.execute(update)
    db.session.commit()
    if result.rowcount == 0:
        return jsonify({'message': 'Employee not found'}), 404

    return jsonify({'message': 'Employee updated successfully'}), 200


@bp_emp.route('/<int:emp_no>', methods=['DELETE'])
@jwt_required()
def delete_employee(emp_no):
    try:
        emp = current_app.tables.get('emp')
        emp_branch = current_app.tables.get('emp_branch')
        branch_code = get_jwt_identity()  # JWT로부터 branch_code를 가져옵니다.

        # 1. emp_branch에서 emp_no와 branch_code가 같은 로우를 지운다.
        delete_emp_branch = emp_branch.delete().where(
            emp_branch.c.emp_no == emp_no,
            emp_branch.c.branch_code == branch_code
        )
        db.session.execute(delete_emp_branch)
        db.session.commit()

        # 2. emp_branch에 emp_no가 같은 다른 로우가 있는지 확인한다.
        emp_branch_exists = db.session.execute(
            db.select(emp_branch).where(emp_branch.c.emp_no == emp_no)
        ).fetchone()

        # 3. emp_branch에 emp_no가 더 이상 존재하지 않으면 emp 테이블에서 해당 직원 삭제
        if not emp_branch_exists:
            delete_emp = emp.delete().where(emp.c.emp_no == emp_no)
            db.session.execute(delete_emp)

        db.session.commit()

        return jsonify({'message': 'Employee deleted successfully'}), 200

    except Exception as e:
        current_app.logger.error(f"Failed to delete employee: {str(e)}")
        return jsonify({"error": "Failed to delete employee"}), 500
