pipeline {
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
import nl.sligro.ci.NodePackageManager

/**
 * Lerna - Docker pipeline multibranch pipeline. Used by Api and BFF
 * @param name
 * @param devDeployFilename
 * @param imageName
 * @param repo
 */
void call(
        String projectName,
        String sharedLibraryName,
        String dockerPrefix = projectName,
        String nodeVersion = 'node18'
) {
    String projVersion
    NodePackageManager packageManager
    pipeline {
        agent {
            kubernetes {
                yaml libraryResource("nl/sligro/kubernetes/docker${nodeVersion.capitalize()}Pod.yaml")
            }
        }

        options {
            datadog(tags: ["team:${projectName.toUpperCase()}", 'purpose:prsupport'])
            lock(resource: (env.BRANCH_NAME == 'master' || env.BRANCH_NAME.startsWith('hotfix/')) ? projectName : env.BUILD_TAG)
        }
        stages {
            stage('Initialize') {
                steps {
                    script {
                        projVersion = sligroMethods.loadLernaVersion()
                        packageManager = NodePackageManager.detect(this)
                    }
                }
            }
            stage('Build') {
                steps {
                    container('node') {
                        script {
                            if (packageManager.needsLockTreatment()) {
                                sh 'locktt --registry "${npm_config_registry}" -s -p'
                            }
                            packageManager.install(this, true)
                            packageManager.runWorkspacesScript(this, 'build')
                        }
                    }
                }
            }
            stage('Sonar Scan') {
                steps {
                    container('node') {
                        withSonarQubeEnv('Sligro SonarQubePro') {
                            script {
                                withEnv([
                                        'DD_SERVICE=',
                                        'DD_ENV='
                                ]) {
                                    packageManager.runScript(this, 'test')
                                }
                                packageManager.runScript(this, 'eslint', '--max-warnings', '0')
                                String sonarParams = "-Dsonar.branch.name=${BRANCH_NAME}"
                                if (env.BRANCH_NAME.startsWith('PR-')) {
                                    sonarParams = "-Dsonar.pullrequest.key=${env.CHANGE_ID} -Dsonar.pullrequest.branch=${env.CHANGE_BRANCH} -Dsonar.pullrequest.base=${env.CHANGE_TARGET}"
                                }
                                packageManager.runScript(this, 'sonar', sonarParams)
                            }
                        }
                    }
                }
            }
            stage('Quality Gate') {
                steps {
                    script {
                        qualityGate
                    }
                }
            }
            stage('Prerelease') {
                when {
                    anyOf {
                        branch 'master'; branch 'hotfix/*'
                    }
                }
                steps {
                    container('node') {
                        script {
                            withCredentials([gitUsernamePassword(credentialsId: 'jenkins-github_app')]) {
                                force = sh(script: "lerna changed | grep \'${sharedLibraryName}\'", returnStdout: true)
                                echo "Received force: ${force}"

                                String[] splitPrerelease = projVersion.split('-')

                                prereleaseType = 'prerelease'
                                if (splitPrerelease.length == 1) {
                                    // if current version is a release version (e.i. no -alpha postfix)
                                    if (env.BRANCH_NAME == 'master') {
                                        prereleaseType = 'preminor'
                                    } else {
                                        prereleaseType = 'prepatch'
                                    }
                                }

                                // first undo the lock file updates (we want to ignore those for lerna)
                                if (packageManager.needsLockTreatment()) {
                                    sh 'git stash'
                                }
                                sh 'git fetch --tags'

                                // run lerna to update versions
                                if (force) {
                                    sh "lerna version ${prereleaseType} --yes --force-publish"
                                } else {
                                    sh "lerna version ${prereleaseType} --yes"
                                }

                                // and return the lock file. this will speed up the docker builds later on
                                if (packageManager.needsLockTreatment()) {
                                    sh 'git stash pop'
                                }
                            }
                        }
                    }

                    container('docker') {
                        script {
                            // and finally build the necessary containers
                            sligroMethods.publishLernaResultToDocker(dockerPrefix.toLowerCase(), projVersion)
                        }
                    }
                }
            }
        }
    }
}
