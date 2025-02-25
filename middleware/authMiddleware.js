const tokenController = require('../controllers/tokenController');
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.redirect('/login?message=No access token provided');
    }

    const userData = tokenController.validateAccessToken(accessToken);
    if (!userData) {
      return res.redirect('/login?message=Please login');
    }

    req.user = userData;
    next();
  } catch (error) {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.redirect('/login?message=Unauthorized');
  }
};

module.exports = authenticate;