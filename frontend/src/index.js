import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Home from "./Home";
import reportWebVitals from "./reportWebVitals";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const theme = createTheme({
  /** Put your mantine theme override here but preferred choice is to use Tailwind */
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <App />,
  },
  {
    path: "/signup",
    element: <App />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MantineProvider theme={theme}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </MantineProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();