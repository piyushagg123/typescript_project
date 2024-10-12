import { FormEvent, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import axios from "axios";
import { AuthContext } from "../context/Login";
import CryptoJS from "crypto-js";
import JoinAsPro from "./JoinAsPro";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import constants from "../constants";
import { jwtDecode } from "jwt-decode";
import FinancePlanner from "./FinancePlanner";

interface FormObject {
  [key: string]: string;
}

interface SignupProps {
  joinAsPro: boolean;
}

const SignUp: React.FC<SignupProps> = ({ joinAsPro }) => {
  const authContext = useContext(AuthContext);
  if (authContext === undefined) {
    return;
  }
  const { setLogin, setUserDetails, userDetails } = authContext;
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [openJoinasPro, setOpenJoinasPro] = useState<boolean>(false);
  const [joinAs, setJoinAs] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setJoinAs(event.target.value as string);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const formObject: FormObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value.toString();
    });

    const confirmPassword = formObject.confirm_password;
    delete formObject.confirm_password;

    if (!formObject.first_name) {
      setError("Please enter your first name.");
      return;
    }

    if (!formObject.last_name) {
      setError("Please enter your last name.");
      return;
    }

    if (!formObject.email) {
      setError("Please enter your email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formObject.email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (!formObject.mobile) {
      setError("Please enter your mobile number.");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formObject.mobile)) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (joinAsPro) {
      if (!joinAs) {
        setError("Please select the professional type");
        return;
      }
    }

    if (!formObject.password) {
      setError("Please enter your password.");
      return;
    }

    if (formObject.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    formObject.password = CryptoJS.SHA1(formObject.password).toString();
    try {
      const response = await axios.post(
        `${constants.apiBaseUrl}/user/register`,
        formObject
      );

      sessionStorage.setItem("token", response.data.access_token);
      const user_data = await axios.get(
        `${constants.apiBaseUrl}/user/details`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      const decodedJWT = jwtDecode(sessionStorage.getItem("token")!);
      const combinedData = {
        ...user_data.data.data,
        ...decodedJWT,
      };
      setUserDetails(combinedData);

      setLogin(true);

      if (joinAsPro) {
        setOpenJoinasPro(true);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      setError(error.response?.data?.debug_info ?? "An error occurred");
    }
  };

  const handleProfession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!joinAs) {
      setError("Please select the professional type");
      return;
    }
    setOpenJoinasPro(true);
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div className="hidden md:block bg-purple p-12 lg:py-28 text-white lg:px-36">
          <h1 className="text-xl md:text-3xl font-bold mt-[4em]">
            {joinAsPro
              ? "Join today for recreating homes"
              : "Sign up today to recreate your home"}
          </h1>
          <div className="flex items-center mt-[2em]">
            <LabelImportantIcon className="text-sm" />
            <p>Explore vast selection of ideas</p>
          </div>
          <div className="flex items-center mt-[1em]">
            <LabelImportantIcon className="text-sm" />
            <p>Get matched with best interior designers near you</p>
          </div>
          <div className="flex items-center mt-[1em]">
            <LabelImportantIcon className="text-sm" />
            <p>Sit back, relax and get your home recreated.</p>
          </div>
        </div>
        <div className="mt-28">
          {!sessionStorage.getItem("token") && (
            <p className=" m-auto w-fit">
              Already have an account?
              <span className="ml-3">
                <Link to={"/login"} className="text-purple">
                  Log in
                </Link>
              </span>
            </p>
          )}
          {openJoinasPro ? (
            <div className="py-8">
              {joinAs === "InteriorDesigner" ? (
                <JoinAsPro />
              ) : (
                <FinancePlanner />
              )}
            </div>
          ) : (
            <div className="w-fit m-auto md:p-8 flex flex-col justify-center items-center ">
              <h1 className="text-2xl md:text-3xl text-center font-bold text-purple mb-[1em]">
                Sign up for your account
              </h1>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    width: "300px",
                    padding: "2px",
                    marginBottom: "10px",
                  }}
                >
                  {error}
                </Alert>
              )}
              <form
                className="flex flex-col"
                onSubmit={
                  userDetails.first_name ? handleProfession : handleSubmit
                }
              >
                {!userDetails.first_name && (
                  <>
                    {" "}
                    <TextField
                      label="First name"
                      id="first_name"
                      name="first_name"
                      size="small"
                      sx={{ width: "300px" }}
                    />
                    <TextField
                      label="Last name"
                      id="last_name"
                      name="last_name"
                      size="small"
                      sx={{ width: "300px", marginY: "1em" }}
                    />
                    <TextField
                      label="Mobile number"
                      id="mobile"
                      name="mobile"
                      type="number"
                      size="small"
                      sx={{ width: "300px" }}
                    />
                    <TextField
                      label="Email"
                      id="email"
                      name="email"
                      size="small"
                      sx={{ width: "300px", marginY: "1em" }}
                    />
                  </>
                )}
                {joinAsPro && (
                  <FormControl
                    fullWidth
                    sx={{ marginBottom: "1em", width: "300px" }}
                  >
                    <InputLabel id="demo-simple-select-label" size="small">
                      Profession
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={joinAs}
                      label="Profession"
                      onChange={handleChange}
                      size="small"
                    >
                      <MenuItem value={"InteriorDesigner"}>
                        Interior designer
                      </MenuItem>
                      <MenuItem value={"FinancePlanner"}>
                        Finance planner
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
                {!userDetails.first_name && (
                  <TextField
                    label="Password"
                    type="password"
                    id="password"
                    name="password"
                    size="small"
                    sx={{ width: "300px" }}
                  />
                )}
                <label>
                  {!userDetails.first_name && (
                    <TextField
                      label="Confirm Password"
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      size="small"
                      sx={{ width: "300px", marginY: "1em" }}
                    />
                  )}
                  <div className="flex justify-center my-[1em]">
                    <Button
                      type="submit"
                      variant="outlined"
                      style={{ backgroundColor: "#8c52ff", color: "white" }}
                    >
                      Continue
                    </Button>
                  </div>
                </label>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SignUp;
