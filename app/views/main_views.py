from datetime import timedelta
from flask import Blueprint, jsonify, current_app, request
from sqlalchemy import text, select
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

    BranchList = current_app.tables.get('branch_list')
    if BranchList is None:
        raise Exception("User table not found in mapped tables")
    # BranchList = current_app.tables['users']

    bb = db.session.query(BranchList).all()
    print("branch:", bb)
    return jsonify({"message": "Database connection successful"}), 200


@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        branch_code = data.get('branch_code')
        userid = data.get('branch_id')
        password = data.get('branch_pw')

        BranchList = current_app.tables.get('branch_list')
        # 지점이 존재하면, 회원 등록

        query = db.select(BranchList).where(BranchList.c.branch_code == branch_code)
        #branch = BranchList.query.filter_by(branch_code=branch_code).first()
        branch = db.session.execute(query).fetchone()

        if branch is None:
            return jsonify({"msg": "등록되지 않은 지점임."}), 400

        if branch.branch_id is not None:
            return jsonify({"msg": "이미 아이디가 존재함. "}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        update_query = (
            db.update(BranchList)
            .where(BranchList.c.branch_code == branch_code)
            .values(branch_id=userid, branch_pw=hashed_password)
        )

        db.session.execute(update_query)
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

    BranchList = current_app.tables['branch_list']
    query = db.select(BranchList).where(BranchList.c.branch_id == branch_id)
    branch = db.session.execute(query).fetchone()

    if branch:
        if bcrypt.check_password_hash(branch.branch_pw, branch_pw):
            access_token = create_access_token(identity=branch.branch_code,
                                               expires_delta=timedelta(hours=3))
            return jsonify(access_token=access_token), 200
        else:
            print('비밀번호가 잘못되었습니다.')
    else:
        print('브랜치 아이디를 찾을 수 없습니다.')

    return jsonify({"msg": "로그인 실패"}), 401


@bp.route('/life', methods=['GET'])
@jwt_required()
def get_lifeservice():
    branch_code = get_jwt_identity()
    LifeService = current_app.tables.get('life_service')
    print(branch_code)
    flag = db.session.execute(select(LifeService).where(LifeService.c.branch_code == branch_code)).fetchone()

    if not flag:
        return jsonify({"msg": "해당 지점의 생활 서비스 정보가 없습니다."}), 404

    return jsonify({"package": flag.package_flag == "o",
                    "lottery_ticket": flag.lottery_ticket_flag == "o",
                    "atm": flag.atm_flag == "o",
                    "pubprice": flag.pubprice_flag == "o"}), 200  # True, False로 반환


