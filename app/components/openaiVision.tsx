import { ChatOpenAI } from "@langchain/openai"; 
import { PromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

// Function to analyze outfit details
export const analyzeOutfit = async (imageUri: string): Promise<string[]> => {
    try {
        // Initialize OpenAI Vision Model
        const model = new ChatOpenAI({
            modelName: "gpt-4-vision-preview",
            temperature: 0.6,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        // Define a prompt template
        const prompt = PromptTemplate.fromTemplate(`
            Analyze the provided outfit image and extract key clothing details.
            Return the output as an array of relevant outfit descriptions.

            Example Output:
            ["red hoodie", "Nike sneakers", "denim jeans"]
        `);

        // Generate metadata
        const metadata = await model.invoke([
            new HumanMessage({
                content: [
                    { type: "text", text: await prompt.format({}) },
                    { type: "image_url", image_url: imageUri }, // Pass image directly
                ],
            }),
        ]);

        console.log("AI Response:", metadata.content);

        if (Array.isArray(metadata.content) && metadata.content.length > 0 && 'text' in metadata.content[0]) {
            return JSON.parse(metadata.content[0].text);
        } else {
            throw new Error("Unexpected response format from AI model.");
        }
    } catch (error) {
        console.error("Error analyzing outfit:", error);
        return [];
    }
};