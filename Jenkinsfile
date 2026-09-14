pipeline {
    agent any

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

        stage('Wait for images') {
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if docker manifest inspect ${IMAGE_BASE}-backend:${GIT_COMMIT} >/dev/null 2>&1 &&
                        docker manifest inspect ${IMAGE_BASE}-frontend:${GIT_COMMIT} >/dev/null 2>&1; then
                            echo "Both images are available for ${GIT_COMMIT}"
                            exit 0
                        fi

                        echo "Images not available yet. Waiting 20 seconds..."
                        sleep 20
                    done

                    echo "Images were not published for ${GIT_COMMIT}"
                    exit 1
                '''
            }
        }

        stage('Pull images') {
            steps {
                sh """
                    docker pull ${IMAGE_BASE}-backend:${GIT_COMMIT}
                    docker pull ${IMAGE_BASE}-frontend:${GIT_COMMIT}
                """
            }
        }

        stage('Deploy') {
            environment {
                BACKEND_TAG  = "${GIT_COMMIT}"
                FRONTEND_TAG = "${GIT_COMMIT}"
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
