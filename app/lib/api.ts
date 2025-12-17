
export const API_URL = "http://localhost:8000"; 

export const enhanceResume = (data: any) => 
  fetch(`${API_URL}/resume/api/enhance-resume`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });

export const generatePDF = (data: any) => 
  fetch(`${API_URL}/resume/api/generate-pdf`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });