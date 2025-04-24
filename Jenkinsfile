pipeline {
    agent { label 'docker-agent' }

    tools {
        nodejs 'nodejs'
    }

    environment {
        TARGET_DIST = '/app/dist'
    }

    options {
        timestamps()
        timeout(time: 10, unit: 'MINUTES')
    }

    stages {

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

        // stage('🧪 Tests') {
        //     steps {
        //         script {
        //             try {
        //                 sh 'npm test'
        //             } catch (err) {
        //                 echo "⚠️ Tests échoués ou non définis : ${err.message}"
        //                 currentBuild.result = 'UNSTABLE'
        //             }
        //         }
        //     }
        // }

        stage('🏗️ Build') {
            when {
                branch 'master'
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('📁 Déploiement local dans /app/dist') {
            when {
                branch 'master'
            }
            steps {
                script {
                    sh """
                        ls -la ${TARGET_DIST} || echo '❌ Le dossier n’existe pas !'
                        rm -rf ${TARGET_DIST}/*
                        cp -r dist/* ${TARGET_DIST}/
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline terminé avec succès.'
        }
        failure {
            echo '❌ Échec du pipeline.'
        }
        always {
            cleanWs()
        }
    }
}
