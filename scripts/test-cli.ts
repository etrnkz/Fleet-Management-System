import inquirer from 'inquirer';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:3000';
let authToken: string | null = null;
let refreshToken: string | null = null;

async function main() {
  console.log(chalk.blue.bold('\n=== Fleet Management Backend Test Tool ===\n'));

  while (true) {
    console.log(chalk.white('Menu:'));
    console.log(chalk.white('1. Check System Health'));
    console.log(chalk.white('2. Login'));
    console.log(chalk.white('3. Register'));
    console.log(chalk.white('4. Refresh Token'));
    console.log(chalk.white('0. Exit'));

    const { choice } = await inquirer.prompt([
      {
        type: 'input',
        name: 'choice',
        message: 'Select an option (number):',
        validate: (input) => {
          if (['1', '2', '3', '4', '0'].includes(input)) return true;
          return 'Please enter a valid number (0-4)';
        }
      },
    ]);

    if (choice === '0') {
      console.log(chalk.yellow('Goodbye!'));
      process.exit(0);
    }

    try {
      switch (choice) {
        case '1':
          await checkHealth();
          break;
        case '2':
          await login();
          break;
        case '3':
          await register();
          break;
        case '4':
          await refresh();
          break;
      }
    } catch (error) {
      console.error(chalk.red('\nError:'), error.message);
    }

    console.log('\n-------------------------------------------\n');
  }
}

async function checkHealth() {
  console.log(chalk.cyan('Checking system health...'));
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();
  console.log(chalk.green('Health Status:'), JSON.stringify(data, null, 2));
}

async function login() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter email:',
      default: 'admin@example.com',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter password:',
      default: 'Admin@123',
    },
  ]);

  console.log(chalk.cyan('Logging in...'));
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });

  const data = await response.json();

  if (response.ok) {
    authToken = data.access_token;
    refreshToken = data.refresh_token;
    console.log(chalk.green('Login successful!'));
    console.log(chalk.dim('User:'), `${data.user.name} (${data.user.role})`);
  } else {
    console.log(chalk.red('Login failed:'), data.message);
  }
}

async function register() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Full Name (Letters and spaces only):',
      default: 'John Doe',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      default: 'john@example.com',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password (min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special):',
      default: 'Password@123',
    },
    {
      type: 'list',
      name: 'role',
      message: 'Role:',
      choices: [
        'system-admin',
        'transport-admin',
        'driver',
        'deployment-office',
        'employee',
        'admin-office',
        'college-dean',
        'president',
        'maintenance'
      ],
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Phone (10-15 digits):',
      default: '1234567890',
    },
    {
      type: 'input',
      name: 'department',
      message: 'Department:',
      default: 'Fleet Management',
    },
  ]);

  console.log(chalk.cyan('Registering user...'));
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(chalk.green('Registration successful!'));
    console.log(chalk.dim('Details:'), JSON.stringify(data.data, null, 2));
  } else {
    console.log(chalk.red('Registration failed:'), JSON.stringify(data.message, null, 2));
  }
}

async function refresh() {
  if (!refreshToken) {
    console.log(chalk.yellow('No refresh token available. Please login first.'));
    return;
  }

  console.log(chalk.cyan('Refreshing token...'));
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    },
  });

  const data = await response.json();

  if (response.ok) {
    authToken = data.access_token;
    console.log(chalk.green('Token refreshed successfully!'));
  } else {
    console.log(chalk.red('Refresh failed:'), data.message);
  }
}

main().catch((err) => {
  console.error(chalk.red('Fatal Error:'), err);
  process.exit(1);
});
