from flask import Blueprint, jsonify, current_app


###   판매  api    ###
bp_sale = Blueprint('sale', __name__, url_prefix='/sale')