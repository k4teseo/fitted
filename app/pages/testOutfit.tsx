import React, { useState } from "react";
import { View, Button, Text, Image } from "react-native";
import { analyzeOutfit } from "../components/openaiVision";

const TestOutfit = () => {
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const testImageUri = 'https://www.mademois-elle.com/img21/OOTW_summer23_1.jpg';

  const handleTest = async () => {
    setLoading(true);
    try {
      const outfitDetails = await analyzeOutfit(testImageUri);
      console.log("Outfit Analysis Result:", outfitDetails);

      // Ensure result is always an array to avoid .length errors
      setResult(Array.isArray(outfitDetails) ? outfitDetails : []);
    } catch (error) {
      console.error("Error analyzing outfit:", error);
      setResult([]); // Ensure result is reset on error
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Image 
        source={{ uri: testImageUri }} 
        style={{ width: 200, height: 250, marginBottom: 10 }} 
      />
      <Button title="Test Analyze Outfit" onPress={handleTest} />
      {loading && <Text>Analyzing...</Text>}
      {result.length > 0 ? (
        <View>
          <Text>Outfit Details:</Text>
          {result.map((item, index) => (
            <Text key={index}>- {item}</Text>
          ))}
        </View>
      ) : !loading && <Text>No outfit details found.</Text>}
    </View>
  );
};

export default TestOutfit;