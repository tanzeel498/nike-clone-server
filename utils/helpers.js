function getUserData(user) {
  const { password, cart, ...userData } = user._doc;
  return userData;
}

module.exports = {
  getUserData,
};
