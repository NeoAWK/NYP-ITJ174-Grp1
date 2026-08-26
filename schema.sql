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