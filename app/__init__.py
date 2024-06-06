from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from sqlalchemy import create_engine
from flask_cors import CORS

import config
import os


db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config.DevelopmentConfig)

    os.environ['NLS_LANG'] = 'KOREAN_KOREA.AL32UTF8'


    engine = create_engine(
        app.config['SQLALCHEMY_DATABASE_URI'],
        connect_args={"encoding": "UTF-8", "nencoding": "UTF-8"}
    )

    #ORM, bcrypt, jwt
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        db.session.configure(bind=engine)

        #blueprint
        from .views import main_views, charge_views, emp_views, order_views, return_views, sale_views, sell_views, stock_views, work_views
        app.register_blueprint(main_views.bp)
        app.register_blueprint(charge_views.bp_charge)
        app.register_blueprint(emp_views.bp_emp)
        app.register_blueprint(order_views.bp_order)
        app.register_blueprint(return_views.bp_return)
        app.register_blueprint(sale_views.bp_sale)
        app.register_blueprint(sell_views.bp_sell)
        app.register_blueprint(stock_views.bp_stock)
        app.register_blueprint(work_views.bp_work)


        from .models import mapped_tables
        app.tables = mapped_tables



    return app