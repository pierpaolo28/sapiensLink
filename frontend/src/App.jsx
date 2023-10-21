import "./App.css";
import axios from "axios";
import Header from "./components/header/Header";
import Footer from "./components/Footer";
import GridContainer from "./components/shared/GridContainer";

function App() {
  // works fine
  const getHome = () => {
    axios
      .get("home")
      .then(console.log)
      .catch((err) => console.log(err));
  };

  const getList = () => {
    // 404
    axios.get("lists").then(console.log);
  };

  const getLists = async () => {
    // cors error
    let response = await fetch("http://127.0.0.1:8000/api/lists/");
    let lists = await response.json();

    console.log(lists);
  };
  return (
    <div id="page-container">
      <div id="content-wrap">
        <Header></Header>
        <GridContainer>
          <div className="leftSidePanel">Example List</div>
          <div className="mainPanel">Sharing Knowledge One Link At A Time</div>
          <div className="rightSidePanel">
            Example List
            <ul>
              <li>
                <button onClick={getHome}>Get Home From Django </button>
              </li>
              <li>
                <button onClick={getLists}>Get List </button>
              </li>
            </ul>
          </div>
        </GridContainer>
      </div>
      {/* 
      //   Click on the button to get data from Django. Start Django Server First
      //   <br />
      //   See data in the console
      //   <br />
        // <button onClick={getHome}>Get Home From Django </button> 
      */}
      <footer id="footer">
        <Footer></Footer>
      </footer>
    </div>
  );
}

export default App;
