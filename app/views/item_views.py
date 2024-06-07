from flask import Blueprint, jsonify, current_app, request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, and_
from app import db

bp_item = Blueprint('item', __name__, url_prefix='/item')

@bp_item.route('/img/upload', methods=['POST'])
def upload_image():
    print("이미지 업로드 시작")
    if 'file' not in request.files:
        return jsonify({"error": "파일이 없습니다"}), 400

    file = request.files['file']
    img_no = request.form.get('img_no')

    if file.filename == '':
        return jsonify({"error": "파일 이름이 없습니다"}), 400

    if not img_no:
        return jsonify({"error": "이미지 번호가 없습니다"}), 400

    try:
        img_no = int(img_no)
    except ValueError:
        return jsonify({"error": "유효하지 않은 이미지 번호"}), 400

    img_data = file.read()

    new_image = current_app.tables['item_img'].insert().values(img_no=img_no, img=img_data)
    try:
        db.session.execute(new_image)
        db.session.commit()
        return jsonify({"message": "이미지가 성공적으로 업로드되었습니다"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp_item.route('/code', methods=['GET'])
def get_code():
    # 코드 타입 -> 모든 'code_type' 조회 후
    # 도미노 -> parent_code_type parent_code 에 따라 group
    # 여기서 parent_code_type = 대분류인 애들 / 중분류인 애들 분류
    # 상세 코드 -> 조회된 모든 노미노의 code_nm 조회

    CodeType = current_app.tables.get('code_type')
    DetailCode = current_app.tables.get('detail_code')
    Domino = current_app.tables.get('domino')

    try:
        codetype_q = db.select(CodeType.c.code_type).select_from(CodeType)
        code_type_list = db.session.execute(codetype_q).fetchall() #모든 코드 종류 저장한 배열
        #print(code_type_list[0].code_type) << code type 접근

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    item_group = [] #대분류끼리, 중분류끼리
    for i in range(len(code_type_list)):
        query = (select(Domino)
                 .select_from(Domino)
                 .where(Domino.c.parent_code_type == code_type_list[i].code_type))
        try:
            group = db.session.execute(query).fetchall()
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

        item_group.append(group)

    categories = {} # 대분류: 중분류
    sub_categories = {} # 중분류: 소분류
    parent = {}

    for group in item_group:
        if not group:
            continue
        c = {}
        for child in group:
            parent_code_type = child.parent_code_type
            parent_code = child.parent_code

            if not (parent_code_type, parent_code) in parent:
                parent_q = (select(DetailCode.c.code_nm)
                            .select_from(DetailCode)
                            .where(
                                and_(
                                    DetailCode.c.code_type == parent_code_type,
                                    DetailCode.c.code == parent_code )
                            )
                )
                try:
                    parent_nm = db.session.execute(parent_q).fetchone().code_nm
                except SQLAlchemyError as e:
                    db.session.rollback()
                    return jsonify({"error": str(e)}), 500

                parent[(parent_code_type, parent_code)] = parent_nm
            else:
                parent_nm = parent[(parent_code_type, parent_code)]

            child_q = (select(DetailCode.c.code_nm)
                       .select_from(DetailCode)
                       .where(
                            and_(
                                DetailCode.c.code_type==child.code_type,
                                DetailCode.c.code == child.code)
                        ))
            try:
                child_nm = db.session.execute(child_q).fetchone().code_nm
            except SQLAlchemyError as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500

            if parent_nm in c:
                c[parent_nm].append(child_nm)
            else:
                c[parent_nm] = [child_nm]

        if parent_code_type in ['CD-001', 'CD-101']: # 대분류
            categories.update(c)
        else:
            sub_categories.update(c)

    return jsonify({
        "categories": categories,
        "sub_categories": sub_categories
    }), 200




