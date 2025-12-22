const prisma = require('../config/prismaClient');
const { sendMessage } = require('../services/whatsappService');

// Helper to handle common Prisma errors
const handlePrismaError = (res, error, modelName) => {
    console.error(`Prisma error in ${modelName} operations:`, error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: `${modelName} with this unique field already exists.`, details: error.meta.target });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: `${modelName} not found.`, details: error.meta.cause });
    }
    return res.status(500).json({ message: `An unexpected error occurred during ${modelName} operation.`, error: error.message });
};

// --- Attendance Management ---
const markAttendance = async (req, res) => {
    const { classId, subjectId, date, attendanceData } = req.body;
    const facultyUserId = req.user.id; // Assuming req.user is populated by protect middleware

    try {
        // Optional: Verify if the faculty is authorized to take attendance for this class/subject
        const faculty = await prisma.faculty.findUnique({ where: { userId: facultyUserId } });
        if (!faculty) {
            return res.status(403).json({ message: 'Faculty profile not found.' });
        }
        
        // Find if this faculty is assigned to teach this subject in this class
        const courseFaculty = await prisma.courseFaculty.findFirst({
            where: {
                facultyId: faculty.id,
                subjectId: parseInt(subjectId),
                classId: parseInt(classId),
            },
        });

        if (!courseFaculty) {
            return res.status(403).json({ message: 'Faculty not authorized to mark attendance for this class/subject.' });
        }

        const attendanceRecords = [];
        for (const record of attendanceData) {
            const { studentId, status } = record;
            const createdOrUpdatedAttendance = await prisma.attendance.upsert({
                where: {
                    studentId_classId_subjectId_date: {
                        studentId: parseInt(studentId),
                        classId: parseInt(classId),
                        subjectId: parseInt(subjectId),
                        date: new Date(date),
                    },
                },
                update: {
                    status: status,
                },
                create: {
                    studentId: parseInt(studentId),
                    classId: parseInt(classId),
                    subjectId: parseInt(subjectId),
                    date: new Date(date),
                    status: status,
                },
                include: {
                    student: {
                        include: { user: true }
                    },
                    subject: true
                }
            });
            attendanceRecords.push(createdOrUpdatedAttendance);

            // --- Automation Logic: Absentee Agent ---
            if (status === 'ABSENT') {
                const student = createdOrUpdatedAttendance.student;
                const subject = createdOrUpdatedAttendance.subject;

                if (student && student.parentWhatsappNumber) {
                    const recipientNumber = student.parentWhatsappNumber;
                    const templateName = 'absent_notification'; // Must be defined in Meta Business Manager

                    const components = [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: student.user.name },
                                { type: 'text', text: subject.name },
                                { type: 'text', text: new Date(date).toDateString() },
                            ],
                        },
                    ];

                    // Fire-and-forget for background processing
                    Promise.resolve().then(async () => {
                        await sendMessage(recipientNumber, templateName, components);
                        console.log(`Dispatched absentee notification for student ${student.user.name}.`);
                    }).catch(err => {
                        console.error(`Error dispatching absentee notification for student ${student.user.name}:`, err);
                    });

                } else {
                    console.warn(`Could not send absentee notification: student or parent WhatsApp number not found for student ID ${studentId}.`);
                }
            }
        }
        res.status(200).json(attendanceRecords);
    } catch (error) {
        handlePrismaError(res, error, 'Attendance');
    }
};

// --- Marks Management ---
const addMarks = async (req, res) => {
    const { studentId, classId, subjectId, examType, marksObtained, totalMarks } = req.body;
    const facultyUserId = req.user.id; // Assuming req.user is populated by protect middleware

    try {
        // Optional: Verify if the faculty is authorized to add marks for this class/subject
        const faculty = await prisma.faculty.findUnique({ where: { userId: facultyUserId } });
        if (!faculty) {
            return res.status(403).json({ message: 'Faculty profile not found.' });
        }
        // Verification logic similar to attendance for courseFaculty assignment

        const createdOrUpdatedMark = await prisma.mark.upsert({
            where: {
                studentId_classId_subjectId_examType: {
                    studentId: parseInt(studentId),
                    classId: parseInt(classId),
                    subjectId: parseInt(subjectId),
                    examType: examType,
                },
            },
            update: {
                marksObtained: parseInt(marksObtained),
                totalMarks: parseInt(totalMarks),
            },
            create: {
                studentId: parseInt(studentId),
                classId: parseInt(classId),
                subjectId: parseInt(subjectId),
                examType: examType,
                marksObtained: parseInt(marksObtained),
                totalMarks: parseInt(totalMarks),
            },
            include: {
                student: {
                    include: { user: true }
                },
                subject: true
            }
        });

        // --- Automation Logic: Marks Agent ---
        const lowPerformanceThreshold = 0.50; // 50%
        if (createdOrUpdatedMark.totalMarks > 0 && 
            (createdOrUpdatedMark.marksObtained / createdOrUpdatedMark.totalMarks) < lowPerformanceThreshold) {
            
            const student = createdOrUpdatedMark.student;
            const subject = createdOrUpdatedMark.subject;

            if (student && student.parentWhatsappNumber) {
                const recipientNumber = student.parentWhatsappNumber;
                const templateName = 'low_performance_alert'; // Must be defined in Meta Business Manager

                const components = [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: student.user.name },
                            { type: 'text', text: String(createdOrUpdatedMark.marksObtained) },
                            { type: 'text', text: String(createdOrUpdatedMark.totalMarks) },
                            { type: 'text', text: subject.name },
                        ],
                    },
                ];

                // Fire-and-forget for background processing
                Promise.resolve().then(async () => {
                    await sendMessage(recipientNumber, templateName, components);
                    console.log(`Dispatched low performance alert for student ${student.user.name}.`);
                }).catch(err => {
                    console.error(`Error dispatching low performance alert for student ${student.user.name}:`, err);
                });
            } else {
                console.warn(`Could not send low performance alert: student or parent WhatsApp number not found for student ID ${studentId}.`);
            }
        }

        res.status(200).json(createdOrUpdatedMark);
    } catch (error) {
        handlePrismaError(res, error, 'Mark');
    }
};

// --- Faculty Data Retrieval ---
const getFacultyClasses = async (req, res) => {
    const facultyUserId = req.user.id;

    try {
        const faculty = await prisma.faculty.findUnique({
            where: { userId: facultyUserId },
            include: {
                classes: {
                    include: { semester: true, department: true }
                },
            },
        });

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        res.status(200).json(faculty.classes);
    } catch (error) {
        handlePrismaError(res, error, 'Faculty Classes');
    }
};

const getFacultySubjects = async (req, res) => {
    const facultyUserId = req.user.id;

    try {
        const faculty = await prisma.faculty.findUnique({
            where: { userId: facultyUserId },
            include: {
                courseFaculty: {
                    include: { subject: true, class: true }
                }
            }
        });

        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }

        // Extract unique subjects and classes from courseFaculty
        const subjectsWithClasses = faculty.courseFaculty.map(cf => ({
            subject: cf.subject,
            class: cf.class
        }));

        res.status(200).json(subjectsWithClasses);
    } catch (error) {
        handlePrismaError(res, error, 'Faculty Subjects');
    }
};

const getFacultyReports = async (req, res) => {
    const facultyUserId = req.user.id;
    const { classId, subjectId, startDate, endDate } = req.query; // Example query params

    try {
        const faculty = await prisma.faculty.findUnique({ where: { userId: facultyUserId } });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }

        // Example: Get attendance summary for a class/subject
        const attendanceSummary = await prisma.attendance.groupBy({
            by: ['studentId', 'status'],
            where: {
                classId: classId ? parseInt(classId) : undefined,
                subjectId: subjectId ? parseInt(subjectId) : undefined,
                date: {
                    gte: startDate ? new Date(startDate) : undefined,
                    lte: endDate ? new Date(endDate) : undefined,
                },
                student: {
                    class: {
                        facultyId: faculty.id // Ensure faculty is associated with the class
                    }
                }
            },
            _count: {
                status: true,
            },
        });
        
        // This is a basic example. Real reports would involve more complex aggregations
        // and data joining from different models (Marks, Students, etc.).

        res.status(200).json(attendanceSummary);
    } catch (error) {
        handlePrismaError(res, error, 'Faculty Reports');
    }
};


module.exports = {
    markAttendance,
    addMarks,
    getFacultyClasses,
    getFacultySubjects,
    getFacultyReports,
};
