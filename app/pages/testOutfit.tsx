import React, { useState } from "react";
import { View, Button, Text, Image } from "react-native";
import { analyzeOutfit } from "../components/openaiVision"; // Import your function

const TestOutfit = () => {
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const testImageUri = require("../../assets/images/outfit.png");

  const handleTest = async () => {
    setLoading(true);
    const outfitDetails = await analyzeOutfit(testImageUri);
    setResult(outfitDetails);
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Test Analyze Outfit" onPress={handleTest} />
      {loading && <Text>Analyzing...</Text>}
      {result.length > 0 && (
        <View>
          <Text>Outfit Details:</Text>
          {result.map((item, index) => (
            <Text key={index}>- {item}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default TestOutfit;
