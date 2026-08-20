// PaymentSuccess.jsx

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";

const PaymentSuccess = () => {
  const [status, setStatus] = useState("Verifying payment...");
  const navigate = useNavigate();
  const { setCartItems, url } = useContext(StoreContext);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // eSewa sends ?data=BASE64_ENCODED_RESPONSE
        const params = new URLSearchParams(window.location.search);
        // URLSearchParams converts an unescaped Base64 `+` to a space. eSewa
        // callbacks can contain `+`, so restore it before calling atob().
        const encodedData = params.get("data")?.replace(/ /g, "+");

        if (!encodedData) {
          setStatus("Payment response not found.");
          return;
        }

        // Decode Base64
        const decodedData = JSON.parse(
          atob(encodedData)
        );

        console.log("eSewa response:", decodedData);

        const response = await axios.post(
          url + "/api/order/esewa/verify",
          {
            product_code: decodedData.product_code,
            total_amount: decodedData.total_amount,
            transaction_uuid: decodedData.transaction_uuid,
          }
        );

        console.log("Verification:", response.data);

        if (
          response.data.success &&
          response.data.data.status === "COMPLETE"
        ) {
          setStatus("Payment successful!");
          setCartItems({});
          navigate("/myorders", { replace: true });
        } else {
          setStatus("Payment could not be verified.");
        }

      } catch (error) {
        console.error("Verification error:", error);
        setStatus(error.response?.data?.message || "Payment verification failed.");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div>
      <h1>{status}</h1>
    </div>
  );
};

export default PaymentSuccess;
