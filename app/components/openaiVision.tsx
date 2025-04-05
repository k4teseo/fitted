import { ChatOpenAI } from "@langchain/openai"; 
import { PromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";
import Constants from "expo-constants";

// Function to analyze outfit details
export const analyzeOutfit = async (imageUri: string): Promise<string[]> => {
    try {
        const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing OpenAI API Key");
        }

        // Initialize OpenAI Vision Model
        const model = new ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.6,
            openAIApiKey: apiKey
        });

        // Define a prompt template
        const prompt = PromptTemplate.fromTemplate(`
            Analyze the provided outfit image and extract key clothing details.
            Return the response strictly as a JSON array with no Markdown, no code block formatting, and no explanations.

            Example Output:
            ["red hoodie", "Nike sneakers", "denim jeans"]
        `);

        // Generate metadata
        const metadata = await model.invoke([
            new HumanMessage({
                content: [
                    { type: "text", text: await prompt.format({}) },
                    { type: "image_url", image_url: { url: imageUri } }, 
                ],
            }),
        ]);

        console.log("AI Raw Response:", metadata);
        console.log("metadata.content Type:", typeof metadata.content);
        console.log("metadata.content Value:", metadata.content);

        // Directly parse metadata.content since it's already a stringified JSON array
        if (typeof metadata.content === "string") {
            try {
                const parsedData = JSON.parse(metadata.content);
                if (Array.isArray(parsedData)) {
                    console.log("Parsed Outfit Data:", parsedData);
                    return parsedData;
                }
            } catch (jsonError) {
                console.error("Error parsing JSON:", jsonError);
            }
        }

        return []; 

    } catch (error) {
        console.error("Error analyzing outfit:", error);
        return [];
    }
};