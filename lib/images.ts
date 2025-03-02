import { supabase } from './supabase';
import Constants from 'expo-constants';

interface Image {
    id: string;
    image_path: string;
    caption: string;
}

interface UploadedImage {
    id: string;
    imageUrl: string;
    caption: string;
}

const supabaseUrl = Constants.expoConfig?.extra?.databaseUrl;

// Define the base Supabase Storage URL
const SUPABASE_STORAGE_URL = `${supabaseUrl}/storage/v1/object/public`;

// Upload Image & Store Metadata
export const uploadImageWithCaption = async (file: File, caption: string): Promise<Image | null> => {
    if (!file) return null;

    const filePath = `public/${file.name}`;

    // Upload the image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
    }

    // Insert image path and caption into the database
    const { data: insertData, error: insertError } = await supabase
        .from('images')
        .insert([{ image_path: uploadData.path, caption }])
        .select('*')
        .single();

    if (insertError) {
        console.error('Database insert error:', insertError);
        return null;
    }

    return insertData;
};

// Fetch Images & Captions
export const getImagesWithCaptions = async (): Promise<UploadedImage[]> => {
    const { data, error } = await supabase.from('images').select('*');

    if (error) {
        console.error('Fetch error:', error);
        return [];
    }

    return data.map((image: Image) => ({
        id: image.id,
        // Construct the public URL directly here
        imageUrl: `${SUPABASE_STORAGE_URL}/images/${image.image_path}`,
        caption: image.caption,
    }));
};