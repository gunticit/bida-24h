module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@api': './src/api',
          '@store': './src/store',
          '@screens': './src/screens',
          '@nav': './src/navigation',
          '@utils': './src/utils',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
  ],
};
