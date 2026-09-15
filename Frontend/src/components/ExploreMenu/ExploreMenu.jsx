import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      {/* <p className='explore-menu-text'>Choose from a diverse menu featuring a delecatble array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p> */}
      <div className="explore-menu-list">
        {/* "All" option - shows every food item when selected */}
        <div
          onClick={() => setCategory("All")}
          className="explore-menu-list-item"
        >
          <div
            className={
              category === "All"
                ? "explore-menu-all-btn active"
                : "explore-menu-all-btn"
            }
          >
            All
          </div>
          <p>All Dishes</p>
        </div>

        {menu_list.map((item, index) => {
          return (
            <div
              onClick={() =>
                setCategory((prev) =>
                  prev === item.menu_name ? "All" : item.menu_name,
                )
              }
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt=""
              />
              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
