import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { getTotalCartAmount, token, setToken, setCartItems } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();
  const hideSearchOn = ["/cart", "/order", "/myorders"];

  const showSearch = !hideSearchOn.includes(location.pathname);

  const logout = () => {
    localStorage.removeItem("token");
    setCartItems({});
    setToken("");
    navigate("/");
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(
      query
        ? `/?search=${encodeURIComponent(query)}#food-display`
        : "/#food-display",
    );
    setMenu("menu");
    setSearchTerm("");

    setTimeout(() => {
      document.getElementById("food-display")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.mitho_bite} alt="" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <Link
          to="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </Link>
        {/* <a
          href="#app-download"
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          mobile-app
        </a> */}
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact Us
        </a>
      </ul>
      <div className="navbar-right">
        {showSearch && (
          <form
            className={`navbar-search ${searchOpen ? "open" : ""}`}
            onSubmit={submitSearch}
          >
            <input
              aria-label="Search food"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search dishes..."
              value={searchTerm}
            />

            <button
              aria-label={searchOpen ? "Search dishes" : "Open food search"}
              className="navbar-search-button"
              onClick={() => !searchOpen && setSearchOpen(true)}
              type={searchOpen ? "submit" : "button"}
            >
              <img src={assets.search_icon} alt="" />
            </button>
          </form>
        )}
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} className="cart-icon-image" alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>
        {!token ? (
          <button className="signup-button" onClick={() => setShowLogin(true)}>
            Sign Up
          </button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
