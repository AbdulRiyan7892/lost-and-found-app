import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
console.log("App rendered");
return <h1>Hello World</h1>;

function App() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const res = await axios.get("http://localhost:3000/api/items");
    setItems(res.data);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="App">
      <h1>Campus Lost & Found</h1>
      <ItemForm onItemAdded={fetchItems} />
      <ItemList items={items} />
    </div>
  );
}

export default App;
