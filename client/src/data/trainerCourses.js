export const trainerCoursePlaceholders = [
    {
        id: 'CS101',
        title: 'Programming Fundamentals',
        code: 'CS101',
        assignedRole: 'Full-time Polytechnic trainer',
        progressPercent: 72,
        milestonesHit: 9,
        totalMilestones: 12,
        weeksCleared: 8,
        totalWeeks: 12,
        nextFocus: 'Week 9: Arrays and basic sorting',
        syllabusBreakdown: [
            { label: 'Intro to Variables', done: true },
            { label: 'Control Flow', done: true },
            { label: 'Functions', done: true },
            { label: 'Arrays', done: false }
        ]
    },
    {
        id: 'CS204',
        title: 'Database Systems',
        code: 'CS204',
        assignedRole: 'Full-time Polytechnic trainer',
        progressPercent: 48,
        milestonesHit: 5,
        totalMilestones: 10,
        weeksCleared: 5,
        totalWeeks: 12,
        nextFocus: 'Normalization workshop and schema review',
        syllabusBreakdown: [
            { label: 'ER Modeling', done: true },
            { label: 'Relational Algebra', done: true },
            { label: 'Normalization', done: false },
            { label: 'Transactions', done: false }
        ]
    },
    {
        id: 'CS315',
        title: 'Applied Web Engineering',
        code: 'CS315',
        assignedRole: 'Full-time Polytechnic trainer',
        progressPercent: 86,
        milestonesHit: 12,
        totalMilestones: 14,
        weeksCleared: 10,
        totalWeeks: 12,
        nextFocus: 'Final project review sprint',
        syllabusBreakdown: [
            { label: 'REST APIs', done: true },
            { label: 'Frontend State', done: true },
            { label: 'Testing', done: true },
            { label: 'Deployment', done: false }
        ]
    }
];

export function getCoursesForTrainer(user) {
    // Placeholder mode: show a clean assigned-course set for the trainer dashboard.
    return trainerCoursePlaceholders;
}

export function getCourseById(id) {
    return trainerCoursePlaceholders.find((course) => course.id === id) || null;
}
