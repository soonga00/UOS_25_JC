from flask import Blueprint, jsonify, current_app


###   재고관리  api    ###
bp_stock = Blueprint('stock', __name__, url_prefix='/stock')