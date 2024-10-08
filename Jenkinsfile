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
    }
}
