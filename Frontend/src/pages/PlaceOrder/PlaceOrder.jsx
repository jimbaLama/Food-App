import { useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useState } from 'react';
import axios from 'axios'

const PlaceOrder = () => {
  const {getTotalCartAmount, token, food_list, cartItems, url}= useContext(StoreContext);
  const [data, setData] = useState({
    firstName:'',
    lastName: '',
    email:'',
    street:'',
    city:'',
    state:'',
    zipCode:'',
    country:'',
    phone:''
  })

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(data=>({...data, [name]:value}))
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if(cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo); 
      }
    })
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount()+100,
    }
    let response = await axios.post(url+"/api/order/place",orderData, {headers:{token:token}});
    if(response.data.success) {
      const {session_url} = response.data;
      window.location.replace(session_url);
    } else {
      alert(response.data.message)
    }
  }
  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivary Information</p>
        <div className='multi-fields'>
          <input required onChange={onChangeHandler} value={data.firstName} name='firstName' type="text" placeholder='First Name' required/>
          <input onChange={onChangeHandler} value={data.lastName} name='lastName' type="text" placeholder='Last Name' required/>
        </div>
        <input onChange={onChangeHandler} value={data.email} name='email' type="email" placeholder='Email address' required/>
        <input onChange={onChangeHandler} value={data.street} name='street' type="text" placeholder='Street' required/>
         <div className='multi-fields'>
          <input onChange={onChangeHandler} value={data.city} name='city' type="text" placeholder='City' required/>
          <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required/>
        </div>
         <div className='multi-fields'>
          <input name='zipCode' onChange={onChangeHandler} value={data.zipCode} type="text" placeholder='Zip code' required/>
          <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required/>
        </div>
        <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='phone' required />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs.{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>Rs.{getTotalCartAmount()===0?0:100}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>Rs.{getTotalCartAmount()===0?0:getTotalCartAmount()+100}</b>
            </div>
          </div>
          <button type='submit'>Proceed to Payment</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
