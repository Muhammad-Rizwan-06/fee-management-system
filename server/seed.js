const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Challan = require('./models/Challan');
const Announcement = require('./models/Announcement');
const Comment = require('./models/Comment');

dotenv.config();

const seedData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fee_management';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Challan.deleteMany();
    await Announcement.deleteMany();
    await Comment.deleteMany();

    // 1. Seed Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@fms.com',
      password: hashedPassword,
      picture: 'adminplaceholder.jpg',
      role: 'admin'
    });
    console.log('Admin seeded:', admin.email);

    // 2. Seed Students
    const students = await Student.create([
      // University (Semester)
      {
        name: 'Ahmad Ali',
        fatherName: 'Haider Ali',
        rollNo: 'CPE-1',
        email: 'ahmad@university.edu',
        dob: '2002-05-15',
        idCard: '36102-1234567-1',
        gender: 'male',
        systemType: 'semester',
        session: '2023-2027',
        currentPeriod: '3rd Semester',
        feeStatus: 'unpaid',
        dueDate: new Date('2026-07-25')
      },
      {
        name: 'Rizwan Bukhari',
        fatherName: 'Bukhsh Muhammad',
        rollNo: 'CPE-2',
        email: 'rizwan@university.edu',
        dob: '2001-08-20',
        idCard: '36102-7654321-2',
        gender: 'male',
        systemType: 'semester',
        session: '2023-2027',
        currentPeriod: '3rd Semester',
        feeStatus: 'paid',
        dueDate: new Date('2026-07-25')
      },
      {
        name: 'Amna Zulfiqar',
        fatherName: 'Zulfiqar Ali',
        rollNo: 'CPE-3',
        email: 'amna@university.edu',
        dob: '2003-01-10',
        idCard: '36102-1111111-3',
        gender: 'female',
        systemType: 'semester',
        session: '2024-2028',
        currentPeriod: '1st Semester',
        feeStatus: 'pending',
        dueDate: new Date('2026-08-10')
      },

      // School (Monthly)
      {
        name: 'Zeeshan Haji',
        fatherName: 'Haji Ramzan',
        rollNo: 'SCH-101',
        email: 'zeeshan@school.edu',
        dob: '2012-11-05',
        idCard: '36102-2222222-4',
        gender: 'male',
        systemType: 'monthly',
        classLevel: 'Class 8',
        currentPeriod: 'July 2026',
        feeStatus: 'unpaid',
        dueDate: new Date('2026-07-20')
      },
      {
        name: 'Saima Khan',
        fatherName: 'Imran Khan',
        rollNo: 'SCH-102',
        email: 'saima@school.edu',
        dob: '2013-04-12',
        idCard: '36102-3333333-5',
        gender: 'female',
        systemType: 'monthly',
        classLevel: 'Class 8',
        currentPeriod: 'July 2026',
        feeStatus: 'paid',
        dueDate: new Date('2026-07-20')
      },
      {
        name: 'Hamza Rizwan',
        fatherName: 'Rizwan Ahmad',
        rollNo: 'SCH-201',
        email: 'hamza@school.edu',
        dob: '2010-09-30',
        idCard: '36102-4444444-6',
        gender: 'male',
        systemType: 'monthly',
        classLevel: 'Class 10',
        currentPeriod: 'July 2026',
        feeStatus: 'pending',
        dueDate: new Date('2026-07-20')
      }
    ]);
    console.log('Students seeded successfully');

    // 3. Seed Challans for the paid and pending students
    const rizwan = students.find(s => s.name === 'Rizwan Bukhari');
    await Challan.create({
      studentId: rizwan._id,
      rollNo: rizwan.rollNo,
      systemType: 'semester',
      groupIdentifier: '2023-2027',
      period: '3rd Semester',
      amount: 45000,
      challanUrl: '/uploads/receipts/placeholder_receipt.png',
      feeStatus: 'paid'
    });

    const amna = students.find(s => s.name === 'Amna Zulfiqar');
    await Challan.create({
      studentId: amna._id,
      rollNo: amna.rollNo,
      systemType: 'semester',
      groupIdentifier: '2024-2028',
      period: '1st Semester',
      amount: 55000,
      challanUrl: '/uploads/receipts/placeholder_receipt.png',
      feeStatus: 'pending'
    });

    const saima = students.find(s => s.name === 'Saima Khan');
    await Challan.create({
      studentId: saima._id,
      rollNo: saima.rollNo,
      systemType: 'monthly',
      groupIdentifier: 'Class 8',
      period: 'July 2026',
      amount: 4500,
      challanUrl: '/uploads/receipts/placeholder_receipt.png',
      feeStatus: 'paid'
    });

    const hamza = students.find(s => s.name === 'Hamza Rizwan');
    await Challan.create({
      studentId: hamza._id,
      rollNo: hamza.rollNo,
      systemType: 'monthly',
      groupIdentifier: 'Class 10',
      period: 'July 2026',
      amount: 6000,
      challanUrl: '/uploads/receipts/placeholder_receipt.png',
      feeStatus: 'pending'
    });
    console.log('Challans seeded successfully');

    // 4. Seed Announcements
    await Announcement.create([
      {
        subject: 'July Fee Deadline Extension',
        message: 'Dear students, the deadline to submit the fees for July has been extended to July 25, 2026. Please make sure to upload verification slips on time.'
      },
      {
        subject: 'Scholarship Applications Open',
        message: 'Departmental scholarship applications for the session 2023-2027 are open. Please contact the coordinator office for details.'
      }
    ]);
    console.log('Announcements seeded successfully');

    // 5. Seed comments
    await Comment.create([
      {
        name: 'Dr. Muhammad Rizwan',
        email: 'rizwan.hod@university.edu',
        comment: 'This new system is incredibly seamless! It makes verification and status checking extremely quick.'
      },
      {
        name: 'Ahmad Ali',
        email: 'ahmad.coordinator@university.edu',
        comment: 'The dual billing feature is fantastic. We can now manage both the university department and our allied school in one app.'
      }
    ]);
    console.log('Comments seeded successfully');

    mongoose.connection.close();
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
    mongoose.connection.close();
  }
};

seedData();
