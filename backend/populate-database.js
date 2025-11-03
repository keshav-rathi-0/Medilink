require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Medicine = require('./models/Medicine');
const Ward = require('./models/Ward');
const Staff = require('./models/Staff');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Billing = require('./models/Billing');

function generatePatientId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAT${timestamp}${random}`;
}
// Sample data
const sampleData = {
  users: [
    {
      name: "Admin User",
      email: "admin@hospital.com",
      password: "admin123",
      role: "Admin",
      phone: "+1234567890",
      address: {
        street: "123 Hospital Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA"
      },
      dateOfBirth: new Date("1980-01-01"),
      gender: "Male"
    },
    {
      name: "Dr. Sarah Smith",
      email: "sarah.smith@hospital.com",
      password: "doctor123",
      role: "Doctor",
      phone: "+1234567891",
      address: {
        street: "456 Medical Ave",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        country: "USA"
      },
      dateOfBirth: new Date("1985-05-15"),
      gender: "Female"
    },
    {
      name: "John Doe",
      email: "john.doe@email.com",
      password: "patient123",
      role: "Patient",
      phone: "+1234567892",
      address: {
        street: "789 Patient Lane",
        city: "New York",
        state: "NY",
        zipCode: "10003",
        country: "USA"
      },
      dateOfBirth: new Date("1990-08-20"),
      gender: "Male"
    },
    {
      name: "Pharmacist Mike",
      email: "mike@hospital.com",
      password: "pharma123",
      role: "Pharmacist",
      phone: "+1234567893",
      address: {
        street: "321 Pharmacy Rd",
        city: "New York",
        state: "NY",
        zipCode: "10004",
        country: "USA"
      },
      dateOfBirth: new Date("1988-03-10"),
      gender: "Male"
    },
    {
      name: "Nurse Emily",
      email: "emily@hospital.com",
      password: "nurse123",
      role: "Nurse",
      phone: "+1234567894",
      address: {
        street: "654 Care Street",
        city: "New York",
        state: "NY",
        zipCode: "10005",
        country: "USA"
      },
      dateOfBirth: new Date("1992-11-25"),
      gender: "Female"
    }
  ]
};

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

// Populate database
async function populateDatabase() {
  try {
    console.log('\n🚀 Starting database population...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Medicine.deleteMany({});
    await Ward.deleteMany({});
    await Staff.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Billing.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.create(sampleData.users);
    console.log(`✅ Created ${users.length} users`);

    // Create Doctor Profile
    console.log('\n👨‍⚕️ Creating doctor profile...');
    const doctor = await Doctor.create({
      userId: users[1]._id, // Dr. Sarah Smith
      specialization: "Cardiology",
      qualification: "MBBS, MD (Cardiology)",
      experience: 10,
      licenseNumber: "DOC2024001",
      department: "Cardiology",
      consultationFee: 500,
      availability: [
        {
          day: "Monday",
          slots: [
            { startTime: "09:00", endTime: "12:00", isAvailable: true },
            { startTime: "14:00", endTime: "17:00", isAvailable: true }
          ]
        },
        {
          day: "Wednesday",
          slots: [
            { startTime: "09:00", endTime: "12:00", isAvailable: true }
          ]
        },
        {
          day: "Friday",
          slots: [
            { startTime: "10:00", endTime: "13:00", isAvailable: true }
          ]
        }
      ],
      onCallShifts: [],
      rating: 4.5,
      totalRatings: 120
    });
    console.log('✅ Doctor profile created');

    // Create Patient Profile
    console.log('\n🤒 Creating patient profile...');
    const patient = await Patient.create({
      userId: users[2]._id, // John Doe
      patientId: generatePatientId(),
      bloodGroup: "O+",
      emergencyContact: {
        name: "Jane Doe",
        phone: "+1987654321",
        relation: "Wife"
      },
      medicalHistory: [
        {
          condition: "Hypertension",
          diagnosedDate: new Date("2022-01-15"),
          status: "Chronic",
          notes: "Under medication control"
        }
      ],
      allergies: ["Penicillin", "Pollen"],
      currentMedications: [],
      insuranceInfo: {
        provider: "HealthFirst Insurance",
        policyNumber: "HF123456789",
        validUntil: new Date("2025-12-31")
      }
    });
    console.log('✅ Patient profile created');

    // Create Medicines
    console.log('\n💊 Creating medicines...');
    const medicines = await Medicine.create([
      {
        name: "Paracetamol 500mg",
        genericName: "Acetaminophen",
        manufacturer: "PharmaCorp Ltd",
        category: "Tablet",
        dosageForm: "Tablet",
        strength: "500mg",
        stockQuantity: 1000,
        reorderLevel: 100,
        unitPrice: 5,
        batchNumber: "BATCH2024001",
        manufactureDate: new Date("2024-01-01"),
        expiryDate: new Date("2026-01-01"),
        supplierInfo: {
          name: "MediSupply Co",
          contact: "+1234567890",
          email: "supply@medico.com"
        },
        prescriptionRequired: false,
        sideEffects: ["Nausea", "Dizziness"],
        contraindications: ["Liver disease"]
      },
      {
        name: "Amoxicillin 250mg",
        genericName: "Amoxicillin",
        manufacturer: "AntiBio Pharma",
        category: "Capsule",
        dosageForm: "Capsule",
        strength: "250mg",
        stockQuantity: 500,
        reorderLevel: 50,
        unitPrice: 15,
        batchNumber: "BATCH2024002",
        manufactureDate: new Date("2024-02-01"),
        expiryDate: new Date("2026-02-01"),
        prescriptionRequired: true,
        sideEffects: ["Diarrhea", "Nausea", "Rash"],
        contraindications: ["Penicillin allergy"]
      },
      {
        name: "Ibuprofen 400mg",
        genericName: "Ibuprofen",
        manufacturer: "PainRelief Inc",
        category: "Tablet",
        dosageForm: "Tablet",
        strength: "400mg",
        stockQuantity: 750,
        reorderLevel: 75,
        unitPrice: 8,
        batchNumber: "BATCH2024003",
        manufactureDate: new Date("2024-03-01"),
        expiryDate: new Date("2026-03-01"),
        prescriptionRequired: false,
        sideEffects: ["Stomach upset", "Dizziness"],
        contraindications: ["Stomach ulcers", "Kidney disease"]
      }
    ]);
    console.log(`✅ Created ${medicines.length} medicines`);

    // Create Wards
    console.log('\n🏥 Creating wards...');
    const wards = await Ward.create([
      {
        wardNumber: "W101",
        wardName: "General Ward A",
        wardType: "General",
        department: "General Medicine",
        floor: 1,
        totalBeds: 20,
        availableBeds: 20,
        beds: Array.from({ length: 20 }, (_, i) => ({
          bedNumber: `W101-${String(i + 1).padStart(2, '0')}`,
          isOccupied: false
        })),
        gender: "Mixed",
        facilities: ["AC", "TV", "Bathroom"],
        dailyRate: 1000
      },
      {
        wardNumber: "W201",
        wardName: "ICU Ward",
        wardType: "ICU",
        department: "Critical Care",
        floor: 2,
        totalBeds: 10,
        availableBeds: 10,
        beds: Array.from({ length: 10 }, (_, i) => ({
          bedNumber: `W201-${String(i + 1).padStart(2, '0')}`,
          isOccupied: false
        })),
        gender: "Mixed",
        facilities: ["AC", "Ventilator", "Monitor", "Private Bathroom"],
        dailyRate: 5000
      },
      {
        wardNumber: "W301",
        wardName: "Private Ward",
        wardType: "Private",
        department: "General",
        floor: 3,
        totalBeds: 15,
        availableBeds: 15,
        beds: Array.from({ length: 15 }, (_, i) => ({
          bedNumber: `W301-${String(i + 1).padStart(2, '0')}`,
          isOccupied: false
        })),
        gender: "Mixed",
        facilities: ["AC", "TV", "Private Bathroom", "Refrigerator", "Sofa"],
        dailyRate: 3000
      }
    ]);
    console.log(`✅ Created ${wards.length} wards`);

    // Create Staff
    console.log('\n👔 Creating staff...');
    const staff = await Staff.create({
      userId: users[4]._id, // Nurse Emily
      designation: "Staff Nurse",
      department: "General Medicine",
      qualification: "B.Sc Nursing",
      joiningDate: new Date("2023-01-15"),
      employmentType: "Full-Time",
      shift: "Morning",
      workSchedule: [
        { day: "Monday", startTime: "08:00", endTime: "16:00" },
        { day: "Tuesday", startTime: "08:00", endTime: "16:00" },
        { day: "Wednesday", startTime: "08:00", endTime: "16:00" },
        { day: "Thursday", startTime: "08:00", endTime: "16:00" },
        { day: "Friday", startTime: "08:00", endTime: "16:00" }
      ],
      salary: {
        basic: 30000,
        allowances: 5000,
        total: 35000
      },
      performance: {
        rating: 4.2,
        lastReviewDate: new Date("2024-06-01")
      }
    });
    console.log('✅ Staff created');

    // Create Appointment
    console.log('\n📅 Creating appointment...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: tomorrow,
      timeSlot: {
        startTime: "09:00",
        endTime: "09:30"
      },
      type: "Consultation",
      status: "Scheduled",
      priority: "Normal",
      symptoms: "Chest pain and fatigue",
      createdBy: users[0]._id // Admin
    });
    console.log('✅ Appointment created');

    // Create Prescription
    console.log('\n📋 Creating prescription...');
    const prescription = await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,
      appointment: appointment._id,
      medicines: [
        {
          medicine: medicines[0]._id, // Paracetamol
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "7 days",
          instructions: "Take after meals with water",
          quantity: 14
        },
        {
          medicine: medicines[2]._id, // Ibuprofen
          dosage: "400mg",
          frequency: "Once daily",
          duration: "5 days",
          instructions: "Take after dinner",
          quantity: 5
        }
      ],
      diagnosis: "Viral Fever with body ache",
      symptoms: "High fever, body pain, headache",
      labTests: ["CBC", "CRP"],
      refillsAllowed: 1,
      validUntil: new Date("2024-12-31"),
      notes: "Follow up if symptoms persist after 7 days"
    });
    console.log('✅ Prescription created');

    // Create Billing
    console.log('\n💰 Creating billing...');
    const billing = await Billing.create({
      patient: patient._id,
      items: [
        {
          description: "Doctor Consultation - Cardiology",
          category: "Consultation",
          quantity: 1,
          unitPrice: 500,
          amount: 500
        },
        {
          description: "CBC Test",
          category: "Lab Test",
          quantity: 1,
          unitPrice: 300,
          amount: 300
        },
        {
          description: "CRP Test",
          category: "Lab Test",
          quantity: 1,
          unitPrice: 200,
          amount: 200
        },
        {
          description: "Medicines (Prescription)",
          category: "Medicine",
          quantity: 1,
          unitPrice: 150,
          amount: 150
        }
      ],
      subtotal: 1150,
      discount: 50,
      tax: 110,
      totalAmount: 1210,
      balance: 1210,
      paymentStatus: "Unpaid",
      generatedBy: users[0]._id // Admin
    });
    console.log('✅ Billing created');

    console.log('\n🎉 Database population completed successfully!\n');
    
    // Summary
    console.log('📊 Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Doctors: 1`);
    console.log(`✅ Patients: 1`);
    console.log(`✅ Medicines: ${medicines.length}`);
    console.log(`✅ Wards: ${wards.length}`);
    console.log(`✅ Staff: 1`);
    console.log(`✅ Appointments: 1`);
    console.log(`✅ Prescriptions: 1`);
    console.log(`✅ Billings: 1`);
    console.log('═══════════════════════════════════════\n');

    console.log('🔐 Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Admin:');
    console.log('  Email: admin@hospital.com');
    console.log('  Password: admin123');
    console.log('\nDoctor:');
    console.log('  Email: sarah.smith@hospital.com');
    console.log('  Password: doctor123');
    console.log('\nPatient:');
    console.log('  Email: john.doe@email.com');
    console.log('  Password: patient123');
    console.log('\nPharmacist:');
    console.log('  Email: mike@hospital.com');
    console.log('  Password: pharma123');
    console.log('\nNurse:');
    console.log('  Email: emily@hospital.com');
    console.log('  Password: nurse123');
    console.log('═══════════════════════════════════════\n');

    console.log('🎯 Next Steps:');
    console.log('1. Open MongoDB Compass and refresh');
    console.log('2. You should see all 9 collections');
    console.log('3. Login with above credentials');
    console.log('4. Start testing the APIs!\n');

  } catch (error) {
    console.error('❌ Error populating database:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectDB();
    await populateDatabase();
    console.log('✅ All done! Database is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();

