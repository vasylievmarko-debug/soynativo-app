const React = require('react');
const { View } = require('react-native-web');

const SafeAreaView = React.forwardRef(function SafeAreaView(props, ref) {
  const { edges, ...rest } = props;
  return React.createElement(View, { ref, ...rest });
});

const SafeAreaProvider = ({ children }) => children;

module.exports = {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext: React.createContext({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  initialWindowMetrics: { insets: { top: 0, right: 0, bottom: 0, left: 0 }, frame: { x: 0, y: 0, width: 0, height: 0 } },
};
