import org.sonarsource.scanner.jenkins.pipeline.WaitForQualityGateStep

pipeline {
    agent any
    tools {
        nodejs 'Node 20'
    }
    stages {
        stage('Setup') {
            steps {
                sh 'pnpm install'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }
        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }
        stage('Sonar') {
            steps {
                script {
                    String sonarParams = "-Dsonar.branch.name=${BRANCH_NAME}"
                    if (env.BRANCH_NAME.startsWith('PR-')) {
                        sonarParams = "-Dsonar.pullrequest.key=${env.CHANGE_ID} -Dsonar.pullrequest.branch=${env.CHANGE_BRANCH} -Dsonar.pullrequest.base=${env.CHANGE_TARGET}"
                    }
                    withSonarQubeEnv('SonarCloud') {
                        sh 'env'
                        sh "pnpm sonar ${sonarParams}"
                    }
                }
            }
        }
        stage('Wait for Sonar') {
            steps {
                script {
                    sleep 5
                    timeout(time: 2, unit: 'MINUTES') {
                        def waitForQualityGateStep = waitForQualityGate()
                        if (waitForQualityGateStep.status != 'OK') {
                            error "Pipeline aborted due to quality gate failure: ${waitForQualityGateStep.status}"
                        }
                    }
                }
            }
        }
    }
}
