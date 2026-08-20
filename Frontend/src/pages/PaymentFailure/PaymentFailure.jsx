import { Link } from "react-router-dom";

const PaymentFailure = () => (
  <div className="payment-result">
    <h1>Payment was not completed</h1>
    <p>No payment was confirmed. You can safely return to your cart and try again.</p>
    <Link to="/cart">Return to cart</Link>
  </div>
);

export default PaymentFailure;
