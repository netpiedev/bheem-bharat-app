const axios = require("axios");
const ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MmU3YWQ4OS1lMjY1LTRlNjgtYmExZC0wZmVjMTJjNTIzNTgiLCJwaG9uZSI6Im1hc3RlckBiaGVlbWJoYXJhdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzExNjQ4NzEsImV4cCI6MTc3MTc2OTY3MX0.q_y_m2rEFilbcnzVlIIGtoKxULSgRf22gnYhDXaWAio"; // put your token here
const BASE_URL = "https://api.bheembharat.com/api/jobs"; // 

const cities = [
  "Mumbai, India",
  "Delhi, India",
  "Hyderabad, India",
  "Chennai, India",
  "Pune, India",
  "Kolkata, India",
  "Ahmedabad, India",
  "Jaipur, India",
  "Surat, India",
  "Lucknow, India",
  "Chandigarh, India",
  "Bhopal, India",
  "Indore, India",
  "Patna, India",
  "Coimbatore, India",
  "Nagpur, India",
  "Vadodara, India",
  "Visakhapatnam, India",
  "Ranchi, India",
  "Guwahati, India",
  "Noida, India",
  "Gurgaon, India",
  "Mysore, India",
  "Trivandrum, India",
  "Kanpur, India",
  "Raipur, India",
  "Jodhpur, India",
  "Amritsar, India",
  "Dehradun, India",
  "Shillong, India"
];

const roles = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "QA Engineer",
  "Mobile App Developer",
  "Data Analyst",
  "Cloud Engineer"
];

const jobTypes = ["remote", "hybrid", "onsite"];

const jobs = cities.map((city, index) => ({
  title: roles[index % roles.length] + ` - ${city.split(",")[0]}`,
  description:
    "We are hiring talented professionals with strong technical knowledge and team collaboration skills. Experience in modern tools and frameworks is required. Apply now to join our growing team.",
  salary: `₹${6 + index},00,000 - ₹${10 + index},00,000`,
  location: city,
  type: jobTypes[index % 3],
}));

async function createJobs() {
  for (let i = 0; i < jobs.length; i++) {
    try {
      const response = await axios.post(BASE_URL, jobs[i], {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`✅ Created: ${response.data.data.title}`);
    } catch (error) {
      console.error(
        `❌ Error:`,
        error.response?.data || error.message
      );
    }
  }

  console.log("🎉 30 additional jobs created successfully!");
}

createJobs();
