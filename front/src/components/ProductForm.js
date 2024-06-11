import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

const ProductForm = ({ addProduct, cancelPurchase, handlePayment, getConsumerNo, consumerNo, sex, setSex, age, setAge }) => {
  const [product, setProduct] = useState({
    item_no: '',
    quantity: 1,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [telNo, setTelNo] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [fetchedConsumerNo, setFetchedConsumerNo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSexChange = (e) => {
    setSex(e.target.value);
  };

  const handleAgeChange = (e) => {
    setAge(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://127.0.0.1:5000/sell/${product.item_no}`);
      const itemInfo = response.data.item_info;
      const eventList = response.data.event_list;

      let newProduct = {
        item_no: product.item_no,
        name: itemInfo.item_nm,
        quantity: product.quantity,
        price: itemInfo.consumer_price,
        discount: 0,
        isGiveaway: false
      };

      // 할인 이벤트 처리
      eventList.forEach((event) => {
        if (event.event_type === 'D') {
          newProduct.discount += event.dc_amt;
        }
      });

      // 실제 상품을 먼저 추가
      addProduct(newProduct);

      // 증정품 이벤트 처리
      eventList.forEach((event, index) => {
        if (event.event_type === 'G') {
          const giveawayProduct = {
            item_no: `${product.item_no}-${index + 1}`,
            name: event.giveaway_nm,
            quantity: 1,
            price: 0,
            discount: 0,
            isGiveaway: true
          };
          addProduct(giveawayProduct);
        }
      });

      // 입력 필드 초기화
      setProduct({
        item_no: '',
        quantity: 1,
      });
    } catch (error) {
      console.error('Error fetching item data:', error);
    }
  };

  const handleMileageClick = () => {
    setIsModalVisible(true);
  };

  const handleModalConfirm = async () => {
    setIsModalVisible(false);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/sell/consumer/${telNo}`, {
        params: {
          nm: consumerName
        }
      });
      if (response.data.consumer_no) {
        setFetchedConsumerNo(response.data.consumer_no);
      } else {
        console.log("해당 고객이 존재하지 않습니다.");
        setFetchedConsumerNo(null);
      }
    } catch (error) {
      console.error('Error fetching consumer number:', error);
      setFetchedConsumerNo(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">상품 번호</label>
          <input
            type="text"
            name="item_no"
            value={product.item_no}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">수량</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">연령층</label>
          <select
            name="age"
            value={age}
            onChange={handleAgeChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          >
            <option value="10">10대</option>
            <option value="20">20대</option>
            <option value="30">30대</option>
            <option value="40">40대</option>
            <option value="50">50대</option>
            <option value="60">60대</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">성별</label>
          <select
            name="sex"
            value={sex}
            onChange={handleSexChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          >
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">소비자 번호</label>
          <input
            type="text"
            value={fetchedConsumerNo || ''}
            readOnly
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg"
        >
          추가
        </button>
      </form>
      <div className="mt-4 flex space-x-2">
        <button
          className="flex-1 py-8 bg-green-500 text-white rounded-lg"
          onClick={() => handlePayment("0")} // 현금 결제
        >
          현금
        </button>
        <button
          className="flex-1 py-8 bg-red-500 text-white rounded-lg"
          onClick={() => handlePayment("1")} // 카드 결제
        >
          카드
        </button>
        <button
          className="flex-1 py-8 bg-yellow-500 text-white rounded-lg"
          onClick={handleMileageClick} // 마일리지 적립
        >
          고객 조회
        </button>
      </div>
      <div className="mt-4 flex space-x-2 mb-20">
        <button
          onClick={cancelPurchase}
          className="w-full py-2 bg-gray-500 text-white rounded-lg"
        >
          구매 포기
        </button>
      </div>

      <Modal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">전화번호</label>
          <input
            type="text"
            value={telNo}
            onChange={(e) => setTelNo(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          <label className="block text-sm font-medium text-gray-700 mt-4">이름</label>
          <input
            type="text"
            value={consumerName}
            onChange={(e) => setConsumerName(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          <div className="mt-4 flex space-x-2">
            <button
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
              onClick={handleModalConfirm}
            >
              확인
            </button>
            <button
              className="flex-1 py-2 bg-gray-500 text-white rounded-lg"
              onClick={() => setIsModalVisible(false)}
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductForm;
