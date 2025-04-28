pipeline {
    agent { label 'docker-agent' }

    tools {
        nodejs 'nodejs'
        dockerTool 'docker'
    }

    environment {
        IMAGE_NAME = "crisis-nextjs"

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
        
        stage('Docker Build') {
            when {
                branch 'master'
            }
            steps {
                sh "docker build -t $IMAGE_NAME ."
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                sh "docker stop $IMAGE_NAME || true"
                sh "docker rm $IMAGE_NAME || true"
                sh """
                    docker run -d --name $IMAGE_NAME \\
                    --network webnet \\
                    -l traefik.enable=true \\
                    -l traefik.http.routers.crisis.rule=Host\\(\\`crisis.maxlamenace.duckdns.org\\`\\) \\
                    -l traefik.http.services.crisis.loadbalancer.server.port=3000 \\
                    -l traefik.http.routers.crisis.entrypoints=websecure \\
                    -l traefik.http.routers.crisis.tls.certresolver=myresolver \\
                    --restart unless-stopped \\
                    $IMAGE_NAME:latest
                """
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
