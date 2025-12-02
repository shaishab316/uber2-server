import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';

// Simulate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define file types
type FileType =
  | 'route'
  | 'interface'
  | 'model'
  | 'controller'
  | 'service'
  | 'validation'
  | 'middleware'
  | 'utils'
  | 'lib'
  | 'template'
  | 'enum';

// File templates
const fileTemplates: Record<FileType, (mName: string) => string> = {
  route: mName => /*typescript*/ `import { Router } from 'express';

const router = Router();

export const ${mName}Routes = router;`,

  interface: () => /*typescript*/ ``,

  model: mName => /*prisma*/ `model ${mName} {
  id         String   @id @default(uuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("${mName[0].toLowerCase()}${mName.slice(1)}s")
}
`,

  controller: mName => /*typescript*/ `export const ${mName}Controllers = {};`,

  service: mName => /*typescript*/ `export const ${mName}Services = {};`,

  validation: mName => /*typescript*/ `export const ${mName}Validations = {};`,

  middleware: mName => /*typescript*/ `export const ${mName}Middlewares = {};`,

  utils: () => '',

  lib: () => '',

  template: mName => /*typescript*/ `export const ${mName}Templates = {};`,

  enum: mName => /*typescript*/ `export enum E${mName} {}`,
};

// 🧩 Helper to capitalize the first letter
const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

async function main(): Promise<void> {
  console.clear();
  console.log(chalk.cyan.bold('🚀 Module Builder'));
  console.log(chalk.gray('-----------------------------------\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'moduleName',
      message: chalk.yellow('📦 What is the module name?'),
    },
    {
      type: 'checkbox',
      name: 'filesToCreate',
      message: chalk.yellow('📁 Select files to create:'),
      choices: [
        { name: 'Route', value: 'route', checked: true },
        { name: 'Interface', value: 'interface', checked: true },
        { name: 'Model', value: 'model', checked: true },
        { name: 'Middleware', value: 'middleware', checked: false },
        { name: 'Controller', value: 'controller', checked: true },
        { name: 'Service', value: 'service', checked: true },
        { name: 'Validation', value: 'validation', checked: true },
        { name: 'Enum', value: 'enum', checked: false },
        { name: 'Utils', value: 'utils', checked: false },
        { name: 'Lib', value: 'lib', checked: false },
        { name: 'Template', value: 'template', checked: false },
      ],
    },
  ]);

  const moduleName = (answers.moduleName as string)?.trim();
  if (!moduleName) {
    console.log(chalk.red('❌ Module name is required'));
    process.exit(0);
  }

  const filesToCreate = answers.filesToCreate as FileType[];
  const capitalizedMName = capitalize(moduleName);
  const folderPath = path.resolve(__dirname, moduleName);

  const spinner = ora(
    `Creating module ${chalk.cyanBright(capitalizedMName)}...`,
  ).start();

  try {
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

    const generatedFiles: string[] = [];

    for (const fileType of filesToCreate) {
      const extension = fileType === 'model' ? 'prisma' : 'ts';
      const filePath = path.join(
        folderPath,
        `${capitalizedMName}.${fileType}.${extension}`,
      );

      const content = fileTemplates[fileType](capitalizedMName) + '\n';
      fs.writeFileSync(filePath, content);
      generatedFiles.push(filePath);
    }

    spinner.succeed(
      `Module ${chalk.greenBright(capitalizedMName)} created successfully!\n`,
    );

    // Display summary table
    const data = [
      [chalk.cyan('File Type'), chalk.cyan('Path')],
      ...generatedFiles.map((fp, i) => [
        filesToCreate[i],
        chalk.gray(path.relative(process.cwd(), fp)),
      ]),
    ];

    console.log(table(data));
    console.log(chalk.greenBright('🎉 All files generated successfully!\n'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Error creating files'));
    console.error(error);
  }
}

main();
