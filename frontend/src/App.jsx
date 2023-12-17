import "./App.css";
import axios from "axios";
import Header from "./components/header/Header";
import Footer from "./components/Footer";
import GridContainer from "./components/shared/GridContainer";
import { useNavigate } from 'react-router-dom';

function App() {
  // works fine
  const getHome = () => {
    axios
      .get("home")
      .then(console.log)
      .catch((err) => console.log(err));
  };

  const getList = () => {
    // 404 fixed passing user that exists on plain Django website
    axios.get("list/1/").then(console.log);
  };

  const getLists = async () => {
    // cors error fixed (look allowed urls in backend/sapiensLink/settings.py)
    let response = await fetch("http://127.0.0.1:8000/api/lists_db_setup/");
    let lists = await response.json();

    console.log(lists);
  };

  const navigate = useNavigate();

  const getReactHome = () => {
    navigate('/home');
  };
  const getReactListFeed = () => {
    navigate('/listsfeed');
  };
  const getReactDBSetup = () => {
    navigate('/dbsetup');
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
                <button onClick={getList}>Get List From Django </button>
              </li>
              <li>
                <button onClick={getLists}>Get List in React </button>
              </li>
              <li>
                <button onClick={getReactHome}>Go to home in React </button>
              </li>
              <li>
              <button onClick={getReactDBSetup}>Setup Empty DB</button>
              </li>
              <li>
              <button onClick={getReactListFeed}>Go to List Feed </button>
              </li>
            </ul>
          </div>
          <div className="smallMainPanel">Before clinging on a get/go option make sure to have already populated the DB either manually or using frontend/example_database/database_setup.html</div>
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
