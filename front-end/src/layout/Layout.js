import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";

import "./Layout.css";

/**
 * Defines the main layout of the application.
 *
 * You will not need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <div className="container-fluid">
      <div className="row min-vh-100"> {/* Ensure full height */}
        <div className="col-md-2 sidebar p-0"> {/* Sidebar */}
          <Menu />
        </div>
        <div className="col p-4"> {/* Main content area with padding */}
          <Routes />
        </div>
      </div>
    </div>
  );}

export default Layout;
