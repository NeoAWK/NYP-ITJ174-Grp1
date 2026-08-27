
  CREATE TABLE `users` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
    `name` VARCHAR(50) NOT NULL, 
    `email` VARCHAR(50) NOT NULL, 
    `password` VARCHAR(100) NOT NULL, 
    `mobileNo` VARCHAR(20), 
    `profilePicture` VARCHAR(100), 
    `isVerified` TINYINT(1) NOT NULL DEFAULT 0, 
    `verificationToken` VARCHAR(255), 
    `verificationTokenExpires` DATETIME, 
    `usertype` TEXT NOT NULL DEFAULT 'Learner', 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL
  );

  CREATE TABLE `learner_profiles` (
    `userId` INTEGER PRIMARY KEY REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
    `educationQualification` VARCHAR(50), 
    `areaOfInterest` VARCHAR(100), 
    `attachment` VARCHAR(255), 
    `enrolledCourse` VARCHAR(100), 
    `moduleHours` INTEGER DEFAULT 0, 
    `notStarted` TINYINT(1) DEFAULT 1, 
    `inProgress` TINYINT(1) DEFAULT 0, 
    `completed` TINYINT(1) DEFAULT 0
  );

  CREATE TABLE `trainer_profiles` (
    `userId` INTEGER PRIMARY KEY REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
    `areasOfExpertise` VARCHAR(100), 
    `resumeExperience` TEXT, 
    `qualifications` TEXT, 
    `certification` TEXT, 
    `experience` TEXT, 
    `experienceEntries` TEXT, 
    `professionalDevelopment` TEXT, 
    `certificationValidity` DATE, 
    `certificateFile` VARCHAR(255), 
    `certificateFiles` TEXT, 
    `providerId` INTEGER REFERENCES `users`(`id`) ON DELETE SET NULL
  );

  CREATE TABLE `training_providers` (
    `userId` INTEGER PRIMARY KEY REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
    `companyRegistrationId` VARCHAR(50), 
    `companyAddress` VARCHAR(120), 
    `postalCode` VARCHAR(20), 
    `companyWebsite` VARCHAR(255), 
    `mainFieldOfTraining` VARCHAR(100), 
    `proofOfCertification` TEXT, 
    `orgDetails` TEXT, 
    `telephoneNo` VARCHAR(20), 
    `emailAddress` VARCHAR(50), 
    `accreditationStatus` VARCHAR(50)
  );

  CREATE TABLE `Courses` (
    `CourseID` VARCHAR(255) NOT NULL PRIMARY KEY,
    `CourseTitle` VARCHAR(255) NOT NULL,
    `SubmissionStatus` VARCHAR(255) DEFAULT 'Pending',
    `ApprovalDate` DATETIME,
    `ApprovalExpiryDate` DATETIME,
    `IsActive` TINYINT(1) DEFAULT 0,
    `TrainerID` INTEGER REFERENCES `users`(`id`) ON DELETE SET NULL,
    `CourseLevel` VARCHAR(255) DEFAULT 'Foundation', 
    `Category` VARCHAR(255) DEFAULT 'General', 
    `Duration` VARCHAR(100) DEFAULT 'N/A', 
    `CourseFee` DECIMAL(10,2) DEFAULT 0.00,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL
  );

  CREATE TABLE `modules` (
    `ModuleID` VARCHAR(255) PRIMARY KEY, 
    `CourseID` VARCHAR(255) NOT NULL REFERENCES `Courses` (`CourseID`) ON DELETE CASCADE ON UPDATE CASCADE, 
    `ModuleTitle` VARCHAR(255) NOT NULL, 
    `ModuleDescription` TEXT NOT NULL, 
    `EstimatedHours` INTEGER NOT NULL, 
    `OrderSequence` INTEGER NOT NULL, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL
  );

  CREATE TABLE `AdminLogs` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
    `adminEmail` VARCHAR(255) NOT NULL, 
    `action` VARCHAR(255) NOT NULL, 
    `targetEntity` VARCHAR(255), 
    `details` TEXT, 
    `createdAt` DATETIME NOT NULL, 
    `updatedAt` DATETIME NOT NULL
  );

  CREATE TABLE `FormMetas` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `filePath` VARCHAR(255) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `isActive` BOOLEAN NOT NULL DEFAULT 1,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE Enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Or SERIAL PRIMARY KEY for PostgreSQL
    userId INT NOT NULL,
    courseId VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Enrolled',
    enrolledAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

  -- Password: P@ssw0rd 
  INSERT INTO `users` (`id`, `name`, `email`, `password`, `mobileNo`, `profilePicture`, `isVerified`, `verificationToken`, `verificationTokenExpires`, `usertype`, `createdAt`, `updatedAt`) VALUES 
  (2000, 'Admin Account', 'Admin@rightskills.local', '$2b$10$5s47/OzoBwG5FLU9Isvp.OL.NiXL5XMFqtPTSo3Kip5nvtGXUSCe2', NULL, NULL, 1, NULL, NULL, 'RightSkills', '2026-08-24 13:39:36.234 +00:00', '2026-08-26 10:52:39.847 +00:00'),
  (2001, 'Test Trainer', 'test.trainer@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 1, NULL, NULL, 'Trainer', '2026-08-24 13:39:36.538 +00:00', '2026-08-26 10:52:39.993 +00:00'),
  (3, 'Provider One', 'provider.one@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 1, NULL, NULL, 'TrainingProvider', '2026-08-26 05:54:27', '2026-08-26 05:54:27'),
  (4, 'Provider Two', 'provider.two@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 0, NULL, NULL, 'TrainingProvider', '2026-08-26 06:58:22', '2026-08-26 06:58:22'),
  (5, 'Trainer One', 'trainer.one@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 1, NULL, NULL, 'Trainer', '2026-08-26 06:58:22', '2026-08-26 06:58:22'),
  (6, 'Trainer Two', 'trainer.two@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 0, NULL, NULL, 'Trainer', '2026-08-26 06:58:22', '2026-08-26 09:45:54.040 +00:00'),
  (7, 'Learner One', 'learner.one@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 1, NULL, NULL, 'Learner', '2026-08-26 06:58:22', '2026-08-26 09:45:54.040 +00:00'),
  (8, 'Learner Two', 'learner.two@rightskills.local', '$2b$10$3bHugVK15H29.skXm85t0.stIfYgq87XuoeOyDbrxondRI38ffzuK', NULL, NULL, 1, NULL, NULL, 'Learner', '2026-08-26 06:58:22', '2026-08-26 09:45:54.040 +00:00');

  INSERT INTO `training_providers` (`userId`, `companyRegistrationId`, `companyAddress`, `postalCode`, `companyWebsite`, `mainFieldOfTraining`, `proofOfCertification`, `orgDetails`, `telephoneNo`, `emailAddress`, `accreditationStatus`) VALUES 
  (3, 'REG-123456', '221B Baker Street', 'SG 123456', 'wis.com', 'Liability Insurance', 'Yes', 'Test Training Provider Organization', '+65 9123 4567', 'provider@test.com', 'Active'),
  (4, 'REG-789012', '69 Tekong Road', 'SG 654321', 'goggle.com', 'Civil Liabilities', 'No', 'New Training Provider Organization', '+65 9876 5432', 'new.provider@rightskills.local', 'Active');

  INSERT INTO `trainer_profiles` (`userId`, `areasOfExpertise`, `resumeExperience`, `qualifications`, `certification`, `experience`, `experienceEntries`, `professionalDevelopment`, `certificationValidity`, `certificateFile`, `certificateFiles`, `providerId`) VALUES 
  (2001, 'Information Technology', '3 Years @ Cisco', 'Diploma in Applied Learning and Development', 'Certified Workplace Trainer', 'Three years delivering technical and workplace skills training.', NULL, 'Annual trainer development programme', '2028-12-31', NULL, NULL, 3),
  (5, 'Education', '60 years at Nanyang Poly', 'Bachelor in Education', 'Advanced Trainer Certification', '5 years of corporate training experience.', NULL, 'Ongoing professional development in e-learning', '2029-12-31', NULL, NULL, 3),
  (6, 'Architecture', 'Built the eiffel Tower', 'Master in Instructional Design', 'Certified e-Learning Specialist', '8 years designing and delivering technical courses.', NULL, 'Member of the International Training Federation', '2030-06-30', NULL, NULL, 4);

  INSERT INTO `Courses` (`CourseID`, `CourseTitle`, `SubmissionStatus`, `ApprovalDate`, `ApprovalExpiryDate`, `IsActive`, `TrainerID`, `CourseLevel`, `Category`, `Duration`, `CourseFee`, `createdAt`, `updatedAt`) VALUES 
  ('001', 'Advanced Python & AI Basics', 'Approved', '2026-08-24 13:39:36.702 +00:00', '2029-08-24 13:39:36.702 +00:00', 1, 2, 'Foundation', 'General', 'N/A', 300.00, '2026-08-24 13:39:36.702 +00:00', '2026-08-26 09:13:35.930 +00:00'),
  ('002', 'Professional UX/UI Workshop', 'Rejected', NULL, NULL, 0, 5, 'Foundation', 'General', 'N/A', 200.00, '2026-08-24 13:39:36.702 +00:00', '2026-08-26 09:25:49.843 +00:00'),
  ('003', 'Forklift Operations & Safety', 'Pending', '2026-08-24 13:39:36.702 +00:00', '2026-08-24 13:39:36.702 +00:00', 0, 5, 'Foundation', 'General', 'N/A', 150.00, '2026-08-24 13:39:36.702 +00:00', '2026-08-26 09:24:36.957 +00:00'),
  ('004', 'Advanced Digital Marketing', 'Approved', '2026-08-24 13:39:36.702 +00:00', '2029-08-24 13:39:36.702 +00:00', 1, 6, 'Foundation', 'General', 'N/A', 5000.00, '2026-08-24 13:39:36.702 +00:00', '2026-08-24 13:39:36.702 +00:00'),
  ('005', 'Data Science with Python', 'Approved', '2026-08-26 06:58:22', '2029-08-26', 1, 6, 'Foundation', 'General', 'N/A', 500.00, '2026-08-26 06:58:22', '2026-08-26 06:58:22'),
  ('006', 'Agile Project Management', 'Pending', '2026-08-26 06:58:22', '2026-08-26 06:58:22', 0, 6, 'Foundation', 'General', 'N/A', 1500.00, '2026-08-26 06:58:22', '2026-08-26 09:59:17.165 +00:00');

  INSERT INTO `modules` (`ModuleID`, `CourseID`, `ModuleTitle`, `ModuleDescription`, `EstimatedHours`, `OrderSequence`, `createdAt`, `updatedAt`) VALUES 
  ('MOD-101001', '001', 'Introduction to NumPy & Pandas', 'Data manipulation basics, cleaning datasets, and structural arrays.', 2, 1, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-102001', '001', 'Building Neural Networks', 'Conceptual introduction to layers, activation functions, and deep learning.', 3, 2, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-103001', '001', 'Data Visualization & Analysis', 'Plotting insights using Matplotlib and Seaborn to identify trends in data preparation pipelines.', 4, 3, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-104001', '001', 'Deep Learning with TensorFlow', 'Building, training, and evaluating multi-layer artificial neural networks for predictive analysis.', 5, 4, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-201002', '002', 'User Research & Persona Creation', 'Conducting user interviews, building behavioral maps, and compiling user persona profiles.', 2, 1, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-202002', '002', 'Wireframing & Information Architecture', 'Designing structural application layouts, low-fidelity sketches, and digital user flow systems.', 3, 2, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-203002', '002', 'Responsive UI Design in Figma', 'Mastering grids, typography scales, layout constraints, and component auto-layout rules.', 4, 3, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-204002', '002', 'Interactive Prototyping & Testing', 'Creating dynamic smart-animations, triggers, and setting up user-testing observation models.', 5, 4, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-301003', '003', 'Forklift Pre-Operation Inspections', 'Step-by-step mechanical checklist evaluation covering fluid levels, tires, brakes, and safety guards.', 2, 1, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-302003', '003', 'Load Stability & Safe Handling', 'Calculating capacity weights, managing center of gravity, and lifting techniques for uneven cargo.', 3, 2, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-303003', '003', 'Navigating Workplace Hazards', 'Navigating blind spots, high-traffic ramps, warehouse environments, and pedestrian safety rules.', 4, 3, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-401004', '004', 'Advanced SEO & Content Strategy', 'Keyword gap evaluation, technical site auditing, indexing fixes, and structured data setup.', 2, 1, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-402004', '004', 'Programmatic Bidding & Paid Ads', 'Managing target ROAS, setting up audience retargeting campaigns, and building optimized search funnels.', 3, 2, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00'),
  ('MOD-403004', '004', 'Marketing Analytics & Attribution', 'Configuring conversions, using Google Analytics 4, and building visual data dashboards for reporting.', 4, 3, '2026-08-24 13:39:36.752 +00:00', '2026-08-24 13:39:36.752 +00:00');

  INSERT INTO `FormMetas` (`id`, `name`, `slug`, `filePath`, `version`, `isActive`, `createdAt`, `updatedAt`) VALUES 
  (1, 'Application Form Manager', 'officer-course-form', 'CourseApplicationEditorForm.yaml', 1, 1, '2026-08-24 17:03:48', '2026-08-25 02:59:42.401 +00:00');

-- Enrollments for Learner One (id = 7)
  INSERT INTO Enrollments (userId, courseId, status, enrolledAt, createdAt, updatedAt)
  VALUES
    (7, '001', 'Completed',   '2026-08-24 14:00:00', '2026-08-24 14:00:00', '2026-08-26 10:00:00'),
    (7, '004', 'In Progress', '2026-08-24 14:00:00', '2026-08-25 09:00:00', '2026-08-26 09:30:00'),
    (8, '004', 'In Progress', '2026-08-24 14:00:00', '2026-08-25 09:00:00', '2026-08-26 09:30:00'),
    (8, '005', 'Enrolled',    '2026-08-24 14:00:00', '2026-08-26 08:00:00', '2026-08-26 08:00:00');

  INSERT INTO `AdminLogs` (`id`, `adminEmail`, `action`, `targetEntity`, `details`, `createdAt`, `updatedAt`) VALUES 
  (1, 'admin123@abc.com', 'COURSE_APPROVED', 'Customer Experience Design', 'Approved course submission for Clarity Learning Co.', '2026-08-24 13:39:36.311 +00:00', '2026-08-24 13:39:36.311 +00:00'),
  (2, 'admin123@abc.com', 'COURSE_REJECTED', 'Advanced Data Analytics with Python', 'Rejection notice sent due to incomplete syllabus structure.', '2026-08-24 13:39:36.311 +00:00', '2026-08-24 13:39:36.311 +00:00'),
  (3, 'admin123@abc.com', 'FORM_UPDATED', 'Course Application Form Schema', 'Updated maximum allowable subsidy rate settings.', '2026-08-24 13:39:36.311 +00:00', '2026-08-24 13:39:36.311 +00:00'),
  (4, 'admin123@abc.com', 'COURSE_REJECTED', 'Course ID: 006', 'Rejected application for Agile Project Management. Reason: Blah Blah Blah', '2026-08-26 09:22:59.817 +00:00', '2026-08-26 09:22:59.817 +00:00'),
  (5, 'admin123@abc.com', 'COURSE_REJECTED', 'Course ID: 002', 'Rejected application for Professional UX/UI Workshop. Reason: Blah Blah Blah', '2026-08-26 09:25:49.870 +00:00', '2026-08-26 09:25:49.870 +00:00');