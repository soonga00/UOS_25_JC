from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity

###   직원 관리  api    ###
bp_emp = Blueprint('emp', __name__, url_prefix='/emp')

@bp_emp.route('/', methods=['GET'])
@jwt_required()
def load_emp():
    try:
        branch_code = get_jwt_identity()
