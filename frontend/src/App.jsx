import "./App.css";
import axios from "axios";
import Header from "./components/header/Header";

function App() {
  const getHome = () => {
    axios
      .get("home")
      .then(console.log)
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Header></Header>
      Click on the button to get data from Django.
      <br />
      See data in the console
      <br />
      <button onClick={getHome}>Get Home From Django </button>
    </>
  );
}

export default App;
