import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { navItems } from "./NavItems";
import Button from "./Button";
import Dropdown from "./Dropdown";
// import PostDropdown from "./PostDropdown";


function Navbar() {
  const [dropdown, setDropdown] = useState(false);
  //const [postdropdown, setpostdropdown] = useState(false);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          MAC
        </Link>
        <ul className="nav-items">
          {navItems.map((item) => {
            if (item.title === "리그 일정") {
              return (
                <li
                  key={item.id}
                  className={item.cName}
                  onMouseEnter={() => setDropdown(true)}
                  onMouseLeave={() => setDropdown(false)}
                >
                  <Link to={item.path}>{item.title}</Link>
                  {dropdown && <Dropdown />}
                </li>
              );
            }
            return (
              <li key={item.id} className={item.cName}>
                <Link to={item.path}>{item.title}</Link>
              </li>
            );
          })}
        </ul>
        <Button />
      </nav>
    </>
  );
}

export default Navbar;
