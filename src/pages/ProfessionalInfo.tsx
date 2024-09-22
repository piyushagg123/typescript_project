import { FormEvent, useContext, useState } from "react";
import img from "../assets/noImageinProject.jpg";
import projectImage from "../assets/noProjectAdded.jpg";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import {
  Chip,
  Tab,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import Carousel from "../components/ProjectCard";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import constants from "../constants";
import { AuthContext } from "../context/Login";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Reviews from "../components/Reviews";
import ReviewDialog from "../components/ReviewDialog";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddAProject from "../components/AddAProject";
import ProjectImages from "../components/ProjectImages";
import CloseIcon from "@mui/icons-material/Close";
import MultipleSelect from "../components/MultipleSelect";
import BorderColorIcon from "@mui/icons-material/BorderColor";

interface VendorData {
  logo?: string;
  category: string;
  sub_category_1: string;
  sub_category_2: string;
  sub_category_3: string;
  description: string;
  business_name: string;
  average_project_value: number;
  number_of_employees: number;
  projects_completed: number;
  mobile: string;
  email: string;
  city: string;
  social?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

interface ProjectData {
  images: Record<string, string[]>;
  title: string;
  description: string;
  city: string;
  state: string;
  sub_category_1: string;
  sub_category_2: string;
  start_date: string;
  end_date: string;
}

interface ReviewFormObject {
  title?: string;
  body?: string;
  rating_quality?: number;
  rating_execution?: number;
  rating_behaviour?: number;
  vendor_id?: number;
}

interface ProfessionalInfoProps {
  renderProfileView: boolean;
  renderProfessionalInfoView: boolean;
}

const fetchVendorDetails = async (id: string, renderProfileView: boolean) => {
  let data;
  if (renderProfileView) {
    const response = await axios.get(
      `${constants.apiBaseUrl}/vendor/auth/details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    data = response.data;
  } else {
    const response = await axios.get(
      `${constants.apiBaseUrl}/vendor/details?vendor_id=${id}`
    );
    data = response.data;
  }

  return data.data as VendorData;
};

const fetchVendorProjects = async (id: string, renderProfileView: boolean) => {
  let data;
  if (renderProfileView) {
    const response = await axios.get(
      `${constants.apiBaseUrl}/vendor/auth/project/details`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    data = response.data;
  } else {
    const response = await axios.get(
      `${constants.apiBaseUrl}/vendor/project/details?vendor_id=${id}`
    );
    data = response.data;
  }
  return data.data as ProjectData[];
};
const ProfessionalInfo: React.FC<ProfessionalInfoProps> = ({
  renderProfileView,
  renderProfessionalInfoView,
}) => {
  const authContext = useContext(AuthContext);

  if (authContext === undefined) {
    return;
  }
  const { login } = authContext;
  const { professionalId } = useParams();
  const [formData, setFormData] = useState<VendorData>({
    logo: "",
    business_name: "",
    sub_category_1: "",
    sub_category_2: "",
    sub_category_3: "",
    description: "",
    mobile: "",
    email: "",
    category: "",
    average_project_value: 0,
    number_of_employees: 0,
    projects_completed: 0,
    city: "",
    social: {
      facebook: "",
      instagram: "",
      website: "",
    },
  });

  const [selectedProject, setSelectedProject] = useState<ProjectData>();
  const [value, setValue] = useState("1");

  // const { data: vendorData, isLoading: isVendorLoading } = useQuery(
  //   ["vendorDetails", professionalId],
  //   () => fetchVendorDetails(professionalId!, renderProfileView)
  // );

  const { isLoading: isVendorLoading } = useQuery(
    ["vendorDetails", professionalId],
    () => fetchVendorDetails(professionalId!, renderProfileView),
    {
      onSuccess: (data) => {
        setFormData({
          business_name: data.business_name,
          sub_category_1: data.sub_category_1 || "",
          sub_category_2: data.sub_category_2 || "",
          sub_category_3: data.sub_category_3 || "",
          description: data.description,
          mobile: data.mobile,
          email: data.email,
          category: data.category,
          average_project_value: data.average_project_value,
          number_of_employees: data.number_of_employees,
          projects_completed: data.projects_completed,
          city: data.city,
          social: {
            facebook: data.social?.facebook ?? "",
            instagram: data.social?.instagram ?? "",
            website: data.social?.website ?? "",
          },
          logo: data.logo,
        });
      },
    }
  );

  const [editMode, setEditMode] = useState(false);

  const handleEditClick = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e: any) => {
    console.log(e.target);

    const { name, value } = e.target;

    if (["facebook", "instagram", "website"].includes(name)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        social: {
          ...prevFormData.social,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    console.log(formData);
    setEditMode(false);
  };

  // const handleCancel = () => {
  //   setFormData(formData!);
  // };

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery(
    ["vendorProjects", professionalId],
    () => fetchVendorProjects(professionalId!, renderProfileView)
  );

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [projectId, setProjectId] = useState<number>(0);
  const handleClose = () => {
    setOpen(false);
    setIsSubmitted(false);
    setSelectedSubCategories([]);
  };

  const handleReviewDialogOpen = () => {
    setReviewDialogOpen(true);
  };

  const handleReviewDialogClose = (
    _?: React.SyntheticEvent<Element, Event>,
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    if (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) {
      return;
    }
    setReviewDialogOpen(false);
    setReviewError("");
  };
  const formatCategory = (str: string) => {
    let formattedStr = str.replace(/_/g, " ");
    formattedStr = formattedStr
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return formattedStr;
  };

  const handleCarouselClick = (project: ProjectData) => {
    setSelectedProject(project);
  };

  const handleBackClick = () => {
    setSelectedProject(undefined);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;
    const formdata = new FormData(form);

    const formObject: ReviewFormObject = { vendor_id: Number(professionalId) };
    formdata.forEach((value, key) => {
      if (key.startsWith("rating_")) {
        (formObject[
          key as "rating_quality" | "rating_execution" | "rating_behaviour"
        ] as number) = Number(value);
      } else {
        formObject[key as "body"] = value.toString();
      }
    });

    try {
      await axios.post(`${constants.apiBaseUrl}/vendor/review`, formObject, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      handleReviewDialogClose();
    } catch (error: any) {
      setReviewError(error.response.data.debug_info);
    }
    setLoading(false);
  };

  if (isVendorLoading || isProjectsLoading)
    return <div className="min-h-screen">Loading...</div>;
  return (
    <>
      {window.scrollTo(0, 0)}
      <div className="mt-[70px] text-text flex flex-col lg:flex-row  justify-center  min-h-screen">
        <div className="text-[10px] md:text-[16px] flex flex-col gap-7 md:gap-0">
          <div className=" md:w-max m-auto lg:m-0 my-[2em]">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-[2em] mb-[1em]">
              <div className="m-auto md:m-0">
                {formData?.logo ? (
                  <img
                    src={`${constants.apiImageUrl}/${formData.logo}`}
                    alt="Vendor Logo"
                    className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full"
                  />
                ) : (
                  <img
                    src={img}
                    alt=""
                    className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full"
                  />
                )}
              </div>
              <div>
                <p className="font-bold text-base text-darkgrey m-auto">
                  {editMode ? (
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    formatCategory(
                      formData?.business_name ?? "Unknown Business"
                    )
                  )}

                  {renderProfileView && (
                    <button
                      onClick={!editMode ? handleEditClick : handleSave}
                      className="ml-4"
                    >
                      {editMode ? "Save" : <BorderColorIcon />}
                    </button>
                  )}
                </p>
                <p className="mb-2 mt-2 flex flex-col md:flex-row gap-2 items-start md:items-center">
                  <span className="font-bold text-sm text-darkgrey">
                    SPECIALIZED THEMES :
                  </span>{" "}
                  {editMode ? (
                    <MultipleSelect
                      selectedValue={
                        formData.sub_category_1
                          ? formData.sub_category_1.split(",")
                          : []
                      }
                      onChange={(selected) => {
                        console.log("Selected Themes:", selected);
                        setFormData((prevData) => ({
                          ...prevData,
                          sub_category_1: selected.join(","),
                        }));
                      }}
                      maxSelection={3}
                      apiEndpoint={`${constants.apiBaseUrl}/category/subcategory1/list?category=INTERIOR_DESIGNER`}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {formatCategory(formData?.sub_category_1 ?? "N/A")
                        .split(",")
                        .map((item, ind) => (
                          <Chip
                            label={item.charAt(0).toUpperCase() + item.slice(1)}
                            variant="outlined"
                            key={ind}
                            sx={{ height: "25px" }}
                          />
                        ))}
                    </div>
                  )}
                </p>

                <p className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-2">
                  <span className="font-bold text-sm text-darkgrey">
                    SPECIALIZED SPACES :
                  </span>
                  {editMode ? (
                    <MultipleSelect
                      selectedValue={
                        formData.sub_category_2
                          ? formData.sub_category_2.split(",")
                          : []
                      }
                      onChange={(selected) => {
                        console.log("Selected Spaces:", selected);
                        setFormData((prevData) => ({
                          ...prevData,
                          sub_category_2: selected.join(","),
                        }));
                      }}
                      maxSelection={3}
                      apiEndpoint={`${constants.apiBaseUrl}/category/subcategory2/list?category=INTERIOR_DESIGNER`}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {formatCategory(formData?.sub_category_2 ?? "N/A")
                        .split(",")
                        .map((item, ind) => (
                          <Chip
                            label={item.charAt(0).toUpperCase() + item.slice(1)}
                            variant="outlined"
                            key={ind}
                            sx={{ height: "25px" }}
                          />
                        ))}
                    </div>
                  )}
                </p>
                <p className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-2">
                  <span className="font-bold text-sm text-darkgrey">
                    EXECUTION TYPE :
                  </span>{" "}
                  {editMode ? (
                    <MultipleSelect
                      selectedValue={
                        formData.sub_category_3
                          ? formData.sub_category_3.split(",")
                          : []
                      }
                      onChange={(selected) => {
                        console.log("Selected Spaces:", selected);
                        setFormData((prevData) => ({
                          ...prevData,
                          sub_category_3: selected.join(","),
                        }));
                      }}
                      maxSelection={1}
                      apiEndpoint={`${constants.apiBaseUrl}/category/subcategory3/list?category=INTERIOR_DESIGNER`}
                    />
                  ) : (
                    (formData?.sub_category_3 ?? "N/A")
                      .split(",")
                      .map((item, ind) => (
                        <Chip
                          label={
                            item === "DESIGN"
                              ? constants.DESIGN
                              : item === "MATERIAL_SUPPORT"
                              ? constants.MATERIAL_SUPPORT
                              : constants.COMPLETE
                          }
                          variant="outlined"
                          key={ind}
                          sx={{
                            height: "25px",
                            maxWidth: "95vw",
                            overflowWrap: "break-word",
                          }}
                        />
                      ))
                  )}
                </p>
              </div>
            </div>

            {login && (
              <div className=" gap-3 flex mb-[2em]">
                <div>
                  {renderProfessionalInfoView && (
                    <Button
                      variant="outlined"
                      style={{ backgroundColor: "#8c52ff", color: "white" }}
                      onClick={handleReviewDialogOpen}
                    >
                      <StarBorderIcon /> <p>Write a Review</p>
                    </Button>
                  )}
                </div>
              </div>
            )}
            <TabContext value={value}>
              <Box>
                <TabList
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#8c52ff",
                    },
                    "& .MuiTab-root.Mui-selected": {
                      color: "#8c52ff",
                    },
                    "& .MuiTab-root": {
                      color: "#576375",
                    },
                  }}
                >
                  <Tab
                    label="About us"
                    value="1"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  />
                  <Tab
                    label="Projects"
                    value="2"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                    onClick={handleBackClick}
                  />
                  <Tab
                    label="Reviews"
                    value="3"
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  />
                </TabList>
              </Box>
              <TabPanel value={"1"} sx={{ padding: 0, marginTop: "10px" }}>
                <div className="w-[95vw] lg:w-[750px]">
                  <p className="text-sm md:text-base text-justify mb-[1em]">
                    {formData?.description}
                  </p>
                </div>
              </TabPanel>
              <TabPanel value={"2"} sx={{ padding: 0, marginTop: "10px" }}>
                {renderProfileView && (
                  <div
                    className={`${
                      selectedProject ? "hidden" : "flex w-full justify-end"
                    }`}
                  >
                    <Button
                      variant="outlined"
                      style={{ backgroundColor: "#8c52ff", color: "white" }}
                      onClick={() => setOpen(true)}
                    >
                      <AddCircleIcon /> Add a new project
                    </Button>
                  </div>
                )}
                <div className="w-[95vw]  lg:w-[750px] flex justify-center flex-col items-center m-auto md:m-0 ">
                  <div className="flex flex-wrap pt-[1em] mb-[3em]">
                    {!projectsData ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-[1em]">
                          <img
                            src={projectImage}
                            alt=""
                            className="w-[300px]"
                          />
                        </div>
                        <p className="mb-[1em]">
                          No projects added yet by the designer
                        </p>
                      </div>
                    ) : selectedProject ? (
                      <div className="flex flex-col">
                        <div className="flex mb-[1em] justify-start gap-60 lg:w-[750px]">
                          <Button
                            variant="outlined"
                            style={{
                              backgroundColor: "#8c52ff",
                              color: "white",
                            }}
                            onClick={handleBackClick}
                          >
                            <ArrowBackIcon />
                          </Button>
                        </div>
                        <div className="flex flex-col gap-3 mb-[1em]">
                          <Carousel
                            imageObj={selectedProject.images}
                            showProjectDetails={false}
                            city=""
                            state=""
                            theme=""
                            title=""
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap lg:w-[750px] justify-center md:justify-between">
                        {projectsData.map((item, ind) => (
                          <div
                            key={ind}
                            onClick={() => handleCarouselClick(item)}
                            className="mb-4"
                          >
                            <Carousel
                              key={ind}
                              imageObj={item.images}
                              title={item.title}
                              city={item.city}
                              state={item.state}
                              theme={item.sub_category_1}
                              showProjectDetails={true}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabPanel>
              <TabPanel value={"3"} sx={{ padding: 0, marginTop: "10px" }}>
                <div className="w-[95vw] lg:w-[750px] flex justify-center flex-col items-center">
                  {
                    <Reviews
                      id={professionalId ? Number(professionalId) : Number(-1)}
                    />
                  }
                </div>
              </TabPanel>
            </TabContext>
          </div>
        </div>
        <div className="w-[250px] text-lg ml-2 md:ml-10 mt-10">
          <div className=" ">
            <p className="font-bold text-base text-darkgrey">Contact Number</p>
            <p className="text-[16px]">{formData?.mobile ?? "N/A"}</p>
          </div>
          <div className="mt-[1em] ">
            <p className="font-bold text-base text-darkgrey">Email</p>
            <p className="text-[16px]">{formData?.email ?? "N/A"}</p>
          </div>
          <div className="flex flex-col justify-evenly mt-[1em] gap-6">
            {selectedProject ? (
              <>
                <div>
                  <p className="font-bold text-base text-purple">
                    Project details
                  </p>
                  <p className="font-bold text-base text-darkgrey">Title</p>
                  <p className="text-[16px] max-w-[300px]">
                    {selectedProject.title}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">
                    Description
                  </p>
                  <p className="text-[16px] max-w-[300px]">
                    {selectedProject.description}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">City</p>
                  <p className="text-[16px] max-w-[300px]">
                    {selectedProject.city}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">State</p>
                  <p className="text-[16px] max-w-[300px]">
                    {selectedProject.state}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">Spaces</p>
                  <p className="text-[16px]">
                    {formatCategory(selectedProject.sub_category_2)
                      .split(",")
                      .map((item, ind) => (
                        <>
                          <Chip
                            label={item}
                            variant="outlined"
                            key={ind}
                            sx={{ height: "25px" }}
                            style={{
                              color: "linear-gradient(#ff5757,#8c52ff)",
                            }}
                          />
                        </>
                      ))}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">Theme</p>
                  <p className="text-[16px]">
                    {formatCategory(selectedProject.sub_category_1)
                      .split(",")
                      .map((item, ind) => (
                        <>
                          <Chip
                            label={item}
                            variant="outlined"
                            key={ind}
                            sx={{ height: "25px" }}
                            style={{
                              color: "linear-gradient(#ff5757,#8c52ff)",
                            }}
                          />
                        </>
                      ))}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">
                    Start Date
                  </p>
                  <p className="text-[16px] max-w-[300px]">
                    {selectedProject.start_date}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-darkgrey">End date</p>
                  <p className="text-[16px] max-w-[300px]">
                    {selectedProject.end_date}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="font-bold text-base text-darkgrey">
                    Typical Job Cost
                  </p>
                  {editMode ? (
                    <input
                      type="text"
                      name="average_project_value"
                      value={formData.average_project_value}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-[16px]">
                      {formData?.average_project_value ?? "N/A"}
                    </p>
                  )}
                </div>
                <div className=" ">
                  <p className="font-bold text-base text-darkgrey">
                    Number of employees
                  </p>
                  {editMode ? (
                    <input
                      type="number"
                      name="number_of_employees"
                      value={formData.number_of_employees}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-[16px]">
                      {formData?.number_of_employees ?? "N/A"}
                    </p>
                  )}
                </div>
                <div className=" ">
                  <p className="font-bold text-base text-darkgrey">
                    Projects Completed
                  </p>
                  {editMode ? (
                    <input
                      type="number"
                      name="projects_completed"
                      value={formData.projects_completed}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-[16px]">
                      {formData?.projects_completed ?? "N/A"}
                    </p>
                  )}
                </div>

                <div className=" ">
                  <p className="font-bold text-base text-darkgrey">Location</p>
                  <p className="text-[16px]">{formData?.city ?? "N/A"}</p>
                </div>
                {editMode ? (
                  <div>
                    <p className="font-bold text-base text-darkgrey">Socials</p>
                    {editMode ? (
                      <>
                        <label>Facebook:</label>
                        <input
                          type="text"
                          name="facebook"
                          value={formData?.social?.facebook}
                          onChange={handleInputChange}
                        />
                      </>
                    ) : (
                      ""
                    )}
                    {editMode ? (
                      <>
                        {" "}
                        <label>Instagram:</label>
                        <input
                          type="text"
                          name="instagram"
                          value={formData?.social?.instagram}
                          onChange={handleInputChange}
                        />
                      </>
                    ) : (
                      ""
                    )}
                    {editMode ? (
                      <>
                        <label>Website:</label>
                        <input
                          type="text"
                          name="website"
                          value={formData?.social?.website}
                          onChange={handleInputChange}
                        />
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  (formData?.social?.facebook ||
                    formData?.social?.instagram ||
                    formData?.social?.website) && (
                    <div>
                      <p className="font-bold text-base text-darkgrey">
                        Socials
                      </p>
                      {formData.social.facebook && (
                        <a
                          href={formData.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FacebookIcon />
                        </a>
                      )}
                      {formData.social.instagram && (
                        <a
                          href={formData.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <InstagramIcon />
                        </a>
                      )}
                      {formData.social.website && (
                        <a
                          href={formData.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenInNewIcon />
                        </a>
                      )}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
        <ReviewDialog
          handleReviewDialogClose={handleReviewDialogClose}
          handleReviewSubmit={handleReviewSubmit}
          loading={loading}
          reviewDialogOpen={reviewDialogOpen}
          reviewError={reviewError}
        />

        <Dialog open={open} fullWidth>
          <DialogContent sx={{ height: "max-content" }}>
            <div className="flex justify-end">
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
                <CloseIcon />
              </IconButton>
            </div>
            {!isSubmitted ? (
              <AddAProject setProjectId={setProjectId} projectId={projectId} />
            ) : (
              <ProjectImages
                subCategories={selectedSubCategories}
                projectId={projectId}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ProfessionalInfo;
