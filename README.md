# Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️

**সিরাজগঞ্জ সুরক্ষা** একটি এআই-চালিত এবং ইভেন্ট-ভিত্তিক "District-Scale Mission-Critical Emergency Infrastructure"। এটি দুর্যোগপূর্ণ এলাকায় জননিরাপত্তা এবং দ্রুত ত্রাণ কার্য পরিচালনার জন্য একটি আধুনিক সমাধান।

## 🚀 মূল বৈশিষ্ট্যসমূহ (Core Features)

- **Offline-First Survival Mode:** `DisasterStorage` লেয়ারের মাধ্যমে ইন্টারনেট বিচ্ছিন্ন অবস্থায়ও অ্যাপটি কার্যকরী থাকে এবং কানেকশন ফিরলে অটো-সিঙ্ক হয়।
- **Autonomous Dispatcher Engine:** Google Genkit AI ব্যবহার করে দ্রুততম এবং সবচেয়ে উপযুক্ত রেসপন্ডার (পুলিশ, ফায়ার সার্ভিস, মেডিকেল) নির্বাচন।
- **Forensic-Ready Audit Trails:** `audit_trails` কালেকশনের মাধ্যমে প্রতিটি ইমার্জেন্সি রেসপন্সের একটি অপরিবর্তনীয় রেকর্ড রাখা হয়।
- **Live Video Verification:** WebRTC সিগন্যালিং ব্যবহার করে ভুয়া অ্যালার্ট শনাক্তকরণ এবং লাইভ ভেরিফিকেশন।
- **Real-time Event Pipeline:** যমুনা নদীর পানির স্তর মনিটর করে বিপদসীমায় পৌঁছালে অটোমেটেড অ্যালার্ট ট্রিগার।
- **RBAC Security:** প্রোডাকশন-গ্রেড ফায়ারবেস সিকিউরিটি রুলস যা নাগরিকের তথ্য সুরক্ষা নিশ্চিত করে।

## 🛠️ টেক স্ট্যাক (Tech Stack)

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, ShadCN UI.
- **Backend/Database:** Firebase Firestore, Firebase Authentication.
- **AI/GenAI:** Google Genkit, Gemini 2.5 Flash.
- **Real-time Communication:** WebRTC for live signaling.
- **Persistence:** LocalStorage based DisasterStorage for offline resilience.

## 📂 প্রজেক্ট স্ট্রাকচার (Project Structure)

- `src/ai/flows/`: Genkit AI ফ্লো যা বন্যা ঝুঁকি এবং রেসপন্ডার সাজেস্ট করে।
- `src/lib/webrtc-signaling.ts`: লাইভ ভিডিও কলের জন্য সিগন্যালিং সার্ভিস।
- `src/lib/disaster-storage.ts`: অফলাইন ডেটা হ্যান্ডলিং ও সিঙ্ক্রোনাইজেশন লজিক।
- `src/components/dashboard/`: ডিসপ্যাচার কনসোল এবং সিটিজেন ড্যাশবোর্ড কম্পোনেন্টস।
- `firestore.rules`: প্রোডাকশন-গ্রেড ডেটা সিকিউরিটি পলিসি।

## 📈 ভ্যালু প্রপোজিশন (Value Proposition)

1. **Resiliency:** চরম দুর্যোগেও এটি অচল হয় না।
2. **Accountability:** প্রশাসনের প্রতিটি পদক্ষেপের স্বচ্ছতা নিশ্চিত করে।
3. **Efficiency:** এআই-এর মাধ্যমে সিদ্ধান্ত গ্রহণের সময় কমিয়ে আনে যা জীবন বাঁচাতে সাহায্য করে।

## 🔮 ভবিষ্যৎ পরিকল্পনা (Future Roadmap)

- **Drone Integration:** চরাঞ্চলে ড্রোনের মাধ্যমে ভেরিফিকেশন ও লাইভ ফিড।
- **National Scale:** সিরাজগঞ্জ থেকে শুরু করে পুরো বাংলাদেশে দুর্যোগ ব্যবস্থাপনা নেটওয়ার্ক হিসেবে প্রসারণ।
- **Predictive Analytics:** হিস্টোরিক্যাল ডেটা ব্যবহার করে সম্ভাব্য দুর্যোগের পূর্বাভাস প্রদান।

---

**Developed with ❤️ for Sirajganj District Administration.**
