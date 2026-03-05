# **App Name**: SynqSports Pro

## Core Features:

- Secure User Authentication: Enable Google and Email/Password authentication. Manage user sessions and secure access based on their assigned role and clubId, with special bypass permissions for superadmins as specified.
- Club Registration & Profile Management: SuperAdmins can create, view, and update club profiles (clubId, configuration, logo, and subscription plan), ensuring data is stored in the 'clubs' Firestore collection.
- Club User Roster Management: Club Admins can invite, add, and modify user accounts (coach, tutor) within their specific club, assigning roles and ensuring clubId association is correctly maintained in the 'users' Firestore collection.
- Role-Based Access & Dashboard Routing: Implement dynamic routing post-login to direct users to their dedicated 'Micro-App' dashboard based on their role (superadmin, club_admin, coach, tutor), enforcing data access strictly by clubId via Firestore Security Rules.
- AI Training Plan Assistant: A generative AI tool designed to assist coaches in creating tailored training schedules and exercise recommendations for their athletes, considering sport type and athlete role.

## Style Guidelines:

- Primary color: A dynamic and professional blue (#266EE3) that evokes trust, technology, and performance, contrasting well with light backgrounds.
- Background color: A very light, subtly tinted off-white (#EFF3F8) to ensure clarity and provide a clean canvas for content.
- Accent color: A vibrant aqua-cyan (#31C6E1) that provides a fresh and energetic highlight for interactive elements and calls to action, complementing the primary blue.
- Headlines font: 'Space Grotesk' (sans-serif) for a modern, slightly technical, and clean aesthetic, fitting for a tech-driven platform. Body font: 'Inter' (sans-serif) for exceptional readability across various screen sizes and types, maintaining a professional look.
- Utilize a consistent set of minimalist, vector-based icons that visually represent sports, data analysis, team management, and user roles. Icons should be easily discernible and scalable.
- Adopt a clean, intuitive, and modular layout with ample whitespace to ensure efficient data consumption and navigation. Content should be organized into clearly defined cards or sections for easy management and readability on responsive designs.
- Incorporate subtle and smooth transitions for page navigation, loading states, and form submissions to enhance user experience without causing distractions. Focus on micro-interactions for button hovers and feedback to convey responsiveness.