import React from "react";
import styles from "../styles/Home.module.css";
import Link from "next/link";

const Navbar = (props) => {
  // var check = $('.messageCheckbox:checked').val();
  // console.log(check)
  function getVal() {
    var checkbox = document.getElementById("check");
    var clientWidth = document.getElementById("ul").clientWidth;
    if (clientWidth <= 600) {
      if (checkbox.checked == true) {
        // document.getElementById('navcontainer').style.cssText = "width: 80%";
        document.getElementById('ul').style.cssText = "left:0; display:'block';height:0;";
        document.getElementById('i').style.cssText = "transform: rotate(90deg); color:white; transition: 0.5s"
        // console.log(clientWidth);
      } else {
        // document.getElementById("navcontainer").style.width = "";
        document.getElementById('ul').style.cssText = "left:''; display:none;";
        document.getElementById('i').style.cssText = `transform: rotate(0deg); color:${props.color}; transition: 0.5s`
      }
    }
  }
  return (
    <nav>
      <div id="nav" className={styles.navbar}>
        <input
            type="checkbox"
            name="check"
            className={styles.messageCheckbox}
            id="check"
            onChange={getVal}
          />
        <div className={styles.navcontainer} id="navcontainer">
          <label htmlFor="check" className={styles.checkbtn}>
            <i id='i' style={{'color': `${props.color}`}} className="fa fa-bars"></i>
          </label>
          <ul id="ul" className={styles.navcontainerul}>
            <Link href="/">
              <a className="link">
                <li>Home</li>
              </a>
            </Link>
            <Link href="/about">
              <a className="link">
                <li>About</li>
              </a>
            </Link>
            <Link href="/blog">
              <a className="link">
                <li>Blog</li>
              </a>
            </Link>
            <Link href="/contact">
              <a className="link">
                <li>Contact</li>
              </a>
            </Link>
            <div className={styles.navcontent}>
              <img
                src="/assets/img/shreyans1.png"
                alt="Logo"
                loading="lazy"
                width="24px"
                className="pb-1"
              />
              TheLawsBender
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
