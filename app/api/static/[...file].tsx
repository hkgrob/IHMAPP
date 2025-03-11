
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function StaticFileView() {
  const { file } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Serving file: {file}</Text>
    </View>
  );
}
