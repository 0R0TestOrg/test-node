pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                'pnpm install'
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
    }
}
