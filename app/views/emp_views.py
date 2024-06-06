from flask import Blueprint, jsonify, current_app


###   직원 관리  api    ###
bp_emp = Blueprint('emp', __name__, url_prefix='/emp')