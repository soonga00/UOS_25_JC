from flask import Blueprint, jsonify, current_app, request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, and_, join
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

            child_q = (select(DetailCode)
                       .select_from(DetailCode)
                       .where(
                            and_(
                                DetailCode.c.code_type==child.code_type,
                                DetailCode.c.code == child.code)
                        ))
            try:
                child = db.session.execute(child_q).fetchone()
            except SQLAlchemyError as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500

            if parent_code_type in ['CD-001', 'CD-101']: # 대분류
                if parent_nm in c:
                    c[parent_nm].append(child.code_nm)
                else:
                    c[parent_nm] = [child.code_nm]
            else: # 중분류
                if parent_nm in c:
                    c[parent_nm].append({"code_nm": child.code_nm,
                                         "code_type": child.code_type,
                                         "code": child.code})
                else:
                    c[parent_nm] = [{"code_nm": child.code_nm,
                                     "code_type": child.code_type,
                                     "code": child.code}]

        if parent_code_type in ['CD-001', 'CD-101']: # 대분류
            categories.update(c)
        else:
            sub_categories.update(c)

    return jsonify({
        "categories": categories,
        "sub_categories": sub_categories
    }), 200

@bp_item.route('/detail', methods=['POST'])
def get_item_detail():
    data = request.get_json()
    code_1 = data.get("code_1") # 대분류 이름
    code_2 = data.get("code_2") # 중분류 이름
    code_3 = data.get("code_3") # 소분류 이름
    print(f"{code_1} > {code_2} > {code_3} 에 대한 상품 리스트 요청 ")


    DetailCode = current_app.tables.get('detail_code')
    Domino = current_app.tables.get('domino')
    Item = current_app.tables.get('item')
    ItemImg = current_app.tables.get('item_img')

    join_cond = (DetailCode.c.code_type == Domino.c.code_type) & (DetailCode.c.code == Domino.c.code)

    domino_join_q = select(Domino, DetailCode).select_from(join(Domino, DetailCode, join_cond))
    domino_join = db.session.execute(domino_join_q).fetchall()
    print(domino_join)

    join_table = join(Domino, DetailCode, join_cond)
    # 대분류 이름을 통해 대분류 코드 get
    class1_q = (select(Domino)
                .where(and_(DetailCode.c.code_nm == code_1, Domino.c.parent_code_type == None))
                .select_from(join_table))
    class1 = db.session.execute(class1_q).fetchone() # 대분류 상세코드


    class2_q = (select(Domino)
                .where( and_(DetailCode.c.code_nm == code_2,
                             Domino.c.parent_code_type == class1.code_type,
                             Domino.c.parent_code == class1.code))
                .select_from(join_table))
    class2 = db.session.execute(class2_q).fetchone() # 중분류 상세코드

    class3_q = (select(DetailCode)
                .where(and_ (DetailCode.c.code_nm == code_3,
                             Domino.c.parent_code_type == class2.code_type,
                             Domino.c.parent_code == class2.code,))
                .select_from(join_table))
    class3 = db.session.execute(class3_q).fetchone() #소분류 상세코드

    join_cond2 = (ItemImg.c.img_no == Item.c.img_no)
    item_list_q = (select(Item, ItemImg.c.img).where( and_( Item.c.code_type == class3.code_type, Item.c.code == class3.code))
                   .select_from(join(ItemImg, Item, (ItemImg.c.img_no == Item.c.img_no))))
    item_list = db.session.execute(item_list_q).fetchall()
    print(item_list[0])

    items = [{"item_nm": item.item_nm,
              "delv_price": item.deliv_price,
              "consumer_price": item.consumer_price,
              #"img": item.img,
              "order_available_flag": item.order_available_flag,
              "deliv_comp_nm": item.deliv_comp_nm,
              "item_no": item.item_no} for item in item_list]

    return jsonify(items), 200






