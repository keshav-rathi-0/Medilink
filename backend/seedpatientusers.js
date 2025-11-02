const mongoose = require('mongoose');
const User = require('../backend/models/User.js');
const Patient = require('../backend/models/Patient.js');
const bcrypt = require('bcryptjs');

// Connect to database
mongoose.connect('mongodb://localhost:27017/hospital_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Helper function to generate unique patient ID
const generatePatientId = async () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const patientId = `PAT${timestamp}${random}`;
  
  const exists = await Patient.findOne({ patientId });
  if (exists) {
    return generatePatientId();
  }
  
  return patientId;
};

const samplePatients = [
  {
    user: {
      name: 'John Doe',
      email: 'john.patient@hospital.com',
      password: 'password123',
      role: 'Patient',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'Male',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    },
    patient: {
      bloodGroup: 'O+',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567899',
        relation: 'Spouse'
      },
      allergies: ['Penicillin', 'Peanuts'],
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2020-03-15'),
          status: 'Chronic',
          notes: 'Controlled with medication'
        }
      ],
      currentMedications: [
        {
          medicine: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: new Date('2020-03-20')
        }
      ]
    }
  },
  {
    user: {
      name: 'Jane Smith',
      email: 'jane.patient@hospital.com',
      password: 'password123',
      role: 'Patient',
      phone: '+1234567891',
      dateOfBirth: new Date('1985-08-22'),
      gender: 'Female',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      }
    },
    patient: {
      bloodGroup: 'A+',
      emergencyContact: {
        name: 'Robert Smith',
        phone: '+1234567898',
        relation: 'Brother'
      },
      allergies: ['Latex'],
      medicalHistory: [
        {
          condition: 'Type 2 Diabetes',
          diagnosedDate: new Date('2019-06-10'),
          status: 'Active',
          notes: 'Diet controlled'
        }
      ]
    }
  },
  {
    user: {
      name: 'Robert Johnson',
      email: 'robert.patient@hospital.com',
      password: 'password123',
      role: 'Patient',
      phone: '+1234567892',
      dateOfBirth: new Date('1978-12-10'),
      gender: 'Male',
      address: {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      }
    },
    patient: {
      bloodGroup: 'B+',
      emergencyContact: {
        name: 'Mary Johnson',
        phone: '+1234567897',
        relation: 'Wife'
      },
      allergies: [],
      medicalHistory: []
    }
  },
  {
    user: {
      name: 'Emily Davis',
      email: 'emily.patient@hospital.com',
      password: 'password123',
      role: 'Patient',
      phone: '+1234567893',
      dateOfBirth: new Date('1995-03-18'),
      gender: 'Female',
      address: {
        street: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        country: 'USA'
      }
    },
    patient: {
      bloodGroup: 'AB+',
      emergencyContact: {
        name: 'Sarah Davis',
        phone: '+1234567896',
        relation: 'Mother'
      },
      allergies: ['Sulfa drugs'],
      labReports: [
        {
          testName: 'Complete Blood Count',
          testDate: new Date('2024-10-15'),
          results: 'Normal',
          remarks: 'All values within normal range'
        }
      ]
    }
  },
  {
    user: {
      name: 'Michael Brown',
      email: 'michael.patient@hospital.com',
      password: 'password123',
      role: 'Patient',
      phone: '+1234567894',
      dateOfBirth: new Date('1982-11-25'),
      gender: 'Male',
      address: {
        street: '654 Maple Dr',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        country: 'USA'
      }
    },
    patient: {
      bloodGroup: 'O-',
      emergencyContact: {
        name: 'Lisa Brown',
        phone: '+1234567895',
        relation: 'Sister'
      },
      allergies: ['Aspirin', 'Ibuprofen'],
      medicalHistory: [
        {
          condition: 'Asthma',
          diagnosedDate: new Date('2015-01-20'),
          status: 'Chronic',
          notes: 'Uses inhaler as needed'
        }
      ],
      currentMedications: [
        {
          medicine: 'Albuterol Inhaler',
          dosage: '90mcg',
          frequency: 'As needed',
          startDate: new Date('2015-01-25')
        }
      ]
    }
  }
];

async function seedPatientsComplete() {
  try {
    console.log('🌱 Starting complete patient data seeding...\n');
    console.log('This will create both User accounts AND Patient profiles\n');

    let created = 0;
    let skipped = 0;

    for (const data of samplePatients) {
      // Check if user already exists
      let user = await User.findOne({ email: data.user.email });
      
      if (!user) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        data.user.password = await bcrypt.hash(data.user.password, salt);
        
        // Create user
        user = await User.create(data.user);
        console.log(`✅ Created user: ${data.user.name} (${user.email})`);
      } else {
        console.log(`⚠️  User already exists: ${data.user.name} (${data.user.email})`);
      }

      // Check if patient profile already exists
      const existingPatient = await Patient.findOne({ userId: user._id });
      
      if (!existingPatient) {
        // Generate patient ID
        const patientId = await generatePatientId();
        
        // Create patient profile
        const patient = await Patient.create({
          userId: user._id,
          patientId: patientId,
          bloodGroup: data.patient.bloodGroup,
          emergencyContact: data.patient.emergencyContact,
          allergies: data.patient.allergies || [],
          medicalHistory: data.patient.medicalHistory || [],
          currentMedications: data.patient.currentMedications || [],
          labReports: data.patient.labReports || []
        });
        
        console.log(`   ✅ Created patient profile: ${patient.patientId}`);
        created++;
      } else {
        console.log(`   ⚠️  Patient profile already exists for this user`);
        skipped++;
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seeding completed successfully!');
    console.log(`   📊 ${created} patient profiles created`);
    console.log(`   ⏭️  ${skipped} already existed`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎉 You can now:');
    console.log('   1. Login to your admin/receptionist account');
    console.log('   2. Go to Patient Management');
    console.log('   3. See all patients listed with their information');
    console.log('   4. View medical records, appointments, etc.\n');
    
    // Display login credentials
    console.log('📝 Patient Login Credentials (for testing):');
    console.log('   Email: john.patient@hospital.com | Password: password123');
    console.log('   Email: jane.patient@hospital.com | Password: password123');
    console.log('   Email: robert.patient@hospital.com | Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the seeder
seedPatientsComplete();