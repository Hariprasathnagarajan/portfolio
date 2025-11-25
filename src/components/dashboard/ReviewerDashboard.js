//Storage
//Company Document Summary


import React, { useEffect, useState } from "react";
import authService from "../../ApiServices/ApiServices";
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

const ReviewerDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({});
  // const [clientSize, setClientSize] = useState(0);
  const [companyData, setCompanyData] = useState([]);
  const [orgCount, setOrgCount] = useState({});
  // const [totalSize, setTotalSize] = useState(0);
  const [dummyData, setDummyData] = useState([]); // For declaration data

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("name") || "User";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const stats = await authService.DashboardViewUploader();
        setDashboardStats(stats || {});
        console.log("DashboardViewUploader()", stats);
        
        // Fetch organization count if needed
        if (role === "Admin") {
          const orgCountData = await authService.organizationCountDas();
          setOrgCount(orgCountData || {});
          console.log("organizationCountDas()", orgCountData);
        }
        
        // Fetch reviewer-specific data
        if (role === "Reviewer") {
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
          }
          
        }
      } catch (error) {
        console.error("Dashboard load failed", error);
      }
    };

    fetchData();
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

  const ProgressBarChart = ({ role }) => {
    const isUploader = role === "Uploader";
    const isAdminOrDocumentRole = ["Admin", "Uploader", "Approver", "Reviewer", "Viewer"].includes(role);

    // const max = isUploader ? 10 : 504;
    // const used = isUploader ? 10 : isAdminOrDocumentRole ? clientSize : totalSize;

    // const safeUsed = typeof used === "number" && !isNaN(used) ? used : 0;
    // const roundedUsed = safeUsed > max ? max : parseFloat(safeUsed.toFixed(2));
    // const percentage = Math.min((roundedUsed / max) * 100, 100).toFixed(2);
    // const fullLabel = `${roundedUsed} MB${isUploader ? ` of ${max} MB` : ""}`;
      const usedMB = dashboardStats?.storage_usage?.used_mb || 0;
  const max = role === "Uploader" ? 10 : 504; // Storage limits
  const percentage = Math.min((usedMB / max) * 100, 100).toFixed(2);
  const fullLabel = `${usedMB.toFixed(2)} MB${role === "Uploader" ? ` of ${max} MB` : ''}`;
      
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
                  }}
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
        
  //       {role === "Reviewer" && (
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
      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s ease",
    padding: '20px', borderRadius: '10px',flex: 1, minWidth: '300px' }}>
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
    <div style={{ minHeight: "100vh", padding: "40px" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
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
          <ProgressBarChart
            // clientSize={clientSize}
            // totalSize={totalSize}
            role={role}
          />
          <CompanyTable />
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;

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