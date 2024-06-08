from sqlalchemy import MetaData, Table
from app import db

metadata = MetaData()

# 수동으로 users 테이블 매핑

orders = Table('orders', metadata, autoload_with=db.engine)
order_list = Table('order_list', metadata, autoload_with=db.engine)
branch_list = Table('branch_list', metadata, autoload_with=db.engine)
return_dispose_list = Table('return_dispose_list', metadata, autoload_with=db.engine)

sell = Table('sell', metadata, autoload_with=db.engine)
sell_list = Table('sell_list', metadata, autoload_with=db.engine)
receive_item = Table('receive_item', metadata, autoload_with=db.engine)
stock = Table('stock', metadata, autoload_with=db.engine)
loss = Table('loss', metadata, autoload_with=db.engine)

code_type = Table('code_type', metadata, autoload_with=db.engine)
detail_code = Table('detail_code', metadata, autoload_with=db.engine)
domino = Table('domino', metadata, autoload_with=db.engine)
item = Table('item', metadata, autoload_with=db.engine)
sales = Table('sales', metadata, autoload_with=db.engine)

charge = Table('charge', metadata, autoload_with=db.engine)
cash = Table('cash', metadata, autoload_with=db.engine)
emp = Table('emp', metadata, autoload_with=db.engine)
work_record = Table('work_record', metadata, autoload_with=db.engine)
emp_branch = Table('emp_branch', metadata, autoload_with=db.engine)

event = Table('event', metadata, autoload_with=db.engine)
life_service = Table('life_service', metadata, autoload_with=db.engine)
consumer = Table('consumer', metadata, autoload_with=db.engine)
item_event = Table('item_event', metadata, autoload_with=db.engine)
item_img = Table('item_img', metadata, autoload_with=db.engine)


def setup_manual_map():
    metadata.create_all(db.engine)
    return {
        'orders': orders,
        'order_list': order_list,
        'branch_list': branch_list,
        'return_dispose_list': return_dispose_list,
        'sell': sell,
        'sell_list': sell_list,
        'receive_item': receive_item,
        'stock': stock,
        'loss': loss,
        'code_type': code_type,
        'detail_code': detail_code,
        'domino': domino,
        'item': item,
        'sales': sales,
        'charge': charge,
        'cash': cash,
        'emp': emp,
        'work_record': work_record,
        'emp_branch': emp_branch,
        'event': event,
        'life_service': life_service,
        'consumer': consumer,
        'item_event': item_event,
        'item_img': item_img,
    }

mapped_tables = setup_manual_map()

