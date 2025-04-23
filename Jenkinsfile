pipeline {

    agent { label 'docker-agent' }

    tools {
        nodejs 'nodejs'
    }

    environment {
        NODE_ENV = 'production'
        TARGET_DIST = '/app/dist'
        PATH = "./node_modules/.bin:$PATH"

    }

    options {
        timestamps()
        timeout(time: 10, unit: 'MINUTES')
    }

    stages {

        stage('🧪 Debug Lockfile et Workspace') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                sh 'cat package-lock.json'
                sh 'cat package.json'
                sh 'echo "📦 Nombre de packages dans lockfile : $(grep name package-lock.json | wc -l)"'
                sh 'git log -n 3 --oneline'

            }
        }

        stage('📦 Installer les dépendances') {
            steps {
                sh 'npm ci'
            }
        }

        stage('🎨 Vérification Prettier') {
            steps {
                sh 'npm run prettier:check'
            }
        }

        stage('🔍 Linter') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('🧪 Tests') {
            steps {
                script {
                    try {
                        sh 'npm test'
                    } catch (err) {
                        echo "⚠️ Tests échoués ou non définis : ${err.message}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('🏗️ Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('📁 Déploiement local dans /app/dist') {
            steps {
                script {
                    sh """
                        mkdir -p ${TARGET_DIST}
                        rm -rf ${TARGET_DIST}/*
                        cp -r dist/* ${TARGET_DIST}/
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build + copie locale terminés avec succès.'
        }
        failure {
            echo '❌ Échec du pipeline.'
        }
        always {
            cleanWs()
        }
    }
}
