module.exports = {
  "presets": ['module:@react-native/babel-preset'],
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["./src"],
        "extensions": [".ts", ".tsx", ".jsx", ".js", ".json"],
        "alias": {
          "@assets": "./src/assets",
          "@components": "./src/components",
          "@navigators": "./src/navigators",
          "@network": "./src/network",
          "@screens": "./src/screens",
          "@store": "./src/store",
          "@utils": "./src/utils",
          "@config": "./src/config",
          "@i18n": "./i18n"
        }
      }
    ]
  ]
};