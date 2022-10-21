@Library('jenkins-pipeline') _

import ru.ubrir.ib.GlobalVars ;

final static String USER_CAUSE = "hudson.model.Cause\$UserIdCause"

final static String GENERIC_WEBHOOK_TRIGGER_CAUSE = "org.jenkinsci.plugins.gwt.GenericCause"
final static String CLONE_URL = "ssh://git@bitbucket.lan.ubrr.ru:7999/sal/ubrr-ui.git"

def cause = currentBuild.getBuildCauses()[0]._class
println("Cause: ${cause}")
def notificationMessage = ""
def currentStage = "Queue"
def markDownLinks = "${GlobalVars.buildLogMarkdown(BUILD_URL)}"
def tag = ""
def noRelease = false



pipeline {
    agent any
    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'eventKey', value: '$.eventKey'],
                [key: 'pullRequestId', value: '$.pullRequest.id'],
                [key: 'pullRequestTitle', value: '$.pullRequest.title'],
                [key: 'sourceBranch', value: '$.pullRequest.fromRef.displayId'],
                [key: 'targetBranch', value: '$.pullRequest.toRef.displayId'],
                [key: 'pullRequestURL', value: '$.pullRequest.links.self[0].href'],
                [key: 'startedBy', value: '$.actor.displayName'],
                [key: 'commitId', value: '$.pullRequest.fromRef.latestCommit'],
                [key: 'pullRequestDescription', value: '$.pullRequest.description']

            ],
            causeString: 'Pull Request ${pullRequestTitle} from $sourceBranch to $targetBranch by $startedBy',
            token: 'ubrr-ui-pr',
            tokenCredentialId: '',
            printContributedVariables: true,
            printPostContent: true,
            silentResponse: false,
            regexpFilterText: '$targetBranch',
            regexpFilterExpression: '^master$'

        )
    }
    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timestamps()
    }
    stages {
        stage("Init") {
            steps {
                script {
                    currentStage = "Init"
                    sh 'env'
                    if ( cause == USER_CAUSE && BRANCH_NAME != 'master') {
                        error("Выпуск релиза из ветки отличной от master")
                    }
                    if ( cause == GENERIC_WEBHOOK_TRIGGER_CAUSE ) {
                        currentBuild.description = "<a href=\"${pullRequestURL}\">" +
                            "${pullRequestId}: ${sourceBranch} to ${targetBranch} ${eventKey.split(':')[1].split('_')[-1]}</a><br>" +
                             "by ${startedBy.split(' ')[0]} ${startedBy.split(' ')[1].charAt(0)}.  ${startedBy.split(' ')[2].charAt(0)}."
                        try {
                            if ( pullRequestDescription.contains("#no_release") ) {
                                noRelease = true
                                currentBuild.description +="<br>#no_release"
                            }
                        } catch (Exception e) {
                            noRelease = false
                        }
                    } else {
                        eventKey = cause
                    }
                    notifyBitbucket(
                        stashServerBaseUrl: 'https://bitbucket.lan.ubrr.ru',
                        credentialsId: 'digital-back-yoda-bitbucket'
                    )
                }
            }
        }
        stage("Clone") {
            when {
                anyOf {
                    expression { eventKey == 'pr:merged' }
                    expression { cause == USER_CAUSE }
                }
            }
            steps {
                script {
                    currentStage = "Clone"
                }
                checkout([
                    $class: 'GitSCM', branches: [[name: "master"]],
                    userRemoteConfigs: [[ credentialsId: 'BitBucket', url: CLONE_URL]]
                ])
            }
        }
        stage("Merge") {
            when {
                allOf {
                    expression { cause == GENERIC_WEBHOOK_TRIGGER_CAUSE }
                    expression { eventKey != 'pr:merged' }
                }

            }
            steps {
                script {
                    currentStage = "Merge"
                }
                checkout([
                    $class: 'GitSCM', branches: [[name: "${sourceBranch}"]],
                    userRemoteConfigs: [[ credentialsId: 'BitBucket', url: CLONE_URL ]],
                    extensions: [[ $class: 'PreBuildMerge', options: [
                            fastForwardMode: 'FF_ONLY', mergeTarget: "${targetBranch}", mergeRemote: "origin"
                        ]
                    ]],
                ])
            }
        }
        stage("Check new Version") {
            when {
                expression { !noRelease.toBoolean() }
            }
            steps {
                script {
                    currentStage = "Check new Version"
                    version = readJSON(file: 'package.json').version
                    currentBuild.description += "<br>Версия: ${version}"
                    notificationMessage = "Версия: ${version}"
                    sh 'git tag --list'
                    sh "git tag | grep v${version} && echo 'Тег v${version} уже существует' && \
                          exit 1 || echo 'Тег v${version} не найдён' "
                }
            }
        }
        stage("Build") {
            agent {
                docker {
                    image 'nexusproxy.lan.ubrr.ru/dockerhub/node:16.17-alpine3.15'
                    registryUrl 'https://nexusproxy.lan.ubrr.ru/dockerhub/'
                    args "-e TZ=Asia/Yekaterinburg -u 0"
                    reuseNode true
                }
            }
            steps {
                script {
                    currentStage = "Build"
                }
                sh 'npm set registry https://nexus.lan.ubrr.ru/repository/npm-group'
                sh 'npm install --save-dev webpack'
                sh 'npm run build'
            }
        }
        stage("Tag new version") {
            when {
                allOf {
                    expression { !noRelease.toBoolean() }
                    expression { eventKey == 'pr:merged' || cause == USER_CAUSE }
                }
            }
            steps {
                script {
                    currentStage = "Tag new version"
                    tag = "v${version}"
                    def tagMessage = ""

                    if ( cause == GENERIC_WEBHOOK_TRIGGER_CAUSE) {
                        try {
                            tagMessage = pullRequestDescription
                        } catch (Exception e) {
                            tagMessage = pullRequestTitle
                        }
                    }
                    sh "git tag -a '${tag}' -m 'Release ${tag}' -m '${tagMessage}'"
                    sh "git show '${tag}'"
                    sshagent(credentials: ['BitBucket']) {
                        sh "git push origin ${tag}"
                    }
                    notificationMessage += "\\nНовый тэг ${tag} отправлен в BitBucket"
                }
            }
        }
        stage("Deploy to Nexus") {
            when {
                allOf {
                    expression { !noRelease.toBoolean() }
                    expression { eventKey == 'pr:merged' || cause == USER_CAUSE }
                }
            }
            agent {
                docker {
                    image 'nexusproxy.lan.ubrr.ru/dockerhub/node:16.17-alpine3.15'
                    registryUrl 'https://nexusproxy.lan.ubrr.ru/dockerhub/'
                    args "-e TZ=Asia/Yekaterinburg -u 0:0"
                    reuseNode true
                }
            }
            steps {
                script {
                    currentStage = "Deploy to Nexus"
                    withCredentials([string(credentialsId: 'npm-hosted-token', variable: 'NPM_HOSTED_TOKEN')]) {
                        sh 'npm config set //nexus.lan.ubrr.ru/repository/npm-hosted/:_authToken=$NPM_HOSTED_TOKEN'
                        sh 'npm publish --registry https://nexus.lan.ubrr.ru/repository/npm-hosted/'
                        currentBuild.description += "<br><a href='https://nexus.lan.ubrr.ru/#browse/browse:npm-hosted:ubrr-ui' target='_blank'>nexus-npm-hosted</a>"
                        notificationMessage += "\\nновая версия ubrr-ui отправлена в [nexus-npm-hosted](https://nexus.lan.ubrr.ru/#browse/browse:npm-hosted:ubrr-ui)"
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                notifyBitbucket(
                        stashServerBaseUrl: 'https://bitbucket.lan.ubrr.ru',
                        credentialsId: 'digital-back-yoda-bitbucket'
                )
                notificationMessage += "\\n**${GlobalVars.buildLogMarkdown(BUILD_URL)}**"
            }

        }
        aborted {
            script {
                if ( currentStage == "Deploy to Nexus") {
                    sshagent(credentials: ['BitBucket']) {
                        sh "git push origin --delete ${tag}"
                    }
                    notificationMessage = "Сборка прервана на стадии **`${currentStage}`**\\nУстановленный ранее тэг `${tag}` удалён\\n${notificationMessage}"
                } else {
                    notificationMessage = "Сборка прервана на стадии **`${currentStage}`**\\n${notificationMessage}"
                }
            }
        }
        failure {
            script {
                if ( currentStage == "Deploy to Nexus") {
                    sshagent(credentials: ['BitBucket']) {
                        sh "git push origin --delete ${tag}"
                    }
                    notificationMessage = "Сборка упала на стадии **`${currentStage}`**\\nУстановленный ранее тэг `${tag}` удалён\\n${notificationMessage}"
                } else {
                    notificationMessage = "Сборка упала на стадии **`${currentStage}`**\\n${notificationMessage}"
                }
            }
        }
        success {
            script {
                notificationMessage = "Сборка прошла успешно\\n${notificationMessage}"
            }
        }
        cleanup {
            echo notificationMessage
            script {
                if ( cause == GENERIC_WEBHOOK_TRIGGER_CAUSE ) {
                    withCredentials([string(credentialsId: "BitBucketJenkinsToken", variable: 'bitbucketToken')]) {
                        sh "curl --request POST 'https://bitbucket.lan.ubrr.ru/rest/api/1.0/projects/SAL/repos/ubrr-ui/pull-requests/${pullRequestId}/comments' \
                            --header 'Authorization: Bearer ${bitbucketToken}' \
                            --header 'Content-Type: application/json' \
                            --data '{ \"text\": \"${notificationMessage}\" }'"
                    }
                }
            }
            cleanWs()
        }
    }
}
