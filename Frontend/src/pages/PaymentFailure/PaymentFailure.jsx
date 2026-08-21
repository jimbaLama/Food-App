import { useNavigate } from "react-router-dom";
import "../PaymentSuccess/PaymentSuccess.css";
import "./PaymentFailure.css";

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <main className="payment-failure-page">
      <section className="payment-failure-card">
        <div className="payment-failure-icon" aria-hidden="true">×</div>
        <p className="payment-failure-brand">eSewa Payment</p>
        <h1>Payment Failed</h1>
        <p className="payment-failure-message">
          Your payment was not completed. No amount has been confirmed for this order.
        </p>
        <button className="payment-failure-button" onClick={() => navigate("/", { replace: true })}>
          Back to Home
        </button>
      </section>
    </main>
  );
};

export default PaymentFailure;
