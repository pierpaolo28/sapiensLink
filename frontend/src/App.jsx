import "./App.css";
import axios from "axios";
import Header from "./components/header/Header";
import Footer from "./components/Footer";
import GridContainer from "./components/shared/GridContainer";

function App() {
  const getHome = () => {
    axios
      .get("home")
      .then(console.log)
      .catch((err) => console.log(err));
  };

  return (
    <div id="page-container">
      <div id="content-wrap">
        <Header></Header>
        <GridContainer>
          <div className="leftSidePanel">Example List</div>
          <div className="mainPanel">Sharing Knowledge One Link At A Time</div>
          <div className="rightSidePanel">Example List</div>
        </GridContainer>
      </div>
      {/* 
      //   Click on the button to get data from Django. Start Django Server First
      //   <br />
      //   See data in the console
      //   <br />
      //   <button onClick={getHome}>Get Home From Django </button> 
      */}
      <footer id="footer">
        <Footer id="footer"></Footer>
      </footer>
    </div>
  );
}

export default App;
