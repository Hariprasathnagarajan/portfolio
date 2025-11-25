  //D:\VDart dms project\DMS-Backend\app\urls.py (API)


// dashboard-container
// company-section
// company-card

import React, { useState, useEffect, useRef } from "react";
import  { useMemo } from 'react';

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";


import {
  AreaChart,
  Area,
  Bar,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
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
import { DarkModeSharp } from "@mui/icons-material";
import LoaderComponent from "../LoaderComponent";
const ProductOwnerDashboard = () => {

  const [isLoading, setIsLoading] = useState(true);
  // State management
 const [dashboardStats, setDashboardStats] = useState({});
  const [companyData, setCompanyData] = useState([]);
  const [orgCount, setOrgCount] = useState({});
  const [monthlyChartData, setMonthlyChartData] = useState([]); // FIXED: renamed state
  // const [enquiryData, setEnquiryData] = useState({});
  // const [msiData, setMsiData] = useState({});
  const [dummyData, setDummyData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

 /// User info
  const username = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");
  const isAdminOrDocumentRole = ["Admin", "Uploader", "Approver", "Reviewer", "Viewer"].includes(role);
  const isAdmin = role === "Admin";
  const isUploader = role === "Uploader";
  const isReviewer = role === "Reviewer";
  const isViewer = role === "Viewer";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch all data in parallel
        const [stats, orgCountData] = await Promise.all([
          apiServices.DashboardView(), //apicall
          apiServices.organizationCountDas(), //apicall
        ]);

        // Set main data states
        setDashboardStats(stats);
        console.log("setDashboardStats : ", stats);
        setOrgCount(orgCountData);
        console.log("setOrgCount : ", orgCountData);
        // Inside fetchDashboardData
setCompanyData(Array.isArray(stats.organizations) ? stats.organizations : []);


      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      finally {
        setIsLoading(false); // Hide loader
      }

    };
     const convertFileSizeToMB = (sizeString) => {
      if (!sizeString) return 0;
      const [value, unit] = sizeString.split(" ");
      const size = parseFloat(value);
      if (unit === "GB") return size * 1024;
      if (unit === "KB") return size / 1024;
      return size;
    };


    fetchDashboardData();
  }, [role, isAdminOrDocumentRole]);


  const totalStorageMB = useMemo(() => {
  if (!companyData || companyData.length === 0) return 0;
  
  return companyData.reduce((total, company) => {
    return total + convertFileSizeToMB(company.total_file_size_without_rejection);
  }, 0);
}, [companyData]);
  
  // Handlers
  const handleOpenModalData = (company) => {
    setModalData(company);
    setIsModalOpen(true);
  };
    const closeModalData = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

 
 return (
  <div style={{marginTop:"3%"}}>
    {isLoading ? (
      <LoaderComponent />
    ) : (

          <>
          <div className="dashboard-container" style={{
      padding: "5px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    }}>
       {/* Loading overlay */}
      {/* {isLoading && <LoaderComponent /> } */}
      {/* Welcome Title */}
      {/* <div>
        <h2 style={{
          position: "relative",
          top: "100px",
          marginLeft: "-1000px",
        }}>
          Welcome, {username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()}
        </h2>
        <hr style={{
          marginTop: "120px",
          marginBottom: "-90px",
          border: "none",
          borderTop: "2px solid #e0e0e0",
          width: "93%",
          marginLeft: "auto",
          marginRight: "auto",
        }}/>
      </div> */}

      {/* Top Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gap: "20px",
        alignItems: "start",
      }}>
        {/* Company Count */}
        <CardAnalytics 
          OrgCount={{
            totalCompanies: dashboardStats?.total_organizations || 0,
            activeCompanies: dashboardStats?.active_org_count || 0,
            inactiveCompanies: dashboardStats?.inactive_org_count || 0,
            deleted_org_count: dashboardStats?.deleted_org_count || 0,
            user_count: dashboardStats?.user_count || 0
          }} 
        />
        {/* In ProductOwnerDashboard.js - Conditionally render UserPieChart */}
        {role !== "Uploader" && (
          <UserPieChart
            isAdminOrDocumentRole={isAdminOrDocumentRole}
            dashboardStats={dashboardStats}
          />
        )}
        <ProgressBarChart totalSize={totalStorageMB} />

      </div>

      {/* Bottom Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
      }}>
        <div className="company-section">
           <CompanyTable
          companyData={dashboardStats.organizations}
          declarationId={dashboardStats.declaration_counts}
          handleOpenModalData={handleOpenModalData}
          modalData={modalData}
          closeModalData={closeModalData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dummyData={dummyData}
          isAdminOrDocumentRole={isAdminOrDocumentRole}
          isAdmin={isAdmin}
          isUploader={isUploader}
        />
        </div>


{/* Document Trend by File Size */}
        <FileSizeTrendsChart documentStatistics={dashboardStats.document_statistics}  />


      </div>
    </div>
          </>
    )}
  </div>

    
  );
};

const convertFileSizeToMB = (sizeString) => {
  if (!sizeString) return 0;
  const [value, unit] = sizeString.split(" ");
  const size = parseFloat(value);
  if (unit === "GB") return size * 1024;
  if (unit === "KB") return size / 1024;
  return size;
};


const CompanyTable = ({
  companyData, 
  declarationId,
  handleOpenModalData, 
  modalData, 
  closeModalData,
  searchTerm,
  setSearchTerm
}) => {
  const [sortedData, setSortedData] = useState([]);
  const [rowLimit, setRowLimit] = useState(15);
  const modalRef = useRef();

useEffect(() => {
  setSortedData(Array.isArray(companyData) ? [...companyData] : []);
}, [companyData]);


  // Event handlers
  const handleSort = (ascending = true) => {
    const sorted = [...companyData].sort((a, b) => 
      ascending 
        ? parseFloat(a.doc_size || 0) - parseFloat(b.doc_size || 0)
        : parseFloat(b.doc_size || 0) - parseFloat(a.doc_size || 0)
    );
    setSortedData(sorted);
  };

  const handleRowLimitChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setRowLimit(value);
  };

  // Filter data
  const filteredData = sortedData.filter(company => 
    (company.organization_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (company.organization_user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (company.total_file_size_without_rejection?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",

        width: "65vw",
        padding: "20px",
        height:"57vh",
        margin: "10px auto",
        borderRadius: "12px",
        marginLeft:"20px"
      }}
    >
      {/* Controls Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => handleSort(true)} title="Sort Ascending"><FaArrowUp /></button>
          <button onClick={() => handleSort(false)} title="Sort Descending"><FaArrowDown /></button>
        </div> */}
        <input type="number" value={rowLimit} min="1" placeholder="Rows" onChange={handleRowLimitChange} style={inputStyle} />
        <input type="text" placeholder="Search company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, width: "180px" }} />
      </div>

      {/* Scrollable Company List */}
      <div style={{ maxHeight: "90%", overflowY: "auto", paddingRight: "5px"}}>
        {false ? (
          <p>Loading...</p>
        ) : filteredData.length > 0 ? (
          filteredData.slice(0, rowLimit === 0 ? filteredData.length : rowLimit)
            .map((company, index) => (
              <div
                key={index}
                onClick={() => handleOpenModalData(company)}
                className="company-card"
                style={cardStyle}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center" }}>
                    <FaBuilding style={{ marginRight: "6px", fontSize: "12px", color: "#333" }} />
                    {company.organization_name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#777", marginTop: "2px" }}>
                    <FaUser style={{ marginRight: "5px" }} />
                    {company.organization_user}
                  </div>
                </div>

                <div style={statsContainerStyle}>
                  <div><FaFileAlt style={iconMargin} />{company.total_files_without_rejection} Docs</div>
                  <div><FaFolderOpen style={iconMargin} />{company.total_file_size_without_rejection} MB</div>
                  <div><FaUsers style={iconMargin} />{company.total_employees} Users</div>
                </div>
              </div>
            ))
        ) : (
          <p style={{ color: "red", textAlign: "center" }}>No data found</p>
        )}
      </div>

      {/* Modal View */}
      {modalData && (
        <div
          ref={modalRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.2)",
            zIndex: 1000,
            minWidth: "320px",
          }}
        >

          {/* get_organization_details_by_id */}
          {/* company table modal */}
          <h3>{modalData.organization_name}</h3>
          <p><strong>👤 Username:</strong> {modalData.organization_user}</p>
          <p><strong>📑 Declarations:</strong> {declarationId[modalData.organization_id] ?? 0}</p>
          <p><strong>📑 Documents:</strong> {modalData.total_files_all}</p>
          <p><strong>📁 Size:</strong> {modalData.total_file_size_all}</p>
          <p><strong>👥 Employees:</strong> {modalData.total_employees}</p>
          <button
            onClick={closeModalData}
            style={{
              marginTop: "20px",
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};


// 🔧 Reusable styles
const buttonStyle = {
  padding: "6px",
  borderRadius: "6px",
  backgroundColor: "#e2e8f0",
  border: "none",
  cursor: "pointer",
};

const inputStyle = {
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "80px",
  fontSize: "12px",
};

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 12px",
  marginBottom: "6px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
};

const statsContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  fontSize: "11px",
  color: "#555",
};

const iconMargin = { marginRight: "4px" };


const FileSizeTrendsChart = ({ documentStatistics = [] }) => {
  // State variables for chart data
  const [dashboardData, setDashboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
useEffect(() => {
    const processDocumentStatistics = () => {
        try {
            setIsLoading(true);
            const response = documentStatistics;
            
            const monthMap = {
                January: "Jan", February: "Feb", March: "Mar", April: "Apr",
                May: "May", June: "Jun", July: "Jul", August: "Aug",
                September: "Sep", October: "Oct", November: "Nov", December: "Dec"
            };

            const allMonths = Object.values(monthMap);

            const convertFileSizeToMB = (sizeString) => {
                if (!sizeString) return 0;
                const [value, unit] = sizeString.split(" ");
                const size = parseFloat(value);
                if (unit === "GB") return size * 1024;
                if (unit === "KB") return size / 1024;
                return size;
            };

            // Aggregate monthly data across all orgs/years
            const monthAggregator = {};
            
            response.forEach(org => {
                org.years.forEach(year => {
                    year.monthly_document_counts.forEach(entry => {
                        const shortMonth = monthMap[entry.month];
                        if (!monthAggregator[shortMonth]) {
                            monthAggregator[shortMonth] = {
                                month: shortMonth,
                                docCount: 0,
                                fileSizeMB: 0
                            };
                        }
                        monthAggregator[shortMonth].docCount += entry.document_count;
                        monthAggregator[shortMonth].fileSizeMB += convertFileSizeToMB(entry.file_size);
                    });
                });
            });

            // Ensure all 12 months are included
            const chartData = allMonths.map(month => ({
                month,
                docCount: monthAggregator[month]?.docCount || 0,
                fileSizeMB: monthAggregator[month]?.fileSizeMB || 0
            }));

            setDashboardData(chartData);
        } catch (err) {
            console.error("Failed to process data", err);
            setError("Failed to process chart data");
        } finally {
            setIsLoading(false);
        }
    };

    if (documentStatistics && documentStatistics.length > 0) {
        processDocumentStatistics();
    } else {
        setIsLoading(false);
        setDashboardData([]);
    }
}, [documentStatistics]);

  // Prepare chart data with all months
  const mergedData = useMemo(() => {
    const defaultMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return defaultMonths.map((month) => {
      const found = dashboardData.find((d) => d.month === month);
      return {
        month,
        docCount: found?.docCount || 0,
        fileSizeMB: found?.fileSizeMB || 0,
      };
    });
  }, [dashboardData]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center",
        color: "#666",
        fontStyle: "italic"
      }}>
        Loading document trends...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center",
        color: "#ff4444",
        fontWeight: "bold"
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
      padding: "20px",
      borderRadius: "16px",
      height:"57vh",
      margin: "10px auto",
      width: "28vw",
    }}>
      <h3 style={{
        fontSize: "20px",
        fontWeight: 600,
        color: "#2c3e50",
        marginBottom: "16px"
      }}>
        📊 Document Trend by File Size
      </h3>
{/* sssdsd */}
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={mergedData}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: "bold" }} />
          <YAxis
            yAxisId="left"
            label={{ value: "Docs", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 12 }}
            width={50}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "MB", angle: -90, position: "insideRight" }}
            tick={{ fontSize: 12 }}
            width={50}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "fileSizeMB" 
                ? [`${parseFloat(value).toFixed(2)} MB`, "Size"] 
                : [value, "Docs"]
            }
          />
          <Bar
            yAxisId="left"
            dataKey="docCount"
            barSize={20}
            fill="#2c2e83"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="fileSizeMB"
            stroke="#ff7300"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};


const ProgressBarChart = ({ totalSize = 0 }) => {
  // const maxStorage = 5000; // MB
  // const percentage = Math.min((totalSize / maxStorage) * 100, 100);
    const maxStorage = 5000; // MB
  const percentage = Math.min((totalSize / maxStorage) * 100, 100);
  const displaySize = totalSize.toFixed(3);

   // Format display size appropriately
  const formatSize = (size) => {
    if (size >= 1024) return `${(size / 1024).toFixed(3)} GB`;
    return `${size.toFixed(3)} MB`;
  };


  // Role-based styling
  const role = localStorage.getItem("role")?.toLowerCase();
  const roleStyles = {
    default: { border: "2px solid #ccc" },
    admin: { border: "2px solid #004080" },
    uploader: { border: "2px dashed #28a745" },
    reviewer: { border: "2px solid #9932cc" },
    viewer: { border: "2px solid #ff8c00" },
    product_owner: { 
      border: "2px solid #00bcd4",
      backgroundColor: "#f0fbfc",
      boxShadow: "0 6px 18px rgba(0, 188, 212, 0.2)"
    },
  };

  const wrapperStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "all 0.3s ease-in-out",
    padding: "16px 20px",
    borderRadius: "14px",
    // minWidth: "360px",
    // maxWidth: "420px",
    width:"20vw",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "100px",
    marginLeft: "-30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    ...(roleStyles[role] || roleStyles.default),
  };

  return (
    <div style={wrapperStyle}>
      <h3 style={{
        textAlign: "center",
        fontSize: "17px",
        fontWeight: "700",
        color: "#007bff",
        margin: "0",
      }}>Storage Usage</h3>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
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
        }}>
          {displaySize}
        </div>

        <div style={{
          flex: 1,
          height: "12px",
          backgroundColor: "#e6e6e6",
          borderRadius: "50px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            borderRadius: "50px",
            transition: "width 0.4s ease-in-out",
            background: "linear-gradient(to right, #007bff, #00d4ff)",
            width: `${percentage}%`,
          }} />
        </div>
      </div>

      <div style={{
        textAlign: "center",
        fontSize: "13px",
        color: "#333",
        fontWeight: "500",
        marginTop: "-6px",
      }}>
        {percentage.toFixed(3)}% Used
      </div>
    </div>
  );
};

const UserPieChart = ({
  dashboardStats,
  isAdminOrDocumentRole
}) => {
  const role = localStorage.getItem("role");
  // if (role === "Uploader") return null; // Changed from "UPLOADER" to "Uploader"

  const data = useMemo(() => {
  if (isAdminOrDocumentRole) {
    return [
      { name: "Uploader", value: dashboardStats?.uploader_count || 0 },
      { name: "Reviewer", value: dashboardStats?.reviewer_count || 0 },
      { name: "Viewer", value: dashboardStats?.viewer_count || 0 }
    ];
  }
  return [
    { name: "Users", value: dashboardStats?.user_count || 0 },
    { name: "Enquiry", value: dashboardStats?.enquiry_total || 0 },
    { name: "MSA", value: dashboardStats?.msi_count || 0 }
  ];
}, [isAdminOrDocumentRole, dashboardStats]);
  

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

  // Using the container style from the old code
  const containerStyle = {
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    width: "15vw",
    height: "63%",
    // maxWidth: "240px",
    textAlign: "center",
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
    marginLeft: "-20px",
    marginTop: "95px",
  };

  // Using the title style from the old code
  const titleStyle = {
    marginBottom: "12px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c2e83",
    letterSpacing: "0.5px",
  };

  // Using the legend styles from the old code
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
        {isAdminOrDocumentRole ? "User Roles" : "Users Insights"}
      </h3>

      <ResponsiveContainer width="100%" height={isAdminOrDocumentRole ? 90 : 100}>
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
            <div style={{ ...legendDotStyle, backgroundColor: COLORS[index] }} />
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
const CardAnalytics = ({ OrgCount }) => {


  // Determine which cards to display based on role
  const getCards = () => {
    
      return [
        { label: "Total Companies", value: OrgCount?.totalCompanies || 0, percent: 100, color: "#4285F4" },
        { label: "Active Companies", value: OrgCount?.activeCompanies || 0, percent: 70, color: "#00C851" },
        { label: "Inactive Companies", value: OrgCount?.inactiveCompanies || 0, percent: 40, color: "#aa66cc" },
        { label: "Deleted Companies", value: OrgCount?.deleted_org_count || 0, percent: 25, color: "#ff4444" },
      ];
  };

  const cards = getCards();

  const containerStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
    
    borderRadius: "12px",
    padding: "20px",
    width: "35vw",
    height: "63%",
    margin: "90px auto 0",
    fontFamily: "sans-serif",
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: "1px solid #f0f0f0",
  };

  const progressBarContainer = {
    background: "#e0e0e0",
    borderRadius: "8px",
    width: "150px",
    height: "8px",
    marginRight: "10px",
  };

  const progressBar = (percent, color) => ({
    width: `${percent}%`,
    height: "100%",
    backgroundColor: color,
    borderRadius: "8px",
  });

  const badgeStyle = (color) => ({
    backgroundColor: color + "22",
    color: color,
    fontWeight: "600",
    fontSize: "12px",
    padding: "5px 10px",
    borderRadius: "20px",
  });

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
          Company Count
      </h2>
      {cards.map((item, idx) => (
        <div key={idx} style={rowStyle}>
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {/* <span style={{ width: "30px", fontWeight: "bold" }}>
              {String(idx + 1).padStart(2, "0")}
            </span> */}
            <span style={{ flex: 1 }}>{item.label}</span>
            <div style={progressBarContainer}>
              <div style={progressBar(item.percent, item.color)}></div>
            </div>
          </div>
          <span style={badgeStyle(item.color)}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default ProductOwnerDashboard;

