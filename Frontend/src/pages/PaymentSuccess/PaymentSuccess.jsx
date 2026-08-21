import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const [status, setStatus] = useState("Verifying payment...");
  const [paymentState, setPaymentState] = useState("verifying");
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
          setPaymentState("error");
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

        // console.log("Verification:", response.data);

        if (
          response.data.success &&
          response.data.data.status === "COMPLETE"
        ) {
          setStatus("Payment successful!");
          setPaymentState("success");
          setCartItems({});
        } else {
          setStatus("Payment could not be verified.");
          setPaymentState("error");
        }

      } catch (error) {
        console.error("Verification error:", error);
        setStatus(error.response?.data?.message || "Payment verification failed.");
        setPaymentState("error");
      }
    };

    verifyPayment();
  }, []);

  return (
    <main className="payment-success-page">
      <section className="payment-success-card" aria-live="polite">
        <div className={`payment-success-icon ${paymentState}`} aria-hidden="true">
          {paymentState === "success" ? "✓" : paymentState === "error" ? "!" : "…"}
        </div>
        <p className="payment-success-brand">eSewa Payment</p>
        <h1>{paymentState === "success" ? "Payment Successful" : "Checking your payment"}</h1>
        <p className="payment-success-message">{status}</p>

        {paymentState === "verifying" && <div className="payment-success-loader" />}

        {paymentState === "success" && (
          <button className="payment-success-button" onClick={() => navigate("/myorders", { replace: true })}>
            Done
          </button>
        )}

        {paymentState === "error" && (
          <button className="payment-success-button" onClick={() => navigate("/", { replace: true })}>
            Back to Home
          </button>
        )}
      </section>
    </main>
  );
};

export default PaymentSuccess;
