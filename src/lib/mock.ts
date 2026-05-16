export type Role = "student" | "faculty" | "evaluator" | "hod" | "examiner" | "admin";

export const ROLES: { id: Role; label: string }[] = [
  { id: "student", label: "Student" },
  { id: "faculty", label: "Faculty Guide" },
  { id: "evaluator", label: "Evaluator" },
  { id: "hod", label: "HOD" },
  { id: "examiner", label: "External Examiner" },
  { id: "admin", label: "Admin" },
];

// Populated with realistic research data
export const submissionTrend = [
  { m: "Jan", submitted: 12, prev: 8 },
  { m: "Feb", submitted: 25, prev: 14 },
  { m: "Mar", submitted: 18, prev: 22 },
  { m: "Apr", submitted: 42, prev: 30 },
  { m: "May", submitted: 35, prev: 25 },
  { m: "Jun", submitted: 58, prev: 40 },
];

export const departmentSplit = [
  { name: "Computer Science", value: 45 },
  { name: "Electronics", value: 25 },
  { name: "Information Tech", value: 20 },
  { name: "Cyber Security", value: 10 },
];

export const facultyWorkload = [
  { name: "Dr. Sarah", active: 8, pending: 2 },
  { name: "Prof. John", active: 5, pending: 4 },
  { name: "Dr. Amit", active: 12, pending: 1 },
  { name: "Prof. Elena", active: 7, pending: 3 },
];

export const milestones = [
  { key: "proposal", label: "Proposal", date: "Sep 15", status: "completed" },
  { key: "lit", label: "Literature Review", date: "Oct 20", status: "completed" },
  { key: "mid", label: "Mid Review", date: "Jan 10", status: "completed" },
  { key: "internal", label: "Internal Eval", date: "Mar 05", status: "in-progress" },
  { key: "final", label: "Final Submission", date: "May 20", status: "todo" },
  { key: "viva", label: "Viva Voce", date: "Jun 15", status: "todo" },
] as const;

export const recentDissertations = [
  { id: 1, title: "Deep Learning in Healthcare", student: "Alice Smith", status: "approved" },
  { id: 2, title: "Blockchain for Supply Chain", student: "Bob Johnson", status: "pending" },
  { id: 3, title: "Quantum Computing Ethics", student: "Charlie Brown", status: "revision" },
];

export const aiSuggestions = [
  { type: "structure", text: "Chapter 3 needs more citations from 2023-24 literature." },
  { type: "plagiarism", text: "Section 2.1 matches known paper by IEEE. Please rephrase." },
  { type: "deadlines", text: "Mid-review is approaching. Submit Chapter 2 for approval." },
];

export const notifications = [
  { id: 1, title: "Topic Approved", msg: "Your dissertation topic has been authorized by HOD.", time: "2h ago" },
  { id: 2, title: "New Feedback", msg: "Dr. Sarah Guide added comments to Chapter 1.", time: "5h ago" },
];
