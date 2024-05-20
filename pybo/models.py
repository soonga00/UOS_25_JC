from pybo import db

class Order(db.Model):
    OrderNo = db.Column(db.Integer, primary_key=True, nullable=False)
    BranchCode = db.Column(db.String, nullable=False)
    OrderDate = db.Column(db.DateTime, nullable=False)
    State = db.Column(db.String, nullable=False)

class OrderList(db.Model):
    OrderListNo = db.Column(db.Integer, primary_key=True, nullable=False)
    OrderNo = db.Column(db.Integer, db.ForeignKey('Order.OrderNo', ondelete='CASCADE'), nullable=False)
    Order = db.relationship('Order', backref=db.backref('OrderList'))
    ItemNo = db.Column(db.Integer,db.ForeignKey('Item.ItemNo', ondelete='CASCADE'), nullable=False)
    OrderQty = db.Column(db.Integer, nullable=False)