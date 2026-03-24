pipeline {
    agent any

    environment {
        DOCKER_IMAGE     = "your-dockerhub-username/blog-server"
        STG_HOST         = "stg서버IP"
        PROD_HOST        = "prod서버IP"
        DEPLOY_USER      = "deploy"
        APP_DIR          = "/app"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def shortCommit = env.GIT_COMMIT.take(7)
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${shortCommit}"
                    sh "docker build -t ${DOCKER_IMAGE}:${env.IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${env.IMAGE_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker push ${DOCKER_IMAGE}:${env.IMAGE_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to STG') {
            steps {
                sshagent(['stg-server-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${STG_HOST} \
                            'bash ${APP_DIR}/scripts/deploy.sh ${DOCKER_IMAGE}:${env.IMAGE_TAG} stg'
                    """
                }
            }
        }

        stage('PROD 배포 승인') {
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: "STG 배포 완료 (이미지: ${env.IMAGE_TAG})\nPROD 배포를 진행하시겠습니까?",
                          ok: '배포'
                }
            }
        }

        stage('Deploy to PROD') {
            steps {
                sshagent(['prod-server-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${PROD_HOST} \
                            'bash ${APP_DIR}/scripts/deploy.sh ${DOCKER_IMAGE}:${env.IMAGE_TAG} prod'
                    """
                }
            }
        }
    }

    post {
        success {
            echo "배포 성공: ${env.IMAGE_TAG}"
        }
        failure {
            echo "배포 실패: ${env.IMAGE_TAG}"
        }
        always {
            sh "docker rmi ${DOCKER_IMAGE}:${env.IMAGE_TAG} || true"
            sh "docker logout || true"
        }
    }
}
