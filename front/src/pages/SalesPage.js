import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import WarningModal from '../components/WarningModal';

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [sellNo, setSellNo] = useState(null);
  const [consumerNo, setConsumerNo] = useState(null);
  const [sex, setSex] = useState("M");
  const [age, setAge] = useState("30");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const createSell = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/sell', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSellNo(response.data.sell_no);
      } catch (error) {
        console.error('Error creating sell:', error);
      }
    };

    createSell();
  }, []);

  const addProduct = (product) => {
    console.log(product);

    if (!product.isGiveaway) {
      const existingProductIndex = products.findIndex((p) => p.item_no === product.item_no && !p.isGiveaway);

      if (existingProductIndex !== -1) {
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: Number(updatedProducts[existingProductIndex].quantity) + Number(product.quantity),
          price: Number(product.price),
          discount: Number(updatedProducts[existingProductIndex].discount) + Number(product.discount),
        };
        setProducts(updatedProducts);
      } else {
        setProducts((prevProducts) => [...prevProducts, product]);
      }
    } else {
      setProducts((prevProducts) => [...prevProducts, product]);
    }
  };

  const handlePayment = async (payMethod) => {
    const token = localStorage.getItem('token');
    const itemList = products
      .filter(product => !product.isGiveaway)
      .map(product => ({
        item_no: product.item_no,
        sell_qty: product.quantity,
      }));

    const data = {
      sell_no: sellNo,
      item_list: itemList,
      sex,
      age,
      consumer_no: consumerNo,
      pay_method: payMethod,
    };
    console.log(data)
    try {
      const response = await axios.post('http://127.0.0.1:5000/sell/payment', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data.msg);
      navigate('/main');
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleCancelPurchase = useCallback(() => {
    setPendingAction(() => async () => {
      if (sellNo) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://127.0.0.1:5000/sell/abandon/${sellNo}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data.msg);
          setProducts([]);
          setSellNo(null);
          navigate('/main');
        } catch (error) {
          console.error('Error cancelling purchase:', error);
        }
      }
    });
    setIsModalOpen(true);
  }, [sellNo, navigate]);

  const getConsumerNo = async (telNo) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/sell/consumer/${telNo}`);
      if (response.data.consumer_no) {
        setConsumerNo(response.data.consumer_no);
      } else {
        console.log("해당 고객이 존재하지 않습니다.");
        setConsumerNo(null);
      }
    } catch (error) {
      console.error('Error fetching consumer number:', error);
    }
  };

  const confirmAction = async () => {
    if (pendingAction) {
      await pendingAction();
    }
    setIsModalOpen(false);
  };

  const cancelAction = () => {
    setIsModalOpen(false);
    setPendingAction(null);
  };

  useBeforeUnload((event) => {
    if (isModalOpen) {
      event.preventDefault();
      event.returnValue = ''; // Chrome requires returnValue to be set
      return '';
    }
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isModalOpen) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isModalOpen]);

  return (
    <div className="p-6 bg-gray-100 w-screen h-screen flex">
      <div className="w-3/4 pr-4">
        <ProductList products={products} />
      </div>
      <div className="w-1/4 pl-4">
        <ProductForm
          addProduct={addProduct}
          cancelPurchase={handleCancelPurchase}
          handlePayment={handlePayment}
          getConsumerNo={getConsumerNo}
          consumerNo={consumerNo}
          sex={sex}
          setSex={setSex}
          age={age}
          setAge={setAge}
        />
      </div>
      <WarningModal
        isVisible={isModalOpen}
        onClose={cancelAction}
        onConfirm={confirmAction}
        message="구매 포기하시겠습니까?"
      />
    </div>
  );
};

export default SalesPage;