from app import db
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.automap import automap_base

def setup_automap():
    Base = automap_base()
    Base.prepare(db.engine, reflect=True)
    return Base

Base = setup_automap()

#매핑된 클래스를 사용하여 모델을 정의
User = Base.classes.users