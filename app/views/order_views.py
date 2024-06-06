from flask import Blueprint, jsonify, current_app


###   발주  api    ###
bp_order = Blueprint('order', __name__, url_prefix='/order')

