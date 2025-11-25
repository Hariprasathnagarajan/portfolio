  import { HiBuildingOffice2 } from "react-icons/hi2";
import {
  FaBuildingCircleXmark,
  FaBuildingCircleExclamation,
} from "react-icons/fa6";
import {
  GrDocument,
  GrDocumentTime,
  GrDocumentVerified,
  GrDocumentExcel,
} from "react-icons/gr";

import { PieChart, Pie, Cell } from "recharts";
import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaUsers,
  FaFileAlt,
  FaFolderOpen,
  FaBuilding,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import apiServices from "../../ApiServices/ApiServices";
import { PiFilesBold } from "react-icons/pi";

// import { MdArrowDropUp, MdArrowDropDown  } from "react-icons/md";
import {
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

import {
  Bar,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
// import { MdArrowDropUp, MdArrowDropDown  } from "react-icons/md";
  const username = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");

  const isUploader = role === "Uploader";
  const isReviewer = role === "Reviewer";
  const isViewer = role === "Viewer";
  const isAdmin = role === "Admin";
  const isAdminOrDocumentRole = ["Admin", "Uploader", "Approver", "Reviewer", "Viewer"].includes(role);

// used 
const DeclarationDeatilsMonthly = () => {
  const defaultMonths = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
  const [yearlyData, setYearlyData] = useState({});
  const [selectedReportYear, setSelectedReportYear] = useState("2025");
  const [modalOpenChart, setmodalOpenChart] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isUploader = localStorage.getItem("role") === "Uploader";
  const isReviewer = localStorage.getItem("role") === "Reviewer";
  const isViewer = localStorage.getItem("role") === "Viewer";
  const isAdminOrDocumentRole = !(isUploader || isReviewer || isViewer);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiServices.declarationDetailsMonthly();
        setYearlyData(res);
        console.log('declarationDetailsMonthly response : ', res);

        const years = Object.keys(res);
        if (years.length > 0 && !years.includes(selectedReportYear)) {
          setSelectedReportYear(years[0]);
        }
      } catch (err) {
        console.error("Failed to fetch monthly declaration details:", err);
      }
    };

    fetchData();
  }, []);

  const uniqueReportYears = Object.keys(yearlyData);

  const transformedData = Object.entries(yearlyData[selectedReportYear] || {}).map(
    ([month, value]) => ({
      month,
      total_documents: value,
      companies: [], // Optionally populate this if backend provides
    })
  );

  const mergedData = defaultMonths.map((month) => {
    const match = transformedData.find((item) => item.month === month);
    console.log("Merged Data", match);
    return match || { month, total_documents: 0, companies: [] };
  });

const chartStyles = {
  borderRadius: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
  padding: "10px",
  marginRight: "0",
  marginTop: "0", 
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
  boxSizing: "border-box",
     width: "100%", height:"fit-content", position :"relative", maxWidth: "420px",

};


  return (
    <>
      <div
  style={{
    ...chartStyles,
    display: isUploader || isReviewer || isViewer ? "none" : "block",
  }}
>
        {isAdminOrDocumentRole && (
          <>
            <span><center>Declaration</center></span>
          </>
        )}

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={mergedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            onClick={(event) => {
              const clickedMonth = event?.activeLabel;
              if (clickedMonth) {
                const clickedData = mergedData.find((d) => d.month === clickedMonth);
                if (clickedData) setmodalOpenChart(clickedData);
              }
            }}
          >
            <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: "bold", fill: "#555" }} />
            <YAxis tick={{ fontSize: 10, fontWeight: "bold", fill: "#555", dx: -4 }} width={50} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const monthData = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                        fontSize: "12px",
                      }}
                    >
                      <p><strong>📅 Month:</strong> {monthData.month}</p>
                      <p><strong>📄 Declaration Uploaded:</strong> {monthData.total_documents}</p>
                      {monthData.companies.length > 0 && (
                        <>
                          <strong>Company Breakdown:</strong>
                          {monthData.companies.map((c, i) => (
                            <div key={i} style={{ paddingLeft: "10px", borderBottom: "1px solid #ddd" }}>
                              <p
                                style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                                onClick={() => {
                                  setModalData(c);
                                  setIsModalOpen(true);
                                }}
                              >
                                📌 <strong>{c.company}</strong>
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: "orange", strokeWidth: 2 }}
            />
            <Bar dataKey="total_documents" barSize={20} fill="#2c2e83" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="total_documents" stroke="#ff7300" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};


// used
const ProgressBarChart = ({
  totalSize = 0,
  client = 0,
  isUploader,
  isReviewer,
  isViewer,
  isAdminOrDocumentRole,
}) => {

  const max = isAdminOrDocumentRole ? 100 : 504; // Adjust max based on role
  const used = typeof totalSize === "number" ? totalSize : 0;
  const percentage = Math.min((used / max) * 100, 100).toFixed(2);



  // const max = isUploader ? 10 : 504;

  const usedRaw = isUploader ? 10 : isAdminOrDocumentRole ? client : totalSize;
  // const used = typeof usedRaw === "number" && !isNaN(usedRaw) ? usedRaw : 0;
  // const percentage = Math.min((used / max) * 100, 100).toFixed(2);
  const roundedUsed = used > max ? max.toFixed(2) : used.toFixed(2);
  const fullLabel = `${roundedUsed} MB`;

  // get role from localStorage
  const role = localStorage.getItem("role")?.toLowerCase();

  // assign dynamic styles
  const roleStyles = {
    default: {
      border: "2px solid #ccc",
    },
    admin: {
      border: "2px solid #004080",
    },
    uploader: {
      border: "2px solid #00bcd4",
      backgroundColor: "#f0fbfc",
      boxShadow: "0 6px 18px rgba(0, 188, 212, 0.2)",
    },
    reviewer: {
      border: "2px solid #004080",
    },
    viewer: {
      border: "2px solid #004080",
    },
    product_owner: {
      border: "2px solid #00bcd4",
      backgroundColor: "#f0fbfc",
      boxShadow: "0 6px 18px rgba(0, 188, 212, 0.2)",
    },
  };

  const roleClass = roleStyles[role] || roleStyles.default;

  const wrapperStyle = {
    padding: "16px 20px",
    borderRadius: "14px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    gap: "3px",
    transition: "transform 0.2s ease",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    border: "1px solid #e0e0e0",
      backgroundColor: "#f0fbfc",
      // boxShadow: "0 6px 18px rgba(0, 188, 212, 0.2)",
     width: "90%", height:"fit-content", position :"relative", maxWidth: "420px",
     
    
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "17px",
    fontWeight: "700",
    color: "#007bff",
    margin: "0",
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const labelStyle = {
    minWidth: "56px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "bold",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15)",
  };

  const barBgStyle = {
    flex: 1,
    height: "12px",
    backgroundColor: "#e6e6e6",
    borderRadius: "50px",
    overflow: "hidden",
  };

  const barFillStyle = {
    height: "100%",
    borderRadius: "50px",
    transition: "width 0.4s ease-in-out",
    background: "linear-gradient(to right, #007bff, #00d4ff)",
    width: `${percentage}%`,
  };

  const percentStyle = {
    textAlign: "center",
    fontSize: "13px",
    color: "#333",
    fontWeight: "500",
    marginTop: "-6px",
  };

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle}>Storage Usage</h3>

      <div style={rowStyle}>
        <div style={labelStyle}>{fullLabel}</div>

        <div style={barBgStyle}>
          <div style={barFillStyle} />
        </div>
      </div>

      <div style={percentStyle}>{percentage}% Used</div>
    </div>
  );
};

// used
const UserPieChart = ({
    uploadCount,
  reviewerCount,
  viewerCount,
  isAdminOrDocumentRole
}) => {
  const role = localStorage.getItem("role");
  if (role === "Uploader") return null;

  const data = isAdminOrDocumentRole
    ? [
        { name: "Uploader", value: uploadCount },
        { name: "Reviewer", value: reviewerCount },
        { name: "Viewer", value: viewerCount },
      ]
    : [
        // { name: "Users", value: userCount },
        // { name: "Enquiry", value: enquiryCount },
        // { name: "MSI", value: msiCount },
      ];

  const COLORS = ["#007bff", "#ffc107", "#32a891"];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 13;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={isAdminOrDocumentRole ? x + 9 : x}
        y={isAdminOrDocumentRole ? y + 12 : y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
      >
        {/* {data[index].value} */}
      </text>
    );
  };

  const containerStyle = {
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
     width: "90%", height:"fit-content", position :"relative", maxWidth: "420px",

  };

  const titleStyle = {
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c2e83",
    letterSpacing: "0.5px",
  };

  const legendStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "12px",
    gap: "12px",
  };

  const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: "500",
    color: "#333",
    backgroundColor: "#f9f9f9",
    padding: "6px 10px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
  };

  const legendDotStyle = {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "6px",
    flexShrink: 0,
  };

  const legendTextStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontWeight: "600",
    fontSize: "13px",
    color: "#444",
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>
        {isAdminOrDocumentRole ? "User  Roles" : "Users Insights"}
      </h3>

      <ResponsiveContainer
        width="100%"
        height={isAdminOrDocumentRole ? 90 : 100}
      >
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={40}
            innerRadius={28}
            labelLine={false}
            label={renderCustomizedLabel}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={legendStyle}>
        {data.map((entry, index) => (
          <div key={index} style={legendItemStyle}>
            <div
              style={{ ...legendDotStyle, backgroundColor: COLORS[index] }}
            />
            <span style={{ ...legendTextStyle, color: COLORS[index] }}>
              {entry.name}
              <span style={{ color: COLORS[index], marginLeft: "4px" }}>
                {data[index].value}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// used
const CardAnalytics = ({ DashboardStats = {} }) => {
  console.log('CardAnalytics DashboardStats:', DashboardStats);
  const role = localStorage.getItem("role") || "";
  const isAdminOrDocumentRole = [
    "admin",
    "uploader",
    "approver",
    "reviewer",
    "viewer",
  ].includes(role.toLowerCase());

  let items = [];
  if (isAdminOrDocumentRole) {
    console.log('DashboardStats:', DashboardStats);
    const summary = DashboardStats.document_summary || {};
    const total = parseInt(summary.total_documents || 0);
    const approved = parseInt(summary.approved_count || 0);
    const pending = parseInt(summary.pending_count || 0);
    const rejected = parseInt(summary.rejected_count || 0);

    const percent = (count) =>
      total > 0 ? Math.round((count / total) * 100) : 0;

    items = [
      {
        label: "Total Documents",
        value: total,
        percent: 100,
        color: "#2980b9",
      },
      {
        label: "Approved",
        value: approved,
        percent: percent(approved),
        color: "#43e97b",
      },
      {
        label: "Pending",
        value: pending,
        percent: percent(pending),
        color: "#f7971e",
      },
      {
        label: "Rejected",
        value: rejected,
        percent: percent(rejected),
        color: "#f31432ff",
      },
    ];
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e0e0e0",
        transition: "transform 0.2s ease",
        padding: "10px",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "100%",
        marginTop: "10px",
        marginLeft: "10px",
        fontFamily: "sans-serif",
      }}
    >
      <h2
        style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Documents
      </h2>
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "15px",
              backgroundColor: "#f9f9f9",
              borderRadius: "10px",
              minWidth: "150px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "10px",
              }}
            >
              {item.label}
            </span>
            <div
              style={{
                background: "#e0e0e0",
                height: "8px",
                width: "100px",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${item.percent}%`,
                  backgroundColor: item.color,
                  transition: "width 0.4s ease-in-out",
                }}
              ></div>
            </div>
            <span
              style={{
                backgroundColor: item.color + "22",
                color: item.color,
                fontWeight: "600",
                fontSize: "16px",
                padding: "5px 10px",
                borderRadius: "20px",
              }}
            >
              {item.value} ({item.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};



const AdminDashboard = ({
}) => {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReportYear, setSelectedReportYear] = useState(new Date().getFullYear().toString());
  const [uniqueReportYears, setUniqueReportYears] = useState([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiServices.DashboardView();
        setDashboardData(response);
        console.log('dashboard data', response);

        // Extract unique years from monthly declarations
        if (response.monthlyDeclarations) {
          const years = Object.keys(response.monthlyDeclarations);
          setUniqueReportYears(years);
          if (years.length > 0) setSelectedReportYear(years[years.length - 1]); // Set to latest year
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
        console.error("DashboardView API Error:", err);
        return; // Exit if main dashboard data fails
      }


    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  if (!dashboardData) {
    return <div>No data available</div>;
  }

  console.log('dashboardData.stats:', dashboardData?.stats);

  // Destructure data from API response
  const {
    stats = {},
    monthlyDeclarations = {},
    userCounts = {},
    storageUsage = {}
  } = dashboardData;

  // Prepare data for charts
  const yearlyDeclarationData = monthlyDeclarations;
  
  const monthlyDocumentData = monthlyDeclarations[selectedReportYear] 
    ? Object.entries(monthlyDeclarations[selectedReportYear]).map(([month, value]) => ({
        month,
        fileSizeMB: value.fileSizeMB || 0,
        docCount: value.total_documents || 0
      }))
    : [];


    // Calculate total file size from API data
  const calculateTotalFileSize = (data) => {
    if (!data || !data.document_statistics) return 0;
    
    let totalSize = 0;
    data.document_statistics.forEach(org => {
      org.years.forEach(year => {
        year.monthly_document_counts.forEach(month => {
          // Extract numeric value from "0.01 MB" format
          const sizeValue = parseFloat(month.file_size.split(' ')[0]);
          if (!isNaN(sizeValue)) {
            totalSize += sizeValue;
          }
        });
      });
    });
    return totalSize;
  };

  const totalFileSizeMB = dashboardData ? calculateTotalFileSize(dashboardData) : 0;
  return (
  <>
    {/* Embedded CSS for responsiveness */}
    <style>{`
      .dashboard-container {
        // margin-top: 15vh;
        padding-top: 60px;
        box-sizing: border-box;
        width: 101%;
      }

      /* Desktop: 3-column layout */
      .dashboard-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 20px;
        align-items: start;
      }

      /* Column for Progress + Declaration */
      .dashboard-column {
        display: grid;
        grid-template-rows: auto auto;
        gap: 20px;
      }

      /* Tablet (600px - 899px): 2-column layout */
      @media (max-width: 899px) {
        .dashboard-row {
          grid-template-columns: repeat(2, 1fr);
        }

        .dashboard-column {
          grid-column: span 2; /* Full width on tablet */
        }
      }

      /* Mobile (<600px): Single column layout */
      @media (max-width: 599px) {
        .dashboard-container {
          padding: 10px;
        }

        .dashboard-row {
          grid-template-columns: 1fr;
        }

        .dashboard-column {
          grid-column: span 1;
        }
      }
    `}</style>

    {/* Dashboard Layout */}
    <div className="dashboard-container">
      <div className="dashboard-row">
        {/* style={{marginLeft:"20px"}} */}

         <div className="dashboard-column" >
          <ProgressBarChart
            totalSize={totalFileSizeMB}
            isAdminOrDocumentRole={true}
          />
          <UserPieChart
          uploadCount={dashboardData.uploader_count || 0}
          reviewerCount={dashboardData.reviewer_count || 0}
          viewerCount={dashboardData.viewer_count || 0}
          isAdminOrDocumentRole={true}
        />
        </div>

        <DeclarationDeatilsMonthly />

      </div>
      <CardAnalytics DashboardStats={dashboardData} />
    </div>
  </>
);

};

export default AdminDashboard;

