# SwasthyaID – A Digital Health Record Management System for Migrant Workers in Kerala

[![GitHub Repo](https://img.shields.io/badge/GitHub-Swasthyaid-blue?logo=github)](https://github.com/siddharthvarpe086/swasthyaid) 

Live Link:
https://swasthyaid.vercel.app 

## Project Overview  
**SwasthyaID** is a digital health record management system designed for **migrant workers in Kerala, India**.  
The **Last 4 digits of Adhar ID and first two lettes of Worker's name** will act as a **Unique health identity**. because that number doesn't change once the Adhar Card is created.  
This ensures that medical records are always available—whether the worker changes jobs, moves locations, or visits a new doctor.  

The system improves healthcare access, reduces disease risks, and supports the **United Nations Sustainable Development Goals (SDGs)**.  

## Problem Statement  
There could be around 4.8 million migrant workers in the state by 2023.
Every year, the migrant worker population in Kerala increases by **2.35 lakh (235,000) people**.  
But the reality is:  
- Many workers still **do not have a permanent health record**.  
- When workers move from one place to another, their medical history is lost.  
- Language barriers make it difficult to understand prescriptions and vaccines.  
- Without proper records, they can unknowingly **spread infections & Diseases**.  
- Governments and hospitals lack accurate data for **planning health policies**.  


## Proposed Solution 
~Every migrant worker's **Last 4 digits of Adhar ID and first two lettes of your name** act as their **Unique Health ID**, which becomes their digital health identity.

~Workers can log in using the OTP on a web app to access their medical history, prescriptions, and vaccination records in their own language.

~Doctors and hospitals can use the same ID to **update health records** — adding prescriptions, diagnoses, visit notes, and follow-up appointments.

~All data is securely stored in **Supabase (auth + database) with strict role-based access**.

~A government/admin dashboard gives a big-picture view of worker health, outbreak monitoring, and vaccination coverage.

~The system also has AI-powered features: summarizing prescriptions and medical reports in local languages, detecting health risk clusters (e.g., fever cases in one area), and a simple chatbot for worker queries.

## Our Features  

### For Migrant Workers  
- **Unique Health ID** → **Last 4 digits of Adhar ID and first two lettes of your name** which gives them quick access to their health records. (No exposure of complete Adhar Number)
- **Login with Adhar id and unique health ID (Supabase Auth)** → Worker can login using Adhar card and unique health ID of the worker.  
- **Multilingual Support** → Available in multiple languages of india specially the languages used in kerala.  
- **Personal Records** → See or download prescriptions, test reports, vaccination details,and medical records.  
- **Nearby hospital** → Locate nearby healthcare centers.
- **AI summarizer**  → To translate the medical documents into simple understandable language
- **Audio support**  → For Illiterate workers who don't know read and write.

### For Healthcare Workers  
- Doctors Login with their government **NMR ID** (e.g., MH/12345/2021)
- If the hospital or the doctor is private then they have to register themselves on the SwasthyaID portal. Then they will get the unique ID for login into hospital portal. (Ex., PVTHPTL-1234)
- Use the worker’s **Unique ID** to access their profile.
- Add and update:
  - Prescriptions  
  - Visit date  
  - Diagnosis  
  - Additional notes  
  - Next appointment date
  - Medical documents (document format e.g. pdf) 

### For Government / Admins  
- Real-time dashboard for **disease monitoring and outbreak alerts**.  
- District-wise distribution of workers and health trends.  
- Vaccination coverage and policy planning insights.
- District-wise health status visualization.

## Tech Stack  
- **Frontend:** Vite, TypeScript, React  
- **UI Components:** shadcn-ui, Tailwind CSS  
- **Authentication & Database:** Supabase  
- **AI Integration:** Gemini API (for document and prescription summarization)
- **Google maps API:** Find nearby Government hospitals/Private hospitals

## Authentication & Database:
-Adhar login

-Last 4 digits of Adhar ID and first two lettes of worker's name as a Unique Health ID

-Supabase for login and authentication

## Demo Credentials (for testing)

**Migrant Workers:**
| Worker           |  Unique ID  |
| ---------------- | ------------|
| Migrant Worker 1 |   MI3946    |
| Migrant Worker 2 |   MI2946    |
| Migrant Worker 3 |   MI6401    |

👉 Use these **Unique IDs** to access the health data of registered workers.

**Government Doctors:**
| Doctor           |    Doctor ID   |
| ---------------- | ---------------|
| Gov Doctor 1     |  KL/12345/2021 |
| Gov Doctor 2     |  KL/08763/2025 |
| GOv Doctor 3     |  KL/67542/2024 |

👉 Use these **Unique IDs** to login as Government doctor and acces the hospital portal to update worker's data.

**Private Doctors:**
| Doctor           |    Doctor ID   |
| ---------------- | ---------------|
| PVT Doctor 1     |   PVTHPTL-123  |
| PVT Doctor 2     |   PVTHPTL-456  |
| PVT Doctor 3     |   PVTHPTL-789  |

👉 Use these **Unique IDs** to login as Private doctor and acces the hospital portal to update worker's data.

~The doctor can use this **unique ID** to access their profile and add new medical records and data to the worker's profile.

## Installation & Setup  

This project was built on **[Lovable](https://lovable.dev/)**, which makes deployment quick and simple.  
If you want to run it locally:  

1. **Clone the Repository**  
```bash
   git clone https://github.com/siddharthvarpe086/swasthyaid.git
```
```bash
   cd swasthyaid
```

2. **Install Dependencies**
```bash
   npm install
```
3. **Set Up Environment Variables**
   Create a `.env` file in the root folder:
```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   
   VITE_SUPABASE_KEY=your_supabase_anon_key
   
   VITE_GEMINI_API_KEY=your_gemini_api_key
```
## Usage Guide 
**Migrant Workers:**
1) Worker have to register on the swasthyaID portal.
2) They will get the Unique ID.
3) Now they can use this Unique ID anywhere to acces their medical records
4) To view their complete profile, they can login by Adhar ID system

**Doctors-PVT/GOV:**
1) If the doctor is govrnment then can easily login.
2) If the doctor is Private then have to register first.
3) Private doctor then will get a unique ID for login.
4) Login using IDs.
5) Search for the worker by using worker's ID.
6) Update the records.

**Government of Kerala:**
1) Can login through Government credentials (Fixed).
2) Get the overall data of the Kerala State.


## Future Roadmap

**Government API integration**
1) MyHealthfinder API
2) HealthData.gov
3) Open Data NHS Scotland API
4) CMS.gov API
5) ABHA Integration

**AI Integrations**
1) Medical Image & Report Analysis
2) Anomaly Detection in Prescriptions & Record.
3) AI for Emergency Triage & Decision Support

## Security & Privacy
- Role based access
- No exposure of complete AdharCard ID
- Secured registration and logins with supabase
- Encrypted data

## Team Neuron
1) Siddharth Varpe
2) Pratikasha Gavhale
3) Nisha Lende
4) Samyak Mehta
5) Kartik Vaidya
6) Aniket Chitre


## References

* [Ayushman Bharat Digital Health ID (ABHA)](https://healthid.ndhm.gov.in/)
* [Kerala eHealth Project](https://ehealth.kerala.gov.in/)
* [Supabase Docs](https://supabase.com/docs)
* [shadcn/ui](https://ui.shadcn.com/)

 
 ## Acknowledgements

We would like to sincerely thank the following for their support and inspiration in building *SwasthyaID*:

**Smart India Hackathon (SIH) Organizers** – for providing the platform to solve real-world healthcare challenges.

**Government of India (MoHFW & NHA initiatives)** – for driving digital health adoption through programs like Ayushman Bharat Digital Mission (ABDM).

**eHealth Portal of kerala Government** -  Policy guidance and requirements

**Open-Source Community** – React, Vite, Tailwind CSS, shadcn-ui, and Supabase communities for their powerful tools and documentation.

**Google Gemini AI** – for enabling intelligent features like multilingual support and ID generation.

**Healthcare Professionals & Migrant Worker Community** – for highlighting the real challenges of accessibility and continuity of care.

**Our Mentors, Guides, and Faculty** – for their constant guidance and feedback during the development of this project.
