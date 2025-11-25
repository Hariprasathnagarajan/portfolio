import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  User, LayoutDashboard, Building2, UserPlus, FileCheck2, ListChecks,
  FileText, Upload, ChartNoAxesCombined, ChevronDown, ChevronRight
} from "lucide-react";
import "./AsideBar.css";

import { Badge } from "@mui/material";
import ReconciliationAdmin from "../reconciliationadmin/reconciliation-admin";
import authService, { API_URL } from "../../ApiServices/ApiServices";
const ROLES = {
  ADMIN: "Admin",
  PRODUCT_ADMIN: "Product Admin",
  CLIENT_ADMIN: "Client Admin",
  VIEWER: "Viewer",
  PRODUCT_OWNER: "Product Owner",
  UPLOADER: "Uploader",
  REVIEWER: "Reviewer",
  AUDITOR:"Auditor",
  AUDIT_MANAGER:"Audit Manager",
  ReconciliationAdmin:"Reconciliation Admin",
};

const TopNavbar = () => {
  const [role, setRole] = useState("VIEWER");
  const [roleFetched, setRoleFetched] = useState("");
  const [dropdowns, setDropdowns] = useState({
    org: false,
    admin: false,
    user: false,
    docs: false,
    audit: false,
    auditorAudit: false,
    recon: false,
    adminAudit: false,
    adminRecon: false
  });

  const [isDMS, setIsDMS] = useState(false);
  const [isAudit, setIsAudit] = useState(false);
  const [isReconciliation, setIsReconciliation] = useState(false);

  const orgTimeoutRef = useRef(null);
  const adminTimeoutRef = useRef(null);
  const userTimeoutRef = useRef(null);
  const docsTimeoutRef = useRef(null);
  const auditTimeoutRef = useRef(null);
  const auditorAuditTimeoutRef = useRef(null);
  const reconTimeoutRef = useRef(null);
  const adminAuditTimeoutRef = useRef(null);
  const adminReconTimeoutRef = useRef(null);
  const [auditCount, setAuditCount] = useState(0);
  const [reconCount, setReconCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUserName] = useState("");
const isFetchingRef = useRef(false);

useEffect(() => {
  let socket;
  let intervalId;
  let lastFetchTime = 0;

  const fetchCounts = async (userUUID) => {
    const now = Date.now();
    // Only allow fetch if 3s have passed since last fetch
    if (isFetchingRef.current || now - lastFetchTime < 3000) return;
    isFetchingRef.current = true;
    lastFetchTime = now;
    try {
      const counts = await authService.getSidebarCounts(userUUID);
      setAuditCount(counts.declaration_on_audit || 0);
      setReconCount(counts.stock_audit || 0);
    } catch (err) {
      console.error("Failed to fetch sidebar counts via API:", err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const setupWebSocket = async () => {
    try {
      const details_data = await authService.details();
      const userUUID = details_data.details[3]?.id;
      if (!userUUID) return;

      // 🔹 Fallback API call (always run once initially)
      await fetchCounts(userUUID);

      const backendHost = new URL(API_URL).host;
      const wsUrl = `ws://${backendHost}/ws/sidebar/${userUUID}/`;

      socket = new WebSocket(wsUrl);

      socket.onopen = () => console.log("✅ Sidebar WebSocket connected");

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 Sidebar counts via WebSocket:", data);
        setAuditCount(data.declaration_on_audit || 0);
        setReconCount(data.stock_audit || 0);
      };

      socket.onclose = () => {
        console.warn("⚠️ Sidebar WebSocket closed, retrying in 3s...");
        setTimeout(setupWebSocket, 5000); // auto reconnect
      };

      socket.onerror = (err) => {
        console.error("❌ Sidebar WebSocket error:", err);
        socket.close();
      };

      // ✅ fetch counts every 5 seconds
      intervalId = setInterval(() => fetchCounts(userUUID), 10000);
    } catch (err) {
      console.error("Failed to setup WebSocket for sidebar:", err);
    }
  };

  if (role === ROLES.AUDITOR || role === ROLES.VIEWER) {
    setupWebSocket();
  }

  return () => {
    if (socket) socket.close();
    if (intervalId) clearInterval(intervalId);
  };
}, [role]);


  const fetchDetails = async () => {
    try {
      const details_data = await authService.details();
      const email = details_data.details[1]?.email || details_data.details[5]?.email;
      const name = details_data.type === "User"
        ? details_data.details[1]?.first_name
        : details_data.details[5]?.first_name;
      const lastName = details_data.type === "User"
     ? details_data.details[1]?.last_name
     : details_data.details[5]?.last_name;
       const fullName = [name, lastName].filter(Boolean).join(" ");
      const company_name = details_data.type === "User"
        ? details_data.details[7]?.company_name
        : details_data.details[1]?.company_name;
      setUserName(name);
      // const roleFromStorage =

      if (email) localStorage.setItem("email", email);
      if (name) localStorage.setItem("name", name);
      if (company_name) localStorage.setItem("company_name", company_name);

      let finalRole = ROLES.VIEWER;
      let dms = false, audit = false, recon = false;

      if (details_data.type === "User") {
        const fetchedRole = details_data.details[5]?.name;
        dms = !!details_data.details[7]?.is_dms_needed;
        audit = !!details_data.details[7]?.is_auditing_enabled;
        recon = !!details_data.details[7]?.is_reconciliation_needed;
        localStorage.setItem("role", fetchedRole);
        finalRole = fetchedRole;
      } else if (details_data.type === "Organization") {
        // console.log("Organization details:", details_data);
        const orgRole = details_data.details[3]?.name;
        dms = !!details_data.details[1]?.is_dms_needed;
        audit = !!details_data.details[1]?.is_auditing_enabled;
        recon = !!details_data.details[1]?.is_reconciliation_needed;
        finalRole = orgRole === "Admin" ? ROLES.CLIENT_ADMIN : orgRole;
        localStorage.setItem("role", finalRole);

      }

      setIsDMS(dms);
      setIsAudit(audit);
      setIsReconciliation(recon);
      setRole(finalRole);
      if (finalRole!=="Admin") setRoleFetched(finalRole);
      else setRoleFetched("Client Admin");
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleDropdown = (type, isOpen) => {
    clearTimeout(orgTimeoutRef.current);
    clearTimeout(adminTimeoutRef.current);
    clearTimeout(userTimeoutRef.current);
    clearTimeout(docsTimeoutRef.current);
    clearTimeout(auditTimeoutRef.current);
    clearTimeout(auditorAuditTimeoutRef.current);
    clearTimeout(reconTimeoutRef.current);
    clearTimeout(adminAuditTimeoutRef.current);
    clearTimeout(adminReconTimeoutRef.current);

    setDropdowns(prev => ({
      ...prev,
      [type]: isOpen
    }));
  };

  const handleMouseLeaveWithDelay = (type) => {
    const timeoutRefs = {
      org: orgTimeoutRef,
      admin: adminTimeoutRef,
      user: userTimeoutRef,
      docs: docsTimeoutRef,
      audit: auditTimeoutRef,
      auditorAudit: auditorAuditTimeoutRef,
      recon: reconTimeoutRef,
      adminAudit: adminAuditTimeoutRef,
      adminRecon: adminReconTimeoutRef
    };

    timeoutRefs[type].current = setTimeout(() => {
      handleDropdown(type, false);
    }, 300);
  };

  // Role-based access control
  const hasDashboardAccess = [
    ROLES.PRODUCT_ADMIN, ROLES.VIEWER, ROLES.PRODUCT_OWNER,
    ROLES.ADMIN, ROLES.UPLOADER, ROLES.REVIEWER, ROLES.AUDITOR
  ].includes(role);
  const isAdmin = role === ROLES.ADMIN;
  const hasOrgAccess = [ROLES.PRODUCT_ADMIN, ROLES.PRODUCT_OWNER].includes(role);
  const hasUserAccess = role === ROLES.ADMIN;
  const ReconciliationAdmin = role === ROLES.ReconciliationAdmin;
  const hasAdminAccess = role === ROLES.PRODUCT_OWNER;
  const hasDocsAccess = [
    ROLES.VIEWER, ROLES.ADMIN, ROLES.UPLOADER, ROLES.REVIEWER
  ].includes(role);
  const hasBackupAccess = [
    ROLES.ADMIN
  ].includes(role);
  const hasAuditAccess = hasAdminAccess || isAdmin;
  const hasAuditManagerAccess =  [
    ROLES.AUDIT_MANAGER
  ].includes(role);
  const hasAuditorAccess = role === ROLES.AUDITOR;

  // Active route styling
  const isProfileActive = location.pathname === "/Profile";
  const isDashboardActive = location.pathname === "/Dashboard";
  const isOrgActive = location.pathname.startsWith("/OrganizationList") || location.pathname === "/CompanyCreation";
  const isAdminActive = location.pathname.startsWith("/AdminList") || location.pathname === "/AdminCreation";
  const isUserActive = location.pathname.startsWith("/user-list") || location.pathname === "/createuser" || location.pathname === "/deletedusers";
  const isDocsActive = location.pathname.startsWith("/DocumentList");
  const isBackupActive = location.pathname === "/backup";
  const isAuditActive = [
    "/create-audit",
    "/assign-auditor",
    "/assign-company",
    "/status-company",
    "/load-auditor",
    "/reconciliation",
    "/AuditList"
  ].some(path => location.pathname.startsWith(path));
// Audit section for Auditor
const isAuditorAuditActive = [
  "/auditor-company",
  "/auditor-declaration"
].some(path => location.pathname.startsWith(path));

const isReconActive = [
  "/AuditReconcilation",
  "/adhocReconcilation",
  "/ReconciliationClient",
  "/reconciliation-audit"
].some(path => location.pathname.startsWith(path));

// Reconciliation section for Auditor
const isAuditorReconActive = [
  "/auditor-reconciliation",
  "/auditor-recon-detail"
].some(path => location.pathname.startsWith(path));

  const isAdminAuditActive = [
    "/audit-settings",
    "/audit-reports",
    "/company-status",
    "/audits-status"
  ].some(path => location.pathname.startsWith(path));

  const isAdminReconActive = [
    "/reconciliation-settings",
    "/reconciliation-reports",
    "/adhoc-reconciliation",
    "/audit-reconciliation",
    "/reconciliation-admin"
  ].some(path => location.pathname.startsWith(path));
  // Add this with other active checks
const isAuditManagerAuditActive = [
  "/AuditorDash",
  "/OpenDeclaration",
  "/audit-declaration-status"
].some(path => location.pathname.startsWith(path));

const isAuditManagerOrgActive = [
  "/companydash",
  "/DeclarationWise"
].some(path => location.pathname.startsWith(path));

const isAuditManagerReconActive = [
  "/ManagerReconciliation",
  "/ManagerReconciliationdetail"
].some(path => location.pathname.startsWith(path));


  return (
    <nav className="top-navbar" aria-label="Main navigation">
      <div className="nav-logo"></div>
      <ul className="nav-menu">
        {/* COMMON MENU FOR PRODUCT OWNER + PRODUCT ADMIN */}
        {[ROLES.PRODUCT_OWNER, ROLES.PRODUCT_ADMIN].includes(role) && (
          <>
            <li><NavLink to="/Profile" className={({ isActive }) => isActive ? "active-link" : ""}><User size={18} /> Profile</NavLink></li>
            <li><NavLink to="/Dashboard" className={({ isActive }) => isActive ? "active-link" : ""}><ChartNoAxesCombined size={18} /> Dashboard</NavLink></li>
            {/* Organization */}
            <li
              className="dropdown"
              onMouseEnter={() => handleDropdown("org", true)}
              onMouseLeave={() => handleMouseLeaveWithDelay("org")}
            >
              <div
                className={`dropdown-toggle ${isOrgActive ? "active-link" : ""}`}
                onClick={() => navigate("/OrganizationList")}
              >
                <Building2 size={18} /> Organization{" "}
                {dropdowns.org ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              {dropdowns.org && (
                <ul className="dropdown-menu">
                  <li><NavLink to="/OrganizationList">Organization List</NavLink></li>
                  <li><NavLink to="/CompanyCreation">New Organization</NavLink></li>
                </ul>
              )}
            </li>
            {/* User */}
            <li
              className="dropdown"
              onMouseEnter={() => handleDropdown("admin", true)}
              onMouseLeave={() => handleMouseLeaveWithDelay("admin")}
            >
              <div
                className={`dropdown-toggle ${isAdminActive ? "active-link" : ""}`}
                onClick={() => navigate("/AdminList")}
              >
                <UserPlus size={18} /> User{" "}
                {dropdowns.admin ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              {dropdowns.admin && (
                <ul className="dropdown-menu">
                  <li><NavLink to="/AdminList">User List</NavLink></li>
                  <li><NavLink to="/AdminCreation">New User</NavLink></li>
                </ul>
              )}
            </li>
            {/* Audit */}
            {isAudit && (
              <li
                className="dropdown"
                onMouseEnter={() => handleDropdown("audit", true)}
                onMouseLeave={() => handleMouseLeaveWithDelay("audit")}
              >
                <NavLink
                  to="/company-status"
                  className={() =>
                    location.pathname === "/company-status" ||
                    location.pathname === "/audits-status"||
                    location.pathname === "/company-declaration-status"||
                    location.pathname === "/audit-declaration-status"||
                    location.pathname === "/company"
                      ? "dropdown-toggle active-link"
                      : "dropdown-toggle"
                  }
                >
                  
                  <FileCheck2 size={20} /> Audit{" "}
                  {dropdowns.audit ? <ChevronDown size={20} /> : <ChevronRight size={16} />}
                </NavLink>
                {dropdowns.audit && (
                  <ul className="dropdown-menu">
                    <li><NavLink to="/company-status">Organization Wise Status</NavLink></li>
                    <li><NavLink to="/audits-status">Auditor Wise Status</NavLink></li>
                  </ul>
                )}
              </li>
            )}
            {/* Reconciliation */}
           {isReconciliation && (
  <li>
    <NavLink
      to="/AuditReconcilation"
      className={() => isReconActive ? "dropdown-toggle active-link" : "dropdown-toggle"}
    >
      <ListChecks size={18} />
      Reconciliation
    </NavLink>
  </li>

            )}
          </>
        )}
{[ROLES.ReconciliationAdmin].includes(role) && (
          <>
            <li>
  <NavLink to="/Profile" className={({ isActive }) => isActive ? "active-link" : ""}>
    <User size={18} /> Profile
  </NavLink>
</li>

            <li>
                <div
                  className={`dropdown-toggle ${isReconActive ? "active-link" : ""}`}
                  onClick={() => navigate("/reconciliation-admin")}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", gap: "8px" }}
                >
                  <ListChecks size={18} />
                  Reconciliation
                </div>
              </li>
            </>
        )}

        {/* ADMIN MENU */}
        {[ROLES.ADMIN, ROLES.CLIENT_ADMIN].includes(role) && (
          <>
            <li><NavLink 
  to="/Profile" 
  className={({ isActive }) => (isActive ? "active-link" : "")}
>
  <User size={18} /> Profile
</NavLink>
</li>
            <li>
  <NavLink 
    to="/Dashboard" 
    className={({ isActive }) => isActive ? "active-link" : ""}
  >
    <ChartNoAxesCombined size={18} /> Dashboard
  </NavLink>
</li>
            <li
              className="dropdown"
              onMouseEnter={() => handleDropdown("user", true)}
              onMouseLeave={() => handleMouseLeaveWithDelay("user")}
            >
              <div className={`dropdown-toggle ${isUserActive ? "active-link" : ""}`}
                onClick={() => navigate("/user-list")}>
                <Building2 size={18} /> User {dropdowns.user ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              {dropdowns.user && (
                <ul className="dropdown-menu">
                  <li><NavLink to="/user-list">User List</NavLink></li>
                  <li><NavLink to="/createuser">New User</NavLink></li>
                </ul>
              )}
            </li>
            {isDMS && (
              <li
                className="dropdown"
                onMouseEnter={() => handleDropdown("docs", true)}
                onMouseLeave={() => handleMouseLeaveWithDelay("docs")}
              >
                <div className={`dropdown-toggle ${isDocsActive || isBackupActive ? "active-link" : ""}`}
                  onClick={() => navigate("/DocumentList")}>
                  <FileText size={18} /> Documents {dropdowns.docs ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {dropdowns.docs && (
                  <ul className="dropdown-menu">
                    <li><NavLink to="/DocumentList">Documents</NavLink></li>
                    <li><NavLink to="/backup">Backup</NavLink></li>
                  </ul>
                )}
              </li>
            )}
            {isAudit && (
              <li>
                <NavLink
                  to="/ClientAudit"
                  className={({ isActive }) =>
                    isActive || location.pathname.startsWith("/company-status") || location.pathname.startsWith("/audits-status")
                      ? "dropdown-toggle active-link"
                      : "dropdown-toggle"
                  }
                  style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: "8px" }}
                >
                  <FileCheck2 size={20} /> Audit
                </NavLink>
              </li>
            )}
            {isReconciliation && (
              <li>
               <li>
  <NavLink
    to="/ReconciliationClient"
    className={({ isActive }) => (isActive ? "dropdown-toggle active-link" : "dropdown-toggle")}
  >
    <ListChecks size={18} />
    Reconciliation
  </NavLink>
</li>

              </li>
            )}
          </>
        )}

        {/* VIEWER MENU */}
        {role === ROLES.VIEWER && (
          <>
            <li><NavLink 
  to="/Profile" 
  className={({ isActive }) => (isActive ? "active-link" : "")}
>
  <User size={18} /> Profile
</NavLink>
</li>
            <li>
              {/* <li> */}
  <NavLink 
    to="/Dashboard" 
    className={({ isActive }) => isActive ? "active-link" : ""}
  >
    <ChartNoAxesCombined size={18} /> Dashboard
  </NavLink>
{/* </li> */}
</li>
            {isDMS && (
              <li>
                <NavLink
                  to="/DocumentList"
                  className={isDocsActive ? "active-link" : ""}
                >
                  <FileText size={18} /> Documents
                </NavLink>
              </li>
            )}
            {isAudit && (
              <li>
                <NavLink
                  to="/vieweraudit"
                  className={location.pathname.startsWith("/vieweraudit") ? "active-link" : ""}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck2 size={18} />
                    <span style={{ marginRight: '4px' }}>Audit</span>
                    <Badge
                      badgeContent={auditCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: '16px',
                          minWidth: '16px',
                          padding: '0 4px',
                          transform: 'scale(1) translate(50%, -50%)'
                        }
                      }}
                    />
                  </div>
                </NavLink>
              </li>
            )}
            {isReconciliation && (
              <li>
                <NavLink
                  to="/reconciliation-admin"
                  className={location.pathname.startsWith("/reconciliation-admin") ? "active-link" : ""}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ListChecks size={18} />
                    <span style={{ marginRight: '4px' }}>Reconciliation</span>
                    <Badge
                      badgeContent={reconCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: '16px',
                          minWidth: '16px',
                          padding: '0 4px',
                          transform: 'scale(1) translate(50%, -50%)'
                        }
                      }}
                    />
                  </div>
                </NavLink>
              </li>
            )}
          </>
        )}

        {hasAuditorAccess && (
          <>
            <li><NavLink 
  to="/Profile" 
  className={({ isActive }) => (isActive ? "active-link" : "")}
>
  <User size={18} /> Profile
</NavLink>
</li>
          {isAudit && (
  <li>
    <NavLink
      to="/auditor-company"
      className={() => isAuditorAuditActive ? "active-link" : ""}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileCheck2 size={18} />
        <span style={{ marginRight: '4px' }}>Audit</span>
                    <Badge
                      badgeContent={auditCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: '16px',
                          minWidth: '16px',
                          padding: '0 4px',
                          transform: 'scale(1) translate(50%, -50%)'
                        }
                      }}
                    />
                  </div>
                </NavLink>
              </li>
            )}
         {isReconciliation && (
  <li>
    <div
      className={`dropdown-toggle ${isAuditorReconActive ? "active-link" : ""}`}
      onClick={() => navigate("/auditor-reconciliation")}
      style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", gap: "8px" }}
    >
      <ListChecks size={18} />
      <span style={{ marginRight: '4px' }}>Reconciliation</span>
                  <Badge
                    badgeContent={reconCount}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: '16px',
                        minWidth: '16px',
                        padding: '0 4px',
                        transform: 'scale(1) translate(50%, -50%)'
                      }
                    }}
                  />
                </div>
              </li>
            )}
          </>
        )}

        {/* OTHER ROLES */}
        {![ROLES.PRODUCT_OWNER, ROLES.ADMIN, ROLES.VIEWER, ROLES.AUDITOR, ROLES.PRODUCT_ADMIN].includes(role) && (
          <>
            {hasDashboardAccess && (
              <>
                <li><NavLink 
  to="/Profile" 
  className={({ isActive }) => (isActive ? "active-link" : "")}
>
  <User size={18} /> Profile
</NavLink>
</li>
                {role !== ROLES.AUDITOR && (
                  <li>
                    {/* <li> */}
  <NavLink 
    to="/Dashboard" 
    className={({ isActive }) => isActive ? "active-link" : ""}
  >
    <ChartNoAxesCombined size={18} /> Dashboard
  </NavLink>
{/* </li> */}
</li>
                )}
              </>
            )}

            {hasOrgAccess && (
              <li
                className="dropdown"
                onMouseEnter={() => handleDropdown("org", true)}
                onMouseLeave={() => handleMouseLeaveWithDelay("org")}
              >
                <div className={`dropdown-toggle ${isOrgActive ? "active-link" : ""}`}
                  onClick={() => navigate("/OrganizationList")}>
                  <Building2 size={18} /> Organization {dropdowns.org ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {dropdowns.org && (
                  <ul className="dropdown-menu">
                    <li><NavLink to="/OrganizationList">Organization List</NavLink></li>
                    <li><NavLink to="/CompanyCreation">New Organization</NavLink></li>
                  </ul>
                )}
              </li>
            )}

            {hasUserAccess && (
              <li
                className="dropdown"
                onMouseEnter={() => handleDropdown("user", true)}
                onMouseLeave={() => handleMouseLeaveWithDelay("user")}
              >
                <div className={`dropdown-toggle ${isUserActive ? "active-link" : ""}`}
                  onClick={() => navigate("/user-List")}>
                  <Building2 size={18} /> User {dropdowns.user ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {dropdowns.user && (
                  <ul className="dropdown-menu">
                    <li><NavLink to="/user-list">User List</NavLink></li>
                    <li><NavLink to="/createuser">New User</NavLink></li>
                    <li><NavLink to="/deletedusers">Deleted User</NavLink></li>
                  </ul>
                )}
              </li>
            )}

            {hasAdminAccess && (
              <li
                className="dropdown"
                onMouseEnter={() => handleDropdown("admin", true)}
                onMouseLeave={() => handleMouseLeaveWithDelay("admin")}
              >
                <div className={`dropdown-toggle ${isAdminActive ? "active-link" : ""}`}
                  onClick={() => navigate("/AdminList")}>
                  <UserPlus size={18} /> User {dropdowns.admin ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {dropdowns.admin && (
                  <ul className="dropdown-menu">
                    <li><NavLink to="/AdminList">User List</NavLink></li>
                    <li><NavLink to="/AdminCreation">New User</NavLink></li>
                  </ul>
                )}
              </li>
            )}

            {isAudit && hasAuditAccess && (
              <li
                className="dropdown"
                onMouseEnter={() => handleDropdown("audit", true)}
                onMouseLeave={() => handleMouseLeaveWithDelay("audit")}
              >
                <NavLink
                  to="/company-status"
                  className={() =>
                    location.pathname === "/company-status" ||
                    location.pathname === "/audits-status"
                      ? "dropdown-toggle active-link"
                      : "dropdown-toggle"
                  }
                >
                  <FileCheck2 size={20} /> Audit{" "}
                  {dropdowns.audit ? <ChevronDown size={20} /> : <ChevronRight size={16} />}
                </NavLink>
                {dropdowns.audit && (
                  <ul className="dropdown-menu">
                    <li><NavLink to="/company-status">Organization Wise Status</NavLink></li>
                    <li><NavLink to="/audits-status">Auditor Wise Status</NavLink></li>
                  </ul>
                )}
              </li>
            )}

            {isReconciliation && hasAuditAccess && (
              <li>
               <NavLink 
  to="/AuditReconcilation"
  className={({ isActive }) => (isActive ? "dropdown-toggle active-link" : "dropdown-toggle")}
>
  <ListChecks size={18} />
  Reconciliation
</NavLink>

              </li>
            )}
            {role === ROLES.REVIEWER && (
               <li>
            <NavLink to="/verifydocument" className={({ isActive }) => isActive ? "active-link" : ""}>
              <FileCheck2 size={18} /> Validate
            </NavLink>
          </li>
            )}
            {role === ROLES.UPLOADER && (
               <li>
            <NavLink to="/upload" className={({ isActive }) => isActive ? "active-link" : ""}>
              <Upload size={18} /> Upload
            </NavLink>
          </li>
            )}
            {isDMS && hasDocsAccess && (
              <li>
                <NavLink
                  to="/DocumentList"
                  className={isDocsActive ? "active-link" : ""}
                >
                  <FileText size={18} /> Documents
                </NavLink>
              </li>
            )}
          {hasAuditManagerAccess && (
  <>
    <li>
      <NavLink to="/Profile" className={({ isActive }) => isActive ? "active-link" : ""}>
        <User size={18} /> Profile
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/AuditorDash"
        className={() => (isAuditManagerAuditActive ? "active-link" : "")}
      >
        <ChartNoAxesCombined size={18} /> Auditors
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/companydash"
        className={() => (isAuditManagerOrgActive ? "active-link" : "")}
      >
        <Building2 size={18} /> Organization
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/ManagerReconciliation"
        className={() => (isAuditManagerReconActive ? "active-link" : "")}
      >
        <FileText size={18} /> Reconciliation
      </NavLink>
    </li>
  </>
)}

            {hasBackupAccess && (
              <li>
                <NavLink
                  to="/backup"
                  className={isBackupActive ? "active-link" : ""}
                >
                  <FileText size={18} /> Backup
                </NavLink>
              </li>
            )}
          </>
        )}
      </ul>
      <div style={{ marginLeft:"auto"}}>
        <h3>Welcome, {username} ({roleFetched})</h3>
        </div>
    </nav>
  );
};

export default TopNavbar;