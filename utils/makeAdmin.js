const mongoose = require('mongoose');
const users = require('../Models/userSchema');

// Connect to MongoDB (update the connection string as needed)
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/recipebook', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to make a user admin
const makeUserAdmin = async (email) => {
  try {
    const user = await users.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return;
    }
    
    user.isAdmin = true;
    await user.save();
    console.log(`User ${user.username} (${email}) is now an admin!`);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
};

// Function to list all users
const listUsers = async () => {
  try {
    const allUsers = await users.find().select('username email isAdmin');
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Admin: ${user.isAdmin}`);
    });
  } catch (error) {
    console.error('Error listing users:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'list') {
    await listUsers();
  } else if (command === 'make-admin' && args[1]) {
    await makeUserAdmin(args[1]);
  } else {
    console.log('Usage:');
    console.log('  node makeAdmin.js list                    - List all users');
    console.log('  node makeAdmin.js make-admin <email>      - Make user admin');
  }
  
  mongoose.connection.close();
};

main(); 