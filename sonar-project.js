import { scan } from 'sonarqube-scanner';

scan({
    options: {
        'sonar.projectName': 'node-test',
        'sonar.projectDescription': 'Test app in Node',
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
}).then(() => {
    console.log("OK")
}, (error) => {
    console.error(error)
});
