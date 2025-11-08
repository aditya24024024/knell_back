import axios from "axios";

export const currencyMiddleware = async (req, res, next) => {
  try {
    const forwardedFor = req.headers["x-forwarded-for"];
    const clientIp =
      (forwardedFor && forwardedFor.split(",")[0]) || req.socket.remoteAddress;

    let country = "IN";
    let currency = "INR";

    // 🔍 Use ipapi.co (no API key needed)
    const { data } = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    if (data && data.country_code) {
      country = data.country_code;
    }

    // 🌍 map common countries to their currencies
    const currencyMap = {
      US: "USD",
      GB: "GBP",
      AE: "AED",
      EU: "EUR",
      CA: "CAD",
      AU: "AUD",
    };

    if (currencyMap[country]) {
      currency = currencyMap[country];
    }

    req.userCurrency = currency;
    next();
  } catch (err) {
    console.error("Currency detection failed:", err.message);
    req.userCurrency = "INR";
    next();
  }
};
