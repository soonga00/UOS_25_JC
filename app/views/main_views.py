from flask import Blueprint, jsonify, current_app, request
from sqlalchemy import text
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app import db, bcrypt

bp = Blueprint('main', __name__, url_prefix='/')


@bp.route('/')
def index():
    return 'Pybo index'

@bp.route('/oracle')
def get_data():
    try:
        with db.engine.connect() as con:
            query = text("SELECT value FROM v$parameter WHERE name = 'service_names'")
            result = con.execute(query)
            for row in result:
                print(row)
        return jsonify({"message": "Database connection successful"}), 200
    except Exception as e:
        current_app.logger.error(e)
        return str(e)


@bp.route('/map')
def map():

    BranchList = current_app.tables.get('emp')
    if BranchList is None:
        raise Exception("User table not found in mapped tables")
    # BranchList = current_app.tables['users']

    bb = db.session.query(BranchList).all()
    print("branch:", bb)
    b_list = [{ "no": b.emp_no, "name": b.nm, "rank": b.rank } for b in bb]
    print("list", b_list)
    return jsonify({"message": "Database connection successful"}), 200


@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        branch_code = data.get('branch_code')
        userid = data.get('userid')
        password = data.get('password')

        BranchList = current_app.tables['BranchList']
        # 지점이 존재하면, 회원 등록
        branch = BranchList.query.filter_by(branch_code=branch_code).first()
        if branch is None:
            return jsonify({"msg": "등록되지 않은 지점임."}), 400

        if branch.branch_id is not None:
            return jsonify({"msg": "이미 아이디가 존재함. "}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        branch.branch_id = userid
        branch.branch_pw = hashed_password
        db.session.commit()

        return jsonify({"msg": "지점 아이디 등록 성공"}), 200

    except Exception as e:
        print(e)
        return jsonify({"msg": str(e)}), 400


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    branch_id = data.get('branch_id')
    branch_pw = data.get('branch_pw')

    BranchList = current_app.tables['BranchList']
    branch = BranchList.query.filter_by(branch_id=branch_id).first()
    if branch and bcrypt.check_password_hash(branch.branch_pw, branch_pw):
        access_token = create_access_token(identity=branch.branch_code)
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "로그인 실패"}), 401


@bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_branch = get_jwt_identity()
    return jsonify(logged_in_ad=current_branch), 200
