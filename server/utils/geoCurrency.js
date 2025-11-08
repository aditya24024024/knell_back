import axios from "axios";

// Detect currency from IP
export async function getCurrencyFromIP(ip) {
  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);
    const country = data.country_name || "India";
    const currency = data.currency || "INR";
    return { country, currency };
  } catch (err) {
    console.error("GeoCurrency error:", err.message);
    return { country: "India", currency: "INR" };
  }
}

// Convert INR → targetCurrency
export async function convertCurrency(amountINR, targetCurrency) {
  if (targetCurrency === "INR") return amountINR;
  try {
    const { data } = await axios.get(
      `https://api.exchangerate.host/convert?from=INR&to=${targetCurrency}&amount=${amountINR}`
    );
    return data.result || amountINR;
  } catch (err) {
    console.error("Conversion failed:", err.message);
    return amountINR;
  }
}
