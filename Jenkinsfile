pipeline {
    agent {
        node { label 'master' }
    }

    environment {
        APP_NAME = 'newton-front'
        ECR_REPO = 'https://494167762137.dkr.ecr.us-east-1.amazonaws.com/newton-front'
        ECR_PREFIX = '494167762137.dkr.ecr.us-east-1.amazonaws.com/'
        ECR_CREDENTIAL = 'ecr:us-east-1:ecr-complete-access'
    }

    stages {
        stage('Checkout repo') {
            steps {
                script {
                    println("Git checkout inside application repository")
                    checkout scm
                }
            }
        }

        stage('Requirements') {
            parallel {
                stage('Setting env vars') {
                    steps {
                        script {
                            def image

                            // Resize commit to 7 chars only
                            println("1- Resizing commit")
                            if (env.GIT_COMMIT.length() >= 7) {
                                env.APP_COMMIT = env.GIT_COMMIT[0..6]
                            }


                            // Adapt pipeline flow by specific rules and environments
                            println("2- Checking current ambient")
                            if (env.GIT_BRANCH ==~ "^v\\d+\\.\\d+\\.\\d+") {
                                // PRD --> If matches a tag v*.*.*
				env.ENVIRONMENT = "prod"
                                env.APP_AMBIENT = "prd"
                                env.APP_TAG = env.GIT_BRANCH
                                env.AWS_DEPLOY_S3_BUCKET = 'newton-front.qedu.org.br'
                                env.AWS_DEPLOY_CLOUDFRONT_DISTRIBUTION_ID = 'EAU3N9WQTF624' 
                            }
                            else {
                                // STG --> Everything else
				env.ENVIRONMENT = "stag"
                                env.APP_AMBIENT = "stg"
                                env.APP_TAG = ""
                                env.AWS_DEPLOY_S3_BUCKET = 'staging-newton-front.qedu.org.br'
                                env.AWS_DEPLOY_CLOUDFRONT_DISTRIBUTION_ID = 'E3QTY7H5TGS3LB' 
                            }


                            // Defining variables related do repositories, credentials, etc
                            println("3- Setting AWS and Image variables")
                            if(env.APP_TAG){
                                env.IMAGE_VERSION = "${APP_TAG}"
                            }
                            else {
                                env.IMAGE_VERSION = "${APP_COMMIT}"
                            }

                            env.CONTAINER_NAME = "${APP_NAME}"
                            env.CONTAINER_IMAGE = "${ECR_PREFIX}${APP_NAME}:${IMAGE_VERSION}"
                            env.AWS_ECS_CLUSTER = "${APP_AMBIENT}-apps"
                            env.AWS_ECS_SERVICE = "${APP_AMBIENT}-${APP_NAME}"
                            env.AWS_ECS_TASK_DEFINITION = "${AWS_ECS_SERVICE}"

                            env.GITHUB_CREDENTIAL = "qedutech-github"
                            env.PIPELINES_REPO = "https://github.com/QEdu/jenkins-pipeline.git"
                            env.PIPELINES_BRANCH = "master"
                            env.BLUE_OCEAN_BUILD = env.BUILD_URL


                            // Defines Slack message color
                            println("5- Setting message color variables")
                            env.SUCCESS_COLOR = "#6dc066"
                            env.FAILURE_COLOR = "#FF0000"
                            env.BUILD_COLOR = "#c0c0c0"
                            env.DEPLOY_COLOR = "#4169E1"


                            // All Slack messages BUILD messages
                            println("6 - Setting BUILD message content")
                            env.MSG_BUILD_START = ":gear: *BUILD*: APP > `${APP_NAME}` \n\n" +
                            "BRANCH: `${GIT_BRANCH}` \n" +
                            "COMMIT: `${APP_COMMIT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"

                            env.MSG_BUILD_SUCCESS = ":package: *BUILD*: APP > `${APP_NAME}` \n\n" +
                            "STATUS: `SUCCESS` \n" +
                            "IMAGE: `${CONTAINER_IMAGE}` \n" +
                            "BRANCH: `${GIT_BRANCH}` \n" +
                            "COMMIT: `${APP_COMMIT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"

                            env.MSG_BUILD_UNSTABLE = ":package: *BUILD*: APP > `${APP_NAME}` \n\n" +
                            "STATUS: `UNSTABLE` \n" +
                            "IMAGE: `${CONTAINER_IMAGE}` \n" +
                            "BRANCH: `${GIT_BRANCH}` \n" +
                            "COMMIT: `${APP_COMMIT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"

                            env.MSG_BUILD_FAILURE = ":package: *BUILD*: APP > `${APP_NAME}` \n\n" +
                            "STATUS: `FAIL` \n" +
                            "BRANCH: `${GIT_BRANCH}` \n" +
                            "COMMIT: `${APP_COMMIT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"


                            // All Slack messages DEPLOY messages
                            println("7 - Setting DEPLOY message content")
                            env.MSG_DEPLOY_START = ":rocket: *DEPLOY*: APP > `${APP_NAME}` \n\n" +
                            "IMAGE: `${CONTAINER_IMAGE}` \n" +
                            "ENVIRONMENT: `${APP_AMBIENT}` \n" +
                            "VERSION: `${IMAGE_VERSION}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"

                            env.MSG_DEPLOY_SUCCESS = ":heavy_check_mark: *DEPLOY*: APP > `${APP_NAME}` \n\n" +
                            "STATUS: `SUCCESS` \n" +
                            "IMAGE: `${CONTAINER_IMAGE}` \n" +
                            "ENVIRONMENT: `${APP_AMBIENT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"

                            env.MSG_DEPLOY_UNSTABLE = ":heavy_check_mark: *DEPLOY*: APP > `${APP_NAME}` \n\n" +
                            "STATUS: `SUCCESS` \n" +
                            "IMAGE: `${CONTAINER_IMAGE}` \n" +
                            "ENVIRONMENT: `${APP_AMBIENT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"

                            env.MSG_DEPLOY_FAILURE = ":x: *DEPLOY*: APP > `${APP_NAME}` \n\n" +
                            "STATUS: `FAILURE` \n" +
                            "IMAGE: `${CONTAINER_IMAGE}` \n" +
                            "ENVIRONMENT: `${APP_AMBIENT}` \n" +
                            "PIPELINE: ${BLUE_OCEAN_BUILD} \n\n"


                            println("8- Showing all environment variables")
                            sh("printenv | sort")
                        }
                    }
                }

                stage('Pulling necessary images') {
                    steps {
                        script {
                            println("Necessary images pulled")
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    println("SLACK - Notifying build start")
                    slackSend (
                        color: "${BUILD_COLOR}",
                        message: "${MSG_BUILD_START}"
                    )
                    println("Building application image")
                    // Creates "image" Docker Image type object
                    image = docker.build("${APP_NAME}:${APP_COMMIT}", "--build-arg ENVIRONMENT=${ENVIRONMENT} .")
                }
            }

            post {
                failure {
                    println("SLACK - Notifying build failure")
                    slackSend (
                        color: "${FAILURE_COLOR}",
                        message: "${MSG_BUILD_FAILURE}"
                    )
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    // Starts "test" container with the built application and runs commands
                    //def test = image.run("-i --user root", "/bin/sh")
                    //try {
                    //    sh "docker exec -i ${test.id} yarn e2e"
                    //    sh "docker exec -i ${test.id} yarn test"
                    //    sh "docker cp ${test.id}:/tmp/ ./tmp/"
                    //    junit(testResults: 'tmp/*.xml', allowEmptyResults: true)
                    //}
                    //finally {
                    //    test.stop()
                    //}
		    println("testado")
                }
            }
            post {
                failure {
                    println("SLACK - Notifying test failure")
                    slackSend (
                        color: "${FAILURE_COLOR}",
                        message: "${MSG_BUILD_FAILURE}"
                    )
                }
            }
        }

        stage('Confirm Deploy') {
            steps {
                script {
                    try {
                        timeout(time: 30, unit: 'MINUTES') {
                            input(
                                id: 'deploy', message: 'Deploy this image?', ok: 'Yes'
                            )
                        }
                        env.WILL_DEPLOY = "true"
                    }
                    catch(Exception err) {
                        currentBuild.result = 'ABORTED'
                        env.WILL_DEPLOY = "false"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (env.WILL_DEPLOY == "true") {
                        println("SLACK - Notifying deployment start")
                        slackSend (
                          color: "${env.DEPLOY_COLOR}",
                          message: "${env.MSG_DEPLOY_START}"
                        )

                        try {


                            def deploy = image.run("-ti --user root", "/bin/sh")
                            try {
                                sh "docker exec -i ${deploy.id} apk add python py-pip --update --no-cache"
                                sh "docker exec -i ${deploy.id} pip install --upgrade awscli"
                                sh "docker exec -i ${deploy.id} aws s3 sync /var/www/dist/ s3://${AWS_DEPLOY_S3_BUCKET}/ --delete"
                                sh "docker exec -i ${deploy.id} aws cloudfront create-invalidation --distribution-id ${AWS_DEPLOY_CLOUDFRONT_DISTRIBUTION_ID} --paths \"/*\""
                            }
                            finally {
                                deploy.stop()
                            }

                            println("SLACK - Notifying deployment success")
                            slackSend (
                                color: "${env.SUCCESS_COLOR}",
                                message: "${env.MSG_DEPLOY_SUCCESS}"
                            )
                         }
                         catch (Exception e) {
                             currentBuild.result = "FAILURE"
                             println("SLACK - Notifying deployment failure")
                             slackSend (
                                 color: "${FAILURE_COLOR}",
                                 message: "${MSG_DEPLOY_FAILURE}"
                             )
                         }
                    }
                    else {
                        println("Deployment wasn't done")
                    }
                }
            }
        }
    }
}
