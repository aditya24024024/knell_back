import geoip from "geoip-lite";

const currencyMap = {
  IN: { symbol: "₹", code: "INR", rate: 1 },
  US: { symbol: "$", code: "USD", rate: 0.012 },
  GB: { symbol: "£", code: "GBP", rate: 0.0096 },
  EU: { symbol: "€", code: "EUR", rate: 0.011 },
  // add more if needed
};

export const detectCurrency = (req, res, next) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress;

    const geo = geoip.lookup(ip);
    const countryCode = geo?.country || "IN"; // default to India

    req.currency = currencyMap[countryCode] || currencyMap["IN"];
    next();
  } catch (err) {
    console.error("Currency detection error:", err);
    req.currency = currencyMap["IN"];
    next();
  }
};
