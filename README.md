# Fitted 👗  

Fitted is a fashion-focused social platform where users can post daily outfit photos, tag brands, and share their style with friends. Designed for casual posting and one-on-one interactions, Fitted makes exploring personal style and finding inspiration effortless and fun.

Built with **React Native, TypeScript, and Expo**, Fitted provides a seamless user experience, leveraging **Supabase** as its backend for authentication, storage, and database management.  

---

## 🚀 Features  
- 📸 **Post Your Outfit** – Upload daily outfit photos and add brand tags.  
- 🏷 **Tag Clothing Items** – Label each item with its brand for easy outfit tracking.  
- 👥 **Social Sharing** – Share outfits with friends and view their posts.  
- 🔐 **Secure Authentication** – Sign up and log in with Supabase authentication.  
- ☁️ **Cloud Storage** – Store outfit images in Supabase Storage.  
- 🏠 **Personalized Feed** – Scroll through a feed of your friends’ outfits.  
- 🔎 **Explore Trends** – Discover trending styles and fashion inspiration.  

---

## 🛠 Tech Stack  

### **Frontend**  
- [React Native](https://reactnative.dev/) – Mobile app framework  
- [TypeScript](https://www.typescriptlang.org/) – Type-safe development  
- [Expo](https://expo.dev/) – Simplified React Native development  

### **Backend**  
- [Supabase](https://supabase.com/) – Backend-as-a-service (BaaS)  
  - **Auth** – User authentication  
  - **Database** – PostgreSQL with Row-Level Security (RLS)  
  - **Storage** – Image hosting for outfit posts  

---

## 📦 Installation & Setup  

### **1. Clone the Repository**  
```sh
git clone https://github.com/yourusername/fitted.git
cd fitted
```

### **2. Install Dependencies**
```sh
npm install
```

### **3. Install Expo CLI (If Not Installed)**
```sh
npm install -g expo-cli
```

### **4. Set Up Environment Variables**
```sh
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```


### **5. Start the Development Server**
```sh
npx expo start
```

### **6. If the App is Not Building**
```sh
npx expo start -c
```
