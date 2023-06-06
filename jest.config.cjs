module.exports = {
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testPathIgnorePatterns: ["./node_modules/"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
};
