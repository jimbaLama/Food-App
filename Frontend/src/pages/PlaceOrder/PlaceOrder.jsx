import { useContext, useEffect } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import {useNavigate} from 'react-router-dom'
import { useState } from "react";
import axios from "axios";
import {v4 as uuidv4} from 'uuid'

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);
    const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    if(!token) {
      navigate("/cart")
    } else if(getTotalCartAmount() === 0) {
      navigate("/cart")
    }
  }, [token])


const handlePayment = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const transaction_uuid = uuidv4();
    const items = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({ _id: item._id, quantity: cartItems[item._id] }));

    const orderResponse = await axios.post(
      url + "/api/order/esewa/create",
      { address: data, items, transaction_uuid },
      { headers: { token } },
    );

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message || "Could not create order");
    }

    const formData = {
      ...orderResponse.data.payment,

      signed_field_names:
        "total_amount,transaction_uuid,product_code",

      signature: "",

      success_url: "http://localhost:5173/payment-success",
      failure_url: "http://localhost:5173/payment-failure",
    };

    console.log("eSewa payload before signature:", formData);

    // Generate signature
    const response = await axios.post(url + "/signature", {
      total_amount: formData.total_amount,
      transaction_uuid: formData.transaction_uuid,
      product_code: formData.product_code,
    });

    formData.signature = response.data.signature;

    console.log("Final eSewa payload:", formData);

    // Create eSewa form
    const form = document.createElement("form");

    form.method = "POST";
    form.action =
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement("input");

      input.type = "hidden";
      input.name = key;
      input.value = value;

      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

  } catch (error) {
    console.error("Payment error:", error);
    console.error("Server response:", error.response?.data);

    alert("Error initiating payment");
  } finally {
    setLoading(false);
  }
};


  return (
    // <form onSubmit={placeOrder} className="place-order">
      <form className="place-order" onSubmit={handlePayment}>
      <div className="place-order-left">
        <p className="title">Delivary Information</p>
        <div className="multi-fields">
          <input
            required
            onChange={onChangeHandler}
            value={data.firstName}
            name="firstName"
            type="text"
            placeholder="First Name"
          />
          <input
            onChange={onChangeHandler}
            value={data.lastName}
            name="lastName"
            type="text"
            placeholder="Last Name"
            required
          />
        </div>
        <input
          onChange={onChangeHandler}
          value={data.email}
          name="email"
          type="email"
          placeholder="Email address"
          required
        />
        <input
          onChange={onChangeHandler}
          value={data.street}
          name="street"
          type="text"
          placeholder="Street"
          required
        />
        <div className="multi-fields">
          <input
            onChange={onChangeHandler}
            value={data.city}
            name="city"
            type="text"
            placeholder="City"
            required
          />
          <input
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="Province"
            required
          />
        </div>

        <input
          name="country"
          onChange={onChangeHandler}
          value={data.country}
          type="text"
          placeholder="Country"
          required
        />

        <input
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder="Phone"
          required
        />
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
              <p>Rs.{getTotalCartAmount() === 0 ? 0 : 100}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Rs.{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 100}
              </b>
            </div>
          </div>
          <button type="submit" disabled={loading}>Proceed to Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;