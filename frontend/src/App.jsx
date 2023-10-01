import "./App.css";
import axios from "axios";
import Header from "./components/header/Header";
import Hero from "./components/hero/Hero";
import Section from "./components/section/Section";
import Footer from "./components/Footer";

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
      <Hero></Hero>
      <Section></Section>
      Click on the button to get data from Django.
      <br />
      See data in the console
      <br />
      <button onClick={getHome}>Get Home From Django </button>
      <Footer></Footer>
    </>
  );
}

export default App;
