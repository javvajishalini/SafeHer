#!/usr/bin/env bash
# SafeHer Spring Boot Backend JVM Launcher for Linux / macOS
set -euo pipefail

echo "Starting SafeHer Backend with configured JVM options..."

JVM_OPTS="-Xms512m -Xmx2048m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8"

if [ -f "target/backend-0.0.1-SNAPSHOT.jar" ]; then
    exec java $JVM_OPTS -jar target/backend-0.0.1-SNAPSHOT.jar
else
    echo "JAR not found in target. Running via mvn spring-boot:run with JVM arguments..."
    exec mvn spring-boot:run -Dspring-boot.run.jvmArguments="$JVM_OPTS"
fi
