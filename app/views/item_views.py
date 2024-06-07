from flask import Blueprint, jsonify, current_app, request
from sqlalchemy.exc import SQLAlchemyError
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