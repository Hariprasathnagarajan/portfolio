// done
import React, { useState, useEffect } from "react";
import {
  GrDocument,
  GrDocumentVerified,
  GrDocumentTime,
  GrDocumentExcel,
} from "react-icons/gr";
import {
  FaUsers,
  FaFileAlt,
  FaFolderOpen,
} from "react-icons/fa";
import authService from "../../ApiServices/ApiServices";




import { LineChart, Line, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend } from 'recharts';
// import {  } from 'recharts';
const dataLineChart = [
  { name: '2025-08-01', uv: 400 },
  { name: '2025-08-02', uv: 300 },
  { name: '2025-08-03', uv: 500 },
  { name: '2025-08-04', uv: 450 },
  { name: '2025-08-05', uv: 350 },
  { name: '2025-08-06', uv: 600 },
  { name: '2025-08-07', uv: 200 },
  { name: '2025-08-08', uv: 550 },
  { name: '2025-08-09', uv: 380 },
  { name: '2025-08-10', uv: 420 },
];

const dataMeterChart = [
  {
    name: 'Progress',
    value: 50, // percentage
    fill: 'rgb(0, 123, 255)', // progress color
  },
];
const meterchartValue = 50
const angle = (180 * (100 - meterchartValue)) / 100;




const ViewerDashboard = ({ client, totalFileSizeMB }) => {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("name") || "User";

  const [dashboardStats, setDashboardStats] = useState({});
  const [orgCount, setOrgCount] = useState({});
  const [companyData, setCompanyData] = useState([]);
  const [dummyData, setDummyData] = useState([]); // For declaration data

  // Fetch dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await authService.DashboardViewUploader();
        setDashboardStats(stats || {});
        console.log("✅ authService.DashboardViewUploader():", stats);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch organization details and declaration summary for Viewer
  useEffect(() => {
    const fetchViewerData = async () => {
      try {
        const details = await authService.details();
        const orgId = details?.details?.[1]?.id;

        if (orgId) {
          // Fetch organization details
          const orgResponse = await authService.organizationIdDetails(orgId);
          const summary = orgResponse?.summary?.sub || [];
          setCompanyData(summary);
          
          // Fetch declaration data
          const declarationResponse = await authService.organizationIdDetails(orgId);
          setDummyData(declarationResponse?.summary?.sub || []);
          
          console.log("✅ Viewer data:", {
            companyData: summary,
            declarationData: declarationResponse?.summary?.sub
          });
        }
      } catch (error) {
        console.error("❌ Error fetching viewer data:", error);
      }
    };

    if (role === "Viewer") {
      fetchViewerData();
    }
  }, [role]);

  // CardAnalytics content
  const analyticsItems = [
    {
      label: "Total Documents",
      value: dashboardStats?.document_count || 0,
      icon: <GrDocument />,
    },
    {
      label: "Approved",
      value: dashboardStats?.approved_count || 0,
      icon: <GrDocumentVerified color="#16a34a" />,
    },
    {
      label: "Pending",
      value: dashboardStats?.pending_count || 0,
      icon: <GrDocumentTime color="#f59e0b" />,
    },
    {
      label: "Rejected",
      value: dashboardStats?.rejected_count || 0,
      icon: <GrDocumentExcel color="#ef4444" />,
    },
  ];

  // Storage usage chart
  const ProgressBarChart = () => {
    // const max = 504;
    // const used = typeof client === "number" && !isNaN(client) ? client : 0;
    // const percentage = Math.min((used / max) * 100, 100).toFixed(2);
    // const fullLabel = `${used.toFixed(2)} MB`;

    // Get storage data from API response
    const usedMB = dashboardStats.storage_usage?.used_mb || 0;
    const max = 504; // Max storage in MB
    
    // Calculate percentage safely
    const percentage = Math.min((usedMB / max) * 100, 100).toFixed(2);
    const fullLabel = `${usedMB.toFixed(2)} MB`;

    return (
      <div style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
    
        borderRadius: "16px",
        padding: "24px",
        flex: 1,
        minWidth: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <h3 style={{
          fontSize: "20px",
          marginTop: "-30px",
          color: "#0f172a",
          fontWeight: "700",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "15px"
        }}>
          Storage Usage
        </h3>

        <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            background: "#007bff",
            color: "white",
            padding: "10px 16px",
            borderRadius: "9999px",
            fontWeight: "bold",
            fontSize: "14px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}>
            {fullLabel}
          </div>

          <div style={{
            flex: 1,
            background: "#e5e7eb",
            borderRadius: "9999px",
            height: "14px",
            overflow: "hidden",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
          }}>
            <div style={{
              width: `${percentage}%`,
              height: "100%",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #007bff, #00d4ff)",
              transition: "width 0.6s ease-in-out"
            }}></div>
          </div>
        </div>

        <div style={{
          textAlign: "right",
          fontSize: "13px",
          color: "#64748b",
          fontWeight: "500"
        }}>
          {percentage}% Used
        </div>
      </div>
    );
  };

  const CardAnalytics = () => {
    const isAdminOrDocumentRole = [
      "Admin",
      "Uploader",
      "Approver",
      "Reviewer",
      "Viewer",
    ].includes(role);

    const isCompanyRole = !isAdminOrDocumentRole;

    const getItems = () => {
      if (role === "Admin") {
        return [
          { label: "Declarations", value: dashboardStats.dec_count || 0, percent: 90, color: "#0072ff" },
          { label: "Documents", value: dashboardStats.document_count || 0, percent: 65, color: "#9D50BB" },
          { label: "Approved", value: dashboardStats.approved_count || 0, percent: 80, color: "#56ab2f" },
          { label: "Pending", value: dashboardStats.pending_count || 0, percent: 50, color: "#f7971e" },
          { label: "Rejected", value: dashboardStats.rejected_count || 0, percent: 30, color: "#e53935" },
        ];
      }

      if (isAdminOrDocumentRole) {
        return [
          { label: "Total Documents", value: dashboardStats.document_summary?.total_documents || 0, percent: 70, color: "#2980b9" },
          { label: "Approved", value: dashboardStats.document_summary?.approved_count || 0, percent: 60, color: "#43e97b" },
          { label: "Pending", value: dashboardStats.document_summary?.pending_count || 0, percent: 35, color: "#f7971e" },
          { label: "Rejected", value: dashboardStats.document_summary?.rejected_count || 0, percent: 25, color: "#f953c6" },
        ];
      }

      return [
        { label: "Total Companies", value: orgCount.totalCompanies || 0, percent: 100, color: "#4285F4" },
        { label: "Active Companies", value: orgCount.activeCompanies || 0, percent: 70, color: "#00C851" },
        { label: "Inactive Companies", value: orgCount.inactiveCompanies || 0, percent: 40, color: "#aa66cc" },
        { label: "Deleted Companies", value: orgCount.deleted_org_count || 0, percent: 25, color: "#ff4444" },
      ];
    };

    const items = getItems();

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
          maxWidth: "600px",
          margin: "90px auto 0",
          marginTop:"10px",
          marginLeft:"10px",
          fontFamily: "sans-serif",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
          {isAdminOrDocumentRole ? "Documents" : "Company Count"}
        </h2>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: index !== items.length - 1 ? "1px solid #eee" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
              {/* <span style={{ fontWeight: "bold", width: "24px" }}>
                {String(index + 1).padStart(2, "0")}
              </span> */}
              <span style={{ flex: 1 }}>{item.label}</span>
              <div
                style={{
                  background: "#e0e0e0",
                  height: "6px",
                  width: "120px",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                    transition: "width 0.4s ease-in-out",
                  }}vs
                ></div>
              </div>
            </div>
            <span
              style={{
                backgroundColor: item.color + "22",
                color: item.color,
                fontWeight: "600",
                fontSize: "12px",
                padding: "5px 10px",
                borderRadius: "20px",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // const CompanyTable = () => {
  //   const [selectedOption, setSelectedOption] = useState('declaration');
    
  //   const handleOptionChange = (event) => {
  //     setSelectedOption(event.target.value);
  //   };

  //   return (
  //     <div style={cardStyle}>
  //       <h3 style={titleStyle}>Company Document Summary</h3>
        
  //       {role === "Viewer" && (
  //         <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "20px"}}>
  //           <label style={{ display: "flex", alignItems: "center", fontSize: "14px", fontWeight: "500" }}>
  //             <input
  //               type="radio"
  //               value="declaration"
  //               checked={selectedOption === 'declaration'}
  //               onChange={handleOptionChange}
  //               style={{ marginRight: "8px" }}
  //             />
  //             Declaration Data
  //           </label>
  //         </div>
  //       )}
        
  //       {selectedOption === "declaration" ? (
  //         dummyData.length > 0 ? (
  //           dummyData.map((data, index) => (
  //             <div
  //               key={index}
  //               style={{
  //                 display: "flex",
  //                 justifyContent: "space-between",
  //                 alignItems: "center",
  //                 padding: "12px 0",
  //                 borderBottom: "1px solid #f3f4f6",
  //               }}
  //             >
  //               <div>
  //                 <strong style={{ color: "#333" }}>{data.declaration_number}</strong>
  //                 <div style={{ fontSize: "12px", color: "#777" }}>
  //                   <FaFileAlt style={{ marginRight: "6px" }} />
  //                   Size: {data.file_size}
  //                 </div>
  //               </div>
  //               <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
  //                 <div><FaFileAlt style={{ marginRight: "4px" }} />{data.file_count} Files</div>
  //                 <div><FaFolderOpen style={{ marginRight: "4px" }} />{data.status_count.approved} Approved</div>
  //                 <div><FaUsers style={{ marginRight: "4px" }} />{data.status_count.pending} Pending</div>
  //               </div>
  //             </div>
  //           ))
  //         ) : (
  //           <p style={{ color: "red", textAlign: "center" }}>No declaration data found</p>
  //         )
  //       ) : (
  //         companyData.length > 0 ? (
  //           companyData.map((company, index) => (
  //             <div
  //               key={index}
  //               style={{
  //                 display: "flex",
  //                 justifyContent: "space-between",
  //                 alignItems: "center",
  //                 padding: "12px 0",
  //                 borderBottom: "1px solid #f3f4f6",
  //               }}
  //             >
  //               <div>
  //                 <strong style={{ color: "#333" }}>{company.org_name}</strong>
  //                 <div style={{ fontSize: "12px", color: "#777" }}>
  //                   <FaUsers style={{ marginRight: "6px" }} />
  //                   {company.username}
  //                 </div>
  //               </div>
  //               <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
  //                 <div>
  //                   <FaFileAlt style={{ marginRight: "4px" }} />
  //                   {company.uploaded_files_count} Docs
  //                 </div>
  //                 <div>
  //                   <FaFolderOpen style={{ marginRight: "4px" }} />
  //                   {company.uploaded_files_size_mb} MB
  //                 </div>
  //               </div>
  //             </div>
  //           ))
  //         ) : (
  //           <p style={{ color: "red", textAlign: "center" }}>
  //             No company data found
  //           </p>
  //         )
  //       )}
  //     </div>
  //   );
  // };

  const list = dashboardStats.declaration_document_data || [];
    
        const CompanyTable = () => (
        <div style={{  background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
    
    padding: '20px', borderRadius: '10px', flex: 1, minWidth: '300px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            Company Document Summary
          </h3>
          {list.length > 0 ? (
            list.map((data, index) => (
              <div
                key={index}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}
              >
                <div>
                  <strong style={{ color: '#333' }}>{data.declaration_name || 'Untitled'}</strong>
                  <div style={{ fontSize: '12px', color: '#777' }}>
                    {/* <FaFileAlt style={{ marginRight: '6px' }} />
                    Size: {data.size_mb || 0} MB */}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
                  <div>
                    <FaFileAlt style={{ marginRight: '4px' }} />{data.document_count || 0} Files
                  </div>
                  <div>
                    <FaFolderOpen style={{ marginRight: '4px' }} />{data.total_storage_mb || 0} MB
                  </div>
                  {/* <div>
                    <FaUsers style={{ marginRight: '4px' }} />{data.pending_count || 0} Pending
                  </div> */}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'red', textAlign: 'center' }}>No declaration data found</p>
          )}
        </div>
      );
  return (
    <>
    <div style={{ minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
        {/* <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "16px",
            marginTop:"65px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
           Welcome, {username.charAt(0).toUpperCase() + username.slice(1)}
        </h2>
        <hr style={{ border: "none", height: "2px", backgroundColor: "#e5e7eb", marginBottom: "30px" }} /> */}

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop:"16vh"
          }}
        >
          <CardAnalytics />
          <ProgressBarChart />
          <CompanyTable />
          

        </div>
      </div>
    </div>
{/* 

<div
  style={{
    display: "flex",
    flexWrap: "wrap", // allows wrapping on small screens
    gap: "16px",      // spacing between cards
    justifyContent: "center", // center the cards
    padding: "16px",
  }}
>
  <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        padding: "0 16px 0 16px",
        width: "100%",
        maxWidth: "200px", // Responsive max width
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box", // ensure padding doesn't overflow
        }}> 
        <h1 style={{fontSize:"18px"}}>Total Documents</h1>
        <h1 style={{fontSize:"18px"}}>{dashboardStats.document_summary?.total_documents}</h1>
        <LineChart width={150} height={100} data={dataLineChart}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          dot={{ r: 2 }}
          activeDot={{ r: 3 }}
        />
      </LineChart>

      </div>




      <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        padding: "0 16px 0 16px",
        width: "100%",
        maxWidth: "200px", // Responsive max width
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box", // ensure padding doesn't overflow


        }}> 
        <h1 style={{fontSize:"18px"}}>Approved</h1>
        <h1 style={{fontSize:"18px"}}>{dashboardStats.document_summary?.approved_count}</h1>
        <LineChart width={150} height={100} data={dataLineChart}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          dot={{ r: 2 }}
          activeDot={{ r: 3 }}
        />
      </LineChart>

      </div>




      <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        padding: "0 16px 0 16px",
        width: "100%",
        maxWidth: "200px", // Responsive max width
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box", // ensure padding doesn't overflow


        }}> 
        <h1 style={{fontSize:"18px"}}>Pending</h1>
        <h1 style={{fontSize:"18px"}}>{dashboardStats.document_summary?.pending_count}</h1>
        <LineChart width={150} height={100} data={dataLineChart}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          dot={{ r: 2 }}
          activeDot={{ r: 3 }}
        />
      </LineChart>

      </div>
      
      
      
      
      
      <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        padding: "0 16px 0 16px",
        width: "100%",
        maxWidth: "200px", // Responsive max width
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box", // ensure padding doesn't overflow


        }}> 
        <h1 style={{fontSize:"18px"}}>Rejected</h1>
        <h1 style={{fontSize:"18px"}}>{dashboardStats.document_summary?.rejected_count}</h1>
        <LineChart width={150} height={100} data={dataLineChart}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          dot={{ r: 2 }}
          activeDot={{ r: 3 }}
        />
      </LineChart>

      </div>
</div> */}



{/* 
 <div style={{ textAlign: 'center', marginBottom:"20vh"}}>
      <RadialBarChart
        width={300}
        height={150}
        cx={150}
        cy={150}
        innerRadius={70}
        outerRadius={100}
        startAngle={180}
        endAngle={0}
        data={dataMeterChart}
      >
        <RadialBar
          minAngle={15}
          clockWise
          dataKey="value"
          cornerRadius={10}
        />
        <text
          x={150}
          y={140}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fill="#333"
        >
          65%
        </text>
      </RadialBarChart>
    </div> */}




    {/* ===== */}

    {/* <div style={{ position: 'relative', width: 500, height: 250, marginBottom: '20vh' }}>
      <RadialBarChart
        width={300}
        height={150}
        cx={150}
        cy={150}
        innerRadius={70}
        outerRadius={100}
        startAngle={180}
        endAngle={0}
        data={dataMeterChart}
      >
        <RadialBar
          minAngle={15}
          clockWise
          dataKey="value"
          cornerRadius={10}
        />
        <text
          x={150}
          y={140}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fill="#333"
        >
          5.97 MB/{meterchartValue}%
        </text>
      </RadialBarChart>

      <svg
        width="300"
        height="150"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none', // allows clicks through to the chart
        }}
      >
        <line
          x1="150"
          y1="150"
          x2={150 + 60 * Math.cos((Math.PI * angle) / 180)}
          y2={150 - 60 * Math.sin((Math.PI * angle) / 180)}
          stroke="rgb(0, 123, 255)"
          strokeWidth="4"
        />
        <circle cx="150" cy="150" r="5" fill="black" />
      </svg>
    </div>   */}



    

    
    </>
  );
};

export default ViewerDashboard;

// ====== Styles ======
const cardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  flex: 1,
  minWidth: "300px",
};

const titleStyle = {
  fontSize: "18px",
  marginBottom: "12px",
  fontWeight: "600",
  borderBottom: "1px solid #eee",
  paddingBottom: "8px",
};

const badgeStyle = {
  minWidth: "60px",
  height: "40px",
  borderRadius: "12px",
  backgroundColor: "#007bff",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: "bold",
};

const barContainerStyle = {
  flex: 1,
  height: "12px",
  backgroundColor: "#e6e6e6",
  borderRadius: "50px",
  overflow: "hidden",
};

const percentageLabelStyle = {
  marginTop: "10px",
  fontSize: "13px",
  textAlign: "center",
};

const valueBadgeStyle = {
  fontSize: "14px",
  fontWeight: "600",
  background: "#f3f4f6",
  padding: "4px 10px",
  borderRadius: "6px",
};




// 175k
// 100k
