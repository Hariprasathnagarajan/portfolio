import React, { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaUsers,
  FaFileAlt,
  FaFolderOpen,
  FaBuilding,
  FaArrowUp,
  FaArrowDown,
  FaExclamationCircle,
  FaTimesCircle,
  FaFileExcel
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from "recharts";
import apiServices from "../../ApiServices/ApiServices";
import { ClipLoader } from "react-spinners";

const ProductOwnerDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({});
  const [companyData, setCompanyData] = useState([]);
  const [orgCount, setOrgCount] = useState({});
  const [enquiryData, setEnquiryData] = useState({});
  const [msiData, setMsiData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowLimit, setRowLimit] = useState(15);
  const [sortedData, setSortedData] = useState([]);
  const [storageData, setStorageData] = useState({
    totalSize: 0,
    isLoading: true
  });
  const [groupedData, setGroupedData] = useState([]);
  const [uniqueReportYears, setUniqueReportYears] = useState([]);
  const [selectedReportYear, setSelectedReportYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all data concurrently
        const [
          orgCountData, 
          stats, 
          companyResponse, 
          // groupedResponse, 
          // enquiryResponse, 
          // msiResponse
        ] = await Promise.all([
          apiServices.organizationCountDas(),
          apiServices.DashboardView(),
          apiServices.organizationCount(),
          // apiServices.groupedData(),
          // apiServices.enquiryCount(),
          // apiServices.msiCount()
        ]);

        console.log("Fetched Data:", {
          orgCountData,
          stats,
          companyResponse,
        });
const groupedResponse = []
const enquiryResponse = []
const msiResponse = []
        // Set state for all fetched data
        setOrgCount(orgCountData || {});
        setDashboardStats(stats || {});
        setStorageData({
          totalSize: stats?.total_size_mb || 0,
          isLoading: false
        });
        
        const companies = companyResponse || [];
        setCompanyData(companies);
        setSortedData(companies);
        
        const grouped = groupedResponse?.data || [];
        setGroupedData(grouped);
        
        const years = grouped.length > 0 
          ? [...new Set(grouped.map(item => item.year))] 
          : [new Date().getFullYear().toString()];
        setUniqueReportYears(years);
        if (years.length > 0) {
          setSelectedReportYear(years[years.length - 1]);
        }
        
        setEnquiryData(enquiryResponse || {});
        setMsiData(msiResponse || {});
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(`Failed to load data: ${err.message || 'Unknown error'}. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleOpenModalData = (company) => {
    setModalData(company);
    setIsModalOpen(true);
  };

  const closeModalData = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleRowLimitChange = (e) => {
    const value = e.target.value.trim();
    const parsed = parseInt(value, 10);
    setRowLimit(!isNaN(parsed) && parsed > 0 ? parsed : 1);
  };

  const handleSortAscending = () => {
    const sorted = [...companyData].sort((a, b) => 
      parseFloat(a.total_file_size_without_rejection || 0) - 
      parseFloat(b.total_file_size_without_rejection || 0)
    );
    setSortedData(sorted);
  };

  const handleSortDescending = () => {
    const sorted = [...companyData].sort((a, b) => 
      parseFloat(b.total_file_size_without_rejection || 0) - 
      parseFloat(a.total_file_size_without_rejection || 0)
    );
    setSortedData(sorted);
  };

  const filteredData = (sortedData.length > 0 ? sortedData : companyData).filter((company) =>
    (company.organization_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (company.organization_user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (company.total_file_size_without_rejection?.toString().toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Prepare data for file size trends chart
  const prepareChartData = () => {
    if (!selectedReportYear) return [];
    
    const yearData = groupedData.filter(item => item.year === selectedReportYear);
    if (yearData.length === 0) return [];
    
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    return months.map(month => {
      const monthData = yearData.find(item => item.month === month);
      return {
        month,
        total_documents: monthData?.total_documents || 0,
        total_file_size: monthData?.total_file_size || 0
      };
    });
  };

  const chartData = prepareChartData();

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px"
      }}>
        <ClipLoader size={60} color="#4285F4" />
        <p style={{ fontSize: "18px", color: "#555" }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
        textAlign: "center",
        padding: "20px"
      }}>
        <FaExclamationCircle size={60} color="#EA4335" />
        <h2 style={{ fontSize: "24px", color: "#EA4335" }}>{error}</h2>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="dashboard-container" 
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}
    >
      {/* Welcome Title */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#2c3e50" }}>
          Welcome, {username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()}
        </h2>
        <hr style={{
          border: "none",
          borderTop: "2px solid #e0e0e0",
          margin: "20px 0"
        }}/>
      </div>

      {/* Main Content Area - Two Columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
        alignItems: "flex-start"
      }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* File Size Trends */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "15px"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#2c3e50", margin: 0 }}>
                Company Trends
              </h3>
              
              {uniqueReportYears.length > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <label style={{ fontSize: "14px", color: "#555" }}>Year:</label>
                  <select
                    value={selectedReportYear}
                    onChange={(e) => setSelectedReportYear(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      backgroundColor: "#f8f9fa",
                      fontSize: "14px",
                      minWidth: "120px"
                    }}
                  >
                    {uniqueReportYears.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div style={{ height: "300px", minWidth: "300px" }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <XAxis dataKey="month" />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => `${value} MB`}
                      domain={[0, (dataMax) => Math.ceil((dataMax || 0) * 1.2)]}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[0, (dataMax) => Math.ceil((dataMax || 0) * 1.2)]}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'total_file_size') return [`${value} MB`, 'File Size'];
                        return [value, 'Documents'];
                      }}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ 
                        borderRadius: "8px", 
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        border: "none"
                      }}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="total_file_size" 
                      name="File Size" 
                      fill="#2c2e83" 
                      barSize={20} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="total_documents" 
                      name="Documents" 
                      stroke="#ff7300" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#6c757d"
                }}>
                  No data available for selected year
                </div>
              )}
            </div>
          </div>

          {/* Company Table */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "15px",
            }}>
              <h3 style={{ 
                fontSize: "20px", 
                fontWeight: "600", 
                color: "#2c3e50", 
                margin: 0,
              }}>
                Companies
              </h3>
              
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap",
                gap: "10px", 
                alignItems: "center",
              }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={handleSortAscending} 
                    title="Sort Ascending" 
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: "#e2e8f0",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaArrowUp />
                  </button>
                  <button 
                    onClick={handleSortDescending} 
                    title="Sort Descending" 
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: "#e2e8f0",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaArrowDown />
                  </button>
                </div>
                
                <input 
                  type="number" 
                  value={rowLimit} 
                  min="1" 
                  placeholder="Rows" 
                  onChange={handleRowLimitChange} 
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    width: "80px",
                    fontSize: "14px"
                  }} 
                />
                
                <input 
                  type="text" 
                  placeholder="Search company..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    minWidth: "200px",
                    fontSize: "14px"
                  }} 
                />
              </div>
            </div>

            {/* Scrollable Company List */}
            <div style={{ 
              maxHeight: "400px", 
              overflowY: "auto", 
              paddingRight: "10px",
            }}>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(0, rowLimit === 0 ? filteredData.length : rowLimit)
                  .map((company, index) => (
                    <div
                      key={index}
                      onClick={() => handleOpenModalData(company)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px",
                        marginBottom: "10px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        flexWrap: "wrap",
                        ":hover": {
                          backgroundColor: "#e9ecef",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                        }
                      }}
                    >
                      <div style={{ minWidth: "250px" }}>
                        <div style={{ 
                          fontWeight: "600", 
                          fontSize: "16px", 
                          display: "flex", 
                          alignItems: "center",
                          marginBottom: "5px"
                        }}>
                          <FaBuilding style={{ marginRight: "10px", color: "#6c757d" }} />
                          {company.organization_name || "N/A"}
                        </div>
                        <div style={{ 
                          fontSize: "14px", 
                          color: "#6c757d", 
                          display: "flex", 
                          alignItems: "center"
                        }}>
                          <FaUser style={{ marginRight: "8px" }} />
                          {company.organization_user || "N/A"}
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        fontSize: "14px",
                        color: "#495057",
                        flexWrap: "wrap"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center",
                          minWidth: "120px"
                        }}>
                          <FaFileAlt style={{ marginRight: "6px" }} />
                          {company.total_files_without_rejection || 0} Docs
                        </div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center",
                          minWidth: "120px"
                        }}>
                          <FaFolderOpen style={{ marginRight: "6px" }} />
                          {company.total_file_size_without_rejection || 0} MB
                        </div>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center",
                          minWidth: "120px"
                        }}>
                          <FaUsers style={{ marginRight: "6px" }} />
                          {company.total_employees || 0} Users
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div style={{ 
                  textAlign: "center", 
                  padding: "30px", 
                  color: "#6c757d",
                }}>
                  No companies found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Company Count Card */}
          <CardAnalytics 
            OrgCount={{
              totalCompanies: orgCount?.total_organizations || 0,
              activeCompanies: orgCount?.activeCompanies || 0,
              inactiveCompanies: orgCount?.inactiveCompanies || 0,
              deleted_org_count: orgCount?.deletedCompanies || 0,
            }} 
          />
          
          {/* Storage Usage Card */}
          <ProgressBarChart 
            totalSize={storageData.totalSize}
            isLoading={storageData.isLoading}
          />
          
          {/* User Insights Card */}
          <UserPieChart
            userCount={orgCount?.user_count || 0}
            enquiryCount={enquiryData?.enquiry_count || 0} 
            msiCount={msiData?.msi_count || 0}    
          />
        </div>
      </div>

      {/* Modal View */}
      {isModalOpen && modalData && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#ffffff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 1000,
            minWidth: "300px",
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid #e0e0e0"
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ 
              fontSize: "22px", 
              fontWeight: "600", 
              color: "#2c3e50",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <FaBuilding style={{ color: "#4285F4" }} />
              {modalData.organization_name || "N/A"}
            </h3>
            <button 
              onClick={closeModalData}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#6c757d"
              }}
            >
              &times;
            </button>
          </div>
          
          <div style={{ marginBottom: "25px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "12px",
              fontSize: "16px",
              flexWrap: "wrap"
            }}>
              <FaUser style={{ marginRight: "10px", color: "#6c757d", minWidth: "20px" }} />
              <strong style={{ minWidth: "120px" }}>Username:</strong>
              <span>{modalData.organization_user || "N/A"}</span>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "12px",
              fontSize: "16px",
              flexWrap: "wrap"
            }}>
              <FaFileAlt style={{ marginRight: "10px", color: "#6c757d", minWidth: "20px" }} />
              <strong style={{ minWidth: "120px" }}>Documents:</strong>
              <span>{modalData.total_files_without_rejection || 0}</span>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "12px",
              fontSize: "16px",
              flexWrap: "wrap"
            }}>
              <FaFolderOpen style={{ marginRight: "10px", color: "#6c757d", minWidth: "20px" }} />
              <strong style={{ minWidth: "120px" }}>Size:</strong>
              <span>{modalData.total_file_size_without_rejection || 0} MB</span>
            </div>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "12px",
              fontSize: "16px",
              flexWrap: "wrap"
            }}>
              <FaUsers style={{ marginRight: "10px", color: "#6c757d", minWidth: "20px" }} />
              <strong style={{ minWidth: "120px" }}>Employees:</strong>
              <span>{modalData.total_employees || 0}</span>
            </div>
          </div>
          
          <button
            onClick={closeModalData}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4285F4",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              width: "100%",
              transition: "background-color 0.2s",
              ":hover": {
                backgroundColor: "#3367D6"
              }
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const CardAnalytics = ({ OrgCount }) => {
  const cards = [
    { 
      label: "Total Companies", 
      value: OrgCount?.totalCompanies || 0, 
      percent: 100, 
      color: "#4285F4",
      icon: <FaBuilding size={20} />
    },
    { 
      label: "Active Companies", 
      value: OrgCount?.activeCompanies || 0, 
      percent: 70, 
      color: "#00C851",
      icon: <FaExclamationCircle size={20} />
    },
    { 
      label: "Inactive Companies", 
      value: OrgCount?.inactiveCompanies || 0, 
      percent: 40, 
      color: "#aa66cc",
      icon: <FaTimesCircle size={20} />
    },
    { 
      label: "Deleted Companies", 
      value: OrgCount?.deleted_org_count || 0, 
      percent: 25, 
      color: "#ff4444",
      icon: <FaFileExcel size={20} />
    },
  ];

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      <h2 style={{ 
        marginBottom: "20px", 
        fontSize: "20px", 
        fontWeight: "600",
        color: "#2c3e50"
      }}>
        Company Statistics
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {cards.map((item, idx) => (
          <div key={idx} style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "12px 15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px"
          }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "10px", 
              backgroundColor: `${item.color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "15px"
            }}>
              {item.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: "16px", 
                fontWeight: "500",
                marginBottom: "5px"
              }}>
                {item.label}
              </div>
              <div style={{ 
                height: "6px", 
                backgroundColor: "#e9ecef", 
                borderRadius: "10px",
                overflow: "hidden"
              }}>
                <div style={{ 
                  width: `${item.percent}%`, 
                  height: "100%", 
                  backgroundColor: item.color,
                  borderRadius: "10px"
                }} />
              </div>
            </div>
            
            <div style={{ 
              minWidth: "50px", 
              textAlign: "right", 
              fontSize: "18px", 
              fontWeight: "600",
              color: item.color
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserPieChart = ({
  userCount,
  enquiryCount,
  msiCount,
}) => {
  const data = [
    { name: "Users", value: userCount || 0 },
    { name: "Enquiry", value: enquiryCount || 0 },
    { name: "MSI", value: msiCount || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ["#4285F4", "#FFC107", "#33B679"];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }) => {
    if (percent < 0.1) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ 
        marginBottom: "20px", 
        fontSize: "20px", 
        fontWeight: "600",
        color: "#2c3e50"
      }}>
        User Insights
      </h3>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
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
            
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              flexWrap: "wrap",
              gap: "15px",
              marginTop: "20px"
            }}>
              {data.map((entry, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "20px"
                }}>
                  <div style={{ 
                    width: "12px", 
                    height: "12px", 
                    borderRadius: "50%", 
                    backgroundColor: COLORS[index],
                    marginRight: "8px"
                  }} />
                  <div>
                    <div style={{ fontWeight: "500" }}>{entry.name}</div>
                    <div style={{ fontWeight: "600", color: COLORS[index] }}>
                      {entry.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#6c757d",
            textAlign: "center",
            padding: "20px"
          }}>
            No user data available
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressBarChart = ({ 
  totalSize,
  isLoading
}) => {
  const maxSize = 1000; // Max storage in MB
  const percentage = Math.min((totalSize / maxSize) * 100, 100);
  const formattedSize = totalSize.toFixed(2);
  
  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <h3 style={{ 
        marginBottom: "20px", 
        fontSize: "20px", 
        fontWeight: "600",
        color: "#2c3e50"
      }}>
        Storage Usage
      </h3>
      
      {isLoading ? (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          flex: 1,
          color: "#6c757d"
        }}>
          <ClipLoader size={30} color="#4285F4" />
        </div>
      ) : (
        <>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px"
          }}>
            <div style={{ fontSize: "16px", fontWeight: "500" }}>
              {formattedSize} MB
            </div>
            <div style={{ fontSize: "16px", color: "#6c757d" }}>
              {maxSize} MB
            </div>
          </div>
          
          <div style={{ 
            height: "12px", 
            backgroundColor: "#e9ecef", 
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "15px"
          }}>
            <div style={{ 
              width: `${percentage}%`, 
              height: "100%", 
              background: "linear-gradient(90deg, #4285F4, #34A853)",
              borderRadius: "10px",
              transition: "width 0.5s ease"
            }} />
          </div>
          
          <div style={{ 
            textAlign: "center", 
            fontSize: "24px", 
            fontWeight: "600",
            color: percentage > 80 ? "#EA4335" : "#4285F4",
            marginTop: "10px"
          }}>
            {percentage.toFixed(1)}%
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
            gap: "15px",
            marginTop: "20px"
          }}>
            <div style={{ 
              textAlign: "center", 
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px"
            }}>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>Used</div>
              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {formattedSize} MB
              </div>
            </div>
            <div style={{ 
              textAlign: "center", 
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px"
            }}>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>Available</div>
              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {(maxSize - totalSize).toFixed(2)} MB
              </div>
            </div>
            <div style={{ 
              textAlign: "center", 
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px"
            }}>
              <div style={{ fontSize: "14px", color: "#6c757d" }}>Total</div>
              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {maxSize} MB
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductOwnerDashboard; 