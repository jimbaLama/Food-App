import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import Header from "../../components/Header/Header";
import "./Home.css";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";

const Home = () => {
  const [category, setCategory] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);

    // Clear the previous search
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  return (
    <div>
      <Header />

      <ExploreMenu
        category={category}
        setCategory={handleCategoryChange}
      />

      <FoodDisplay
        category={category}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default Home;