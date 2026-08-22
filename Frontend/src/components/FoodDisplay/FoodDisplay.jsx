import { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category, searchTerm = "" }) => {
  const { food_list } = useContext(StoreContext);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredFoods = food_list.filter((item) => {
    const matchesCategory = category === "All" || category === item.category;
    const searchableText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    return matchesCategory && (!normalizedSearchTerm || searchableText.includes(normalizedSearchTerm));
  });

  return (
    <div className="food-display" id="food-display">
      <h2>{normalizedSearchTerm ? `Search results for “${searchTerm.trim()}”` : "Top dishes near you"}</h2>
      <div className="food-display-list">
        {filteredFoods.map((item) => (
          <FoodItem key={item._id} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} />
        ))}
      </div>
      {filteredFoods.length === 0 && <p className="food-display-empty">No dishes found. Try another search.</p>}
    </div>
  );
};

export default FoodDisplay;
