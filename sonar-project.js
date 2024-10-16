import process from 'node:process';
import { scan } from 'sonarqube-scanner';
import { program } from 'commander';

program
    .option('-D, --define <property=value...>', 'Define property')
    .option('-X, --debug', 'Produce execution debug output');

function parseArgs() {
    return program.parse().opts();
}

scan({
    options: {
        'sonar.projectName': 'node-test',
        'sonar.projectDescription': 'Test app in Node',
        // 'sonar.organization': '0r0testorg',
        'sonar.projectKey': '0R0TestOrg_test-node',
        // 'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
        'sonar.sourceEncoding': 'UTF-8',
        'sonar.inclusions': [
            '**/src/**/*',
        ].join(', '),
        'sonar.test.inclusions': [
            '**/test/**/*',
        ].join(', '),
        'sonar.test.exclusions': [
            '**/node_modules/**/*',
        ].join(', '),
        'sonar.exclusions': [
            '**/node_modules/**/*',
            '**/__mocks__/**/*',
        ].join(', '),
    },
}, parseArgs()).then(() => {

}, (error) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
});
