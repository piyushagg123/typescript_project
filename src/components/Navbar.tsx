import { useState, useContext, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { AuthContext } from "../context/Login";
import axios from "axios";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import JoinAsPro from "../pages/JoinAsPro";
import Avatar from "@mui/material/Avatar";
import { deepOrange } from "@mui/material/colors";
import { CgProfile } from "react-icons/cg";
import { IoIosLogOut } from "react-icons/io";
const Navbar = () => {
  const [isDivVisible, setIsDivVisible] = useState(false);
  const divRef = useRef(null);

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setIsDivVisible(false);
    }
  };
  useEffect(() => {
    if (isDivVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDivVisible]);

  const { login, setLogin, userDetails, vendor } = useContext(AuthContext);

  const [toggleMenu, setToggleMenu] = useState(false);
  const [toggleProfileMenu, setToggleProfileMenu] = useState(false);
  const handleLogout = async () => {
    try {
      const result = await axios.delete(
        "https://designmatch.ddns.net/user/logout",
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (result) {
        setToggleProfileMenu(false);
        setLogin(false);
        sessionStorage.removeItem("token");
      } else console.log("Cant log out");
    } catch (error) {
      console.log("error during logging out: ", error);
    }
  };
  const toggle = () => {
    setToggleMenu(!toggleMenu);
  };

  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) {
      return;
    }
    setOpen(false);
  };
  return (
    <div className="navBar flex justify-between p-[12px] fixed bg-prim w-screen top-0 items-center z-[1000] text-text text-lg">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <button onClick={toggle}>
            {toggleMenu ? <RxCross2 /> : <FaBars />}
          </button>
        </div>
        <div className="logo">
          <Link to="/">LOGO</Link>
        </div>
        <div
          className={
            toggleMenu
              ? "flex flex-col fixed top-16 right-0 left-0 bottom-0 bg-[#00000066] lg:flex-row lg:static lg:bg-none transition-all"
              : "hidden lg:flex lg:flex-row lg:static"
          }
        ></div>
      </div>
      {login ? (
        <div className="flex gap-4 items-center">
          {vendor || userDetails.data.is_vendor ? (
            ""
          ) : (
            <div>
              <button
                className="border-text border-[2px] px-[12px] py-[4px] text-text bg-prim hover:bg-text hover:text-prim hover:border-text rounded-[5px] transition-all text-[16px]"
                onClick={() => setOpen(true)}
              >
                Join as Pro
              </button>
            </div>
          )}
          <div className={`p-[6px] mr-2 `}>
            <div>
              <button
                onClick={() => {
                  setToggleProfileMenu(
                    (toggleProfileMenu) => !toggleProfileMenu
                  );
                  setIsDivVisible(true);
                }}
              >
                <Avatar sx={{ bgcolor: deepOrange[500] }}>
                  {`${userDetails.data.first_name[0]}${userDetails.data.last_name[0]}`}
                </Avatar>
              </button>
            </div>
            <div
              className={
                toggleProfileMenu && isDivVisible
                  ? "fixed bg-[#f3f1f1] w-[400px] text-text right-1 flex flex-col items-center justify-center top-[76px] rounded-[10px] "
                  : "hidden"
              }
              style={{ boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}
              ref={divRef}
            >
              <p className=" mt-3">{userDetails.data.email}</p>
              <Avatar
                sx={{
                  bgcolor: deepOrange[500],
                  height: 80,
                  width: 80,
                  marginTop: 2,
                }}
              >
                {`${userDetails.data.first_name[0]}${userDetails.data.last_name[0]}`}
              </Avatar>
              <p className="text-2xl pb-[16px]">
                Hi {userDetails.data.first_name}!!
              </p>

              <br />

              <div className="">
                <div className="flex flex-col items-center bg-white justify-center w-[370px] rounded-[10px] p-2 mb-2">
                  {vendor || userDetails.data.is_vendor ? (
                    <div className="">
                      <NavLink
                        to={"/profile"}
                        className="text-text p-1 rounded-[8px] flex items-center gap-2 w-[350px] hover:bg-[#f3f1f1] transition-all"
                        onClick={() => setToggleProfileMenu(false)}
                      >
                        <CgProfile /> <p>View Profile</p>
                      </NavLink>
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="flex h-[40px]">
                    <button
                      className=" text-[red] h-[36px] w-[350px] p-1  transition-all flex items-center gap-2 hover:bg-[#f3f1f1] rounded-[8px] "
                      onClick={() => {
                        setToggleProfileMenu(false);
                        setLogin(false);
                        handleLogout();
                      }}
                    >
                      <IoIosLogOut /> <p>Log Out</p>
                    </button>
                    <br />
                    <br />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 pr-5">
          <div>
            <button className="border-text border-[2px] px-[12px] py-[4px] text-text bg-prim hover:bg-text hover:text-prim hover:border-text rounded-[5px] transition-all text-[16px]">
              <NavLink to={"/login"}>Log In</NavLink>
            </button>
          </div>
          <div>
            <button className="border-text border-[2px] px-[12px] text-[16px] py-[4px] rounded-[5px] transition-all text-text bg-prim hover:bg-text hover:text-prim hover:border-text">
              <NavLink to={"/signup"}>Join</NavLink>
            </button>
          </div>
        </div>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{ width: "590px", margin: "auto" }}
        fullWidth
      >
        <DialogContent sx={{ height: "max-content", position: "relative" }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            x
          </IconButton>
          <JoinAsPro handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
