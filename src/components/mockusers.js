// mockUsers.js
const mockUsers = [
  {
    id: 1, name: "Raja Kumar", first_name: "Raja", last_name: "Kumar", 
    email: "raja.kumar@example.com", role: 'manager', phoneNumber: "+971 50 123 4501",
    auditType: "Freezone",
    count: [
      { name: "John Smith" }, { name: "Emily Davis" }, { name: "Sarah Johnson" },
      { name: "Jennifer Lee" }
    ]
  },
  {
    id: 2, name: "John Smith", first_name: "John", last_name: "Smith", 
    email: "john.smith@example.com", role: 'auditor', phoneNumber: "+971 50 123 4502", 
    auditType: "Freezone",
    count: [
      { name: "DHL" }, { name: "FEDEX" }, { name: "ARAMEX" },
      { name: "UPS" }, { name: "DTDC" }, { name: "Delhivery" }
    ]
  },
  {
    id: 3, name: "Michael Brown", first_name: "Michael", last_name: "Brown", 
    email: "michael.brown@example.com", role: 'manager', phoneNumber: "+971 50 123 4503",
    auditType: "Mainland",
    count: [
      { name: "Patricia White" }, { name: "Nancy Thompson" }, { name: "Karen Martinez" },
      { name: "Betty Walker" }, { name: "Dorothy King" }
    ]
  },
  {
    id: 4, name: "Emily Davis", first_name: "Emily", last_name: "Davis", 
    email: "emily.davis@example.com", role: 'auditor', phoneNumber: "+971 50 123 4504", 
    auditType: "Mainland",
    count: [
      { name: "NAQUEL LOGISTICS" }, { name: "DTDC" }, { name: "XPRESSBEES" },
      { name: "Shadowfax" }, { name: "First Flight" }, { name: "Zajel" }
    ]
  },
  {
    id: 5, name: "David Wilson", first_name: "David", last_name: "Wilson", 
    email: "david.wilson@example.com", role: 'manager', phoneNumber: "+971 50 123 4505",
    auditType: "Warehouse",
    count: [
      { name: "Betty Walker" }, { name: "Dorothy King" }, { name: "Karen Martinez" },
      { name: "Lisa Martin" }, { name: "Sarah Johnson" }, { name: "Jennifer Lee" }
    ]
  },
  {
    id: 6, name: "Sarah Johnson", first_name: "Sarah", last_name: "Johnson", 
    email: "sarah.johnson@example.com", role: 'auditor', phoneNumber: "+971 50 123 4506", 
    auditType: "Warehouse",
    count: [
      { name: "UPS" }, { name: "SHADOWFAX" }, { name: "FedEx" },
      { name: "DHL" }, { name: "Aramex" }, { name: "Naquel Logistics" }
    ]
  },
  {
    id: 7, name: "Robert Taylor", first_name: "Robert", last_name: "Taylor", 
    email: "robert.taylor@example.com", role: 'manager', phoneNumber: "+971 50 123 4507",
    auditType: "Broker/Agent",
    count: [
      { name: "Matthew Garcia" }, { name: "Anthony Young" }, { name: "Lisa Martin" },
      { name: "Samuel Lewis" }
    ]
  },
  {
    id: 8, name: "Jennifer Lee", first_name: "Jennifer", last_name: "Lee", 
    email: "jennifer.lee@example.com", role: 'auditor', phoneNumber: "+971 50 123 4508", 
    auditType: "Broker/Agent",
    count: [
      { name: "DELHIVERY" }, { name: "GATI" }, { name: "XpressBees" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 9, name: "William Clark", first_name: "William", last_name: "Clark", 
    email: "william.clark@example.com", role: 'manager', phoneNumber: "+971 50 123 4509",
    auditType: "Freezone",
    count: [
      { name: "Dorothy King" }, { name: "Betty Walker" }, { name: "Patricia White" },
      { name: "Nancy Thompson" }, { name: "Karen Martinez" }
    ]
  },
  {
    id: 10, name: "Lisa Martin", first_name: "Lisa", last_name: "Martin", 
    email: "lisa.martin@example.com", role: 'auditor', phoneNumber: "+971 50 123 4510", 
    auditType: "Freezone",
    count: [
      { name: "ECOM EXPRESS" }, { name: "FIRST FLIGHT" }, { name: "Zajel" },
      { name: "Fetchr" }, { name: "Naquel Logistics" }, { name: "Shadowfax" }
    ]
  },
  {
    id: 11, name: "Matthew Garcia", first_name: "Matthew", last_name: "Garcia", 
    email: "matthew.garcia@example.com", role: 'manager', phoneNumber: "+971 50 123 4511",
    auditType: "Mainland",
    count: [
      { name: "Anthony Young" }, { name: "Lisa Martin" }, { name: "Samuel Lewis" },
      { name: "Olivia Hall" }, { name: "Ethan Scott" }
    ]
  },
  {
    id: 12, name: "Nancy Thompson", first_name: "Nancy", last_name: "Thompson", 
    email: "nancy.thompson@example.com", role: 'auditor', phoneNumber: "+971 50 123 4512", 
    auditType: "Mainland",
    count: [
      { name: "DTDC" }, { name: "XpressBees" }, { name: "Shadowfax" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 13, name: "Karen Martinez", first_name: "Karen", last_name: "Martinez", 
    email: "karen.martinez@example.com", role: 'manager', phoneNumber: "+971 50 123 4513",
    auditType: "Warehouse",
    count: [
      { name: "Patricia White" }, { name: "Nancy Thompson" }, { name: "Betty Walker" },
      { name: "Dorothy King" }, { name: "Lisa Martin" }
    ]
  },
  {
    id: 14, name: "Anthony Young", first_name: "Anthony", last_name: "Young", 
    email: "anthony.young@example.com", role: 'auditor', phoneNumber: "+971 50 123 4514", 
    auditType: "Warehouse",
    count: [
      { name: "SHADOWFAX" }, { name: "Naquel Logistics" }, { name: "XpressBees" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 15, name: "Dorothy King", first_name: "Dorothy", last_name: "King", 
    email: "dorothy.king@example.com", role: 'manager', phoneNumber: "+971 50 123 4515",
    auditType: "Broker/Agent",
    count: [
      { name: "Betty Walker" }, { name: "Patricia White" }, { name: "Nancy Thompson" },
      { name: "Karen Martinez" }, { name: "Lisa Martin" }
    ]
  },
  {
    id: 16, name: "Betty Walker", first_name: "Betty", last_name: "Walker", 
    email: "betty.walker@example.com", role: 'auditor', phoneNumber: "+971 50 123 4516", 
    auditType: "Freezone",
    count: [
      { name: "ARAMEX" }, { name: "Naquel Logistics" }, { name: "Shadowfax" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 17, name: "Patricia White", first_name: "Patricia", last_name: "White", 
    email: "patricia.white@example.com", role: 'manager', phoneNumber: "+971 50 123 4517",
    auditType: "Mainland",
    count: [
      { name: "Nancy Thompson" }, { name: "Karen Martinez" }, { name: "Betty Walker" },
      { name: "Dorothy King" }, { name: "Lisa Martin" }
    ]
  },
  {
    id: 18, name: "Samuel Lewis", first_name: "Samuel", last_name: "Lewis", 
    email: "samuel.lewis@example.com", role: 'auditor', phoneNumber: "+971 50 123 4518", 
    auditType: "Mainland",
    count: [
      { name: "XPRESSBEES" }, { name: "DTDC" }, { name: "Naquel Logistics" },
      { name: "Shadowfax" }, { name: "First Flight" }, { name: "Zajel" }
    ]
  },
  {
    id: 19, name: "Olivia Hall", first_name: "Olivia", last_name: "Hall", 
    email: "olivia.hall@example.com", role: 'manager', phoneNumber: "+971 50 123 4519",
    auditType: "Warehouse",
    count: [
      { name: "Matthew Garcia" }, { name: "Anthony Young" }, { name: "Samuel Lewis" },
      { name: "Ethan Scott" }, { name: "Ayaan Sheikh" }
    ]
  },
  {
    id: 20, name: "Ethan Scott", first_name: "Ethan", last_name: "Scott", 
    email: "ethan.scott@example.com", role: 'auditor', phoneNumber: "+971 50 123 4520", 
    auditType: "Broker/Agent",
    count: [
      { name: "GATI" }, { name: "XpressBees" }, { name: "First Flight" },
      { name: "Zajel" }, { name: "Fetchr" }, { name: "Naquel Logistics" }
    ]
  },
  {
    id: 21, name: "Ayaan Sheikh", first_name: "Ayaan", last_name: "Sheikh", 
    email: "ayaan.sheikh@example.com", role: 'manager', phoneNumber: "+971 50 123 4521",
    auditType: "Freezone",
    count: [
      { name: "Fatima Noor" }, { name: "Omar Hussain" }, { name: "Layla Khan" },
      { name: "Zaid Farooq" }, { name: "Mariam Ali" }
    ]
  },
  {
    id: 22, name: "Fatima Noor", first_name: "Fatima", last_name: "Noor", 
    email: "fatima.noor@example.com", role: 'auditor', phoneNumber: "+971 50 123 4522", 
    auditType: "Mainland",
    count: [
      { name: "DHL" }, { name: "FedEx" }, { name: "UPS" },
      { name: "Aramex" }, { name: "Delhivery" }, { name: "GATI" }
    ]
  },
  {
    id: 23, name: "Omar Hussain", first_name: "Omar", last_name: "Hussain", 
    email: "omar.hussain@example.com", role: 'manager', phoneNumber: "+971 50 123 4523",
    auditType: "Warehouse",
    count: [
      { name: "Layla Khan" }, { name: "Zaid Farooq" }, { name: "Mariam Ali" },
      { name: "Hamza Tariq" }, { name: "Aisha Yousuf" }
    ]
  },
  {
    id: 24, name: "Layla Khan", first_name: "Layla", last_name: "Khan", 
    email: "layla.khan@example.com", role: 'auditor', phoneNumber: "+971 50 123 4524", 
    auditType: "Warehouse",
    count: [
      { name: "FedEx" }, { name: "DHL" }, { name: "UPS" },
      { name: "Aramex" }, { name: "Delhivery" }, { name: "GATI" }
    ]
  },
  {
    id: 25, name: "Zaid Farooq", first_name: "Zaid", last_name: "Farooq", 
    email: "zaid.farooq@example.com", role: 'manager', phoneNumber: "+971 50 123 4525",
    auditType: "Broker/Agent",
    count: [
      { name: "Mariam Ali" }, { name: "Hamza Tariq" }, { name: "Aisha Yousuf" },
      { name: "Bilal Ahmed" }, { name: "Noor Fatima" }
    ]
  },
  {
    id: 26, name: "Mariam Ali", first_name: "Mariam", last_name: "Ali", 
    email: "mariam.ali@example.com", role: 'auditor', phoneNumber: "+971 50 123 4526", 
    auditType: "Broker/Agent",
    count: [
      { name: "XpressBees" }, { name: "First Flight" }, { name: "Zajel" },
      { name: "Fetchr" }, { name: "Naquel Logistics" }, { name: "Shadowfax" }
    ]
  },
  {
    id: 27, name: "Hamza Tariq", first_name: "Hamza", last_name: "Tariq", 
    email: "hamza.tariq@example.com", role: 'manager', phoneNumber: "+971 50 123 4527",
    auditType: "Freezone",
    count: [
      { name: "Aisha Yousuf" }, { name: "Bilal Ahmed" }, { name: "Noor Fatima" },
      { name: "Ali Raza" }, { name: "Zara Hussain" }
    ]
  },
  {
    id: 28, name: "Aisha Yousuf", first_name: "Aisha", last_name: "Yousuf", 
    email: "aisha.yousuf@example.com", role: 'auditor', phoneNumber: "+971 50 123 4528", 
    auditType: "Freezone",
    count: [
      { name: "Delhivery" }, { name: "GATI" }, { name: "XpressBees" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 29, name: "Bilal Ahmed", first_name: "Bilal", last_name: "Ahmed", 
    email: "bilal.ahmed@example.com", role: 'manager', phoneNumber: "+971 50 123 4529",
    auditType: "Mainland",
    count: [
      { name: "Noor Fatima" }, { name: "Ali Raza" }, { name: "Zara Hussain" },
      { name: "Sami Malik" }, { name: "Huda Sheikh" }
    ]
  },
  {
    id: 30, name: "Noor Fatima", first_name: "Noor", last_name: "Fatima", 
    email: "noor.fatima@example.com", role: 'auditor', phoneNumber: "+971 50 123 4530", 
    auditType: "Warehouse",
    count: [
      { name: "Naquel Logistics" }, { name: "Shadowfax" }, { name: "XpressBees" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 31, name: "Ali Raza", first_name: "Ali", last_name: "Raza", 
    email: "ali.raza@example.com", role: 'manager', phoneNumber: "+971 50 123 4531",
    auditType: "Warehouse",
    count: [
      { name: "Zara Hussain" }, { name: "Sami Malik" }, { name: "Huda Sheikh" },
      { name: "Ibrahim Siddiqui" }, { name: "Sara Khan" }
    ]
  },
  {
    id: 32, name: "Zara Hussain", first_name: "Zara", last_name: "Hussain", 
    email: "zara.hussain@example.com", role: 'auditor', phoneNumber: "+971 50 123 4532", 
    auditType: "Mainland",
    count: [
      { name: "Shadowfax" }, { name: "Naquel Logistics" }, { name: "XpressBees" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 33, name: "Sami Malik", first_name: "Sami", last_name: "Malik", 
    email: "sami.malik@example.com", role: 'manager', phoneNumber: "+971 50 123 4533",
    auditType: "Broker/Agent",
    count: [
      { name: "Huda Sheikh" }, { name: "Ibrahim Siddiqui" }, { name: "Sara Khan" },
      { name: "Yusuf Ali" }, { name: "Ameera Hassan" }
    ]
  },
  {
    id: 34, name: "Huda Sheikh", first_name: "Huda", last_name: "Sheikh", 
    email: "huda.sheikh@example.com", role: 'auditor', phoneNumber: "+971 50 123 4534", 
    auditType: "Broker/Agent",
    count: [
      { name: "Delhivery" }, { name: "GATI" }, { name: "XpressBees" },
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" }
    ]
  },
  {
    id: 35, name: "Ibrahim Siddiqui", first_name: "Ibrahim", last_name: "Siddiqui", 
    email: "ibrahim.siddiqui@example.com", role: 'manager', phoneNumber: "+971 50 123 4535",
    auditType: "Freezone",
    count: [
      { name: "Sara Khan" }, { name: "Yusuf Ali" }, { name: "Ameera Hassan" },
      { name: "Danish Khan" }, { name: "Leena Ahmed" }
    ]
  },
  {
    id: 36, name: "Sara Khan", first_name: "Sara", last_name: "Khan", 
    email: "sara.khan@example.com", role: 'auditor', phoneNumber: "+971 50 123 4536", 
    auditType: "Warehouse",
    count: [
      { name: "DHL" }, { name: "FedEx" }, { name: "UPS" },
      { name: "Aramex" }, { name: "Delhivery" }, { name: "GATI" }
    ]
  },
  {
    id: 37, name: "Yusuf Ali", first_name: "Yusuf", last_name: "Ali", 
    email: "yusuf.ali@example.com", role: 'manager', phoneNumber: "+971 50 123 4537",
    auditType: "Mainland",
    count: [
      { name: "Ameera Hassan" }, { name: "Danish Khan" }, { name: "Leena Ahmed" },
      { name: "Raja Kumar" }, { name: "John Smith" }
    ]
  },
  {
    id: 38, name: "Ameera Hassan", first_name: "Ameera", last_name: "Hassan", 
    email: "ameera.hassan@example.com", role: 'auditor', phoneNumber: "+971 50 123 4538", 
    auditType: "Freezone",
    count: [
      { name: "UPS" }, { name: "DHL" }, { name: "FedEx" },
      { name: "Aramex" }, { name: "Delhivery" }, { name: "GATI" }
    ]
  },
  {
    id: 39, name: "Danish Khan", first_name: "Danish", last_name: "Khan", 
    email: "danish.khan@example.com", role: 'manager', phoneNumber: "+971 50 123 4539",
    auditType: "Mainland",
    count: [
      { name: "Leena Ahmed" }, { name: "Raja Kumar" }, { name: "John Smith" },
      { name: "Michael Brown" }, { name: "Emily Davis" }
    ]
  },
  {
    id: 40, name: "Leena Ahmed", first_name: "Leena", last_name: "Ahmed", 
    email: "leena.ahmed@example.com", role: 'auditor', phoneNumber: "+971 50 123 4540", 
    auditType: "Mainland",
    count: [
      { name: "First Flight" }, { name: "Zajel" }, { name: "Fetchr" },
      { name: "Naquel Logistics" }, { name: "Shadowfax" }, { name: "XpressBees" }
    ]
  }
];

export default mockUsers;