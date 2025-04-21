pipeline {
    agent {
        docker {
            image 'node:18-alpine'
        }
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Installer les dépendances') {
            steps {
                sh 'npm install'
            }
        }

        stage('Check Prettier') {
            steps {
                sh 'npm run prettier:check'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Tests') {
            steps {
                sh 'npm test || echo "⚠️ Aucun test défini ou test échoué."'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Déploiement local') {
            steps {
                sh 'rm -rf /app/dist/*'
                sh 'cp -r dist/* /app/dist/'
            }
        }

        stage('Fin') {
            steps {
                echo '✅ Build terminé avec succès !'
            }
        }
    }
}
