import "./App.css";
import axios from "axios";

function App() {
  const getHome = () => {
    axios
      .get("home")
      .then(console.log)
      .catch((err) => console.log(err));
  };

  return (
    <>
      Click on the button to get data from Django.
      <br />
      See data in the console
      <br />
      <button onClick={getHome}>Get Home From Django </button>
    </>
  );
}

export default App;
