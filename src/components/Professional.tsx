import React from "react";
import { Rating } from "@mui/material";
import { truncateText } from "../utils";

interface ProfessionalProps {
  img: string;
  rating: number;
  about: string;
  profCat: string;
}

const Professional: React.FC<ProfessionalProps> = ({
  img,
  rating,
  about,
  profCat,
}) => {
  return (
    <div className="flex gap-8 mb-5  items-start flex-col sm:flex-row mt-3 sm:mt-0 text-text px-4">
      <div>
        <img
          src={img}
          alt="Professional"
          className="h-[192px] w-[300px] sm:w-[342px] rounded-[10px] sm:max-w-[342px]"
        />
      </div>

      <div className="flex flex-col justify-center xl:flex-row items-start">
        <div className="w-[270px] md:w-[375px] xl:w-[600px]">
          <div className="flex flex-col gap-1 items-start">
            <span className="font-bold text-base text-darkgrey">{profCat}</span>
            <Rating
              size="small"
              value={rating}
              disabled
              precision={0.5}
              style={{ color: "#ff5757", marginLeft: "-2px" }}
            />
          </div>
          <br />
          <p>{truncateText(about, 80)}</p>
        </div>
      </div>
    </div>
  );
};

export default Professional;
