async function seedCoursesAndModules(db) {
  if (!db.Course || !db.Module) return;

  const courseCount = await db.Course.count();
  if (courseCount > 0) return; // Prevent duplicate entries if database already seeded

  const now = new Date();
  const threeYearsLater = new Date();
  threeYearsLater.setFullYear(now.getFullYear() + 3);

  // Seed Courses Table
  await db.Course.bulkCreate([
    {
      CourseID: '001',
      TrainingProviderID: '41492789B',
      CourseTitle: 'Advanced Python & AI Basics',
      CourseDescription: 'A deep dive into data structures, automation scripting, and an introduction to building machine learning models using TensorFlow.',
      LessonType: 'Online',
      CourseFee: 100,
      StartDate: '09-09-2026',
      EndDate: '12-09-2026',
      EntryPrerequisites: 'Basic programming knowledge',
      SubmissionStatus: 'Approved',
      TrainerID: '32318642C',
      ApprovalDate: now,
      ApprovalExpiryDate: threeYearsLater,
      IsActive: true
    },
    {
      CourseID: '002',
      TrainingProviderID: 'P002',
      CourseTitle: 'Professional UX/UI Workshop',
      CourseDescription: 'A hands-on, practical boot camp focused on wire framing, user research methodologies, and creating high-fidelity interactive prototypes in Figma.',
      LessonType: 'On-site',
      CourseFee: 100,
      StartDate: '10-10-2026',
      EndDate: '14-10-2026',
      EntryPrerequisites: 'None, open to beginners',
      SubmissionStatus: 'Pending',
      TrainerID: 'T002'
    },
    {
      CourseID: '003',
      TrainingProviderID: 'P003',
      CourseTitle: 'Forklift Operations & Safety',
      CourseDescription: 'A regulatory compliance course covering safe operation procedures, load handling, vehicle maintenance, and workplace hazard prevention.',
      LessonType: 'On-site',
      CourseFee: 100,
      StartDate: '11-11-2026',
      EndDate: '12-11-2026',
      EntryPrerequisites: 'Must be at least 18 years old and valid Class 3 driver\'s license.',
      SubmissionStatus: 'Rejected',
      TrainerID: 'T003'
    },
    {
      CourseID: '004',
      TrainingProviderID: 'P004',
      CourseTitle: 'Advanced Digital Marketing',
      CourseDescription: 'Strategies for scaling business growth through advanced SEO tactics, programmatic ad bidding, and data analytics attribution tracking.',
      LessonType: 'Online',
      CourseFee: 100,
      StartDate: '12-12-2026',
      EndDate: '16-12-2026',
      EntryPrerequisites: 'Google Ads Certification (Level 1) or equivalent.',
      SubmissionStatus: 'Approved',
      TrainerID: 'T004',
      ApprovalDate: now,
      ApprovalExpiryDate: threeYearsLater,
      IsActive: true
    }
  ]);

  // Seed Modules Table
  await db.Module.bulkCreate([
    { ModuleID: 'MOD-101', CourseID: '001', ModuleTitle: 'Introduction to NumPy & Pandas', ModuleDescription: 'Data manipulation basics, cleaning datasets, and structural arrays.', EstimatedHours: 4, OrderSequence: 1 },
    { ModuleID: 'MOD-102', CourseID: '001', ModuleTitle: 'Building Neural Networks', ModuleDescription: 'Conceptual introduction to layers, activation functions, and deep learning.', EstimatedHours: 6, OrderSequence: 2 },
    { ModuleID: 'MOD-103', CourseID: '001', ModuleTitle: 'Data Visualization & Analysis', ModuleDescription: 'Plotting insights using Matplotlib and Seaborn to identify trends in data preparation pipelines.', EstimatedHours: 4, OrderSequence: 3 },
    { ModuleID: 'MOD-104', CourseID: '001', ModuleTitle: 'Deep Learning with TensorFlow', ModuleDescription: 'Building, training, and evaluating multi-layer artificial neural networks for predictive analysis.', EstimatedHours: 8, OrderSequence: 4 },
    { ModuleID: 'MOD-201', CourseID: '002', ModuleTitle: 'User Research & Persona Creation', ModuleDescription: 'Conducting user interviews, building behavioral maps, and compiling user persona profiles.', EstimatedHours: 4, OrderSequence: 1 },
    { ModuleID: 'MOD-202', CourseID: '002', ModuleTitle: 'Wireframing & Information Architecture', ModuleDescription: 'Designing structural application layouts, low-fidelity sketches, and digital user flow systems.', EstimatedHours: 4, OrderSequence: 2 },
    { ModuleID: 'MOD-203', CourseID: '002', ModuleTitle: 'Responsive UI Design in Figma', ModuleDescription: 'Mastering grids, typography scales, layout constraints, and component auto-layout rules.', EstimatedHours: 6, OrderSequence: 3 },
    { ModuleID: 'MOD-204', CourseID: '002', ModuleTitle: 'Interactive Prototyping & Testing', ModuleDescription: 'Creating dynamic smart-animations, triggers, and setting up user-testing observation models.', EstimatedHours: 6, OrderSequence: 4 },
    { ModuleID: 'MOD-301', CourseID: '003', ModuleTitle: 'Forklift Pre-Operation Inspections', ModuleDescription: 'Step-by-step mechanical checklist evaluation covering fluid levels, tires, brakes, and safety guards.', EstimatedHours: 2, OrderSequence: 1 },
    { ModuleID: 'MOD-302', CourseID: '003', ModuleTitle: 'Load Stability & Safe Handling', ModuleDescription: 'Calculating capacity weights, managing center of gravity, and lifting techniques for uneven cargo.', EstimatedHours: 3, OrderSequence: 2 },
    { ModuleID: 'MOD-303', CourseID: '003', ModuleTitle: 'Navigating Workplace Hazards', ModuleDescription: 'Navigating blind spots, high-traffic ramps, warehouse environments, and pedestrian safety rules.', EstimatedHours: 3, OrderSequence: 3 },
    { ModuleID: 'MOD-401', CourseID: '004', ModuleTitle: 'Advanced SEO & Content Strategy', ModuleDescription: 'Keyword gap evaluation, technical site auditing, indexing fixes, and structured data setup.', EstimatedHours: 5, OrderSequence: 1 },
    { ModuleID: 'MOD-402', CourseID: '004', ModuleTitle: 'Programmatic Bidding & Paid Ads', ModuleDescription: 'Managing target ROAS, setting up audience retargeting campaigns, and building optimized search funnels.', EstimatedHours: 6, OrderSequence: 2 },
    { ModuleID: 'MOD-403', CourseID: '004', ModuleTitle: 'Marketing Analytics & Attribution', ModuleDescription: 'Configuring conversions, using Google Analytics 4, and building visual data dashboards for reporting.', EstimatedHours: 5, OrderSequence: 3 }
  ]);

  console.log('Courses and Modules successfully created and seeded into SQLite!');
}

module.exports = seedCoursesAndModules;