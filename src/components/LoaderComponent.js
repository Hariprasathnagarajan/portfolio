// // src/components/LoaderComponent/LoaderComponent.js
// import React from "react";
// import Loader from "react-js-loader";
// import "./LoaderComponent.css";

// const LoaderComponent = ({ percentage }) => {
//   return (
//     <div className="loading-popup">
//       <div className="loading-popup-content">
//         <Loader
//           type="box-up"
//           bgColor={"#000b58"}
//           color={"#000b58"}
//           size={100}
//         />
//         <p>{percentage}% Loading...</p>
//       </div>
//     </div>
//   );
// };

// export default LoaderComponent;

import React from "react";
import Loader from "react-js-loader";
import "./LoaderComponent.css";

const LoaderComponent = () => {
  return (
    <div style={{backgroundColor:"white"}}>
    <div className="loading-popup">
      <div className="loading-popup-content">
        <Loader
          type="box-up"
          bgColor={"#000b58"}
          color={"#000b58"}
          size={100}
        />
        <p>Loading Dashboard...</p>
      </div>
    </div>
    </div>
  );
};

export default LoaderComponent;