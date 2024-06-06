from decouple import config


class Config:
    SECRET_KEY = config('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = (config('DATABASE_URI'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# 환경 변수로 데이터베이스 URI 설정 가능
class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False