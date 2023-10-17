import React, { useState } from "react";
import { postDropdown } from "./NavItems";
import { Link } from "react-router-dom";
import "./PostDropdown.css";

function PostDropdown() {
    const [dropdown, setDropdown] = useState(false);

    return (
        <>
            <ul
                className={dropdown ? "services-submenu-post clicked" : "services-submenu-post"}
                onClick={() => setDropdown(!dropdown)}
            >
                {postDropdown.map((item) => {
                    return (
                        <li key={item.id}>
                            <Link
                                to={item.path}
                                className={item.cName}
                                onClick={() => setDropdown(false)}
                            >
                                {item.title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}

export default PostDropdown;
