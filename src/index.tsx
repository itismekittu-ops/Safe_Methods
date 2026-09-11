import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ReactGA from "react-ga4";
import { AppRoutes } from "./App";

const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.hydrateRoot(
    rootEl,
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}
