pipeline {
    agent any

    parameters {
        string(name: 'BACKEND_TAG', description: 'Backend image SHA')
        string(name: 'FRONTEND_TAG', description: 'Frontend image SHA')
    }

    environment {
        REGISTRY   = 'ghcr.io'
        IMAGE_BASE = 'ghcr.io/utkarshgayguwal/himanshu-photography'
        DJANGO_SECRET_KEY = credentials('django-secret-key')
        POSTGRES_PASSWORD = credentials('postgres-password')
    }

    stages {
        stage('Login to GHCR') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_TOKEN')]) {
                    sh 'echo "$GHCR_TOKEN" | docker login $REGISTRY -u "$GHCR_USER" --password-stdin'
                }
            }
        }

        stage('Pull images') {
            steps {
                sh """
                    docker pull ${IMAGE_BASE}-backend:${params.BACKEND_TAG}
                    docker pull ${IMAGE_BASE}-frontend:${params.FRONTEND_TAG}
                """
            }
        }

        stage('Deploy') {
            environment {
                BACKEND_TAG  = "${params.BACKEND_TAG}"
                FRONTEND_TAG = "${params.FRONTEND_TAG}"
            }
            steps {
                sh 'docker compose -f docker-compose.prod.yml up -d'
            }
        }

        stage('Health check') {
            steps {
                sh '''
                    sleep 5
                    curl -f http://localhost:8080/
                '''
            }
        }
    }

    post {
        failure {
            echo 'Deploy failed — check the stage logs above. The previous containers are still running (docker compose up -d only replaces containers whose image actually changed).'
        }
        always {
            sh 'docker image prune -f'
        }
    }
}
