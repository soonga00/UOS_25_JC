from flask import Blueprint, jsonify, current_app


###   반품 폐기  api    ###
bp_return = Blueprint('return', __name__, url_prefix='/return')
